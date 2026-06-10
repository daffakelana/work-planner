import { createClient } from "@supabase/supabase-js";

// Isi nilai ini di file .env (lihat .env.example):
//   VITE_SUPABASE_URL=...
//   VITE_SUPABASE_ANON_KEY=...
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(url, anonKey);

// id user yang sedang login (dibutuhkan untuk insert karena RLS).
export async function currentUserId() {
  const { data } = await supabase.auth.getUser();
  return data?.user?.id ?? null;
}
