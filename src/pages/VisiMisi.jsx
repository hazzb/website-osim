// src/pages/VisiMisi.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import ReactMarkdown from 'react-markdown'; // <-- Impor library baru kita

function VisiMisi() {
  const [halaman, setHalaman] = useState(null); // Simpan sebagai objek, bukan array
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getHalaman() {
      setLoading(true);

      // Kueri Supabase baru:
      // Ambil semua dari 'konten_halaman'
      // DI MANA (where) kolom 'slug' adalah 'visi-misi'
      // .single() berarti kita hanya mengharapkan SATU baris hasil
      let { data, error } = await supabase
        .from('konten_halaman')
        .select('*')
        .eq('slug', 'visi-misi') // .eq() artinya 'equals'
        .single();

      if (data) {
        setHalaman(data);
      }
      if (error) {
        console.error("Error fetching halaman: ", error);
      }
      setLoading(false);
    }

    getHalaman();
  }, []);

  if (loading) {
    return <p>Loading konten...</p>;
  }

  // Tampilkan jika halaman tidak ditemukan
  if (!halaman) {
    return <p>Konten 'visi-misi' tidak ditemukan.</p>;
  }

  // Jika data ada, render kontennya
  return (
    <div>
      {/* Tampilkan judul dari database */}
      <h2>{halaman.judul}</h2>

      {/* * Di sinilah keajaibannya terjadi.
        * Kita masukkan konten_markdown ke komponen <ReactMarkdown>
        * dan dia akan mengubahnya menjadi HTML.
        */}
      <ReactMarkdown>
        {halaman.konten_markdown}
      </ReactMarkdown>
    </div>
  );
}

export default VisiMisi;