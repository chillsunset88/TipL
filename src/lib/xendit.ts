/**
 * TipL — Xendit Integration (Sandbox)
 * Handles payment generation via Xendit API.
 * NOTE: In production, these calls should be made from a secure backend.
 */

const XENDIT_SECRET_KEY = process.env.EXPO_PUBLIC_XENDIT_SECRET_KEY;
const XENDIT_BASE_URL = 'https://api.xendit.co';

/**
 * Encodes the Secret Key for Basic Auth
 */
const getAuthHeader = () => {
  if (!XENDIT_SECRET_KEY) return '';
  // Xendit requires the secret key as username and empty password
  // Format: "username:password" -> "sk_test_xxx:"
  const credentials = btoa(`${XENDIT_SECRET_KEY}:`);
  return `Basic ${credentials}`;
};

export interface XenditQRCodeResponse {
  id: string;
  external_id: string;
  amount: number;
  qr_string: string;
  callback_url: string;
  status: string;
  created: string;
  updated: string;
}

/**
 * Creates a QR Code for payment
 * @param externalId Unique identifier for the transaction
 * @param amount Amount in IDR
 */
export async function createQRCode(externalId: string, amount: number): Promise<XenditQRCodeResponse> {
  const response = await fetch(`${XENDIT_BASE_URL}/qr_codes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getAuthHeader(),
    },
    body: JSON.stringify({
      external_id: externalId,
      type: 'DYNAMIC',
      callback_url: 'https://webhook.site/your-callback-url', // Replace with your webhook
      amount: amount,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create QR code');
  }

  return data;
}

/**
 * Creates an Invoice (Returns a payment link)
 */
export async function createInvoice(externalId: string, amount: number, payerEmail: string) {
  const response = await fetch(`${XENDIT_BASE_URL}/v2/invoices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getAuthHeader(),
    },
    body: JSON.stringify({
      external_id: externalId,
      amount: amount,
      payer_email: payerEmail,
      description: `TipL Order ${externalId}`,
      success_redirect_url: 'tiplapp://payment-finished',
      failure_redirect_url: 'tiplapp://payment-failed',
      should_send_email: true,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create invoice');
  }

  return data;
}
