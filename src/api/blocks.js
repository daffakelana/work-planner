import { supabase } from "../lib/supabase";

const fromDb = (b) => ({ id: b.id, kind: b.kind, name: b.name, value: b.value || "", steps: b.steps || [] });

export async function listBlocks() {
  const { data, error } = await supabase.from("blocks").select("*").order("kind").order("name");
  if (error) throw error;
  return (data || []).map(fromDb);
}

export async function saveBlock(id, block) {
  const { data, error } = await supabase.rpc("save_block", { p_id: id ?? null, p_block: block });
  if (error) throw error;
  return data;
}

export async function deleteBlock(id) {
  const { error } = await supabase.rpc("delete_block", { p_id: id });
  if (error) throw error;
}
