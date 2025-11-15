// src/pages/ProgramKerja.jsx
// --- VERSI 2.8 (Link ke Halaman Detail) ---

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient'; 
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

// --- KOMPONEN CARD (DIMODIFIKASI) ---
// Sekarang tidak lagi menampilkan tombol, tapi membungkus judul dengan Link
function ProgramKerjaCard({ progja, isAdmin }) {
  const cardStyle = { 
    position: 'relative',
    border: '1px solid #ddd', 
    borderRadius: '8px', 
    padding: '15px', 
    backgroundColor: 'white', 
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)', 
    display: 'flex', 
    flexDirection: 'column', 
    height: '100%',
    transition: 'transform 0.2s, box-shadow 0.2s', // Efek hover
  };
  
  // Efek hover sederhana
  const cardHoverStyle = {
    transform: 'translateY(-3px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
  };
  
  // State untuk hover
  const [isHovered, setIsHovered] = useState(false);

  const titleStyle = { margin: '0 0 10px 0', color: '#0056b3', borderBottom: '1px solid #eee', paddingBottom: '10px' };
  const infoStyle = { fontSize: '0.9em', color: '#333', margin: '5px 0' };
  const contentStyle = { flexGrow: 1 };
  
  // --- Style Tautan Judul ---
  const titleLinkStyle = {
    textDecoration: 'none',
    color: 'inherit'
  };

  const editShortcutStyle = {
    position: 'absolute',
    top: '8px',
    right: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(2px)',
    border: '1px solid #ddd',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    color: '#333',
    fontSize: '18px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    zIndex: 10 // Pastikan di atas
  };

  return (
    <div 
      style={{ ...cardStyle, ...(isHovered ? cardHoverStyle : {}) }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isAdmin && (
        <Link 
          to={`/admin/program-kerja/edit/${progja.id}`} 
          style={editShortcutStyle}
          title={`Edit ${progja.nama_acara}`}
        >
          ✏️
        </Link>
      )}

      <div style={contentStyle}>
        {/* --- JUDUL SEKARANG ADALAH LINK --- */}
        <h3 style={titleStyle}>
          <Link to={`/program-kerja/${progja.id}`} style={titleLinkStyle}>
            {progja.nama_acara}
          </Link>
        </h3>
        {/* ------------------------------- */}
        
        <p style={infoStyle}><strong>Tanggal:</strong> {new Date(progja.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <p style={infoStyle}><strong>Divisi:</strong> {progja.nama_divisi}</p>
        <p style={infoStyle}><strong>PJ:</strong> {progja.nama_penanggung_jawab || '-'}</p>
        {progja.deskripsi && <p style={{...infoStyle, fontStyle: 'italic'}}>"{progja.deskripsi.substring(0, 100)}..."</p>}
      </div>
      
      {/* --- Footer (tombol) dihapus --- */}
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

// --- (Komponen Utama ProgramKerja & semua Efek - tidak berubah) ---
function ProgramKerja() {
  const [programList, setProgramList] = useState([]);
  const [error, setError] = useState(null);
  const [periodeList, setPeriodeList] = useState([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState('');
  const [selectedPeriodeInfo, setSelectedPeriodeInfo] = useState(null);
  const [loadingPeriode, setLoadingPeriode] = useState(true);
  const [divisiList, setDivisiList] = useState([]);
  const [selectedDivisiId, setSelectedDivisiId] = useState('semua');
  const [loadingDivisi, setLoadingDivisi] = useState(false);
  const [loadingProgram, setLoadingProgram] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pengaturan, setPengaturan] = useState(null);
  const [loadingPengaturan, setLoadingPengaturan] = useState(true);
  const [isSavingSetting, setIsSavingSetting] = useState(false);

  useEffect(() => {
    async function fetchInitialData() {
      setLoadingPeriode(true); setLoadingPengaturan(true);
      try {
        const fetchPeriode = supabase.from('periode_jabatan').select('*').order('tahun_mulai', { ascending: false });
        const fetchSession = supabase.auth.getSession();
        const fetchSettings = supabase.from('pengaturan').select('id, tampilkan_progja_selesai, tampilkan_progja_rencana, tampilkan_progja_akan_datang').single();
        const [periodeResult, sessionResult, settingsResult] = await Promise.all([ fetchPeriode, fetchSession, fetchSettings ]);
        if (periodeResult.error) throw periodeResult.error;
        const periodes = periodeResult.data || [];
        setPeriodeList(periodes);
        const activePeriode = periodes.find(p => p.is_active);
        let defaultPeriode = activePeriode || (periodes.length > 0 ? periodes[0] : null);
        if (defaultPeriode) {
          setSelectedPeriodeId(defaultPeriode.id);
          setSelectedPeriodeInfo(defaultPeriode);
        }
        setLoadingPeriode(false);
        if (sessionResult.data.session) setIsAdmin(true);
        if (settingsResult.error) throw settingsResult.error;
        setPengaturan(settingsResult.data);
        setLoadingPengaturan(false);
      } catch (error) {
        setError("Gagal memuat data: " + error.message);
        setLoadingPeriode(false); setLoadingPengaturan(false);
      }
    }
    fetchInitialData();
  }, []);

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
    setSelectedPeriodeInfo(periodeList.find(p => p.id == selectedPeriodeId));
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
  }, [selectedPeriodeId, selectedDivisiId, periodeList]);

  const groupedPrograms = useMemo(() => {
    const groups = { 'Akan Datang': [], 'Rencana': [], 'Selesai': [] };
    const statusOrder = ['Akan Datang', 'Rencana', 'Selesai'];
    programList.forEach(progja => {
      if (groups[progja.status]) groups[progja.status].push(progja);
      else groups['Rencana'].push(progja);
    });
    return Object.keys(groups).map(status => ({ status: status, programs: groups[status] })).sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status));
  }, [programList]);
  const handleToggleSetting = async (key, newValue) => {
    if (!pengaturan) return;
    setIsSavingSetting(true);
    setPengaturan(prev => ({ ...prev, [key]: newValue }));
    try {
      const { error } = await supabase.from('pengaturan').update({ [key]: newValue }).eq('id', pengaturan.id);
      if (error) throw error;
    } catch (error) {
      alert("Gagal menyimpan pengaturan: " + error.message);
      setPengaturan(prev => ({ ...prev, [key]: !newValue }));
    } finally {
      setIsSavingSetting(false);
    }
  };
  
  // --- Styling ---
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
  const mottoStyle = { fontStyle: 'italic', fontSize: '1.1em', color: '#333', marginTop: '10px' };
  const adminControlStyle = { padding: '15px', backgroundColor: '#fff8e1', border: '1px solid #ffecb3', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' };

  const isLoading = loadingPeriode || loadingProgram || loadingPengaturan;

  return (
    <div style={pageStyle}>
      {/* ... (Admin Shortcut, Header, Motto, Filter Dropdowns, Admin Toggles - tidak berubah) ... */}
      {isAdmin && ( <Link to={`/admin/program-kerja/tambah?periode_id=${selectedPeriodeId}`} style={shortcutButtonStyle} title="Tambah Program Kerja"> + </Link> )}
      <div style={headerStyle}>
        <h1>Program Kerja</h1>
        {selectedPeriodeInfo && (
          <>
            <h2 style={{color: '#444', marginBottom: '5px'}}>{selectedPeriodeInfo.nama_kabinet} ({selectedPeriodeInfo.tahun_mulai}/{selectedPeriodeInfo.tahun_selesai})</h2>
            {selectedPeriodeInfo.motto_kabinet && ( <div style={mottoStyle}><ReactMarkdown>{selectedPeriodeInfo.motto_kabinet}</ReactMarkdown></div> )}
          </>
        )}
        <div style={{...filterContainerStyle, marginTop: '20px'}}>
          <div style={filterGroupStyle}>
            <label style={labelStyle} htmlFor="periode-select">Tampilkan Arsip:</label>
            {loadingPeriode ? (<p>Memuat...</p>) : ( <select id="periode-select" style={selectStyle} value={selectedPeriodeId} onChange={(e) => setSelectedPeriodeId(e.target.value)} >{periodeList.map(p => ( <option key={p.id} value={p.id}>{p.nama_kabinet || `${p.tahun_mulai}/${p.tahun_selesai}`} {p.is_active && ' (Periode Aktif)'}</option> ))}</select> )}
          </div>
          <div style={filterGroupStyle}>
            <label style={labelStyle} htmlFor="divisi-select">Filter per Divisi:</label>
            {loadingDivisi ? (<p>Memuat...</p>) : ( <select id="divisi-select" style={selectStyle} value={selectedDivisiId} onChange={(e) => setSelectedDivisiId(e.target.value)} disabled={divisiList.length === 0} > <option value="semua">-- Tampilkan Semua Divisi --</option>{divisiList.map(d => (<option key={d.id} value={d.id}>{d.nama_divisi}</option>))} </select> )}
          </div>
        </div>
      </div>
      {isAdmin && !loadingPengaturan && pengaturan && (
        <div style={adminControlStyle}>
          <strong style={{flexBasis: '100%', color: '#665d1e'}}>Kontrol Tampilan Publik:</strong>
          <AdminToggle label="Tampilkan 'Akan Datang'" isEnabled={pengaturan.tampilkan_progja_akan_datang} isSaving={isSavingSetting} onToggle={(v) => handleToggleSetting('tampilkan_progja_akan_datang', v)} />
          <AdminToggle label="Tampilkan 'Rencana'" isEnabled={pengaturan.tampilkan_progja_rencana} isSaving={isSavingSetting} onToggle={(v) => handleToggleSetting('tampilkan_progja_rencana', v)} />
          <AdminToggle label="Tampilkan 'Selesai'" isEnabled={pengaturan.tampilkan_progja_selesai} isSaving={isSavingSetting} onToggle={(v) => handleToggleSetting('tampilkan_progja_selesai', v)} />
        </div>
      )}

      {/* --- RENDER LIST --- */}
      {isLoading && <h2>Memuat Program Kerja...</h2>}
      {error && !loadingProgram && <h2>Error: {error}</h2>}
      {!isLoading && !error && groupedPrograms.map(group => {
        // ... (logika sembunyikan - tidak berubah) ...
        const isSelesai = group.status === 'Selesai';
        const isRencana = group.status === 'Rencana';
        const isAkanDatang = group.status === 'Akan Datang';
        const isControllable = isSelesai || isRencana || isAkanDatang;
        let isHiddenForPublic = false;
        if (isSelesai) isHiddenForPublic = !pengaturan.tampilkan_progja_selesai;
        if (isRencana) isHiddenForPublic = !pengaturan.tampilkan_progja_rencana;
        if (isAkanDatang) isHiddenForPublic = !pengaturan.tampilkan_progja_akan_datang;
        if (!isAdmin) {
          if (isHiddenForPublic) return null;
          if (group.programs.length === 0) return null;
        }
        if (isAdmin) {
          if (group.programs.length === 0 && !isHiddenForPublic) return null;
        }
        return (
          <section key={group.status} style={{...statusGroupStyle, opacity: (isAdmin && isHiddenForPublic) ? 0.6 : 1 }}>
            <div style={statusHeaderStyle}>
              <h2 style={{ color: '#007bff', margin: 0 }}>{group.status}</h2>
              {isAdmin && (
                <Link to={`/admin/program-kerja/tambah?periode_id=${selectedPeriodeId}&status=${group.status}`}
                  style={addProgjaBtnStyle} title={`Tambah Progja (${group.status})`} >
                  +
                </Link>
              )}
              {isAdmin && pengaturan && isControllable && (
                <AdminToggle
                  label={isHiddenForPublic ? "Disembunyikan" : "Tampil Publik"}
                  isEnabled={!isHiddenForPublic}
                  isSaving={isSavingSetting}
                  onToggle={(newValue) => {
                    let key = '';
                    if (isSelesai) key = 'tampilkan_progja_selesai';
                    if (isRencana) key = 'tampilkan_progja_rencana';
                    if (isAkanDatang) key = 'tampilkan_progja_akan_datang';
                    handleToggleSetting(key, newValue);
                  }}
                />
              )}
            </div>
            {isAdmin && isHiddenForPublic && ( <p style={{color: 'red', fontStyle: 'italic', margin: '10px 0 0 0'}}> Tab ini disembunyikan dari pengunjung publik. </p> )}
            <div style={cardContainerStyle}>
              {group.programs.map(progja => (
                <ProgramKerjaCard 
                  key={progja.id} 
                  progja={progja} 
                  isAdmin={isAdmin} 
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
export default ProgramKerja;