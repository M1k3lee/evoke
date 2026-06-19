-- Add claim tracking to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS sanctioned_bmac_email text,
  ADD COLUMN IF NOT EXISTS sanctioned_claimed_at timestamptz;
