// src/context/AuthContext.jsx
// --- VERSI STABIL (Anti-Flicker) ---

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Listener ini cukup cerdas untuk menangani sesi awal (INITIAL_SESSION)
    // dan perubahan status (SIGNED_IN, SIGNED_OUT) sekaligus.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth Event:", event, session?.user?.email); // Untuk debugging
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false); // Loading selesai segera setelah kita dapat status
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Tampilkan children hanya setelah loading selesai agar tidak flicker */}
      {!loading ? children : <div style={{padding: '2rem', textAlign:'center'}}>Memuat Sesi...</div>}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};