import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password });
  const signUp = (email, password, fullName) =>
    supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
  const signOut = () => supabase.auth.signOut();

  return (
    <Ctx.Provider value={{ session, user: session?.user ?? null, loading, signIn, signUp, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
