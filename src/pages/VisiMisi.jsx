// src/pages/VisiMisi.jsx
// --- VERSI DIPERBARUI (setelah Skrip Nuklir) ---

import React, { useState, useEffect } from 'react';
// Path ini sudah benar: VisiMisi.jsx (di pages) -> ../ (ke src) -> supabaseClient.js
import { supabase } from '../supabaseClient'; 

function VisiMisi() {
  const [visi, setVisi] = useState('');
  const [misi, setMisi] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchVisiMisi() {
      setLoading(true);
      setError(null);
      try {
        // --- INI ADALAH PERBAIKANNYA ---

        // 1. Ambil Visi
        //    Kita cari 'nama_halaman' yang sama dengan 'visi'
        const { data: visiData, error: visiError } = await supabase
          .from('konten_halaman')
          .select('konten')
          .eq('nama_halaman', 'visi') // <-- Dulu 'slug', sekarang 'nama_halaman'
          .single(); // .single() untuk mengambil 1 baris saja

        if (visiError) throw visiError;
        if (visiData) setVisi(visiData.konten);

        // 2. Ambil Misi
        //    Kita cari 'nama_halaman' yang sama dengan 'misi'
        const { data: misiData, error: misiError } = await supabase
          .from('konten_halaman')
          .select('konten')
          .eq('nama_halaman', 'misi') // <-- Dulu 'slug', sekarang 'nama_halaman'
          .single();

        if (misiError) throw misiError;
        if (misiData) setMisi(misiData.konten);

      } catch (error) {
        // Ini adalah 'catch' untuk error yang Anda lihat di konsol
        console.error("Error fetching Visi Misi:", error.message);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchVisiMisi();
  }, []); // [] = Berjalan sekali saat halaman dimuat

  // --- Styling (Sederhana) ---
  const sectionStyle = {
    margin: '20px 0',
    padding: '15px',
    border: '1px solid #eee',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9'
  };

  const contentStyle = {
    whiteSpace: 'pre-wrap', // Ini penting agar baris baru (\n) di misi terlihat
    lineHeight: '1.6',
    color: '#333'
  };

  if (loading) {
    return <p>Memuat Visi & Misi...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Gagal memuat data: {error}</p>;
  }

  return (
    <div>
      <h2>Visi & Misi OSIM</h2>
      
      <div style={sectionStyle}>
        <h3>Visi</h3>
        <p style={contentStyle}>
          {visi || 'Visi belum diatur oleh admin.'}
        </p>
      </div>
      
      <div style={sectionStyle}>
        <h3>Misi</h3>
        <p style={contentStyle}>
          {misi || 'Misi belum diatur oleh admin.'}
        </p>
      </div>
    </div>
  );
}

export default VisiMisi;