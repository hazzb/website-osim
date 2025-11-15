// src/pages/EditDivisi.jsx
// --- VERSI 2.0 (Dengan Uploader Logo) ---

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';

function EditDivisi() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State form
  const [namaDivisi, setNamaDivisi] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [urutan, setUrutan] = useState(10);
  
  // --- STATE BARU UNTUK LOGO ---
  const placeholderLogo = 'https://via.placeholder.com/300x150.png/eee/808080?text=Logo+Divisi';
  const [oldLogoUrl, setOldLogoUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(placeholderLogo);
  const [uploading, setUploading] = useState(false);
  // -----------------------------

  // State info
  const [namaKabinet, setNamaKabinet] = useState('');
  const [loading, setLoading] = useState(true);

  // --- (useEffect fetchDivisi - DIMODIFIKASI) ---
  useEffect(() => {
    async function fetchDivisi() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('divisi')
          .select(`*, periode_jabatan ( nama_kabinet )`)
          .eq('id', id)
          .single();
          
        if (error) throw error;
        if (data) {
          setNamaDivisi(data.nama_divisi);
          setDeskripsi(data.deskripsi || '');
          setUrutan(data.urutan || 10);
          setNamaKabinet(data.periode_jabatan.nama_kabinet || 'Periode Tidak Dikenal');
          
          // Isi state logo
          setOldLogoUrl(data.logo_url || '');
          setPreviewUrl(data.logo_url || placeholderLogo);
        } else {
          alert("Divisi tidak ditemukan!");
          navigate('/admin/kelola-divisi');
        }
      } catch (error) {
        alert("Gagal memuat data divisi: " + error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDivisi();
  }, [id, navigate]);

  // --- FUNGSI BARU: Validasi Logo ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(oldLogoUrl || placeholderLogo); // Kembalikan ke foto lama
      return;
    }
    // Validasi Tipe
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      alert("Tipe file tidak valid. Harap pilih file .jpg, .png, .webp, atau .svg.");
      e.target.value = null;
      return;
    }
    // Validasi Ukuran (200KB)
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
    setUploading(true);
    let finalLogoUrl = oldLogoUrl; // Defaultnya adalah logo lama

    try {
      // --- LANGKAH A: Jika ada file baru yang dipilih ---
      if (selectedFile) {
        console.log("Ada logo baru, memulai proses upload...");
        const fileToUpload = selectedFile;
        const fileExt = fileToUpload.name.split('.').pop() || 'png';
        const fileName = `${namaDivisi.replace(/ /g, '-')}-${Date.now()}.${fileExt}`;

        // 2. Upload file BARU
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('logos')
          .upload(fileName, fileToUpload);
        if (uploadError) throw uploadError;

        // 3. Dapatkan URL Publik BARU
        const { data: publicUrlData } = supabase.storage
          .from('logos')
          .getPublicUrl(uploadData.path);
        finalLogoUrl = publicUrlData.publicUrl;

        // 4. Hapus file LAMA (jika ada)
        if (oldLogoUrl) {
          const oldFileName = oldLogoUrl.split('/').pop();
          console.log("Menghapus logo lama:", oldFileName);
          await supabase.storage.from('logos').remove([oldFileName]);
        }
      }
      
      // --- LANGKAH B: Simpan data ke Database (UPDATE) ---
      const { error } = await supabase
        .from('divisi')
        .update({ 
          nama_divisi: namaDivisi,
          deskripsi: deskripsi,
          urutan: urutan,
          logo_url: finalLogoUrl // <-- SIMPAN URL LOGO
        })
        .eq('id', id);

      if (error) throw error;
      alert('Divisi berhasil diperbarui!');
      navigate('/admin/kelola-divisi');

    } catch (error) {
      alert(`Gagal memperbarui divisi: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // --- Styling ---
  const formStyle = { display: 'flex', flexDirection: 'column', maxWidth: '500px', margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' };
  const inputGroupStyle = { marginBottom: '15px' };
  const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold' };
  const inputStyle = { width: '100%', padding: '8px', boxSizing: 'border-box' };
  const buttonStyle = { padding: '10px 15px', fontSize: '1em', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' };
  const infoBoxStyle = { ...inputGroupStyle, padding: '10px', backgroundColor: '#f4f4f4', borderRadius: '5px' };
  const logoPreviewStyle = { width: '100%', height: 'auto', maxHeight: '150px', objectFit: 'contain', border: '1px dashed #ccc', marginBottom: '10px', backgroundColor: '#f9f9f9' };

  if (loading) {
    return <h2>Memuat data divisi...</h2>;
  }

  return (
    <div>
      <h2>Edit Divisi</h2>
      <form style={formStyle} onSubmit={handleSubmit}>
        
        {/* ... (Info Periode - tidak berubah) ... */}
        <div style={infoBoxStyle}>
          <label style={labelStyle}>Periode:</label>
          <strong>{namaKabinet}</strong>
          <small> (Periode tidak dapat diubah.)</small>
        </div>

        {/* ... (Input Nama - tidak berubah) ... */}
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
          <small>Pilih file baru jika ingin mengganti. **Maks 200 KB.**</small>
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
        
        <button style={buttonStyle} type="submit" disabled={uploading}>
          {uploading ? 'Memproses...' : 'Simpan Perubahan'}
        </button>
      </form>
    </div>
  );
}

export default EditDivisi;