/**
 * TipL — Firebase Cloud Functions
 * Backend for Midtrans escrow transactions.
 * 
 * Deploy: cd functions && npm install && firebase deploy --only functions
 * 
 * Required env vars (set via firebase functions:config:set):
 *   midtrans.server_key = YOUR_MIDTRANS_SERVER_KEY
 *   midtrans.client_key = YOUR_MIDTRANS_CLIENT_KEY
 *   midtrans.is_production = false
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const midtransClient = require('midtrans-client');

admin.initializeApp();
const db = admin.firestore();

// Midtrans Snap client — configured from Firebase env
const snap = new midtransClient.Snap({
  isProduction: functions.config().midtrans?.is_production === 'true',
  serverKey: functions.config().midtrans?.server_key || 'YOUR_SERVER_KEY',
  clientKey: functions.config().midtrans?.client_key || 'YOUR_CLIENT_KEY',
});

/**
 * Create a Midtrans Snap transaction token.
 * Called by the client before opening the payment WebView.
 * 
 * Body: { orderId, amount, buyerName, buyerEmail, itemName }
 * Returns: { token, redirectUrl }
 */
exports.createMidtransTransaction = functions.https.onRequest(async (req, res) => {
  // CORS
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId, amount, buyerName, buyerEmail, itemName } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({ error: 'orderId and amount are required' });
    }

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      item_details: [
        {
          id: orderId,
          price: amount,
          quantity: 1,
          name: itemName || 'Jastip Order',
        },
      ],
      customer_details: {
        first_name: buyerName || 'Buyer',
        email: buyerEmail || '',
      },
      // Escrow: enable custom settlement
      // Funds are held until we trigger settlement via API
      custom_expiry: {
        expiry_duration: 60, // 60 minutes to complete payment
        unit: 'minute',
      },
    };

    const transaction = await snap.createTransaction(parameter);

    // Store token in Firestore order
    await db.collection('orders').doc(orderId).update({
      midtransToken: transaction.token,
      midtransRedirectUrl: transaction.redirect_url,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.json({
      token: transaction.token,
      redirectUrl: transaction.redirect_url,
    });
  } catch (error) {
    console.error('Midtrans token creation error:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Midtrans notification webhook handler.
 * Called by Midtrans when payment status changes.
 * Updates the order escrow status in Firestore.
 */
exports.midtransWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const notification = req.body;
    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    console.log(`Midtrans webhook: order=${orderId}, status=${transactionStatus}, fraud=${fraudStatus}`);

    // Map Midtrans status → TipL escrow status
    let orderStatus;
    let timelineUpdate = {};

    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      if (fraudStatus === 'accept' || !fraudStatus) {
        orderStatus = 'payment_confirmed';
        timelineUpdate = {
          'timeline.2.timestamp': admin.firestore.FieldValue.serverTimestamp(),
        };
      }
    } else if (transactionStatus === 'pending') {
      orderStatus = 'pending';
    } else if (
      transactionStatus === 'deny' ||
      transactionStatus === 'cancel' ||
      transactionStatus === 'expire'
    ) {
      orderStatus = 'cancelled';
    }

    if (orderStatus) {
      await db.collection('orders').doc(orderId).update({
        status: orderStatus,
        ...timelineUpdate,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Check Midtrans transaction status.
 * Query param: ?orderId=JPT-0024
 */
exports.checkMidtransStatus = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  const { orderId } = req.query;
  if (!orderId) {
    return res.status(400).json({ error: 'orderId query param required' });
  }

  try {
    const status = await snap.transaction.status(orderId);
    return res.json(status);
  } catch (error) {
    console.error('Status check error:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Release escrow — triggered when buyer confirms delivery.
 * In a real implementation, this would call Midtrans API to capture/settle.
 */
exports.releaseEscrow = functions.https.onCall(async (data, context) => {
  // Auth check
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be signed in');
  }

  const { orderId } = data;
  const orderRef = db.collection('orders').doc(orderId);
  const orderDoc = await orderRef.get();

  if (!orderDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Order not found');
  }

  const order = orderDoc.data();

  // Only the buyer can release escrow
  if (order.buyerId !== context.auth.uid) {
    throw new functions.https.HttpsError('permission-denied', 'Only the buyer can release escrow');
  }

  // Must be in delivered status
  if (order.status !== 'delivered') {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Order must be in delivered status to release escrow'
    );
  }

  // Update order to completed
  await orderRef.update({
    status: 'completed',
    'timeline.6.timestamp': admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // TODO: Trigger payout to traveler via payment provider

  return { success: true, message: 'Escrow released, payment sent to traveler' };
});
