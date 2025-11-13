// src/context/AuthContext.jsx
// --- VERSI FINAL (Robust dengan useEffect Ganda) ---

import React, { createContext, useState, useEffect, useContext } from 'react';
// Pastikan path ini kembali ke .env (jika Anda sudah memperbaikinya)
// atau biarkan hard-coded untuk saat ini
import { supabase } from '../supabaseClient.js'; 

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  
  // 'loading' ini HANYA untuk pengecekan sesi awal
  const [loading, setLoading] = useState(true); 

  // --- EFEK 1: HANYA UNTUK SESI ---
  // Tugasnya: Mendapatkan sesi awal & mengatur listener.
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        
        // KUNCI UTAMA:
        // Setelah listener berjalan pertama kali,
        // kita tahu status sesi awal kita. Kita selesai loading.
        setLoading(false);
      }
    );

    // Fungsi cleanup
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []); // <-- Hanya berjalan sekali saat mount

  // --- EFEK 2: HANYA UNTUK PROFIL ---
  // Tugasnya: Mengawasi 'session'. Jika 'session' berubah, ambil profil.
  useEffect(() => {
    // 1. Jika tidak ada sesi (logout), bersihkan profil
    if (!session) {
      setProfile(null);
      return; // Berhenti di sini
    }

    // 2. Sesi ADA. Kita coba ambil profil.
    const getProfile = async () => {
      try {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id) // Gunakan ID dari sesi yang ada
          .single();
        
        if (error) throw error;
        
        setProfile(profileData || null);
      } catch (error) {
        console.error("Gagal mengambil profil:", error);
        setProfile(null); // Gagal? Set profil ke null.
      }
    };
    
    getProfile();

  }, [session]); // <-- INI KUNCINYA: Berjalan setiap kali 'session' berubah

  // --- Nilai yang Disediakan ---
  const value = {
    session,
    profile,
    loading, // Kita berikan 'loading' jika halaman lain perlu tahu
    logout: () => supabase.auth.signOut(),
  };

  // 'loading' sekarang HANYA melindungi dari pengecekan sesi awal.
  // Jika masih loading, jangan render apa-apa.
  if (loading) {
    return null; // Ini akan menjadi 'flash' sesaat, bukan WSOD permanen
  }

  // Selesai loading, render aplikasi
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook (tetap sama)
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }
  return context;
}