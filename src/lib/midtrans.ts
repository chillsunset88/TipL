/**
 * TipL — Midtrans Integration Helpers
 * Client-side helpers for Midtrans Snap escrow payments.
 * 
 * Flow:
 * 1. Client calls Cloud Function to create Snap token
 * 2. Client opens Midtrans Snap WebView with token
 * 3. Midtrans webhooks → Cloud Function → update Firestore order status
 */

// TODO: Replace with your Cloud Function base URL
const CLOUD_FUNCTIONS_BASE = 'https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net';

export interface CreateTransactionPayload {
  orderId: string;
  amount: number;
  buyerName: string;
  buyerEmail: string;
  itemName: string;
}

export interface MidtransTokenResponse {
  token: string;
  redirectUrl: string;
}

/**
 * Request a Midtrans Snap token from the backend Cloud Function.
 * The backend handles server-key authentication with Midtrans.
 */
export async function createMidtransTransaction(
  payload: CreateTransactionPayload
): Promise<MidtransTokenResponse> {
  const response = await fetch(`${CLOUD_FUNCTIONS_BASE}/createMidtransTransaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Midtrans token creation failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Check transaction status from the backend.
 */
export async function checkTransactionStatus(orderId: string) {
  const response = await fetch(
    `${CLOUD_FUNCTIONS_BASE}/checkMidtransStatus?orderId=${orderId}`
  );

  if (!response.ok) {
    throw new Error(`Status check failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Midtrans Snap sandbox URL for WebView.
 * In production, use 'https://app.midtrans.com/snap/v2/vtweb/'
 */
export const MIDTRANS_SNAP_URL = 'https://app.sandbox.midtrans.com/snap/v2/vtweb/';
export const MIDTRANS_SNAP_URL_PROD = 'https://app.midtrans.com/snap/v2/vtweb/';
