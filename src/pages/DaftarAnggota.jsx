// src/pages/DaftarAnggota.jsx
// --- VERSI DIPERBARUI (setelah Skrip Nuklir) ---

import React, { useState, useEffect } from 'react';
// Path ini sudah benar: DaftarAnggota.jsx (di pages) -> ../ (ke src) -> supabaseClient.js
import { supabase } from '../supabaseClient'; 
import KartuAnggota from '../components/KartuAnggota'; // Kita asumsikan KartuAnggota masih ada

function DaftarAnggota() {
  const [anggotaList, setAnggotaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State baru untuk menyimpan info periode aktif (untuk judul)
  const [periodeInfo, setPeriodeInfo] = useState(null);

  useEffect(() => {
    async function getAnggotaAktif() {
      setLoading(true);
      setError(null);
      
      try {
        // --- INI ADALAH PERBAIKANNYA ---
        // Kita hanya perlu memanggil VIEW 'anggota_detail_view'.
        // View ini sudah otomatis memfilter 'is_active = TRUE'
        const { data, error } = await supabase
          .from('anggota_detail_view')
          .select('*')
          // Kita urutkan di sini, BUKAN di dalam view
          .order('nama', { ascending: true }); 

        if (error) throw error; // Jika error, lempar ke 'catch'

        setAnggotaList(data || []);

        // --- Atur Judul Halaman Secara Dinamis ---
        // Jika kita dapat data, ambil info periode dari anggota pertama
        if (data && data.length > 0) {
          const p = data[0]; // Info periode sudah ada di dalam data
          const namaKabinet = p.nama_kabinet ? `(${p.nama_kabinet})` : '';
          setPeriodeInfo(
            `Periode ${p.tahun_mulai}/${p.tahun_selesai} ${namaKabinet}`
          );
        } else {
          // Jika tidak ada anggota di periode aktif
          setPeriodeInfo("Periode Belum Ditetapkan oleh Admin");
        }

      } catch (error) {
        console.error("Error fetching anggota aktif (Publik): ", error.message);
        setError(error.message);
        setPeriodeInfo("Gagal memuat data");
      } finally {
        setLoading(false);
      }
    }

    getAnggotaAktif();
  }, []); // [] = Hanya berjalan sekali saat halaman dimuat

  if (loading) {
    return <p>Memuat data anggota...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Gagal memuat data: {error}</p>;
  }

  return (
    <div>
      {/* Judul sekarang dinamis berdasarkan periode 'is_active' */}
      <h2>Daftar Anggota OSIM</h2>
      <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        {periodeInfo}
      </h3>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {anggotaList.length > 0 ? (
          anggotaList.map((anggota) => (
            <KartuAnggota
              key={anggota.id}
              nama={anggota.nama}
              // Data jabatan sekarang dari 'jabatan_di_divisi'
              jabatan={anggota.jabatan_di_divisi} 
              fotoUrl={anggota.foto_url}
              // Anda mungkin ingin menambahkan 'nama_divisi' ke kartu Anda
              // namaDivisi={anggota.nama_divisi} 
            />
          ))
        ) : (
          <p>Belum ada anggota yang ditambahkan untuk periode aktif ini.</p>
        )}
      </div>
    </div>
  );
}

export default DaftarAnggota;