// src/pages/ProgramKerja.jsx

import React, { useState, useEffect } from 'react';
// --- Import Disesuaikan: Naik satu level dari 'pages' ke 'src/' ---
import { supabase } from '../supabaseClient'; 

export default function ProgramKerjaPage() {
  const [progjaList, setProgjaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchProgja = async () => {
      // Panggil VIEW program_kerja_detail_view yang sudah di-JOIN
      const { data, error } = await supabase
        .from('program_kerja_detail_view') // <<< Menggunakan VIEW Anda
        .select('*')
        .order('tanggal', { ascending: false });

      if (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
        setProgjaList([]);
      } else {
        setProgjaList(data);
      }
      setLoading(false);
    };

    fetchProgja();
  }, []);

  if (loading) return <h2>Memuat Program Kerja...</h2>;
  if (error) return <div>Terjadi kesalahan: {error}</div>;

  return (
    <div className="program-kerja-container">
      <h1>Semua Program Kerja OSIM</h1>
      {progjaList.map((progja) => (
        // Anda mungkin sudah punya komponen ProgramKerjaCard.jsx di sini
        <div key={progja.id} className="program-card">
          <h3>{progja.nama_acara}</h3>
          <p>Divisi: <strong>{progja.nama_divisi}</strong></p> 
          <p>PJ: <strong>{progja.nama_penanggung_jawab}</strong></p> 
          <p>Status: {progja.status}</p>
        </div>
        // Anda dapat mengganti ini dengan komponen ProgramKerjaCard.jsx Anda
      ))}
    </div>
  );
}