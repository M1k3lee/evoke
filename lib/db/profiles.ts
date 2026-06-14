// profile operations. one row per signed-up user.
// username is picked on the onboarding page (post-signup).

import { createClient } from "@/lib/supabase/client";

const USERNAME_RE = /^[a-z0-9_-]{3,30}$/;

export function validateUsername(username: string): { ok: true } | { ok: false; reason: string } {
  if (!username) return { ok: false, reason: "username required" };
  if (username.length < 3) return { ok: false, reason: "minimum 3 characters" };
  if (username.length > 30) return { ok: false, reason: "maximum 30 characters" };
  if (!USERNAME_RE.test(username)) return { ok: false, reason: "lowercase letters, numbers, _ and - only" };
  return { ok: true };
}

export async function checkUsernameAvailable(username: string): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  if (error) return false;
  return !data;
}

export async function createProfile(input: {
  username: string;
  displayName?: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "not signed in" };

  const v = validateUsername(input.username);
  if (!v.ok) return v;

  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    username: input.username,
    display_name: input.displayName || null,
  });

  if (error) {
    if (error.code === "23505") return { ok: false, reason: "username taken" };
    return { ok: false, reason: error.message };
  }

  return { ok: true };
}

export async function updateProfile(input: {
  displayName?: string | null;
  bio?: string | null;
  matureContentEnabled?: boolean;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "not signed in" };

  const update: Record<string, unknown> = {};
  if (input.displayName !== undefined) update.display_name = input.displayName;
  if (input.bio !== undefined) update.bio = input.bio;
  if (input.matureContentEnabled !== undefined) update.mature_content_enabled = input.matureContentEnabled;

  const { error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", user.id);

  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function getMyMatureOptIn(): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("profiles")
    .select("mature_content_enabled")
    .eq("id", user.id)
    .maybeSingle();
  return !!data?.mature_content_enabled;
}
