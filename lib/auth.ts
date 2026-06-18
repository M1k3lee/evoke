// server-side auth helpers. import these in server components, route
// handlers, and server actions. anything that needs to know "who is
// asking" routes through here.

import { createClient } from "./supabase/server";

export type AuthedUser = {
  id: string;
  email: string | null;
  profile: {
    id: string;
    username: string;
    display_name: string | null;
    bio: string | null;
    title: string | null;
    sanctioned: boolean;
    signals: Array<{ label: string; url: string }>;
  } | null;
};

export async function getCurrentUser(): Promise<AuthedUser | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, bio, title, sanctioned, signals")
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
