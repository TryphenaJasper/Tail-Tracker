import { createClient } from "@supabase/supabase-js";

// Grab these from your Supabase project settings -> API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Example usage once you build auth (put this in a Login/Signup page):
// await supabase.auth.signUp({ email, password });
// await supabase.auth.signInWithPassword({ email, password });
// const { data: { session } } = await supabase.auth.getSession();
