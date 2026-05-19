-- ============================================================
-- TipL — Supabase RLS Policies Setup
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- custom_requests
-- ────────────────────────────────────────────────────────────
ALTER TABLE custom_requests ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can browse open requests
DROP POLICY IF EXISTS "Read open requests" ON custom_requests;
CREATE POLICY "Read open requests"
  ON custom_requests FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can post their own requests
DROP POLICY IF EXISTS "Insert own request" ON custom_requests;
CREATE POLICY "Insert own request"
  ON custom_requests FOR INSERT
  TO authenticated
  WITH CHECK (tiper_id = auth.uid());

-- Travelers can accept (update status/taken_by); buyers can update their own image_urls
DROP POLICY IF EXISTS "Update request" ON custom_requests;
CREATE POLICY "Update request"
  ON custom_requests FOR UPDATE
  TO authenticated
  USING (true);

-- Buyers can delete their own open requests
DROP POLICY IF EXISTS "Delete own request" ON custom_requests;
CREATE POLICY "Delete own request"
  ON custom_requests FOR DELETE
  TO authenticated
  USING (tiper_id = auth.uid());

-- ────────────────────────────────────────────────────────────
-- trips
-- ────────────────────────────────────────────────────────────
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read open trips" ON trips;
CREATE POLICY "Read open trips"
  ON trips FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Insert own trip" ON trips;
CREATE POLICY "Insert own trip"
  ON trips FOR INSERT
  TO authenticated
  WITH CHECK (triper_id = auth.uid());

DROP POLICY IF EXISTS "Update own trip" ON trips;
CREATE POLICY "Update own trip"
  ON trips FOR UPDATE
  TO authenticated
  USING (triper_id = auth.uid());

DROP POLICY IF EXISTS "Delete own trip" ON trips;
CREATE POLICY "Delete own trip"
  ON trips FOR DELETE
  TO authenticated
  USING (triper_id = auth.uid());

-- ────────────────────────────────────────────────────────────
-- products
-- ────────────────────────────────────────────────────────────
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read available products" ON products;
CREATE POLICY "Read available products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Insert own product" ON products;
CREATE POLICY "Insert own product"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (triper_id = auth.uid());

DROP POLICY IF EXISTS "Update own product" ON products;
CREATE POLICY "Update own product"
  ON products FOR UPDATE
  TO authenticated
  USING (triper_id = auth.uid());

-- ────────────────────────────────────────────────────────────
-- profiles
-- ────────────────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read any profile" ON profiles;
CREATE POLICY "Read any profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Update own profile" ON profiles;
CREATE POLICY "Update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Insert own profile" ON profiles;
CREATE POLICY "Insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- ────────────────────────────────────────────────────────────
-- orders
-- ────────────────────────────────────────────────────────────
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Buyer and traveler can both read orders they are part of
DROP POLICY IF EXISTS "Read own orders" ON orders;
CREATE POLICY "Read own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (tiper_id = auth.uid() OR triper_id = auth.uid());

-- Only buyer can create an order
DROP POLICY IF EXISTS "Insert own order" ON orders;
CREATE POLICY "Insert own order"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (tiper_id = auth.uid());

-- Both buyer and traveler can update the order (status transitions)
DROP POLICY IF EXISTS "Update order participant" ON orders;
CREATE POLICY "Update order participant"
  ON orders FOR UPDATE
  TO authenticated
  USING (tiper_id = auth.uid() OR triper_id = auth.uid());

-- ────────────────────────────────────────────────────────────
-- escrow_payments
-- ────────────────────────────────────────────────────────────
ALTER TABLE escrow_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read own escrow" ON escrow_payments;
CREATE POLICY "Read own escrow"
  ON escrow_payments FOR SELECT
  TO authenticated
  USING (buyer_id = auth.uid()::text OR traveler_id = auth.uid()::text);

DROP POLICY IF EXISTS "Insert escrow" ON escrow_payments;
CREATE POLICY "Insert escrow"
  ON escrow_payments FOR INSERT
  TO authenticated
  WITH CHECK (buyer_id = auth.uid()::text);

DROP POLICY IF EXISTS "Update escrow" ON escrow_payments;
CREATE POLICY "Update escrow"
  ON escrow_payments FOR UPDATE
  TO authenticated
  USING (buyer_id = auth.uid()::text OR traveler_id = auth.uid()::text);

-- ────────────────────────────────────────────────────────────
-- Storage buckets (avatars & item-images)
-- ────────────────────────────────────────────────────────────
-- Run these only if buckets don't have policies yet.
-- Check: Storage → Policies in the Supabase dashboard.

INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('item-images', 'item-images', true) ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "Avatar upload" ON storage.objects;
CREATE POLICY "Avatar upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Avatar read" ON storage.objects;
CREATE POLICY "Avatar read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Item image upload" ON storage.objects;
CREATE POLICY "Item image upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'item-images');

DROP POLICY IF EXISTS "Item image read" ON storage.objects;
CREATE POLICY "Item image read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'item-images');

-- ────────────────────────────────────────────────────────────
-- notifications
-- ────────────────────────────────────────────────────────────
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only read their own notifications
DROP POLICY IF EXISTS "Read own notifications" ON notifications;
CREATE POLICY "Read own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Any authenticated user can insert a notification for someone else (e.g. chat messages)
DROP POLICY IF EXISTS "Insert notification" ON notifications;
CREATE POLICY "Insert notification"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can only update (mark read) their own notifications
DROP POLICY IF EXISTS "Update own notifications" ON notifications;
CREATE POLICY "Update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());
