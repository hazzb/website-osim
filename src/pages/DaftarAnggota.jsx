// src/pages/DaftarAnggota.jsx
// --- VERSI 6.1 (Refaktor CSS Modules) ---

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../supabaseClient'; 
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
// --- [PERUBAHAN 1] ---
import styles from './DaftarAnggota.module.css'; // Impor CSS Module

// --- [Komponen AdminToggle (Versi CSS Module)] ---
function AdminToggle({ label, isEnabled, onToggle, isSaving }) {
  // Menggunakan styles.[nama-class]
  const toggleClasses = `${styles['admin-toggle']} ${isEnabled ? styles['toggled-on'] : styles['toggled-off']} ${isSaving ? styles['is-saving'] : ''}`;
  const labelId = `toggle-label-${label.replace(/\s+/g, '-')}`;

  return (
    <div className={toggleClasses} onClick={() => !isSaving && onToggle(!isEnabled)}>
      <label className={styles['admin-toggle-label']} id={labelId}>
        {label}
      </label>
      <div className={styles['admin-toggle-switch']} role="switch" aria-checked={isEnabled} aria-labelledby={labelId}>
        <div className={styles['admin-toggle-knob']}></div>
      </div>
    </div>
  );
}

// --- [Komponen AnggotaCard (Versi CSS Module)] ---
function AnggotaCard({ anggota, isAdmin, pengaturan }) {
  const showMotto = pengaturan.tampilkan_anggota_motto && anggota.motto;
  const showIg = pengaturan.tampilkan_anggota_ig && anggota.instagram_username;
  const showAlamat = pengaturan.tampilkan_anggota_alamat && anggota.alamat;

  return (
    // Menggunakan styles.card
    <div className={styles.card}>
      {isAdmin && (
        <Link to={`/admin/anggota/edit/${anggota.id}`} title={`Edit ${anggota.nama}`} className={styles['card-edit-button']}>
          ✏️
        </Link>
      )}
      
      <img 
        src={anggota.foto_url || 'https://via.placeholder.com/150.png/eee/808080?text=Foto'}
        alt={`Foto ${anggota.nama}`}
        className={styles['anggota-card-image']}
      />
      
      <div className={styles['anggota-card-content']}>
        <h3 className={styles['anggota-card-nama']}>{anggota.nama}</h3>
        <p className={styles['anggota-card-jabatan']}>
          {anggota.jabatan_di_divisi}
          {anggota.jenis_kelamin && (
            <span> ({anggota.jenis_kelamin})</span>
          )}
        </p>
        
        {(showMotto || showIg || showAlamat) && (
          <>
            <hr className={styles['card-divider']} />
            <div className={styles['anggota-card-info']}>
              {showMotto && ( <p className={styles['info-motto']}>"{anggota.motto}"</p> )}
              {showIg && ( <p><strong>IG:</strong> @{anggota.instagram_username}</p> )}
              {showAlamat && ( <p><strong>Alamat:</strong> {anggota.alamat}</p> )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// --- Komponen Utama DaftarAnggota ---
function DaftarAnggota() {
  // ... (Semua state dan logic useEffects tidak berubah) ...
  const [unfilteredAnggota, setUnfilteredAnggota] = useState([]);
  const [error, setError] = useState(null);
  const [periodeList, setPeriodeList] = useState([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState('');
  const [loadingPeriode, setLoadingPeriode] = useState(true);
  const [loadingAnggota, setLoadingAnggota] = useState(true);
  const { session } = useAuth();
  const isAdmin = !!session; 
  const [pengaturan, setPengaturan] = useState(null); 
  const [loadingPengaturan, setLoadingPengaturan] = useState(true);
  const [isSavingSetting, setIsSavingSetting] = useState(false);
  const [divisiOptions, setDivisiOptions] = useState([]);
  const [selectedDivisiFilter, setSelectedDivisiFilter] = useState('semua');
  const [selectedGenderFilter, setSelectedGenderFilter] = useState('semua');

  useEffect(() => {
    async function fetchInitialData() {
      setLoadingPeriode(true); setLoadingPengaturan(true);
      try {
        const fetchPeriode = supabase.from('periode_jabatan').select('*').order('tahun_mulai', { ascending: false });
        const fetchSettings = supabase.from('pengaturan').select('id, tampilkan_anggota_motto, tampilkan_anggota_ig, tampilkan_anggota_alamat').single();
        const [periodeResult, settingsResult] = await Promise.all([ fetchPeriode, fetchSettings ]);
        
        if (periodeResult.error) throw periodeResult.error;
        const periodes = periodeResult.data || [];
        setPeriodeList(periodes);
        
        const activePeriode = periodes.find(p => p.is_active);
        let defaultPeriode = activePeriode || (periodes.length > 0 ? periodes[0] : null);
        if (defaultPeriode) {
          setSelectedPeriodeId(defaultPeriode.id);
        }
        setLoadingPeriode(false);

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
    setSelectedDivisiFilter('semua');
    setSelectedGenderFilter('semua');
    setDivisiOptions([]);
    async function fetchAnggota() {
      setLoadingAnggota(true);
      setError(null);
      setUnfilteredAnggota([]);
      try {
        const { data, error } = await supabase.from('anggota_detail_view').select('*').eq('periode_id', selectedPeriodeId).order('urutan', { ascending: true }).order('nama', { ascending: true }); 
        if (error) throw error;
        if (data.length === 0) {
          setError("Belum ada anggota untuk periode ini.");
          setUnfilteredAnggota([]);
          return;
        }
        setUnfilteredAnggota(data);
        const uniqueDivisi = [...new Map(data.map(item => 
          [item.divisi_id, { id: item.divisi_id, nama_divisi: item.nama_divisi, urutan: item.urutan }]
        )).values()];
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
  }, [selectedPeriodeId]);
  
  const filteredDivisiList = useMemo(() => {
    if (unfilteredAnggota.length === 0) return [];
    let anggota = unfilteredAnggota;
    if (selectedGenderFilter !== 'semua') {
      anggota = anggota.filter(a => a.jenis_kelamin === selectedGenderFilter);
    }
    if (selectedDivisiFilter !== 'semua') {
      anggota = anggota.filter(a => a.divisi_id == selectedDivisiFilter);
    }
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
  
  const isLoading = loadingPeriode || loadingAnggota || loadingPengaturan;

  // --- Render Komponen ---
  return (
    // 'main-content' adalah class GLOBAL dari index.css
    <div className="main-content"> 
      {/* 'page-title' adalah class GLOBAL dari index.css */}
      <h1 className="page-title">Daftar Anggota</h1>

      {/* --- Filter (Versi CSS Module) --- */}
      <div className={styles['filter-bar']}>
        <span className={styles['filter-label']}>Filters:</span>
        <div className={styles['filter-group']}>
          <label htmlFor="periode-select">Periode:</label>
          <select 
            id="periode-select" 
            className={styles['filter-select']}
            value={selectedPeriodeId}
            onChange={(e) => setSelectedPeriodeId(e.target.value)}
            disabled={loadingPeriode}
          >
            {periodeList.map(p => (
              <option key={p.id} value={p.id}>
                {p.nama_kabinet || `${p.tahun_mulai}/${p.tahun_selesai}`} 
                {p.is_active && ' (Aktif)'}
              </option>
            ))}
          </select>
        </div>
        
        <div className={styles['filter-group']}>
          <label htmlFor="divisi-filter">Divisi:</label>
          <select 
            id="divisi-filter" 
            className={styles['filter-select']}
            value={selectedDivisiFilter}
            onChange={(e) => setSelectedDivisiFilter(e.target.value)}
            disabled={loadingAnggota || divisiOptions.length === 0}
          >
            <option value="semua">Semua Divisi</option>
            {divisiOptions.map(d => (
              <option key={d.id} value={d.id}>{d.nama_divisi}</option>
            ))}
          </select>
        </div>

        <div className={styles['filter-group']}>
          <label htmlFor="gender-filter">Gender:</label>
          <select 
            id="gender-filter" 
            className={styles['filter-select']}
            value={selectedGenderFilter}
            onChange={(e) => setSelectedGenderFilter(e.target.value)}
            disabled={loadingAnggota}
          >
            <option value="semua">Semua Gender</option>
            <option value="Ikhwan">Ikhwan</option>
            <option value="Akhwat">Akhwat</option>
          </select>
        </div>
      </div>
      
      {/* --- Admin Control (Versi CSS Module) --- */}
      {isAdmin && !loadingPengaturan && pengaturan && (
        <div className={styles['admin-controls']}>
          <strong className={styles['admin-controls-title']}>Kontrol Privasi Publik:</strong>
          <AdminToggle
            label="Tampilkan Motto"
            isEnabled={pengaturan.tampilkan_anggota_motto}
            isSaving={isSavingSetting}
            onToggle={(v) => handleToggleSetting('tampilkan_anggota_motto', v)}
          />
          <AdminToggle
            label="Tampilkan Instagram"
            isEnabled={pengaturan.tampilkan_anggota_ig}
            isSaving={isSavingSetting}
            onToggle={(v) => handleToggleSetting('tampilkan_anggota_ig', v)}
          />
          <AdminToggle
            label="Tampilkan Alamat"
            isEnabled={pengaturan.tampilkan_anggota_alamat} 
            isSaving={isSavingSetting}
            onToggle={(v) => handleToggleSetting('tampilkan_anggota_alamat', v)} 
          />
        </div>
      )}

      {/* 'loading-text' dan 'error-text' adalah class GLOBAL */}
      {isLoading && <p className="loading-text">Memuat Daftar Anggota...</p>}
      {error && !loadingAnggota && <p className="error-text">Error: {error}</p>}
      
      {!isLoading && !error && pengaturan && (
        <div className={styles['divisi-list']}>
          {filteredDivisiList.length > 0 ? filteredDivisiList.map(divisi => (
            <section key={divisi.nama} className={styles['divisi-section']}>
              <div className={styles['divisi-header']}>
                {divisi.logo_url && (
                  <img src={divisi.logo_url} alt={`Logo ${divisi.nama}`} className={styles['divisi-logo']} />
                )}
                <h2 className={styles['divisi-title']}>{divisi.nama}</h2>
                {isAdmin && (
                  <Link 
                    to={`/admin/anggota/tambah?periode_id=${divisi.periode_id}&divisi_id=${divisi.divisi_id}`} 
                    className={styles['add-button']} 
                    title={`Tambah Anggota ke ${divisi.nama}`}
                  >
                    +
                  </Link>
                )}
              </div>
              
              <div className={styles['card-grid']}>
                {divisi.anggota.map(anggota => (
                  <AnggotaCard 
                    key={anggota.id} 
                    anggota={anggota} 
                    isAdmin={isAdmin} 
                    pengaturan={pengaturan} 
                  />
                ))}
              </div>
            </section>
          )) : (
            // 'info-text' adalah class GLOBAL
            <p className="info-text">
              Tidak ada anggota yang cocok dengan filter Anda.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
export default DaftarAnggota;