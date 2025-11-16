// src/context/AuthContext.jsx
// --- VERSI 1.1 (Perbaikan: Menambahkan fungsi signOut) ---

import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set sesi saat pertama kali dimuat
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Pantau perubahan status auth (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Berhenti memantau saat komponen di-unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Objek value yang akan dibagikan ke komponen anak
  const value = {
    session,
    user,
    loading,
    
    // --- INI ADALAH PERBAIKANNYA ---
    // Kita mengekspos fungsi signOut dari supabase
    // agar komponen lain (seperti Navbar) bisa menggunakannya.
    signOut: () => supabase.auth.signOut(),
    // ---------------------------------
  };

  // Tampilkan loading screen jika sesi belum dimuat
  // atau langsung render children jika sudah
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Hook kustom untuk menggunakan context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
}