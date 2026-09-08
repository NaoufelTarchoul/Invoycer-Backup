import { createClient } from '@supabase/supabase-js';

// Hardcoded credentials as requested
const supabaseUrl = 'https://frritbvlrjwtdxlnsmxz.supabase.co';
const supabaseKey = 'sb_publishable_eLYIMn34EgekFmCZazRn5w_MreTUe76';

export const supabase = createClient(supabaseUrl, supabaseKey);