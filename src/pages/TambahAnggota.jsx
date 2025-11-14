// src/pages/TambahAnggota.jsx
// --- VERSI 4.0 (Dropdown Jabatan dari Database) ---

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

// --- BAGIAN INI DIHAPUS ---
// const JABATAN_PENGURUS_INTI = [...] (DIHAPUS)
// const JABATAN_DIVISI_BIASA = [...] (DIHAPUS)
// ----------------------------

function TambahAnggota() {
  const navigate = useNavigate();

  // State untuk form (tidak berubah)
  const [nama, setNama] = useState('');
  const [fotoUrl, setFotoUrl] = useState('https://placehold.co/400x400/png');
  const [motto, setMotto] = useState('');
  const [instagram, setInstagram] = useState('');
  
  // State Dropdown (tidak berubah)
  const [periodeList, setPeriodeList] = useState([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState('');
  const [divisiList, setDivisiList] = useState([]);
  const [selectedDivisiId, setSelectedDivisiId] = useState('');
  
  // --- PERUBAHAN STATE JABATAN ---
  const [allJabatanList, setAllJabatanList] = useState([]); // Menyimpan SEMUA jabatan dari DB
  const [jabatanOptions, setJabatanOptions] = useState([]); // Opsi dropdown yang sudah difilter
  const [selectedJabatan, setSelectedJabatan] = useState('');
  // ---------------------------------

  // State UI (ditambah loadingJabatan)
  const [loadingPeriode, setLoadingPeriode] = useState(true);
  const [loadingDivisi, setLoadingDivisi] = useState(false);
  const [loadingJabatan, setLoadingJabatan] = useState(true); // <-- BARU
  const [saving, setSaving] = useState(false);

  // --- EFEK 1: Ambil daftar PERIODE dan JABATAN saat halaman dimuat ---
  useEffect(() => {
    async function loadInitialData() {
      // Set semua loading
      setLoadingPeriode(true);
      setLoadingJabatan(true);
      
      try {
        // Ambil Periode (paralel)
        const fetchPeriode = supabase
          .from('periode_jabatan')
          .select('id, nama_kabinet, tahun_mulai, tahun_selesai, is_active')
          .order('tahun_mulai', { ascending: false });
        
        // Ambil Jabatan (paralel)
        const fetchJabatan = supabase
          .from('master_jabatan') // <-- MENGAMBIL DARI TABEL BARU
          .select('nama_jabatan, tipe_jabatan');

        // Jalankan kedua fetch
        const [periodeResult, jabatanResult] = await Promise.all([
          fetchPeriode, 
          fetchJabatan
        ]);

        // Proses Periode
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

        // Proses Jabatan
        if (jabatanResult.error) throw jabatanResult.error;
        setAllJabatanList(jabatanResult.data || []); // <-- Simpan semua jabatan
        setLoadingJabatan(false);
        
      } catch (error) {
        alert("Gagal memuat data awal (periode/jabatan): " + error.message);
        setLoadingPeriode(false);
        setLoadingJabatan(false);
      }
    }
    loadInitialData();
  }, []); // [] = Hanya berjalan sekali

  // --- EFEK 2: Ambil daftar DIVISI (Tidak berubah) ---
  useEffect(() => {
    if (!selectedPeriodeId) {
      setDivisiList([]);
      setSelectedDivisiId('');
      return;
    }
    async function fetchDivisi() {
      setLoadingDivisi(true);
      setDivisiList([]);
      setSelectedDivisiId('');
      try {
        const { data, error } = await supabase.from('divisi').select('id, nama_divisi').eq('periode_id', selectedPeriodeId).order('nama_divisi', { ascending: true });
        if (error) throw error;
        setDivisiList(data || []);
      } catch (error) {
        alert("Gagal memuat daftar divisi: " + error.message);
      } finally {
        setLoadingDivisi(false);
      }
    }
    fetchDivisi();
  }, [selectedPeriodeId]);

  // --- EFEK 3 (DIPERBARUI): Atur Opsi JABATAN (Menggunakan filter, bukan array) ---
  useEffect(() => {
    if (!selectedDivisiId) {
      setJabatanOptions([]);
      setSelectedJabatan('');
      return;
    }
    
    // Cari nama divisi yang dipilih
    const divisiTerpilih = divisiList.find(d => d.id == selectedDivisiId);

    if (divisiTerpilih) {
      let tipeYangDicari = '';
      if (divisiTerpilih.nama_divisi === 'Pengurus Inti') {
        tipeYangDicari = 'Inti';
      } else {
        tipeYangDicari = 'Divisi';
      }
      
      // Filter dari 'allJabatanList' yang baru saja kita fetch
      const filteredJabatan = allJabatanList
        .filter(j => j.tipe_jabatan === tipeYangDicari)
        .map(j => j.nama_jabatan); // Kita hanya butuh 'nama_jabatan'
        
      setJabatanOptions(filteredJabatan);
      
    } else {
      setJabatanOptions([]);
    }
    setSelectedJabatan(''); 
  }, [selectedDivisiId, divisiList, allJabatanList]); // 'Trigger' saat divisi ATAU allJabatanList berubah

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
          jabatan_di_divisi: selectedJabatan, // Data dari dropdown jabatan
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

  // --- RENDER FORM (Dropdown Jabatan di-update) ---
  return (
    <div>
      <h2>Tambah Anggota Baru</h2>
      <form style={formStyle} onSubmit={handleSubmit}>
        
        {/* Dropdown Periode */}
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="periode">1. Pilih Periode:</label>
          {loadingPeriode ? <p>Memuat...</p> : (
            <select id="periode" style={selectStyle} value={selectedPeriodeId}
              onChange={(e) => setSelectedPeriodeId(e.target.value)} required >
              <option value="" disabled>-- Pilih Periode --</option>
              {periodeList.map(periode => <option key={periode.id} value={periode.id}>{periode.tahun_mulai}/{periode.tahun_selesai} ({periode.nama_kabinet || 'Tanpa Nama'})</option>)}
            </select>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          {/* Dropdown Divisi */}
          <div style={{ ...inputGroupStyle, flex: 1 }}>
            <label style={labelStyle} htmlFor="divisi">2. Pilih Divisi:</label>
            {loadingDivisi ? <p>Memuat...</p> : (
              <select id="divisi" style={selectStyle} value={selectedDivisiId}
                onChange={(e) => setSelectedDivisiId(e.target.value)} required
                disabled={divisiList.length === 0 || loadingPeriode} >
                <option value="" disabled>-- Pilih Divisi --</option>
                {divisiList.map(divisi => <option key={divisi.id} value={divisi.id}>{divisi.nama_divisi}</option>)}
              </select>
            )}
          </div>
          
          {/* Dropdown Jabatan (Sekarang dari DB) */}
          <div style={{ ...inputGroupStyle, flex: 1 }}>
            <label style={labelStyle} htmlFor="jabatan">3. Pilih Jabatan:</label>
            {loadingJabatan ? <p>Memuat...</p> : (
              <select id="jabatan" style={selectStyle} value={selectedJabatan}
                onChange={(e) => setSelectedJabatan(e.target.value)} required
                disabled={jabatanOptions.length === 0} >
                <option value="" disabled>-- Pilih Jabatan --</option>
                {jabatanOptions.map(jabatan => (
                  <option key={jabatan} value={jabatan}>
                    {jabatan}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* ... (Input Nama, Foto, Motto, IG - tidak berubah) ... */}
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