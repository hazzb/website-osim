// src/pages/ProgramKerja.jsx
// --- VERSI 2.3 (Sembunyikan Tab Penuh + Toggle 'Akan Datang') ---

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient'; 
import { Link } from 'react-router-dom';

// --- (Komponen Card - tidak berubah) ---
function ProgramKerjaCard({ progja }) {
  const cardStyle = { border: '1px solid #ddd', borderRadius: '8px', padding: '15px', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' };
  const titleStyle = { margin: '0 0 10px 0', color: '#0056b3', borderBottom: '1px solid #eee', paddingBottom: '10px' };
  const infoStyle = { fontSize: '0.9em', color: '#333', margin: '5px 0' };
  return (
    <div style={cardStyle}>
      <h3 style={titleStyle}>{progja.nama_acara}</h3>
      <p style={infoStyle}><strong>Tanggal:</strong> {new Date(progja.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      <p style={infoStyle}><strong>Divisi:</strong> {progja.nama_divisi}</p>
      <p style={infoStyle}><strong>PJ:</strong> {progja.nama_penanggung_jawab || '-'}</p>
    </div>
  );
}

// --- (Komponen AdminToggle - tidak berubah) ---
function AdminToggle({ label, isEnabled, onToggle, isSaving }) {
  const toggleStyle = { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: isEnabled ? '#d4edda' : '#f8d7da', border: `1px solid ${isEnabled ? '#c3e6cb' : '#f5c6cb'}`, padding: '4px 8px', borderRadius: '20px', cursor: 'pointer', opacity: isSaving ? 0.5 : 1, userSelect: 'none' };
  const switchStyle = { position: 'relative', display: 'inline-block', width: '34px', height: '20px' };
  const sliderStyle = { position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: isEnabled ? '#28a745' : '#ccc', transition: '.2s', borderRadius: '34px' };
  const knobStyle = { position: 'absolute', content: '""', height: '14px', width: '14px', left: '3px', bottom: '3px', backgroundColor: 'white', transition: '.2s', borderRadius: '50%', transform: isEnabled ? 'translateX(14px)' : 'translateX(0)' };
  return (
    <div style={toggleStyle} onClick={() => !isSaving && onToggle(!isEnabled)}>
      <span style={{fontSize: '0.8em', fontWeight: 'bold', color: '#555'}}>{label}</span>
      <div style={switchStyle}><span style={sliderStyle}></span><span style={knobStyle}></span></div>
    </div>
  );
}

// --- Komponen Utama Halaman ---
function ProgramKerja() {
  const [programList, setProgramList] = useState([]);
  const [error, setError] = useState(null);
  const [periodeList, setPeriodeList] = useState([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState('');
  const [loadingPeriode, setLoadingPeriode] = useState(true);
  const [divisiList, setDivisiList] = useState([]);
  const [selectedDivisiId, setSelectedDivisiId] = useState('semua');
  const [loadingDivisi, setLoadingDivisi] = useState(false);
  const [loadingProgram, setLoadingProgram] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pengaturan, setPengaturan] = useState(null);
  const [loadingPengaturan, setLoadingPengaturan] = useState(true);
  const [isSavingSetting, setIsSavingSetting] = useState(false);

  // --- EFEK 1: Ambil PERIODE, Sesi Admin, DAN PENGATURAN ---
  useEffect(() => {
    async function fetchInitialData() {
      setLoadingPeriode(true);
      setLoadingPengaturan(true);
      try {
        const fetchPeriode = supabase
          .from('periode_jabatan')
          .select('id, nama_kabinet, tahun_mulai, tahun_selesai, is_active')
          .order('tahun_mulai', { ascending: false });
        
        const fetchSession = supabase.auth.getSession();
        
        // --- DIMODIFIKASI: Ambil semua 3 kolom toggle ---
        const fetchSettings = supabase
          .from('pengaturan')
          .select('id, tampilkan_progja_selesai, tampilkan_progja_rencana, tampilkan_progja_akan_datang')
          .single();

        const [periodeResult, sessionResult, settingsResult] = await Promise.all([
          fetchPeriode, fetchSession, fetchSettings
        ]);

        // 1. Proses Periode
        if (periodeResult.error) throw periodeResult.error;
        const periodes = periodeResult.data || [];
        setPeriodeList(periodes);
        const activePeriode = periodes.find(p => p.is_active);
        if (activePeriode) {
          setSelectedPeriodeId(activePeriode.id);
        } else if (periodes.length > 0) {
          setSelectedPeriodeId(periodes[0].id);
        }
        setLoadingPeriode(false);

        // 2. Proses Sesi Admin
        if (sessionResult.data.session) {
          setIsAdmin(true);
        }

        // 3. Proses Pengaturan
        if (settingsResult.error) throw settingsResult.error;
        setPengaturan(settingsResult.data);
        setLoadingPengaturan(false);

      } catch (error) {
        setError("Gagal memuat data: " + error.message);
        setLoadingPeriode(false);
        setLoadingPengaturan(false);
      }
    }
    fetchInitialData();
  }, []);

  // --- (EFEK 2 & 3 - tidak berubah) ---
  useEffect(() => {
    if (!selectedPeriodeId) return;
    async function fetchDivisi() {
      setLoadingDivisi(true); setDivisiList([]); setSelectedDivisiId('semua');
      try {
        const { data, error } = await supabase.from('divisi').select('id, nama_divisi').eq('periode_id', selectedPeriodeId).order('urutan', { ascending: true });
        if (error) throw error;
        setDivisiList(data || []);
      } catch (error) { console.error("Gagal memuat daftar divisi:", error.message); } 
      finally { setLoadingDivisi(false); }
    }
    fetchDivisi();
  }, [selectedPeriodeId]);

  useEffect(() => {
    if (!selectedPeriodeId) return;
    async function fetchProgramKerja() {
      setLoadingProgram(true); setError(null); setProgramList([]);
      try {
        let query = supabase.from('program_kerja_detail_view').select('*').eq('periode_id', selectedPeriodeId);
        if (selectedDivisiId !== 'semua') {
          query = query.eq('divisi_id', selectedDivisiId);
        }
        const { data, error } = await query.order('tanggal', { ascending: true });
        if (error) throw error;
        if (data.length === 0) {
          setError("Belum ada program kerja untuk filter ini.");
        } else {
          setProgramList(data);
        }
      } catch (error) {
        console.error("Error fetching program kerja:", error.message);
        setError(error.message);
      } finally {
        setLoadingProgram(false);
      }
    }
    fetchProgramKerja();
  }, [selectedPeriodeId, selectedDivisiId]);

  // --- (Pengelompokan - tidak berubah) ---
  const groupedPrograms = useMemo(() => {
    const groups = { 'Akan Datang': [], 'Rencana': [], 'Selesai': [] };
    const statusOrder = ['Akan Datang', 'Rencana', 'Selesai'];
    programList.forEach(progja => {
      if (groups[progja.status]) groups[progja.status].push(progja);
      else groups['Rencana'].push(progja);
    });
    return Object.keys(groups)
      .map(status => ({ status: status, programs: groups[status] }))
      .sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status));
  }, [programList]);

  // --- (Fungsi Toggle - tidak berubah, sudah dinamis) ---
  const handleToggleSetting = async (key, newValue) => {
    if (!pengaturan) return;
    setIsSavingSetting(true);
    setPengaturan(prev => ({ ...prev, [key]: newValue })); // Update optimis
    try {
      const { error } = await supabase.from('pengaturan').update({ [key]: newValue }).eq('id', pengaturan.id);
      if (error) throw error;
    } catch (error) {
      alert("Gagal menyimpan pengaturan: " + error.message);
      setPengaturan(prev => ({ ...prev, [key]: !newValue })); // Kembalikan jika gagal
    } finally {
      setIsSavingSetting(false);
    }
  };
  
  // --- (Styling - tidak berubah) ---
  const pageStyle = { maxWidth: '1000px', margin: '20px auto', padding: '0 20px' };
  const headerStyle = { borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' };
  const filterContainerStyle = { display: 'flex', gap: '20px', flexWrap: 'wrap' };
  const filterGroupStyle = { padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', flex: 1, minWidth: '300px' };
  const labelStyle = { fontWeight: 'bold', marginRight: '10px', display: 'block', marginBottom: '5px' };
  const selectStyle = { padding: '8px', fontSize: '1em', width: '100%' };
  const statusGroupStyle = { marginBottom: '40px' };
  const statusHeaderStyle = { display: 'flex', alignItems: 'center', gap: '15px', paddingBottom: '10px', borderBottom: '2px solid #007bff', color: '#007bff', flexWrap: 'wrap' };
  const addProgjaBtnStyle = { display: 'inline-block', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', padding: '4px 10px', borderRadius: '50px', fontWeight: 'bold', fontSize: '1em', lineHeight: '1' };
  const cardContainerStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' };
  const shortcutButtonStyle = { position: 'fixed', bottom: '30px', right: '30px', backgroundColor: '#28a745', color: 'white', padding: '12px 18px', borderRadius: '50px', textDecoration: 'none', fontSize: '1.1em', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', zIndex: 1000 };

  // Loading utama
  const isLoading = loadingPeriode || loadingProgram || loadingPengaturan;

  return (
    <div style={pageStyle}>
      {/* ... (Pintasan Admin + Header + Filter - tidak berubah) ... */}
      {isAdmin && (
        <Link to={`/admin/program-kerja/tambah?periode_id=${selectedPeriodeId}`} style={shortcutButtonStyle} title="Tambah Program Kerja">
          +
        </Link>
      )}
      <div style={headerStyle}>
        <h1>Program Kerja</h1>
        <div style={filterContainerStyle}>
          <div style={filterGroupStyle}>
            <label style={labelStyle} htmlFor="periode-select">Tampilkan Arsip:</label>
            {loadingPeriode ? (<p>Memuat...</p>) : (
              <select id="periode-select" style={selectStyle} value={selectedPeriodeId} onChange={(e) => setSelectedPeriodeId(e.target.value)} >
                {periodeList.map(p => (
                  <option key={p.id} value={p.id}>{p.nama_kabinet || `${p.tahun_mulai}/${p.tahun_selesai}`} {p.is_active && ' (Periode Aktif)'}</option>
                ))}
              </select>
            )}
          </div>
          <div style={filterGroupStyle}>
            <label style={labelStyle} htmlFor="divisi-select">Filter per Divisi:</label>
            {loadingDivisi ? (<p>Memuat...</p>) : (
              <select id="divisi-select" style={selectStyle} value={selectedDivisiId} onChange={(e) => setSelectedDivisiId(e.target.value)} disabled={divisiList.length === 0} >
                <option value="semua">-- Tampilkan Semua Divisi --</option>
                {divisiList.map(d => (<option key={d.id} value={d.id}>{d.nama_divisi}</option>))}
              </select>
            )}
          </div>
        </div>
      </div>

      {isLoading && <h2>Memuat Program Kerja...</h2>}
      {error && <h2>Error: {error}</h2>}
      
      {/* --- RENDER LOGIKA BARU v2.3 --- */}
      {!isLoading && !error && groupedPrograms.map(group => {
        
        const isSelesai = group.status === 'Selesai';
        const isRencana = group.status === 'Rencana';
        const isAkanDatang = group.status === 'Akan Datang';
        
        // Cek apakah tab ini bisa dikontrol
        const isControllable = isSelesai || isRencana || isAkanDatang;
        
        // Tentukan apakah tab ini disembunyikan oleh pengaturan
        let isHiddenForPublic = false;
        if (isSelesai) isHiddenForPublic = !pengaturan.tampilkan_progja_selesai;
        if (isRencana) isHiddenForPublic = !pengaturan.tampilkan_progja_rencana;
        if (isAkanDatang) isHiddenForPublic = !pengaturan.tampilkan_progja_akan_datang;

        // --- INI LOGIKA BARU UNTUK MENYEMBUNYIKAN SELURUH TAB ---
        
        // 1. Gate untuk Pengunjung Publik
        if (!isAdmin) {
          if (isHiddenForPublic) return null; // 1. Pengaturan menyembunyikan
          if (group.programs.length === 0) return null; // 2. Tidak ada progja
        }
        
        // 2. Gate untuk Admin
        if (isAdmin) {
          if (group.programs.length === 0 && !isHiddenForPublic) {
            // Tab-nya kosong DAN pengaturannya "Tampil",
            // jadi tidak ada progja untuk ditampilkan DAN tidak ada toggle untuk diklik.
            return null;
          }
        }
        // --- Jika lolos gate, render section di bawah ---

        return (
          <section key={group.status} style={{
            ...statusGroupStyle, 
            opacity: (isAdmin && isHiddenForPublic) ? 0.6 : 1 // Buat transparan jika disembunyikan (hanya utk admin)
          }}>
            
            <div style={statusHeaderStyle}>
              <h2 style={{ color: '#007bff', margin: 0 }}>{group.status}</h2>
              
              {/* Tombol + Admin (Kontekstual) */}
              {isAdmin && (
                <Link to={`/admin/program-kerja/tambah?periode_id=${selectedPeriodeId}&status=${group.status}`}
                  style={addProgjaBtnStyle} title={`Tambah Progja (${group.status})`} >
                  +
                </Link>
              )}
              
              {/* Toggle Admin (HANYA untuk tab yang bisa dikontrol) */}
              {isAdmin && pengaturan && isControllable && (
                <AdminToggle
                  label={isHiddenForPublic ? "Disembunyikan" : "Tampil Publik"}
                  isEnabled={!isHiddenForPublic}
                  isSaving={isSavingSetting}
                  onToggle={(newValue) => {
                    // Tentukan key mana yang akan di-update
                    let key = '';
                    if (isSelesai) key = 'tampilkan_progja_selesai';
                    if (isRencana) key = 'tampilkan_progja_rencana';
                    if (isAkanDatang) key = 'tampilkan_progja_akan_datang';
                    
                    handleToggleSetting(key, newValue);
                  }}
                />
              )}
            </div>

            {/* Tampilkan pesan jika disembunyikan (hanya untuk admin) */}
            {isAdmin && isHiddenForPublic && (
              <p style={{color: 'red', fontStyle: 'italic', margin: '10px 0 0 0'}}>
                Tab ini disembunyikan dari pengunjung publik.
              </p>
            )}

            {/* Tampilkan card container */}
            <div style={cardContainerStyle}>
              {group.programs.map(progja => (
                <ProgramKerjaCard key={progja.id} progja={progja} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default ProgramKerja;