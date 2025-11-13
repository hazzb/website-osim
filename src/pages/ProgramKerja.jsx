// src/pages/ProgramKerja.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import AgendaItem from '../components/AgendaItem'; // Impor komponen kita

function ProgramKerja() {
  const [programList, setProgramList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getProgramKerja() {
      setLoading(true);
      // Ambil data dari tabel 'program_kerja'
      // Kita tambahkan .order() untuk mengurutkan berdasarkan tanggal
      let { data, error } = await supabase
        .from('program_kerja')
        .select('*')
        .order('tanggal', { ascending: true }); // Urutkan: tanggal terlama dulu

      if (data) {
        setProgramList(data);
      }
      if (error) {
        console.error("Error fetching data: ", error);
      }
      setLoading(false);
    }

    getProgramKerja();
  }, []);

  if (loading) {
    return <p>Loading timeline program kerja...</p>;
  }

  return (
    <div>
      <h2>Timeline Program Kerja OSIM</h2>

      {/* Loop (map) data dan render komponen AgendaItem */}
      {programList.map((program) => (
        <AgendaItem key={program.id} agenda={program} />
      ))}

      {/* Tampilkan pesan jika tidak ada data */}
      {programList.length === 0 && !loading && (
        <p>Belum ada program kerja yang ditambahkan.</p>
      )}
    </div>
  );
}

export default ProgramKerja;