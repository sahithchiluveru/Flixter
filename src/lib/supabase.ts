import { createClient } from '@supabase/supabase-js'

// The anon key is bundled into the extension; this is expected and safe because
// Row-Level Security enforces all access. The service_role key is never bundled.
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
