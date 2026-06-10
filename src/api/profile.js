import { supabase, currentUserId } from "../lib/supabase";

const fromDb = (p) => p && ({
  id: p.id, fullName: p.full_name || "", location: p.location || "", monthlyGoalKm: p.monthly_goal_km ?? null,
});

export async function getProfile() {
  const id = await currentUserId();
  if (!id) return null;
  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single();
  if (error) throw error;
  return fromDb(data);
}

export async function updateProfile(patch) {
  const id = await currentUserId();
  const { data, error } = await supabase.from("profiles").update({
    full_name: patch.fullName, location: patch.location, monthly_goal_km: patch.monthlyGoalKm,
  }).eq("id", id).select().single();
  if (error) throw error;
  return fromDb(data);
}
