-- Mirasi Initial Schema
-- Run this in Supabase SQL Editor or via supabase db push

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  full_name TEXT,
  avatar_url TEXT,
  dpdp_consent BOOLEAN NOT NULL DEFAULT FALSE,
  dpdp_consent_at TIMESTAMPTZ,
  dpdp_consent_version TEXT DEFAULT '1.0',
  marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, phone, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- ============================================================
-- STYLES (15 art styles)
-- ============================================================
CREATE TABLE styles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('royal', 'folk', 'modern')),
  description TEXT NOT NULL DEFAULT '',
  short_description TEXT NOT NULL DEFAULT '',
  prompt_template TEXT NOT NULL DEFAULT '',
  negative_prompt TEXT NOT NULL DEFAULT '',
  preview_image_url TEXT,
  thumbnail_url TEXT,
  supports_dogs BOOLEAN NOT NULL DEFAULT TRUE,
  supports_cats BOOLEAN NOT NULL DEFAULT TRUE,
  supports_humans BOOLEAN NOT NULL DEFAULT TRUE,
  region TEXT NOT NULL DEFAULT 'Pan-Indian',
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Styles are public read
ALTER TABLE styles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Styles are viewable by everyone"
  ON styles FOR SELECT
  USING (is_active = TRUE);


-- ============================================================
-- GENERATIONS (AI generation jobs)
-- ============================================================
CREATE TABLE generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  style_id UUID NOT NULL REFERENCES styles(id),
  subject_type TEXT NOT NULL CHECK (subject_type IN ('pet', 'human')),
  source_image_path TEXT NOT NULL,
  generated_image_path TEXT,
  preview_image_path TEXT,
  fal_request_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  prompt_used TEXT,
  generation_time_ms INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_generations_user_id ON generations(user_id);
CREATE INDEX idx_generations_status ON generations(status);
CREATE INDEX idx_generations_fal_request_id ON generations(fal_request_id);

ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own generations"
  ON generations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own generations"
  ON generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generations"
  ON generations FOR UPDATE
  USING (auth.uid() = user_id);


-- ============================================================
-- ORDERS (Razorpay orders)
-- ============================================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  generation_id UUID NOT NULL REFERENCES generations(id),
  razorpay_order_id TEXT UNIQUE,
  amount INT NOT NULL, -- in paise
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'paid', 'failed', 'refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_razorpay_order_id ON orders(razorpay_order_id);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- PAYMENTS (verified payment records)
-- ============================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id),
  razorpay_payment_id TEXT UNIQUE NOT NULL,
  razorpay_signature TEXT NOT NULL,
  amount INT NOT NULL, -- in paise
  currency TEXT NOT NULL DEFAULT 'INR',
  method TEXT, -- upi, card, netbanking, wallet, emi
  status TEXT NOT NULL DEFAULT 'captured',
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_razorpay_payment_id ON payments(razorpay_payment_id);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = payments.order_id
      AND orders.user_id = auth.uid()
    )
  );


-- ============================================================
-- DOWNLOADS (tracking + abuse prevention)
-- ============================================================
CREATE TABLE downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  generation_id UUID NOT NULL REFERENCES generations(id),
  payment_id UUID REFERENCES payments(id),
  download_type TEXT NOT NULL DEFAULT 'watermarked' CHECK (download_type IN ('watermarked', 'hd')),
  ip_address INET,
  user_agent TEXT,
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_downloads_user_id ON downloads(user_id);
CREATE INDEX idx_downloads_generation_id ON downloads(generation_id);

ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own downloads"
  ON downloads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own downloads"
  ON downloads FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('source-images', 'source-images', FALSE, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('generated-images', 'generated-images', FALSE, 52428800, ARRAY['image/png', 'image/jpeg']),
  ('preview-images', 'preview-images', TRUE, 1048576, ARRAY['image/jpeg', 'image/webp']),
  ('style-assets', 'style-assets', TRUE, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
-- Source images: users can upload/view their own
CREATE POLICY "Users can upload source images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'source-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own source images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'source-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Preview images: public read
CREATE POLICY "Anyone can view preview images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'preview-images');

-- Style assets: public read
CREATE POLICY "Anyone can view style assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'style-assets');

-- Generated images: only accessible via API (service role), not directly
-- No public policy needed - download goes through /api/download/[id]
