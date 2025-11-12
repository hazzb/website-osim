import { createClient } from '@supabase/supabase-js'

// Ambil URL dan Kunci dari file .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Buat satu 'klien' (koneksi) ke Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)