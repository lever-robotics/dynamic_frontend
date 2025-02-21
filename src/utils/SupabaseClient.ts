// src/utils/SupabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ugqelrsbgvwjlnzrzqab.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVncWVscnNiZ3Z3amxuenJ6cWFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk0Njk1MjIsImV4cCI6MjA1NTA0NTUyMn0.onkTRQl074KrSeQ8kmK3Kv3gUt-PAru-z1RrrK1tq5E";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);