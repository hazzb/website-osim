// src/supabaseClient.js
// --- VERSI FINAL (AMAN) ---

import { createClient } from '@supabase/supabase-js'

// 1. Baca kembali dari file .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 2. Periksa apakah variabel .env berhasil dibaca
if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = "Error: Variabel VITE_SUPABASE_URL atau VITE_SUPABASE_ANON_KEY tidak ditemukan di file .env";
  console.error(errorMsg);
  alert(errorMsg);
  throw new Error(errorMsg);
}

// 3. Ekspor klien seperti biasa
export const supabase = createClient(supabaseUrl, supabaseAnonKey)