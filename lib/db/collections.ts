import { createClient } from "@/lib/supabase/client";

export type Collection = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
};

export async function listMyCollections(): Promise<Collection[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("collections")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as Collection[];
}

export async function createCollection(input: {
  name: string;
  description?: string;
  isPublic?: boolean;
}): Promise<{ ok: true; id: string } | { ok: false; reason: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "not signed in" };

  const { data, error } = await supabase
    .from("collections")
    .insert({
      user_id: user.id,
      name: input.name.slice(0, 60),
      description: input.description?.slice(0, 200) ?? null,
      is_public: input.isPublic ?? false,
    })
    .select("id")
    .single();

  if (error) return { ok: false, reason: error.message };
  return { ok: true, id: data.id };
}

export async function deleteCollection(id: string): Promise<{ ok: boolean }> {
  const supabase = createClient();
  const { error } = await supabase.from("collections").delete().eq("id", id);
  return { ok: !error };
}

export async function addSoulToCollection(
  collectionId: string,
  soulId: string,
): Promise<{ ok: boolean }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("collection_souls")
    .insert({ collection_id: collectionId, soul_id: soulId });
  return { ok: !error };
}

export async function removeSoulFromCollection(
  collectionId: string,
  soulId: string,
): Promise<{ ok: boolean }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("collection_souls")
    .delete()
    .eq("collection_id", collectionId)
    .eq("soul_id", soulId);
  return { ok: !error };
}
