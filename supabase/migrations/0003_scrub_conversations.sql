-- EVOKE :: 0003 — scrub conversations from existing soul records.
--
-- run this ONCE in the Supabase SQL Editor, after 0001 and 0002.
--
-- background: before the privacy fix, the soul's full ForgeState —
-- including communion.messages (the creator's live chat) — was
-- persisted into state_json. published souls therefore carried the
-- creator's conversation, readable by anyone who opened the soul.
--
-- the app no longer writes conversations (stripped at save time) and
-- never shows another operator's chat (stripped at load time). but
-- rows created BEFORE the fix still have the messages baked in. this
-- one-time UPDATE empties the communion slice on every existing row.
--
-- safe + idempotent: re-running it just re-empties already-empty
-- communion blocks. touches nothing else in state_json.

update public.souls
set state_json = jsonb_set(
  state_json,
  '{communion}',
  '{"messages":[],"pending":false,"error":null}'::jsonb,
  true  -- create the key if somehow missing
)
where state_json ? 'communion'
  and state_json -> 'communion' -> 'messages' is not null
  and jsonb_array_length(coalesce(state_json -> 'communion' -> 'messages', '[]'::jsonb)) > 0;
