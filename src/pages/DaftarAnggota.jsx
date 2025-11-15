// src/pages/DaftarAnggota.jsx
// --- VERSI 3.8 (Filter Divisi & Ikhwan/Akhwat) ---

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient'; 
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

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

// --- (Komponen AnggotaCard - tidak berubah) ---
function AnggotaCard({ anggota, isAdmin, pengaturan }) {
  const cardStyle = { position: 'relative', border: '1px solid #ddd', borderRadius: '8px', padding: '15px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', backgroundColor: 'white', display: 'flex', flexDirection: 'column' };
  const imgStyle = { width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #eee', alignSelf: 'center' };
  const nameStyle = { margin: '10px 0 5px 0', color: '#333' };
  const jabatanStyle = { color: '#555', fontSize: '0.9em', fontStyle: 'italic', marginBottom: '10px' };
  const genderStyle = { color: '#777', fontSize: '0.9em' };
  const infoContainerStyle = { marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #f0f0f0' };
  const infoStyle = { fontSize: '0.9em', color: '#666', margin: '4px 0', textAlign: 'left' };
  const editShortcutStyle = { position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(2px)', border: '1px solid #ddd', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: '#333', fontSize: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
  const showMotto = pengaturan.tampilkan_anggota_motto && anggota.motto;
  const showIg = pengaturan.tampilkan_anggota_ig && anggota.instagram_username;
  const showAlamat = pengaturan.tampilkan_anggota_alamat && anggota.alamat;
  return (
    <div key={anggota.id} style={cardStyle}>
      {isAdmin && ( <Link to={`/admin/anggota/edit/${anggota.id}`} style={editShortcutStyle} title={`Edit ${anggota.nama}`} > ✏️ </Link> )}
      <img src={anggota.foto_url || 'https://via.placeholder.com/400.png/eee/808080?text=Foto'} alt={`Foto ${anggota.nama}`} style={imgStyle} />
      <h3 style={nameStyle}>{anggota.nama}</h3>
      <p style={jabatanStyle}>
        {anggota.jabatan_di_divisi}
        {anggota.jenis_kelamin && ( <span style={genderStyle}> ({anggota.jenis_kelamin})</span> )}
      </p>
      {(showMotto || showIg || showAlamat) && (
        <div style={infoContainerStyle}>
          {showMotto && ( <p style={{...infoStyle, fontStyle: 'italic', textAlign: 'center', marginBottom: '8px'}}>"{anggota.motto}"</p> )}
          {showIg && ( <p style={infoStyle}><strong>IG:</strong> @{anggota.instagram_username}</p> )}
          {showAlamat && ( <p style={infoStyle}><strong>Alamat:</strong> {anggota.alamat}</p> )}
        </div>
      )}
    </div>
  );
}

// --- Komponen Utama DaftarAnggota ---
function DaftarAnggota() {
  const [unfilteredAnggota, setUnfilteredAnggota] = useState([]); // <-- 1. Data mentah dari DB
  const [error, setError] = useState(null);
  const [periodeList, setPeriodeList] = useState([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState('');
  const [selectedPeriodeInfo, setSelectedPeriodeInfo] = useState(null);
  const [loadingPeriode, setLoadingPeriode] = useState(true);
  const [loadingAnggota, setLoadingAnggota] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pengaturan, setPengaturan] = useState(null);
  const [loadingPengaturan, setLoadingPengaturan] = useState(true);
  const [isSavingSetting, setIsSavingSetting] = useState(false);
  
  // --- STATE BARU UNTUK FILTER ---
  const [divisiOptions, setDivisiOptions] = useState([]); // Opsi dropdown divisi
  const [selectedDivisiFilter, setSelectedDivisiFilter] = useState('semua');
  const [selectedGenderFilter, setSelectedGenderFilter] = useState('semua');
  // ---------------------------------

  // --- (EFEK 1: Ambil Data Awal - tidak berubah) ---
  useEffect(() => {
    async function fetchInitialData() {
      setLoadingPeriode(true); setLoadingPengaturan(true);
      try {
        const fetchPeriode = supabase.from('periode_jabatan').select('*').order('tahun_mulai', { ascending: false });
        const fetchSession = supabase.auth.getSession();
        const fetchSettings = supabase.from('pengaturan').select('id, tampilkan_anggota_motto, tampilkan_anggota_ig, tampilkan_anggota_alamat').single();
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

  // --- (EFEK 2: Ambil Anggota - DIMODIFIKASI) ---
  useEffect(() => {
    if (!selectedPeriodeId) return;
    
    // Reset filter & update info
    setSelectedPeriodeInfo(periodeList.find(p => p.id == selectedPeriodeId));
    setSelectedDivisiFilter('semua');
    setSelectedGenderFilter('semua');
    setDivisiOptions([]);

    async function fetchAnggota() {
      setLoadingAnggota(true);
      setError(null);
      setUnfilteredAnggota([]); // <-- 2. Set data mentah
      try {
        const { data, error } = await supabase.from('anggota_detail_view').select('*').eq('periode_id', selectedPeriodeId).order('urutan', { ascending: true }).order('nama', { ascending: true }); 
        if (error) throw error;
        if (data.length === 0) {
          setError("Belum ada anggota untuk periode ini.");
          return;
        }
        
        setUnfilteredAnggota(data); // <-- 3. Simpan data mentah
        
        // Buat opsi dropdown divisi dari data yang ada
        const uniqueDivisi = [...new Map(data.map(item => 
          [item.divisi_id, { id: item.divisi_id, nama_divisi: item.nama_divisi, urutan: item.urutan }]
        )).values()];
        // Urutkan opsi divisi
        uniqueDivisi.sort((a, b) => a.urutan - b.urutan || a.nama_divisi.localeCompare(b.nama_divisi));
        setDivisiOptions(uniqueDivisi);

      } catch (error) {
        console.error("Error fetching anggota:", error.message);
        setError(error.message);
      } finally {
        setLoadingAnggota(false);
      }
    }
    fetchAnggota();
  }, [selectedPeriodeId, periodeList]);
  
  // --- LOGIKA FILTER BARU (useMemo) ---
  const filteredDivisiList = useMemo(() => {
    if (unfilteredAnggota.length === 0) return [];

    // 1. Filter anggota berdasarkan gender
    let anggota = unfilteredAnggota;
    if (selectedGenderFilter !== 'semua') {
      anggota = anggota.filter(a => a.jenis_kelamin === selectedGenderFilter);
    }
    
    // 2. Filter anggota berdasarkan divisi
    if (selectedDivisiFilter !== 'semua') {
      anggota = anggota.filter(a => a.divisi_id == selectedDivisiFilter);
    }
    
    // 3. Kelompokkan anggota yang tersisa
    const groups = new Map();
    anggota.forEach(anggota => {
      const { nama_divisi, urutan, divisi_id, periode_id, logo_url } = anggota;
      if (!groups.has(nama_divisi)) {
        groups.set(nama_divisi, { nama: nama_divisi || 'Tanpa Divisi', urutan: urutan || 99, divisi_id: divisi_id, periode_id: periode_id, logo_url: logo_url, anggota: [] });
      }
      groups.get(nama_divisi).anggota.push(anggota);
    });
    
    const groupedArray = Array.from(groups.values());
    groupedArray.sort((a, b) => a.urutan - b.urutan || a.nama.localeCompare(b.nama));
    return groupedArray;

  }, [unfilteredAnggota, selectedDivisiFilter, selectedGenderFilter]);
  // ------------------------------------

  // --- (Fungsi handleToggleSetting - tidak berubah) ---
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
  const pageStyle = { maxWidth: '1200px', margin: '20px auto', padding: '0 20px' };
  const headerStyle = { borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' };
  // Filter baru
  const filterContainerStyle = { display: 'flex', gap: '20px', flexWrap: 'wrap' };
  const filterGroupStyle = { padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', flex: 1, minWidth: '250px' };
  const labelStyle = { fontWeight: 'bold', marginRight: '10px', display: 'block', marginBottom: '5px' };
  const selectStyle = { padding: '8px', fontSize: '1em', width: '100%' };
  // Sisa style
  const divisionGroupStyle = { marginBottom: '40px' };
  const divisionHeaderStyle = { display: 'flex', alignItems: 'center', gap: '15px', paddingBottom: '10px', borderBottom: '2px solid #007bff', color: '#007bff' };
  const divisionLogoStyle = { height: '40px', width: 'auto', maxWidth: '120px', objectFit: 'contain' };
  const addAnggotaToDivisiBtnStyle = { display: 'inline-block', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', padding: '4px 10px', borderRadius: '50px', fontWeight: 'bold', fontSize: '1em', lineHeight: '1', };
  const cardContainerStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' };
  const shortcutButtonStyle = { position: 'fixed', bottom: '30px', right: '30px', backgroundColor: '#28a745', color: 'white', padding: '12px 18px', borderRadius: '50px', textDecoration: 'none', fontSize: '1.1em', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', zIndex: 1000 };
  const mottoStyle = { fontStyle: 'italic', fontSize: '1.1em', color: '#333', marginTop: '10px' };
  const adminControlStyle = { padding: '15px', backgroundColor: '#fff8e1', border: '1px solid #ffecb3', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' };
  
  const isLoading = loadingPeriode || loadingAnggota || loadingPengaturan;

  return (
    <div style={pageStyle}>
      {isAdmin && ( <Link to="/admin/anggota/tambah" style={shortcutButtonStyle} title="Tambah Anggota (Umum)"> + </Link> )}
      
      <div style={headerStyle}>
        <h1>Daftar Anggota</h1>
        {selectedPeriodeInfo && (
          <>
            <h2 style={{color: '#444', marginBottom: '5px'}}>
              {selectedPeriodeInfo.nama_kabinet} ({selectedPeriodeInfo.tahun_mulai}/{selectedPeriodeInfo.tahun_selesai})
            </h2>
            {selectedPeriodeInfo.motto_kabinet && (
              <div style={mottoStyle}><ReactMarkdown>{selectedPeriodeInfo.motto_kabinet}</ReactMarkdown></div>
            )}
          </>
        )}
        
        {/* --- UI FILTER BARU --- */}
        <div style={{...filterContainerStyle, marginTop: '20px'}}>
          {/* Filter Periode */}
          <div style={filterGroupStyle}>
            <label style={labelStyle} htmlFor="periode-select">Masa Jabatan:</label>
            {loadingPeriode ? ( <p>Memuat...</p> ) : (
              <select id="periode-select" style={selectStyle} value={selectedPeriodeId}
                onChange={(e) => setSelectedPeriodeId(e.target.value)} >
                {periodeList.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nama_kabinet || `${p.tahun_mulai}/${p.tahun_selesai}`} 
                    {p.is_active && ' (Periode Aktif)'}
                  </option>
                ))}
              </select>
            )}
          </div>
          
          {/* Filter Divisi */}
          <div style={filterGroupStyle}>
            <label style={labelStyle} htmlFor="divisi-filter">Filter Divisi:</label>
            <select id="divisi-filter" style={selectStyle}
              value={selectedDivisiFilter}
              onChange={(e) => setSelectedDivisiFilter(e.target.value)}
              disabled={loadingAnggota || divisiOptions.length === 0}
            >
              <option value="semua">-- Tampilkan Semua Divisi --</option>
              {divisiOptions.map(d => (
                <option key={d.id} value={d.id}>{d.nama_divisi}</option>
              ))}
            </select>
          </div>
          
          {/* Filter Gender */}
          <div style={filterGroupStyle}>
            <label style={labelStyle} htmlFor="gender-filter">Filter Ikhwan/Akhwat:</label>
            <select id="gender-filter" style={selectStyle}
              value={selectedGenderFilter}
              onChange={(e) => setSelectedGenderFilter(e.target.value)}
              disabled={loadingAnggota}
            >
              <option value="semua">-- Tampilkan Semua --</option>
              <option value="Ikhwan">Ikhwan</option>
              <option value="Akhwat">Akhwat</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* ... (Kontrol Privasi Admin - tidak berubah) ... */}
      {isAdmin && !loadingPengaturan && pengaturan && (
        <div style={adminControlStyle}>
          <strong style={{flexBasis: '100%', color: '#665d1e'}}>Kontrol Privasi Publik:</strong>
          <AdminToggle label="Tampilkan Motto" isEnabled={pengaturan.tampilkan_anggota_motto} isSaving={isSavingSetting} onToggle={(v) => handleToggleSetting('tampilkan_anggota_motto', v)} />
          <AdminToggle label="Tampilkan Instagram" isEnabled={pengaturan.tampilkan_anggota_ig} isSaving={isSavingSetting} onToggle={(v) => handleToggleSetting('tampilkan_anggota_ig', v)} />
          <AdminToggle label="Tampilkan Alamat" isEnabled={pengaturan.tampilkan_anggota_alamat} isSaving={isSavingSetting} onToggle={(v) => handleToggleSetting('tampilkan_anggota_alamat', v)} />
        </div>
      )}

      {/* --- RENDER LIST (DIMODIFIKASI) --- */}
      {isLoading && <h2>Memuat Daftar Anggota...</h2>}
      {error && !loadingAnggota && <h2>Error: {error}</h2>}
      
      {!isLoading && !error && (
        // Render dari 'filteredDivisiList'
        filteredDivisiList.length > 0 ? filteredDivisiList.map(divisi => (
          <section key={divisi.nama} style={divisionGroupStyle}>
            <div style={{ ...divisionHeaderStyle, borderColor: (divisi.urutan === 1) ? '#0056b3' : '#007bff', }}>
              {divisi.logo_url && (<img src={divisi.logo_url} alt={`Logo ${divisi.nama}`} style={divisionLogoStyle} />)}
              <h2 style={{ color: (divisi.urutan === 1) ? '#0056b3' : '#007bff', margin: 0, flexShrink: 0 }}>
                {divisi.nama}
              </h2>
              {isAdmin && (
                <Link to={`/admin/anggota/tambah?periode_id=${divisi.periode_id}&divisi_id=${divisi.divisi_id}`}
                  style={addAnggotaToDivisiBtnStyle} title={`Tambah Anggota ke ${divisi.nama}`} >
                  +
                </Link>
              )}
            </div>
            <div style={cardContainerStyle}>
              {divisi.anggota.map(anggota => (
                <AnggotaCard key={anggota.id} anggota={anggota} isAdmin={isAdmin} pengaturan={pengaturan} />
              ))}
            </div>
          </section>
        )) : (
          // Pesan jika filter tidak menemukan apa-apa
          <p style={{textAlign: 'center', fontSize: '1.2em', fontStyle: 'italic'}}>Tidak ada anggota yang cocok dengan filter Anda.</p>
        )
      )}
    </div>
  );
}
export default DaftarAnggota;