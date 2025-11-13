// src/pages/DaftarAnggota.jsx

import React, { useState, useEffect } from 'react';
// Pastikan jalur ini benar (naik satu level dari 'pages' ke 'src/')
import { supabase } from '../supabaseClient'; 

export default function DaftarAnggotaPage() {
  const [anggotaList, setAnggotaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchAnggota = async () => {
      // Panggil VIEW anggota_detail_view di sini
      const { data, error } = await supabase
        .from('anggota_detail_view') // <<< Menggunakan VIEW anggota Anda
        .select('*')
        .order('nama', { ascending: true }); // Urutkan berdasarkan nama

      if (error) {
        console.error("Error fetching anggota:", error);
        setError(error.message);
        setAnggotaList([]);
      } else {
        // Data yang Anda dapatkan sudah memiliki kolom 'nama_divisi'
        setAnggotaList(data);
      }
      setLoading(false);
    };

    fetchAnggota();
  }, []);

  if (loading) return <h2>Memuat Daftar Anggota...</h2>;
  if (error) return <div>Terjadi kesalahan saat memuat data: {error}</div>;

  return (
    <div className="daftar-anggota-container">
      <h1>Daftar Anggota OSIM</h1>
      {anggotaList.map((anggota) => (
        // Anda mungkin sudah menggunakan komponen KartuAnggota.jsx di sini
        <div key={anggota.id} className="anggota-card">
          <img src={anggota.foto_url} alt={anggota.nama} style={{ width: '100px', height: '100px' }} />
          <h3>{anggota.nama}</h3>
          <p>Divisi: <strong>{anggota.nama_divisi}</strong></p> {/* <<< Kolom baru yang sudah di-JOIN */}
          <p>Jabatan: {anggota.jabatan_di_divisi}</p>
          <p>IG: @{anggota.instagram_username}</p>
        </div>
        // Jika Anda menggunakan KartuAnggota.jsx, Anda bisa passing data ini ke sana.
      ))}
    </div>
  );
}