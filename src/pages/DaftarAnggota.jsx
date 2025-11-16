// src/pages/DaftarAnggota.jsx
// --- VERSI 4.2 (Refaktor UI Super Compact) ---

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient'; 
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';

// --- (Komponen AdminToggle - tidak berubah) ---
function AdminToggle({ label, isEnabled, onToggle, isSaving }) {
  const baseClasses = "flex items-center gap-2 px-3 py-1 rounded-full cursor-pointer transition-opacity select-none";
  const enabledClasses = "bg-green-100 border border-green-200";
  const disabledClasses = "bg-red-100 border border-red-200";
  const switchBase = "relative inline-block w-9 h-5 rounded-full transition-colors";
  const switchKnob = "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform";

  return (
    <div
      className={`${baseClasses} ${isEnabled ? enabledClasses : disabledClasses} ${isSaving ? 'opacity-50' : ''}`}
      onClick={() => !isSaving && onToggle(!isEnabled)}
    >
      <span className="text-xs font-bold text-gray-700">{label}</span>
      <div className={`${switchBase} ${isEnabled ? 'bg-green-500' : 'bg-gray-300'}`}>
        <span className={`${switchKnob} ${isEnabled ? 'translate-x-4' : 'translate-x-0'}`}></span>
      </div>
    </div>
  );
}

// --- (Komponen AnggotaCard - tidak berubah dari v4.1) ---
function AnggotaCard({ anggota, isAdmin, pengaturan }) {
  const showMotto = pengaturan.tampilkan_anggota_motto && anggota.motto;
  const showIg = pengaturan.tampilkan_anggota_ig && anggota.instagram_username;
  const showAlamat = pengaturan.tampilkan_anggota_alamat && anggota.alamat;

  return (
    <div 
      key={anggota.id} 
      className="relative border border-gray-200 rounded-lg p-4 shadow-md bg-white flex items-center gap-4 transition-all duration-200 hover:shadow-lg hover:border-blue-300"
    >
      {isAdmin && (
        <Link 
          to={`/admin/anggota/edit/${anggota.id}`} 
          title={`Edit ${anggota.nama}`}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 border border-gray-300 flex items-center justify-center text-lg shadow-sm hover:bg-gray-100 backdrop-blur-sm z-10"
        >
          ✏️
        </Link>
      )}
      
      <img 
        src={anggota.foto_url || 'https://via.placeholder.com/400.png/eee/808080?text=Foto'} 
        alt={`Foto ${anggota.nama}`} 
        className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-gray-100 flex-shrink-0"
      />
      
      <div className="flex-grow text-left">
        <h3 className="text-base md:text-lg font-bold text-gray-800">{anggota.nama}</h3>
        <p className="text-sm text-gray-600 italic mb-2">
          {anggota.jabatan_di_divisi}
          {anggota.jenis_kelamin && (
            <span className="text-gray-500"> ({anggota.jenis_kelamin})</span>
          )}
        </p>
        
        {(showMotto || showIg || showAlamat) && (
          <div className="pt-2 border-t border-gray-100 space-y-1 text-xs text-gray-700">
            {showMotto && ( <p className="italic">"{anggota.motto}"</p> )}
            {showIg && ( <p><strong>IG:</strong> @{anggota.instagram_username}</p> )}
            {showAlamat && ( <p><strong>Alamat:</strong> {anggota.alamat}</p> )}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Komponen Utama DaftarAnggota ---
function DaftarAnggota() {
  // ... (State & Efek - tidak berubah) ...
  const [unfilteredAnggota, setUnfilteredAnggota] = useState([]);
  const [error, setError] = useState(null);
  const [periodeList, setPeriodeList] = useState([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState('');
  const [selectedPeriodeInfo, setSelectedPeriodeInfo] = useState(null);
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
          setSelectedPeriodeInfo(defaultPeriode);
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
    setSelectedPeriodeInfo(periodeList.find(p => p.id == selectedPeriodeId));
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
  }, [selectedPeriodeId, periodeList]);
  
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
  
  // --- Style Tailwind ---
  const labelClass = "block text-sm font-bold text-gray-700 mb-2";
  const selectClass = "w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white";
  const addAnggotaBtnClass = "ml-4 px-3 py-1 bg-green-500 text-white rounded-full text-sm font-bold hover:bg-green-600 transition-colors";
  const shortcutBtnClass = "fixed bottom-8 right-8 w-14 h-14 bg-green-500 text-white rounded-full text-3xl font-bold shadow-lg hover:bg-green-600 transition-all flex items-center justify-center z-50";

  const isLoading = loadingPeriode || loadingAnggota || loadingPengaturan;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {isAdmin && (
        <Link to="/admin/anggota/tambah" title="Tambah Anggota (Umum)" className={shortcutBtnClass}>
          +
        </Link>
      )}
      
      <div className="border-b border-gray-200 pb-6 mb-6">
        <h1 className="text-4xl font-bold text-gray-900">Daftar Anggota</h1>
        {selectedPeriodeInfo && (
          <div className="mt-2">
            <h2 className="text-2xl font-semibold text-gray-700">
              {selectedPeriodeInfo.nama_kabinet} ({selectedPeriodeInfo.tahun_mulai}/{selectedPeriodeInfo.tahun_selesai})
            </h2>
            {selectedPeriodeInfo.motto_kabinet && (
              <div className="italic text-gray-600 mt-1 text-lg">
                <ReactMarkdown>{selectedPeriodeInfo.motto_kabinet}</ReactMarkdown>
              </div>
            )}
          </div>
        )}
        
        {/* --- [PERUBAHAN 1: FILTER COMPACT] --- */}
        {/* gap-6 diubah menjadi gap-4 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* p-4 diubah menjadi p-3 */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <label htmlFor="periode-select" className={labelClass}>
              Masa Jabatan:
            </label>
            {loadingPeriode ? ( <p>Memuat...</p> ) : (
              <select id="periode-select" className={selectClass} value={selectedPeriodeId}
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
          
          {/* p-4 diubah menjadi p-3 */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <label htmlFor="divisi-filter" className={labelClass}>
              Filter Divisi:
            </label>
            <select id="divisi-filter" className={selectClass}
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
          
          {/* p-4 diubah menjadi p-3 */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <label htmlFor="gender-filter" className={labelClass}>
              Filter Ikhwan/Akhwat:
            </label>
            <select id="gender-filter" className={selectClass}
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
        {/* --- [AKHIR PERUBAHAN 1] --- */}
      </div>
      
      {/* (Admin Control - tidak berubah) */}
      {isAdmin && !loadingPengaturan && pengaturan && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6 flex flex-wrap items-center gap-4">
          <strong className="w-full md:w-auto text-sm font-bold text-yellow-800">
            Kontrol Privasi Publik:
          </strong>
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

      {/* --- RENDER LIST --- */}
      {isLoading && <h2 className="text-center text-xl text-gray-500">Memuat Daftar Anggota...</h2>}
      {error && !loadingAnggota && <h2 className="text-center text-xl text-red-500">Error: {error}</h2>}
      
      {!isLoading && !error && (
        <div className="space-y-12">
          {filteredDivisiList.length > 0 ? filteredDivisiList.map(divisi => (
            <section key={divisi.nama}>
              {/* (Header Divisi - tidak berubah) */}
              <div className="flex items-center gap-4 pb-3 border-b-2"
                   style={{ borderColor: (divisi.urutan === 1) ? '#0056b3' : '#007bff' }}
              >
                {divisi.logo_url && (
                  <img src={divisi.logo_url} alt={`Logo ${divisi.nama}`} 
                       className="h-10 w-auto max-w-xs object-contain"
                  />
                )}
                <h2 className="text-3xl font-bold flex-shrink-0"
                    style={{ color: (divisi.urutan === 1) ? '#0056b3' : '#007bff' }}
                >
                  {divisi.nama}
                </h2>
                {isAdmin && (
                  <Link 
                    to={`/admin/anggota/tambah?periode_id=${divisi.periode_id}&divisi_id=${divisi.divisi_id}`}
                    className={addAnggotaBtnClass}
                    title={`Tambah Anggota ke ${divisi.nama}`}
                  >
                    +
                  </Link>
                )}
              </div>
              
              {/* --- [PERUBAHAN 2: KARTU 3 KOLOM] --- */}
              {/* md:grid-cols-2 diubah menjadi sm:grid-cols-2 lg:grid-cols-3 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {divisi.anggota.map(anggota => (
                  <AnggotaCard 
                    key={anggota.id} 
                    anggota={anggota} 
                    isAdmin={isAdmin} 
                    pengaturan={pengaturan} 
                  />
                ))}
              </div>
              {/* --- [AKHIR PERUBAHAN 2] --- */}
            </section>
          )) : (
            <p className="text-center text-lg italic text-gray-500">
              Tidak ada anggota yang cocok dengan filter Anda.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
export default DaftarAnggota;