import { supabase } from "../lib/supabase";

// READ — sudah dalam bentuk app (camelCase + nested) dari fungsi get_workouts()
export async function listWorkouts() {
  const { data, error } = await supabase.rpc("get_workouts");
  if (error) throw error;
  return data || [];
}

export async function createWorkout(item) {
  const { data, error } = await supabase.rpc("create_workout", {
    p_workout: item,
    p_segments: item.structure || [],
    p_exercises: item.exercises || [],
  });
  if (error) throw error;
  return data; // id baru
}

export async function updateWorkout(id, item) {
  const { error } = await supabase.rpc("update_workout", {
    p_id: id,
    p_workout: item,
    p_segments: item.structure || [],
    p_exercises: item.exercises || [],
  });
  if (error) throw error;
}

export async function deleteWorkout(id) {
  const { error } = await supabase.rpc("delete_workout", { p_id: id });
  if (error) throw error;
}

export async function createWorkouts(items) {
  for (const it of items) await createWorkout(it);
}
