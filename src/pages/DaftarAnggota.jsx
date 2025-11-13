// src/pages/DaftarAnggota.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Perhatikan path '../'
import KartuAnggota from '../components/KartuAnggota'; // Impor LEGO kecil kita

function DaftarAnggota() {
  const [anggotaList, setAnggotaList] = useState([]);
  const [loading, setLoading] = useState(true); // Tambahkan state loading

  useEffect(() => {
    async function getAnggota() {
      setLoading(true); // Mulai loading
      let { data, error } = await supabase
        .from('anggota')
        .select('*');

      if (data) {
        setAnggotaList(data);
      }
      if (error) {
        console.error("Error fetching data: ", error);
      }
      setLoading(false); // Selesai loading
    }

    getAnggota();
  }, []);

  // Tampilkan pesan loading jika data belum siap
  if (loading) {
    return <p>Loading data anggota...</p>;
  }

  // Tampilkan ini jika sudah selesai loading
  return (
    <div>
      <h2>Daftar Anggota OSIM</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {/* * Ini jauh lebih bersih!
        * Kita map data dan untuk setiap item, kita panggil
        * komponen KartuAnggota, sambil 'mengoper' datanya
        * sebagai 'props'.
        */}
        {anggotaList.map((anggota) => (
          <KartuAnggota
            key={anggota.id}
            nama={anggota.nama}
            jabatan={anggota.jabatan}
            fotoUrl={anggota.foto_url} // pastikan ini sesuai nama kolom di Supabase
          />
        ))}
      </div>
    </div>
  );
}

export default DaftarAnggota;