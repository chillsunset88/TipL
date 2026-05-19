import { supabase } from '@/src/lib/supabase';

const db = supabase as any;

// ── Upload (stores storage PATH, not public URL) ──────────────────────────────

async function uploadVerificationPhoto(
  userId: string,
  localUri: string,
  type: 'selfie' | 'ktp',
): Promise<string> {
  const ext = (localUri.split('.').pop() ?? 'jpg').split('?')[0].toLowerCase();
  const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';

  const response = await fetch(localUri);
  if (!response.ok) throw new Error('Gagal membaca file gambar');
  const arrayBuffer = await response.arrayBuffer();

  const path = `${userId}/${type}_${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from('verifications')
    .upload(path, arrayBuffer, { upsert: false, contentType });
  if (error) throw error;

  return path; // ← path disimpan di DB, bukan public URL
}

// ── Signed URL (expires in 1 hour) ───────────────────────────────────────────

export async function getSignedUrl(storagePath: string, expiresIn = 3600): Promise<string> {
  const { data, error } = await supabase.storage
    .from('verifications')
    .createSignedUrl(storagePath, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}

export async function getSignedUrls(
  paths: string[],
  expiresIn = 3600,
): Promise<Record<string, string>> {
  if (paths.length === 0) return {};
  const { data, error } = await supabase.storage
    .from('verifications')
    .createSignedUrls(paths, expiresIn);
  if (error) throw error;
  const map: Record<string, string> = {};
  for (const item of data ?? []) {
    if (item.signedUrl && item.path) map[item.path] = item.signedUrl;
  }
  return map;
}

// ── User: submit verification ─────────────────────────────────────────────────

export async function submitVerification(
  userId: string,
  selfieUri: string,
  ktpUri: string,
): Promise<void> {
  const [selfiePath, ktpPath] = await Promise.all([
    uploadVerificationPhoto(userId, selfieUri, 'selfie'),
    uploadVerificationPhoto(userId, ktpUri, 'ktp'),
  ]);

  const { error: insertError } = await db
    .from('verifications')
    .insert({ user_id: userId, selfie_url: selfiePath, ktp_url: ktpPath });
  if (insertError) throw insertError;

  const { error: profileError } = await db
    .from('profiles')
    .update({ verification_status: 'pending', updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (profileError) throw profileError;
}

export async function getMyVerification(userId: string) {
  const { data, error } = await supabase
    .from('verifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ── Admin: manage verifications ───────────────────────────────────────────────

export type VerificationWithProfile = {
  id: string;
  user_id: string;
  selfie_url: string;
  ktp_url: string;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  full_name: string | null;
  avatar_url: string | null;
};

export async function getPendingVerifications(): Promise<VerificationWithProfile[]> {
  const { data: verifs, error } = await supabase
    .from('verifications')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });
  if (error) throw error;
  if (!verifs || verifs.length === 0) return [];

  const userIds = verifs.map((v: any) => v.user_id);
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', userIds);

  const profileMap: Record<string, any> = {};
  for (const p of (profiles as any[]) ?? []) profileMap[p.id] = p;

  return verifs.map((v: any) => ({
    ...v,
    full_name: profileMap[v.user_id]?.full_name ?? null,
    avatar_url: profileMap[v.user_id]?.avatar_url ?? null,
  }));
}

export async function updateVerificationStatus(
  verificationId: string,
  status: 'approved' | 'rejected',
  rejectionReason?: string,
): Promise<void> {
  const { error } = await db
    .from('verifications')
    .update({
      status,
      rejection_reason: rejectionReason ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', verificationId);
  if (error) throw error;
  // Trigger di DB otomatis sync ke profiles
}
