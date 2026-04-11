import { createClient } from "@supabase/supabase-js";
import { projectId as defaultProjectId, publicAnonKey as defaultAnonKey } from "/utils/supabase/info";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || `https://${defaultProjectId}.supabase.co`;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || defaultAnonKey;

export const supabase = createClient(supabaseUrl, supabaseKey);
