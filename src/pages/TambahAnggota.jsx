// src/pages/TambahAnggota.jsx
// --- VERSI 5.2 (Validasi Ketat 200KB, TANPA Kompresi) ---

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';
// Hapus 'import imageCompression'

function TambahAnggota() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const queryParams = useMemo(() => new URLSearchParams(search), [search]);
  const urlPeriodeId = queryParams.get('periode_id');
  const urlDivisiId = queryParams.get('divisi_id');

  const placeholderFoto = 'https://via.placeholder.com/400.png/eee/808080?text=Preview+Foto';

  // State form
  const [nama, setNama] = useState('');
  const [motto, setMotto] = useState('');
  const [instagram, setInstagram] = useState('');
  
  // State Foto
  const [selectedFile, setSelectedFile] = useState(null); // File mentah dari input
  const [previewUrl, setPreviewUrl] = useState(placeholderFoto);
  const [uploading, setUploading] = useState(false);
  
  // ... (State Dropdown & Jabatan - tidak berubah) ...
  const [periodeList, setPeriodeList] = useState([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState(urlPeriodeId || '');
  const [divisiList, setDivisiList] = useState([]);
  const [selectedDivisiId, setSelectedDivisiId] = useState(urlDivisiId || '');
  const [allJabatanList, setAllJabatanList] = useState([]);
  const [jabatanOptions, setJabatanOptions] = useState([]);
  const [selectedJabatan, setSelectedJabatan] = useState('');
  const [loadingPeriode, setLoadingPeriode] = useState(true);
  const [loadingDivisi, setLoadingDivisi] = useState(false);
  const [loadingJabatan, setLoadingJabatan] = useState(true);

  // --- (Efek 1, 2, 3 - tidak berubah) ---
  useEffect(() => {
    async function loadInitialData() {
      setLoadingPeriode(true); setLoadingJabatan(true);
      try {
        const fetchPeriode = supabase.from('periode_jabatan').select('id, nama_kabinet, tahun_mulai, tahun_selesai, is_active').order('tahun_mulai', { ascending: false });
        const fetchJabatan = supabase.from('master_jabatan').select('nama_jabatan, tipe_jabatan');
        const [periodeResult, jabatanResult] = await Promise.all([fetchPeriode, fetchJabatan]);
        if (periodeResult.error) throw periodeResult.error;
        const periodes = periodeResult.data || [];
        setPeriodeList(periodes);
        if (!urlPeriodeId) {
          const activePeriode = periodes.find(p => p.is_active);
          if (activePeriode) setSelectedPeriodeId(activePeriode.id);
          else if (periodes.length > 0) setSelectedPeriodeId(periodes[0].id);
        } else {
          setSelectedPeriodeId(urlPeriodeId);
        }
        if (jabatanResult.error) throw jabatanResult.error;
        setAllJabatanList(jabatanResult.data || []);
      } catch (error) { alert("Gagal memuat data awal: " + error.message); } 
      finally { setLoadingPeriode(false); setLoadingJabatan(false); }
    }
    loadInitialData();
  }, [urlPeriodeId]);

  useEffect(() => {
    if (!selectedPeriodeId) return;
    async function fetchDivisi() {
      setLoadingDivisi(true);
      if (!urlDivisiId) { setDivisiList([]); setSelectedDivisiId(''); }
      try {
        const { data, error } = await supabase.from('divisi').select('id, nama_divisi').eq('periode_id', selectedPeriodeId).order('nama_divisi', { ascending: true });
        if (error) throw error;
        setDivisiList(data || []);
        if (urlDivisiId) setSelectedDivisiId(urlDivisiId);
      } catch (error) { alert("Gagal memuat daftar divisi: " + error.message); } 
      finally { setLoadingDivisi(false); }
    }
    fetchDivisi();
  }, [selectedPeriodeId, urlDivisiId]);

  useEffect(() => {
    if (!selectedDivisiId || divisiList.length === 0) {
      setJabatanOptions([]); setSelectedJabatan(''); return;
    }
    const divisiTerpilih = divisiList.find(d => d.id == selectedDivisiId);
    if (divisiTerpilih) {
      let tipeYangDicari = (divisiTerpilih.nama_divisi === 'Pengurus Inti') ? 'Inti' : 'Divisi';
      const tipeKustom = allJabatanList.find(j => j.tipe_jabatan === divisiTerpilih.nama_divisi);
      if (tipeKustom) tipeYangDicari = divisiTerpilih.nama_divisi;
      const filteredJabatan = allJabatanList.filter(j => j.tipe_jabatan === tipeYangDicari).map(j => j.nama_jabatan);
      setJabatanOptions(filteredJabatan);
    } else { setJabatanOptions([]); }
    setSelectedJabatan(''); 
  }, [selectedDivisiId, divisiList, allJabatanList]);
  
  // --- FUNGSI VALIDASI (DIPERBARUI) ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(placeholderFoto);
      return;
    }

    // 1. Validasi Tipe (MIME Type)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert("Tipe file tidak valid. Harap pilih file .jpg, .png, atau .webp.");
      e.target.value = null;
      return;
    }

    // 2. Validasi Ukuran File (BATAS KETAT 200KB)
    const maxSizeInBytes = 200 * 1024; // 200KB
    if (file.size > maxSizeInBytes) {
      alert(`Ukuran file terlalu besar (${(file.size / 1024).toFixed(0)} KB). Harap kompres file Anda di bawah 200 KB sebelum meng-upload.`);
      e.target.value = null;
      return;
    }

    // Jika lolos validasi
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file)); 
  };

  // --- FUNGSI SUBMIT (DIMODIFIKASI - TANPA KOMPRESI) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPeriodeId || !selectedDivisiId || !selectedJabatan) {
      alert("Harap lengkapi Periode, Divisi, dan Jabatan.");
      return;
    }
    if (!selectedFile) {
      alert("Harap pilih foto anggota.");
      return;
    }
    
    setUploading(true);
    let finalFotoUrl = '';

    try {
      // 1. TIDAK ADA LAGI KOMPRESI. Langsung ke langkah 2.
      const fileToUpload = selectedFile;
      
      // 2. Tentukan nama file yang unik
      const fileExt = fileToUpload.name.split('.').pop() || 'jpg';
      const fileName = `${nama.replace(/ /g, '-')}-${Date.now()}.${fileExt}`;

      // 3. Upload ke Supabase Storage
      console.log(`Mengupload file ${fileName} (${(fileToUpload.size / 1024).toFixed(0)} KB)...`);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars') // Nama bucket Anda
        .upload(fileName, fileToUpload); // Upload file mentah
      
      if (uploadError) throw uploadError;

      // 4. Dapatkan URL Publik
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(uploadData.path);
      finalFotoUrl = publicUrlData.publicUrl;

      // 5. Simpan ke Database
      const { error: insertError } = await supabase.from('anggota').insert([{ 
          nama: nama, foto_url: finalFotoUrl, motto: motto, 
          instagram_username: instagram, jabatan_di_divisi: selectedJabatan,
          divisi_id: selectedDivisiId, periode_id: selectedPeriodeId
      }]);
      if (insertError) throw insertError;

      alert('Anggota baru berhasil ditambahkan!');
      navigate('/admin/kelola-anggota');

    } catch (error) {
      alert(`Gagal menambahkan anggota: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // --- Styling ---
  const formStyle = { display: 'flex', flexDirection: 'column', maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' };
  const inputGroupStyle = { marginBottom: '15px' };
  const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold' };
  const inputStyle = { width: '100%', padding: '8px', boxSizing: 'border-box' };
  const selectStyle = { ...inputStyle, padding: '8px', backgroundColor: '#f9f9f9' };
  const buttonStyle = { padding: '10px 15px', fontSize: '1em', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer', marginTop: '10px' };
  const fotoPreviewStyle = { width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #eee', marginBottom: '10px', backgroundColor: '#f9f9f9' };

  const isProcessing = uploading || loadingPeriode || loadingDivisi || loadingJabatan;

  return (
    <div>
      <h2>Tambah Anggota Baru</h2>
      <form style={formStyle} onSubmit={handleSubmit}>
        
        {/* ... (Dropdown Periode, Divisi, Jabatan - tidak berubah) ... */}
        <div style={inputGroupStyle}><label style={labelStyle} htmlFor="periode">1. Pilih Periode:</label><select id="periode" style={selectStyle} value={selectedPeriodeId} onChange={(e) => setSelectedPeriodeId(e.target.value)} disabled={loadingPeriode || !!urlPeriodeId} required><option value="" disabled>-- Pilih Periode --</option>{periodeList.map(periode => <option key={periode.id} value={periode.id}>{periode.tahun_mulai}/{periode.tahun_selesai} ({periode.nama_kabinet || 'Tanpa Nama'})</option>)}</select>{urlPeriodeId && <small>Periode diisi otomatis dari pintasan.</small>}</div>
        <div style={{ display: 'flex', gap: '15px' }}><div style={{ ...inputGroupStyle, flex: 1 }}><label style={labelStyle} htmlFor="divisi">2. Pilih Divisi:</label><select id="divisi" style={selectStyle} value={selectedDivisiId} onChange={(e) => setSelectedDivisiId(e.target.value)} disabled={loadingDivisi || divisiList.length === 0 || !!urlDivisiId} required><option value="" disabled>-- Pilih Divisi --</option>{divisiList.map(divisi => <option key={divisi.id} value={divisi.id}>{divisi.nama_divisi}</option>)}</select>{urlDivisiId && <small>Divisi diisi otomatis dari pintasan.</small>}</div><div style={{ ...inputGroupStyle, flex: 1 }}><label style={labelStyle} htmlFor="jabatan">3. Pilih Jabatan:</label><select id="jabatan" style={selectStyle} value={selectedJabatan} onChange={(e) => setSelectedJabatan(e.target.value)} required disabled={loadingJabatan || jabatanOptions.length === 0} ><option value="" disabled>-- Pilih Jabatan --</option>{jabatanOptions.map(jabatan => (<option key={jabatan} value={jabatan}>{jabatan}</option>))}</select></div></div>
        
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="foto">4. Foto Anggota:</label>
          <img src={previewUrl} alt="Preview Foto" style={fotoPreviewStyle} />
          <input 
            style={inputStyle} 
            type="file" 
            id="foto" 
            accept="image/png, image/jpeg, image/webp"
            onChange={handleFileChange} 
            required
          />
          {/* Keterangan diperbarui */}
          <small>Pilih file .jpg/.png/.webp. **Ukuran file maksimal 200 KB.**</small>
        </div>

        {/* ... (Input Nama, Motto, IG - tidak berubah) ... */}
        <div style={inputGroupStyle}><label style={labelStyle} htmlFor="nama">5. Nama Lengkap:</label><input style={inputStyle} type="text" id="nama" value={nama} onChange={(e) => setNama(e.target.value)} required /></div>
        <div style={inputGroupStyle}><label style={labelStyle} htmlFor="motto">Motto (Opsional):</label><input style={inputStyle} type="text" id="motto" value={motto} onChange={(e) => setMotto(e.target.value)} /></div>
        <div style={inputGroupStyle}><label style={labelStyle} htmlFor="instagram">Username Instagram (Opsional, tanpa @):</label><input style={inputStyle} type="text" id="instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} /></div>
        
        <button style={buttonStyle} type="submit" disabled={isProcessing}>
          {uploading ? 'Mengupload foto...' : (isProcessing ? 'Memuat...' : 'Simpan Anggota Baru')}
        </button>
      </form>
    </div>
  );
}

export default TambahAnggota;