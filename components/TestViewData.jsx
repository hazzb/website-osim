// src/components/TestViewData.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // PASTIKAN PATH INI BENAR

export default function TestViewData() {
  const [progjaList, setProgjaList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProgja = async () => {
      // Panggil VIEW program_kerja_detail_view Anda di sini!
      const { data, error } = await supabase
        .from('program_kerja_detail_view') 
        .select('*')
        .order('tanggal', { ascending: false }); // Urutkan tanggal terbaru di atas

      if (error) {
        console.error("Error fetching data:", error);
      } else {
        setProgjaList(data);
      }
      setLoading(false);
    };

    fetchProgja();
  }, []); // [] agar hanya berjalan sekali saat komponen dimuat

  if (loading) return <h2>Memuat data Program Kerja...</h2>;

  return (
    <div>
      <h2>Data Program Kerja (Dari View)</h2>
      {progjaList.map((progja) => (
        <div key={progja.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
          <h3>{progja.nama_acara}</h3>
          <p>📅 Tanggal: {new Date(progja.tanggal).toLocaleDateString()}</p>
          <p>🏢 Divisi: <strong>{progja.nama_divisi}</strong></p> 
          <p>👤 PJ: <strong>{progja.nama_penanggung_jawab}</strong></p> 
          <p>✅ Status: {progja.status}</p>
        </div>
      ))}
    </div>
  );
}