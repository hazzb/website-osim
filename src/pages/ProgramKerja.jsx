// src/pages/ProgramKerja.jsx
// --- VERSI SEDERHANA (TANPA MASTER SWITCH) ---

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import ProgramKerjaCard from '../components/ProgramKerjaCard';

function ProgramKerja() {
  const [rencanaList, setRencanaList] = useState([]);
  const [agendaList, setAgendaList] = useState([]);
  const [arsipList, setArsipList] = useState([]);
  
  // State untuk menyimpan pengaturan (mulai dari null)
  const [pengaturan, setPengaturan] = useState(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPageData() {
      setLoading(true);
      try {
        // --- LANGKAH 1: Ambil Pengaturan (hanya 3 tombol) ---
        const { data: settingsData, error: settingsError } = await supabase
          .from('pengaturan')
          .select('tampilkan_kolom_rencana, tampilkan_kolom_akan_datang, tampilkan_kolom_selesai')
          .eq('id', 1)
          .single();

        if (settingsError) throw settingsError;
        setPengaturan(settingsData); // Simpan pengaturan di state

        // --- LANGKAH 2: Buat daftar 'fetch' secara dinamis ---
        const fetchesToRun = [];

        if (settingsData.tampilkan_kolom_rencana) {
          fetchesToRun.push(
            supabase.from('program_kerja').select('*')
              .eq('status', 'Rencana').order('divisi', { ascending: true })
          );
        } else {
          fetchesToRun.push(Promise.resolve({ data: [] })); 
        }

        if (settingsData.tampilkan_kolom_akan_datang) {
          fetchesToRun.push(
            supabase.from('program_kerja').select('*')
              .eq('status', 'Akan Datang').order('tanggal', { ascending: true })
          );
        } else {
          fetchesToRun.push(Promise.resolve({ data: [] })); 
        }
        
        if (settingsData.tampilkan_kolom_selesai) {
          fetchesToRun.push(
            supabase.from('program_kerja').select('*')
              .eq('status', 'Selesai').order('tanggal', { ascending: false })
          );
        } else {
          fetchesToRun.push(Promise.resolve({ data: [] })); 
        }

        // Jalankan semua kueri
        const [rencanaResult, agendaResult, arsipResult] = await Promise.all(fetchesToRun);

        if (rencanaResult.data) setRencanaList(rencanaResult.data);
        if (agendaResult.data) setAgendaList(agendaResult.data);
        if (arsipResult.data) setArsipList(arsipResult.data);

      } catch (error) {
        console.error("Error fetching program kerja:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPageData();
  }, []); // [] = Hanya berjalan sekali saat halaman dimuat

  // --- Styling (Tidak ada perubahan) ---
  const boardStyle = { display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', gap: '20px', padding: '20px 0', flexWrap: 'wrap', overflowX: 'auto' };
  const columnStyle = { flex: 1, minWidth: '300px', backgroundColor: '#f4f5f7', borderRadius: '8px', padding: '8px' };
  const columnTitleStyle = { padding: '10px 16px', margin: '0', fontSize: '1.2em', fontWeight: 'bold', color: '#172B4D' };
  const cardContainerStyle = { display: 'flex', flexDirection: 'column', gap: '8px' };

  if (loading) {
    return <p>Memuat papan program kerja...</p>;
  }

  // Cek jika KETIGA tombol dimatikan, tampilkan pesan 'Segera Hadir'
  // Ini adalah pengganti 'Master Switch' Anda
  if (pengaturan && !pengaturan.tampilkan_kolom_rencana && !pengaturan.tampilkan_kolom_akan_datang && !pengaturan.tampilkan_kolom_selesai) {
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
        {pengaturan?.tampilkan_kolom_rencana && (
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
        )}
        
        {/* Kolom "Akan Datang" (HANYA jika diizinkan) */}
        {pengaturan?.tampilkan_kolom_akan_datang && (
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
        {pengaturan?.tampilkan_kolom_selesai && (
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