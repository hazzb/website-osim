// src/pages/DaftarAnggota.jsx
// --- VERSI FINAL (Setelah Refactor Periode dan Perbaikan Typo) ---

import React, { useState, useEffect } from 'react'; // <-- KESALAHAN TYPO SUDAH DIPERBAIKI
import { supabase } from '../supabaseClient';
import KartuAnggota from '../components/KartuAnggota';

function DaftarAnggota() {
  const [anggotaList, setAnggotaList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State baru untuk menyimpan nama periode aktif (untuk judul)
  const [periodeAktif, setPeriodeAktif] = useState(''); 

  useEffect(() => {
    // --- FUNGSI BARU YANG JAUH LEBIH BAIK ---
    async function getAnggotaAktif() {
      setLoading(true);
      
      try {
        // Ini adalah kueri "pintar" kita:
        const { data, error } = await supabase
          .from('anggota')
          // 1. Ambil semua kolom anggota, DAN...
          .select(`
            *, 
            periode_jabatan!inner (
              tahun_mulai, 
              tahun_selesai, 
              nama_kabinet
            )
          `)
          // 2. ...HANYA jika 'is_active' di tabel 'periode_jabatan' adalah true
          .eq('periode_jabatan.is_active', true)
          // 3. Urutkan berdasarkan nama
          .order('nama', { ascending: true }); 

        if (error) throw error; // Jika ada error (misal: RLS), lempar

        setAnggotaList(data || []);

        // --- Atur Judul Halaman Secara Dinamis ---
        // Jika kita dapat data, ambil info periode dari anggota pertama
        if (data && data.length > 0) {
          const p = data[0].periode_jabatan; // Info periode yang ter-JOIN
          const namaKabinet = p.nama_kabinet ? `(${p.nama_kabinet})` : '';
          setPeriodeAktif(
            `Periode ${p.tahun_mulai}/${p.tahun_selesai} ${namaKabinet}`
          );
        } else {
          // Jika tidak ada anggota di periode aktif
          setPeriodeAktif("Periode Belum Ditetapkan");
        }

      } catch (error) {
        console.error("Error fetching anggota aktif (Publik): ", error);
        setPeriodeAktif("Gagal memuat data");
      } finally {
        setLoading(false);
      }
    }

    getAnggotaAktif();
  }, []); // [] = Hanya berjalan sekali saat halaman dimuat

  if (loading) {
    return <p>Loading data anggota...</p>;
  }

  return (
    <div>
      {/* Judul sekarang dinamis berdasarkan periode 'is_active' */}
      <h2>Daftar Anggota OSIM</h2>
      <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        {periodeAktif}
      </h3>
      
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {anggotaList.length > 0 ? (
          anggotaList.map((anggota) => (
            <KartuAnggota
              key={anggota.id}
              nama={anggota.nama}
              jabatan={anggota.jabatan}
              fotoUrl={anggota.foto_url}
            />
          ))
        ) : (
          <p>Belum ada anggota yang ditambahkan untuk periode ini.</p>
        )}
      </div>
    </div>
  );
}

export default DaftarAnggota;