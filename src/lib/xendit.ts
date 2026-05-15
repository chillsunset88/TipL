/**
 * TipL — Xendit Integration
 * Creates a Xendit Invoice (hosted checkout page) with all payment methods.
 * NOTE: In production, move API calls to a backend to protect the secret key.
 */

const XENDIT_SECRET_KEY = process.env.EXPO_PUBLIC_XENDIT_SECRET_KEY ?? '';
const XENDIT_BASE = 'https://api.xendit.co';

function authHeader() {
  return 'Basic ' + btoa(`${XENDIT_SECRET_KEY}:`);
}

export interface XenditInvoice {
  id: string;
  invoice_url: string;
  status: string;
  external_id: string;
  amount: number;
}

export async function createXenditInvoice(params: {
  externalId: string;
  amount: number;
  payerEmail: string;
  description: string;
  currency?: string;
}): Promise<XenditInvoice> {
  const res = await fetch(`${XENDIT_BASE}/v2/invoices`, {
    method: 'POST',
    headers: {
      Authorization: authHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      external_id: params.externalId,
      amount: params.amount,
      payer_email: params.payerEmail,
      description: params.description,
      currency: params.currency ?? 'IDR',
      success_redirect_url: 'https://tipl.app/payment/success',
      failure_redirect_url: 'https://tipl.app/payment/failure',
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message ?? `Xendit error: ${res.status}`);
  }

  return res.json() as Promise<XenditInvoice>;
}
