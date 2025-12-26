
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bivhpirvtgpenctvizpr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5f3uFdXFabsPTstCvEwLWw_e-kJ3naO';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
