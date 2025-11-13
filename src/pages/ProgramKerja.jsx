// src/pages/ProgramKerja.jsx
// --- VERSI BARU (Papan Kanban Trello) ---

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import ProgramKerjaCard from '../components/ProgramKerjaCard'; // <-- Impor Kartu baru kita

function ProgramKerja() {
  // Kita perlu 3 state terpisah untuk 3 kolom
  const [rencanaList, setRencanaList] = useState([]);
  const [agendaList, setAgendaList] = useState([]);
  const [arsipList, setArsipList] = useState([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllProgramKerja() {
      setLoading(true);
      try {
        // Kita akan menjalankan 3 kueri secara paralel untuk efisiensi
        
        // 1. Ambil "Rencana" (status = 'Rencana')
        const fetchRencana = supabase
          .from('program_kerja')
          .select('*')
          .eq('status', 'Rencana')
          .order('divisi', { ascending: true });
          
        // 2. Ambil "Akan Datang" (status = 'Akan Datang')
        const fetchAgenda = supabase
          .from('program_kerja')
          .select('*')
          .eq('status', 'Akan Datang')
          .order('tanggal', { ascending: true }); // Acara terdekat di atas
          
        // 3. Ambil "Selesai" (status = 'Selesai')
        const fetchArsip = supabase
          .from('program_kerja')
          .select('*')
          .eq('status', 'Selesai')
          .order('tanggal', { ascending: false }); // Acara terbaru di atas

        // Jalankan semua kueri sekaligus
        const [rencanaResult, agendaResult, arsipResult] = await Promise.all([
          fetchRencana,
          fetchAgenda,
          fetchArsip
        ]);

        // Set state untuk setiap kolom
        if (rencanaResult.data) setRencanaList(rencanaResult.data);
        if (agendaResult.data) setAgendaList(agendaResult.data);
        if (arsipResult.data) setArsipList(arsipResult.data);
        
        // Lempar error jika salah satu kueri gagal
        if (rencanaResult.error) throw rencanaResult.error;
        if (agendaResult.error) throw agendaResult.error;
        if (arsipResult.error) throw arsipResult.error;

      } catch (error) {
        console.error("Error fetching program kerja:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAllProgramKerja();
  }, []); // [] = Hanya berjalan sekali saat halaman dimuat

  // --- Styling untuk Papan Kanban ---
  const boardStyle = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '20px', // Jarak antar kolom
    padding: '20px 0',
    // 'flexWrap' untuk responsivitas di HP
    flexWrap: 'wrap' 
  };

  const columnStyle = {
    flex: 1, // Setiap kolom mengambil ruang yang sama
    minWidth: '300px', // Lebar minimum sebelum 'wrap'
    backgroundColor: '#f4f5f7', // Warna latar Trello
    borderRadius: '8px',
    padding: '8px'
  };

  const columnTitleStyle = {
    padding: '10px 16px',
    margin: '0',
    fontSize: '1.2em',
    fontWeight: 'bold',
    color: '#172B4D' // Warna teks Trello
  };

  const cardContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  };

  if (loading) {
    return <p>Memuat papan program kerja...</p>;
  }

  return (
    <div>
      <h2>Papan Program Kerja OSIM</h2>
      <p>Lihat progres, agenda, dan arsip kegiatan kami secara transparan.</p>
      
      <div style={boardStyle}>
        
        {/* === KOLOM 1: RENCANA === */}
        <div style={columnStyle}>
          <h3 style={columnTitleStyle}>Rencana</h3>
          <div style={cardContainerStyle}>
            {rencanaList.length > 0 ? (
              rencanaList.map(program => (
                <ProgramKerjaCard key={program.id} program={program} />
              ))
            ) : (
              <p style={{ padding: '16px', color: '#666' }}>Tidak ada program yang sedang direncanakan.</p>
            )}
          </div>
        </div>
        
        {/* === KOLOM 2: AKAN DATANG === */}
        <div style={columnStyle}>
          <h3 style={columnTitleStyle}>Akan Datang</h3>
          <div style={cardContainerStyle}>
            {agendaList.length > 0 ? (
              agendaList.map(program => (
                <ProgramKerjaCard key={program.id} program={program} />
              ))
            ) : (
              <p style={{ padding: '16px', color: '#666' }}>Tidak ada agenda terdekat.</p>
            )}
          </div>
        </div>

        {/* === KOLOM 3: SELESAI === */}
        <div style={columnStyle}>
          <h3 style={columnTitleStyle}>Selesai</h3>
          <div style={cardContainerStyle}>
            {arsipList.length > 0 ? (
              arsipList.map(program => (
                <ProgramKerjaCard key={program.id} program={program} />
              ))
            ) : (
              <p style={{ padding: '16px', color: '#666' }}>Belum ada program yang diarsipkan.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default ProgramKerja;