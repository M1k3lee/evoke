// server-side auth helpers. import these in server components, route
// handlers, and server actions. anything that needs to know "who is
// asking" routes through here.

import { createClient } from "./supabase/server";

export type AuthedUser = {
  id: string;
  email: string | null;
  // profile may be null if the user signed up but hasn't picked a
  // username yet. the onboarding page handles that case.
  profile: {
    id: string;
    username: string;
    display_name: string | null;
    bio: string | null;
  } | null;
};

export async function getCurrentUser(): Promise<AuthedUser | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, bio")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email ?? null,
    profile: profile ?? null,
  };
}

export async function requireUser(): Promise<AuthedUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("not signed in");
  return user;
}
