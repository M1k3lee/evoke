-- ============================================================
-- EVOKE profile system — run in Supabase SQL Editor
-- ============================================================

-- 1. Extend profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS title text CHECK (char_length(title) <= 80),
  ADD COLUMN IF NOT EXISTS signals jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS sanctioned boolean NOT NULL DEFAULT false;

-- 2. Extend souls (fork tracking)
ALTER TABLE souls
  ADD COLUMN IF NOT EXISTS fork_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS forked_from uuid REFERENCES souls(id) ON DELETE SET NULL;

-- 2b. RPC to safely increment fork count
CREATE OR REPLACE FUNCTION increment_fork_count(soul_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE souls SET fork_count = fork_count + 1 WHERE id = soul_id;
$$;

-- 3. Bookmarks
CREATE TABLE IF NOT EXISTS bookmarks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  soul_id     uuid NOT NULL REFERENCES souls(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, soul_id)
);
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own bookmarks" ON bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- 4. Collections
CREATE TABLE IF NOT EXISTS collections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL CHECK (char_length(name) <= 60),
  description text CHECK (char_length(description) <= 200),
  is_public   boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own collections" ON collections
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "read public collections" ON collections
  FOR SELECT USING (is_public = true);

-- 5. Collection → soul junction
CREATE TABLE IF NOT EXISTS collection_souls (
  collection_id  uuid NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  soul_id        uuid NOT NULL REFERENCES souls(id) ON DELETE CASCADE,
  added_at       timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (collection_id, soul_id)
);
ALTER TABLE collection_souls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "collection owners manage souls" ON collection_souls
  FOR ALL USING (
    EXISTS (SELECT 1 FROM collections c WHERE c.id = collection_id AND c.user_id = auth.uid())
  );
CREATE POLICY "public collection souls readable" ON collection_souls
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM collections c WHERE c.id = collection_id AND c.is_public = true)
  );
