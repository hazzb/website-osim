// src/pages/TambahDivisi.jsx
// --- VERSI 3.0 (Dengan Uploader Logo) ---

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

function TambahDivisi() {
  const [namaDivisi, setNamaDivisi] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [selectedPeriodeId, setSelectedPeriodeId] = useState('');
  const [periodeList, setPeriodeList] = useState([]);
  const [urutan, setUrutan] = useState(10);
  
  // --- STATE BARU UNTUK LOGO ---
  const placeholderLogo = 'https://via.placeholder.com/300x150.png/eee/808080?text=Logo+Divisi';
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(placeholderLogo);
  const [uploading, setUploading] = useState(false);
  // -----------------------------
  
  const [loadingPeriode, setLoadingPeriode] = useState(true);
  const navigate = useNavigate();

  // --- (useEffect fetchPeriode tidak berubah) ---
  useEffect(() => {
    async function fetchPeriode() {
      setLoadingPeriode(true);
      try {
        const { data, error } = await supabase
          .from('periode_jabatan')
          .select('id, nama_kabinet, tahun_mulai, tahun_selesai, is_active')
          .order('tahun_mulai', { ascending: false });
        if (error) throw error;
        setPeriodeList(data || []);
        const activePeriode = data.find(p => p.is_active);
        if (activePeriode) {
          setSelectedPeriodeId(activePeriode.id);
        } else if (data.length > 0) {
          setSelectedPeriodeId(data[0].id);
        }
      } catch (error) {
        alert("Gagal memuat daftar periode: " + error.message);
      } finally {
        setLoadingPeriode(false);
      }
    }
    fetchPeriode();
  }, []);

  // --- FUNGSI BARU: Validasi Logo ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(placeholderLogo);
      return;
    }
    // 1. Validasi Tipe (kita izinkan SVG juga)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      alert("Tipe file tidak valid. Harap pilih file .jpg, .png, .webp, atau .svg.");
      e.target.value = null;
      return;
    }
    // 2. Validasi Ukuran (200KB)
    const maxSizeInBytes = 200 * 1024; // 200KB
    if (file.size > maxSizeInBytes) {
      alert(`Ukuran file terlalu besar (${(file.size / 1024).toFixed(0)} KB). Harap kompres file di bawah 200 KB.`);
      e.target.value = null;
      return;
    }
    // Jika lolos
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // --- FUNGSI SUBMIT (DIMODIFIKASI) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPeriodeId) {
      alert("Harap pilih periode.");
      return;
    }
    
    setUploading(true);
    let finalLogoUrl = null; // Default null jika tidak ada logo

    try {
      // --- LANGKAH UPLOAD (JIKA ADA FILE) ---
      if (selectedFile) {
        const fileToUpload = selectedFile;
        const fileExt = fileToUpload.name.split('.').pop() || 'png';
        const fileName = `${namaDivisi.replace(/ /g, '-')}-${Date.now()}.${fileExt}`;

        console.log(`Mengupload logo ${fileName}...`);
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('logos') // Nama bucket baru
          .upload(fileName, fileToUpload);
        
        if (uploadError) throw uploadError;

        // Dapatkan URL Publik
        const { data: publicUrlData } = supabase.storage
          .from('logos')
          .getPublicUrl(uploadData.path);
        
        finalLogoUrl = publicUrlData.publicUrl;
      }
      // ---------------------------------

      // --- Simpan ke Database ---
      const { error } = await supabase
        .from('divisi')
        .insert([
          { 
            nama_divisi: namaDivisi, 
            deskripsi: deskripsi, 
            periode_id: selectedPeriodeId,
            urutan: urutan,
            logo_url: finalLogoUrl // <-- SIMPAN URL LOGO
          }
        ]);
      if (error) throw error;
      
      alert('Divisi baru berhasil ditambahkan!');
      navigate('/admin/kelola-divisi');

    } catch (error) {
      alert(`Gagal menambahkan divisi: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // --- Styling ---
  const formStyle = { display: 'flex', flexDirection: 'column', maxWidth: '500px', margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' };
  const inputGroupStyle = { marginBottom: '15px' };
  const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold' };
  const inputStyle = { width: '100%', padding: '8px', boxSizing: 'border-box' };
  const selectStyle = { ...inputStyle, padding: '8px' };
  const buttonStyle = { padding: '10px 15px', fontSize: '1em', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' };
  // Style baru untuk logo
  const logoPreviewStyle = { width: '100%', height: 'auto', maxHeight: '150px', objectFit: 'contain', border: '1px dashed #ccc', marginBottom: '10px', backgroundColor: '#f9f9f9' };

  const isProcessing = uploading || loadingPeriode;

  return (
    <div>
      <h2>Tambah Divisi Baru</h2>
      <form style={formStyle} onSubmit={handleSubmit}>
        {/* ... (Dropdown Periode tidak berubah) ... */}
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="periode">Tautkan ke Periode:</label>
          {loadingPeriode ? <p>Memuat...</p> : (
            <select id="periode" style={selectStyle} value={selectedPeriodeId} onChange={(e) => setSelectedPeriodeId(e.target.value)} required >
              {periodeList.map(p => (
                <option key={p.id} value={p.id}>
                  {p.tahun_mulai}/{p.tahun_selesai} ({p.nama_kabinet || 'Tanpa Nama'})
                </option>
              ))}
            </select>
          )}
        </div>
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="namaDivisi">Nama Divisi:</label>
          <input style={inputStyle} type="text" id="namaDivisi" value={namaDivisi} onChange={(e) => setNamaDivisi(e.target.value)} required />
        </div>
        
        {/* --- INPUT LOGO BARU --- */}
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="logo">Logo Divisi (Opsional):</label>
          <img src={previewUrl} alt="Preview Logo" style={logoPreviewStyle} />
          <input 
            style={inputStyle} 
            type="file" 
            id="logo"
            accept="image/png, image/jpeg, image/webp, image/svg+xml"
            onChange={handleFileChange} 
          />
          <small>Pilih file .jpg/.png/.svg. **Ukuran file maksimal 200 KB.**</small>
        </div>

        {/* ... (Input Deskripsi & Urutan - tidak berubah) ... */}
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="deskripsi">Deskripsi (Opsional):</label>
          <input style={inputStyle} type="text" id="deskripsi" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} />
        </div>
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="urutan">Urutan Tampil:</label>
          <input style={inputStyle} type="number" id="urutan" value={urutan} onChange={(e) => setUrutan(parseInt(e.target.value) || 10)} />
          <small>Angka kecil tampil lebih dulu. (Contoh: PI = 1, Pembina = 2, Divisi biasa = 10).</small>
        </div>
        
        <button style={buttonStyle} type="submit" disabled={isProcessing}>
          {isProcessing ? 'Memproses...' : 'Simpan Divisi'}
        </button>
      </form>
    </div>
  );
}

export default TambahDivisi;