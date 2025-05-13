// src/utils/SupabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ugqelrsbgvwjlnzrzqab.supabase.co";
const SUPABASE_ANON_KEY =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVncWVscnNiZ3Z3amxuenJ6cWFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMDg5NzgsImV4cCI6MjA2MjY4NDk3OH0.XqfvQ2IGrNs3CCttk0eEiGY6UgftXD8sWHllnKWnzVc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
