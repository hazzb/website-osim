// src/pages/ProgramKerja.jsx
// --- VERSI 6.2 (Perbaikan: Menggunakan CSS Modules untuk Filter) ---

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../supabaseClient'; 
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import styles from './ProgramKerja.module.css'; // Impor CSS Module

// --- [Komponen AdminToggle (Versi CSS Module) - Tidak berubah] ---
function AdminToggle({ label, isEnabled, onToggle, isSaving }) {
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

// --- [KOMPONEN BARU: ProgramKerjaCard (Versi CSS Module) - Tidak berubah] ---
function ProgramKerjaCard({ progja, isAdmin }) {
  let statusClass = styles['status-rencana'];
  if (progja.status === 'Selesai') {
    statusClass = styles['status-selesai'];
  } else if (progja.status === 'Akan Datang') {
    statusClass = styles['status-akan-datang'];
  }

  return (
    <div className={styles['progja-card']}>
      {isAdmin && (
        <Link to={`/admin/program-kerja/edit/${progja.id}`} title={`Edit ${progja.nama_acara}`} className={styles['card-edit-button']}>
          ✏️
        </Link>
      )}
      <div className={styles['progja-card-header']}>
        <span className={`${styles['progja-status-badge']} ${statusClass}`}>
          {progja.status}
        </span>
      </div>
      <h3 className={styles['progja-card-title']}>
        <Link to={`/program-kerja/${progja.id}`}>
          {progja.nama_acara}
        </Link>
      </h3>
      <div className={styles['progja-card-info']}>
        <p><strong>Tanggal:</strong> {new Date(progja.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <p><strong>Divisi:</strong> {progja.nama_divisi}</p>
        <p><strong>PJ:</strong> {progja.nama_penanggung_jawab || '-'}</p>
      </div>
      <div className={styles['progja-card-footer']}>
        <Link to={`/program-kerja/${progja.id}`} className={styles['card-detail-link']}>
          Lihat Detail →
        </Link>
      </div>
    </div>
  );
}

// --- Komponen Utama ProgramKerja ---
function ProgramKerja() {
  // ... (Semua state dan logic useEffects tidak berubah) ...
  const [programList, setProgramList] = useState([]);
  const [error, setError] = useState(null);
  const [periodeList, setPeriodeList] = useState([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState('');
  const [loadingPeriode, setLoadingPeriode] = useState(true);
  const [divisiList, setDivisiList] = useState([]);
  const [selectedDivisiId, setSelectedDivisiId] = useState('semua');
  const [loadingDivisi, setLoadingDivisi] = useState(false);
  const [loadingProgram, setLoadingProgram] = useState(true);
  const { session } = useAuth();
  const isAdmin = !!session;
  const [pengaturan, setPengaturan] = useState(null);
  const [loadingPengaturan, setLoadingPengaturan] = useState(true);
  const [isSavingSetting, setIsSavingSetting] = useState(false);

  useEffect(() => {
    async function fetchInitialData() {
      setLoadingPeriode(true); setLoadingPengaturan(true);
      try {
        const fetchPeriode = supabase.from('periode_jabatan').select('*').order('tahun_mulai', { ascending: false });
        const fetchSettings = supabase.from('pengaturan').select('id, tampilkan_progja_selesai, tampilkan_progja_rencana, tampilkan_progja_akan_datang').single();
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
  
  const isLoading = loadingPeriode || loadingProgram || loadingPengaturan;

  return (
    <div className="main-content">
      <h1 className="page-title">Program Kerja</h1>
      
      {/* --- [PERUBAHAN 2: Menggunakan CSS Modules] --- */}
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
          <label htmlFor="divisi-select">Divisi:</label>
          <select 
            id="divisi-select" 
            className={styles['filter-select']} 
            value={selectedDivisiId} 
            onChange={(e) => setSelectedDivisiId(e.target.value)} 
            disabled={loadingDivisi || divisiList.length === 0}
          >
            <option value="semua">Semua Divisi</option>
            {divisiList.map(d => (
              <option key={d.id} value={d.id}>{d.nama_divisi}</option>
            ))}
          </select>
        </div>
      </div>
      
      {isAdmin && !loadingPengaturan && pengaturan && (
        <div className={styles['admin-controls']}>
          <strong className={styles['admin-controls-title']}>Kontrol Tampilan Publik:</strong>
          <AdminToggle
            label="Tampilkan 'Akan Datang'"
            isEnabled={pengaturan.tampilkan_progja_akan_datang}
            isSaving={isSavingSetting}
            onToggle={(v) => handleToggleSetting('tampilkan_progja_akan_datang', v)}
          />
          <AdminToggle
            label="Tampilkan 'Rencana'"
            isEnabled={pengaturan.tampilkan_progja_rencana}
            isSaving={isSavingSetting}
            onToggle={(v) => handleToggleSetting('tampilkan_progja_rencana', v)}
          />
          <AdminToggle
            label="Tampilkan 'Selesai'"
            isEnabled={pengaturan.tampilkan_progja_selesai}
            isSaving={isSavingSetting}
            onToggle={(v) => handleToggleSetting('tampilkan_progja_selesai', v)}
          />
        </div>
      )}

      {isLoading && <p className="loading-text">Memuat Program Kerja...</p>}
      {error && !loadingProgram && <p className="error-text">Error: {error}</p>}
      
      {!isLoading && !error && pengaturan && (
        <div className={styles['divisi-list']}>
          {groupedPrograms.map(group => {
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
              <section 
                key={group.status} 
                className={`${styles['divisi-section']} ${isAdmin && isHiddenForPublic ? styles['is-hidden-admin'] : ''}`}
              >
                {/* --- [PERUBAHAN 3: Menggunakan CSS Modules] --- */}
                <div className={styles['divisi-header']}>
                  <h2 className={styles['divisi-title']}>{group.status}</h2>
                  {isAdmin && (
                    <Link 
                      to={`/admin/program-kerja/tambah?periode_id=${selectedPeriodeId}&status=${group.status}`}
                      className={styles['add-button']} 
                      title={`Tambah Progja (${group.status})`}
                    >
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
                {isAdmin && isHiddenForPublic && (
                  <p className={styles['admin-hidden-warning']}>
                    Tab ini disembunyikan dari pengunjung publik.
                  </p>
                )}
                
                <div className={styles['card-grid-progja']}>
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
      )}
    </div>
  );
}
export default ProgramKerja;