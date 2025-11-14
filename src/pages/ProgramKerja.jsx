// src/pages/ProgramKerja.jsx
// --- VERSI DIPERBARUI (setelah Skrip Nuklir) ---

import React, { useState, useEffect } from 'react';
// Path ini sudah benar: ProgramKerja.jsx (di pages) -> ../ (ke src) -> supabaseClient.js
import { supabase } from '../supabaseClient'; 
// Kita asumsikan Anda memiliki komponen Kartu Program Kerja
import ProgramKerjaCard from '../components/ProgramKerjaCard'; 

function ProgramKerja() {
  // State untuk 3 kolom "Trello"
  const [rencanaList, setRencanaList] = useState([]);
  const [agendaList, setAgendaList] = useState([]);
  const [arsipList, setArsipList] = useState([]);
  
  // State untuk menyimpan pengaturan (dari tabel 'pengaturan')
  const [pengaturan, setPengaturan] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPageData() {
      setLoading(true);
      setError(null);
      
      try {
        // --- INI ADALAH PERBAIKANNYA ---
        // Kita jalankan 2 kueri sekaligus untuk efisiensi

        // 1. Ambil Pengaturan (hanya 1 baris)
        const fetchPengaturan = supabase
          .from('pengaturan')
          .select('*')
          .eq('id', 1)
          .single();
          
        // 2. Ambil SEMUA program kerja dari view (sudah difilter 'is_active')
        const fetchProgramKerja = supabase
          .from('program_kerja_detail_view')
          .select('*');

        // Jalankan keduanya secara paralel
        const [settingsResult, programsResult] = await Promise.all([
          fetchPengaturan,
          fetchProgramKerja
        ]);

        if (settingsResult.error) throw settingsResult.error;
        if (programsResult.error) throw programsResult.error;

        // Simpan pengaturan di state
        const settings = settingsResult.data;
        setPengaturan(settings);

        // Filter data program kerja secara lokal (lebih efisien)
        const allPrograms = programsResult.data || [];
        
        // Kita gunakan .filter() di JavaScript untuk membagi data
        setRencanaList(allPrograms.filter(p => p.status === 'Rencana'));
        setAgendaList(allPrograms.filter(p => p.status === 'Akan Datang'));
        setArsipList(allPrograms.filter(p => p.status === 'Selesai'));

      } catch (error) {
        console.error("Error fetching program kerja:", error.message);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPageData();
  }, []); // [] = Hanya berjalan sekali saat halaman dimuat

  // --- Styling untuk Papan Kanban (dari refactor "Trello" kita) ---
  const boardStyle = { display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', gap: '20px', padding: '20px 0', flexWrap: 'wrap', overflowX: 'auto' };
  const columnStyle = { flex: 1, minWidth: '300px', backgroundColor: '#f4f5f7', borderRadius: '8px', padding: '8px' };
  const columnTitleStyle = { padding: '10px 16px', margin: '0', fontSize: '1.2em', fontWeight: 'bold', color: '#172B4D' };
  const cardContainerStyle = { display: 'flex', flexDirection: 'column', gap: '8px' };

  if (loading) {
    return <p>Memuat papan program kerja...</p>;
  }
  
  if (error) {
    return <p style={{ color: 'red' }}>Gagal memuat data: {error}</p>;
  }

  // Jika pengaturan belum termuat (seharusnya cepat)
  if (!pengaturan) {
    return <p>Memuat pengaturan...</p>;
  }

  // Cek jika KETIGA tombol dimatikan oleh admin
  if (!pengaturan.tampilkan_kolom_rencana && !pengaturan.tampilkan_kolom_akan_datang && !pengaturan.tampilkan_kolom_selesai) {
    return (
      <div>
        <h2>Program Kerja</h2>
        <p>Program kerja untuk periode ini akan segera diumumkan.</p>
      </div>
    );
  }

  // Jika setidaknya satu tombol nyala, tampilkan Papan Kanban
  return (
    <div>
      <h2>Papan Program Kerja OSIM</h2>
      <p>Lihat progres, agenda, dan arsip kegiatan kami secara transparan.</p>
      
      <div style={boardStyle}>
        
        {/* Kolom "Rencana" (HANYA jika diizinkan) */}
        {pengaturan.tampilkan_kolom_rencana && (
          <div style={columnStyle}>
            <h3 style={columnTitleStyle}>Rencana</h3>
            <div style={cardContainerStyle}>
              {rencanaList.length > 0 ? (
                rencanaList.map(program => (
                  // Pastikan Anda meneruskan 'program' BUKAN 'program.program'
                  <ProgramKerjaCard key={program.id} program={program} />
                ))
              ) : (
                <p style={{ padding: '16px', color: '#666' }}>Tidak ada program yang sedang direncanakan.</p>
              )}
            </div>
          </div>
        )}
        
        {/* Kolom "Akan Datang" (HANYA jika diizinkan) */}
        {pengaturan.tampilkan_kolom_akan_datang && (
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
        )}

        {/* Kolom "Selesai" (HANYA jika diizinkan) */}
        {pengaturan.tampilkan_kolom_selesai && (
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
        )}

      </div>
    </div>
  );
}

export default ProgramKerja;