// src/pages/TambahAnggota.jsx
// --- VERSI 4.2 (Logika URL Diperbaiki + Debug) ---

import React, { useState, useEffect, useMemo } from 'react'; // <-- 1. Impor useMemo
import { supabase } from '../supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';

function TambahAnggota() {
  const navigate = useNavigate();
  const { search } = useLocation(); // <-- 2. Dapatkan string URL

  // --- 3. Logika BARU untuk membaca URL (Lebih Stabil) ---
  const queryParams = useMemo(() => new URLSearchParams(search), [search]);
  
  const urlPeriodeId = queryParams.get('periode_id');
  const urlDivisiId = queryParams.get('divisi_id');
  
  // --- 4. DEBUG LOG ---
  console.log("--- FORM TAMBAH ANGGOTA DIMUAT ---");
  console.log("URL Search String:", search);
  console.log("Ditemukan Periode ID dari URL:", urlPeriodeId);
  console.log("Ditemukan Divisi ID dari URL:", urlDivisiId);
  // --------------------

  // State form
  const [nama, setNama] = useState('');
  const [fotoUrl, setFotoUrl] = useState('https://placehold.co/400x400/png');
  const [motto, setMotto] = useState('');
  const [instagram, setInstagram] = useState('');
  
  // State Dropdown (diisi dari URL)
  const [periodeList, setPeriodeList] = useState([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState(urlPeriodeId || '');
  const [divisiList, setDivisiList] = useState([]);
  const [selectedDivisiId, setSelectedDivisiId] = useState(urlDivisiId || '');
  
  // State Jabatan
  const [allJabatanList, setAllJabatanList] = useState([]);
  const [jabatanOptions, setJabatanOptions] = useState([]);
  const [selectedJabatan, setSelectedJabatan] = useState('');

  // State UI
  const [loadingPeriode, setLoadingPeriode] = useState(true);
  const [loadingDivisi, setLoadingDivisi] = useState(false);
  const [loadingJabatan, setLoadingJabatan] = useState(true);
  const [saving, setSaving] = useState(false);

  // --- EFEK 1: Ambil PERIODE dan JABATAN ---
  useEffect(() => {
    console.log("EFEK 1: Memuat Periode & Jabatan...");
    async function loadInitialData() {
      setLoadingPeriode(true);
      setLoadingJabatan(true);
      try {
        const fetchPeriode = supabase
          .from('periode_jabatan')
          .select('id, nama_kabinet, tahun_mulai, tahun_selesai, is_active')
          .order('tahun_mulai', { ascending: false });
        const fetchJabatan = supabase
          .from('master_jabatan')
          .select('nama_jabatan, tipe_jabatan');
        
        const [periodeResult, jabatanResult] = await Promise.all([
          fetchPeriode, 
          fetchJabatan
        ]);

        if (periodeResult.error) throw periodeResult.error;
        const periodes = periodeResult.data || [];
        setPeriodeList(periodes);
        
        // Logika Pengisian Periode
        if (!urlPeriodeId) {
          console.log("EFEK 1: Tidak ada URL Periode ID, mencari yang aktif...");
          const activePeriode = periodes.find(p => p.is_active);
          if (activePeriode) {
            setSelectedPeriodeId(activePeriode.id);
          } else if (periodes.length > 0) {
            setSelectedPeriodeId(periodes[0].id);
          }
        } else {
          console.log("EFEK 1: URL Periode ID ditemukan, mengatur state ke:", urlPeriodeId);
          setSelectedPeriodeId(urlPeriodeId); // Pastikan state di-set
        }
        
        if (jabatanResult.error) throw jabatanResult.error;
        setAllJabatanList(jabatanResult.data || []);
        
      } catch (error) {
        alert("Gagal memuat data awal: " + error.message);
      } finally {
        setLoadingPeriode(false);
        setLoadingJabatan(false);
      }
    }
    loadInitialData();
  }, [urlPeriodeId]); // Dependensi sudah benar

  // --- EFEK 2: Ambil DIVISI berdasarkan Periode ---
  useEffect(() => {
    if (!selectedPeriodeId) {
      console.log("EFEK 2: Dilewati (Periode ID belum ada)");
      return;
    }
    console.log("EFEK 2: Memuat Divisi untuk Periode ID:", selectedPeriodeId);

    async function fetchDivisi() {
      setLoadingDivisi(true);
      if (!urlDivisiId) {
        setDivisiList([]);
        setSelectedDivisiId('');
      }
      try {
        const { data, error } = await supabase
          .from('divisi')
          .select('id, nama_divisi')
          .eq('periode_id', selectedPeriodeId)
          .order('nama_divisi', { ascending: true });
          
        if (error) throw error;
        setDivisiList(data || []);
        
        if (urlDivisiId) {
          console.log("EFEK 2: URL Divisi ID ditemukan, mengatur state ke:", urlDivisiId);
          setSelectedDivisiId(urlDivisiId);
        }
        
      } catch (error) {
        alert("Gagal memuat daftar divisi: " + error.message);
      } finally {
        setLoadingDivisi(false);
      }
    }
    fetchDivisi();
  }, [selectedPeriodeId, urlDivisiId]); // Dependensi sudah benar

  // --- EFEK 3: Atur JABATAN berdasarkan Divisi (Tidak berubah) ---
  useEffect(() => {
    if (!selectedDivisiId || divisiList.length === 0) {
      console.log("EFEK 3: Dilewati (Divisi ID atau list belum ada)");
      setJabatanOptions([]);
      setSelectedJabatan('');
      return;
    }
    
    console.log("EFEK 3: Mencari Jabatan untuk Divisi ID:", selectedDivisiId);
    
    const divisiTerpilih = divisiList.find(d => d.id == selectedDivisiId);
    
    if (divisiTerpilih) {
      console.log("EFEK 3: Divisi terpilih:", divisiTerpilih.nama_divisi);
      let tipeYangDicari = (divisiTerpilih.nama_divisi === 'Pengurus Inti') ? 'Inti' : 'Divisi';
      
      const tipeKustom = allJabatanList.find(j => j.tipe_jabatan === divisiTerpilih.nama_divisi);
      if (tipeKustom) {
        tipeYangDicari = divisiTerpilih.nama_divisi;
        console.log("EFEK 3: Tipe kustom ditemukan:", tipeYangDicari);
      }

      const filteredJabatan = allJabatanList
        .filter(j => j.tipe_jabatan === tipeYangDicari)
        .map(j => j.nama_jabatan);
        
      console.log("EFEK 3: Opsi jabatan ditemukan:", filteredJabatan);
      setJabatanOptions(filteredJabatan);
    } else {
      console.log("EFEK 3: Divisi terpilih tidak ditemukan di 'divisiList'");
      setJabatanOptions([]);
    }
    setSelectedJabatan(''); 
  }, [selectedDivisiId, divisiList, allJabatanList]);

  // --- FUNGSI SUBMIT (Tidak berubah) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPeriodeId || !selectedDivisiId || !selectedJabatan) {
      alert("Harap lengkapi Periode, Divisi, dan Jabatan.");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from('anggota').insert([{ 
          nama: nama, foto_url: fotoUrl, motto: motto, 
          instagram_username: instagram, 
          jabatan_di_divisi: selectedJabatan,
          divisi_id: selectedDivisiId, 
          periode_id: selectedPeriodeId
      }]);
      if (error) throw error;
      alert('Anggota baru berhasil ditambahkan!');
      navigate('/admin/kelola-anggota');
    } catch (error) {
      alert(`Gagal menambahkan anggota: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // --- Styling (Tidak berubah) ---
  const formStyle = { display: 'flex', flexDirection: 'column', maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' };
  const inputGroupStyle = { marginBottom: '15px' };
  const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold' };
  const inputStyle = { width: '100%', padding: '8px', boxSizing: 'border-box' };
  const selectStyle = { ...inputStyle, padding: '8px', backgroundColor: '#f9f9f9' };
  const buttonStyle = { padding: '10px 15px', fontSize: '1em', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer', marginTop: '10px' };

  return (
    <div>
      <h2>Tambah Anggota Baru</h2>
      <form style={formStyle} onSubmit={handleSubmit}>
        
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="periode">1. Pilih Periode:</label>
          <select id="periode" style={selectStyle} 
            value={selectedPeriodeId}
            onChange={(e) => setSelectedPeriodeId(e.target.value)} 
            disabled={loadingPeriode || !!urlPeriodeId} // Kunci jika ID dari URL
            required 
          >
            <option value="" disabled>-- Pilih Periode --</option>
            {periodeList.map(periode => <option key={periode.id} value={periode.id}>{periode.tahun_mulai}/{periode.tahun_selesai} ({periode.nama_kabinet || 'Tanpa Nama'})</option>)}
          </select>
          {urlPeriodeId && <small>Periode diisi otomatis dari pintasan.</small>}
        </div>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ ...inputGroupStyle, flex: 1 }}>
            <label style={labelStyle} htmlFor="divisi">2. Pilih Divisi:</label>
            <select id="divisi" style={selectStyle} 
              value={selectedDivisiId}
              onChange={(e) => setSelectedDivisiId(e.target.value)} 
              disabled={loadingDivisi || divisiList.length === 0 || !!urlDivisiId} // Kunci jika ID dari URL
              required
            >
              <option value="" disabled>-- Pilih Divisi --</option>
              {divisiList.map(divisi => <option key={divisi.id} value={divisi.id}>{divisi.nama_divisi}</option>)}
            </select>
            {urlDivisiId && <small>Divisi diisi otomatis dari pintasan.</small>}
          </div>
          
          <div style={{ ...inputGroupStyle, flex: 1 }}>
            <label style={labelStyle} htmlFor="jabatan">3. Pilih Jabatan:</label>
            <select id="jabatan" style={selectStyle} value={selectedJabatan}
              onChange={(e) => setSelectedJabatan(e.target.value)} required
              disabled={loadingJabatan || jabatanOptions.length === 0} >
              <option value="" disabled>-- Pilih Jabatan --</option>
              {jabatanOptions.map(jabatan => (
                <option key={jabatan} value={jabatan}>
                  {jabatan}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ... (Input Sisa Form - tidak berubah) ... */}
        <div style={inputGroupStyle}><label style={labelStyle} htmlFor="nama">4. Nama Lengkap:</label><input style={inputStyle} type="text" id="nama" value={nama} onChange={(e) => setNama(e.target.value)} required /></div>
        <div style={inputGroupStyle}><label style={labelStyle} htmlFor="fotoUrl">URL Foto:</label><input style={inputStyle} type="text" id="fotoUrl" value={fotoUrl} onChange={(e) => setFotoUrl(e.target.value)} /></div>
        <div style={inputGroupStyle}><label style={labelStyle} htmlFor="motto">Motto (Opsional):</label><input style={inputStyle} type="text" id="motto" value={motto} onChange={(e) => setMotto(e.target.value)} /></div>
        <div style={inputGroupStyle}><label style={labelStyle} htmlFor="instagram">Username Instagram (Opsional, tanpa @):</label><input style={inputStyle} type="text" id="instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} /></div>
        
        <button style={buttonStyle} type="submit" disabled={saving || loadingPeriode || loadingDivisi || loadingJabatan}>
          {saving ? 'Menyimpan...' : 'Simpan Anggota Baru'}
        </button>
      </form>
    </div>
  );
}

export default TambahAnggota;