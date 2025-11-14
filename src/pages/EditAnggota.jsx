// src/pages/EditAnggota.jsx
// --- VERSI 5.0 (Validasi Ketat 200KB, TANPA Kompresi) ---

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
// Hapus 'import imageCompression'

function EditAnggota() {
  const { id } = useParams(); // ID Anggota dari URL
  const navigate = useNavigate();

  const placeholderFoto = 'https://via.placeholder.com/400.png/eee/808080?text=Preview+Foto';

  // State form
  const [nama, setNama] = useState('');
  const [motto, setMotto] = useState('');
  const [instagram, setInstagram] = useState('');
  
  // --- STATE FOTO (Lebih Kompleks) ---
  const [oldFotoUrl, setOldFotoUrl] = useState(''); // Untuk menyimpan URL lama jika upload gagal
  const [selectedFile, setSelectedFile] = useState(null); // File baru yang dipilih
  const [previewUrl, setPreviewUrl] = useState(placeholderFoto); // URL preview
  const [uploading, setUploading] = useState(false);
  // ------------------------------------

  // State Dropdown
  const [periodeList, setPeriodeList] = useState([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState('');
  const [divisiList, setDivisiList] = useState([]);
  const [selectedDivisiId, setSelectedDivisiId] = useState('');
  
  // State Jabatan
  const [allJabatanList, setAllJabatanList] = useState([]);
  const [jabatanOptions, setJabatanOptions] = useState([]);
  const [selectedJabatan, setSelectedJabatan] = useState('');

  // State UI
  const [loading, setLoading] = useState(true); // Loading data awal
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  // --- EFEK 1: Ambil data Anggota, Periode, dan Jabatan ---
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      setLoadingDropdowns(true);
      try {
        // 1. Ambil data anggota yang akan diedit
        const { data: anggotaData, error: anggotaError } = await supabase
          .from('anggota')
          .select('*')
          .eq('id', id)
          .single();
        if (anggotaError) throw anggotaError;
        
        // 2. Ambil data dropdown (Periode & Jabatan)
        const fetchPeriode = supabase.from('periode_jabatan').select('id, nama_kabinet, tahun_mulai, tahun_selesai');
        const fetchJabatan = supabase.from('master_jabatan').select('nama_jabatan, tipe_jabatan');
        const [periodeResult, jabatanResult] = await Promise.all([fetchPeriode, fetchJabatan]);
        
        if (periodeResult.error) throw periodeResult.error;
        if (jabatanResult.error) throw jabatanResult.error;
        
        setPeriodeList(periodeResult.data || []);
        setAllJabatanList(jabatanResult.data || []);
        
        // 3. Isi semua state form
        if (anggotaData) {
          setNama(anggotaData.nama);
          setMotto(anggotaData.motto || '');
          setInstagram(anggotaData.instagram_username || '');
          setSelectedPeriodeId(anggotaData.periode_id);
          setSelectedDivisiId(anggotaData.divisi_id);
          setSelectedJabatan(anggotaData.jabatan_di_divisi);
          
          // Isi state foto
          setPreviewUrl(anggotaData.foto_url || placeholderFoto);
          setOldFotoUrl(anggotaData.foto_url || ''); // Simpan URL lama
        }
      } catch (error) {
        alert("Gagal memuat data: " + error.message);
      } finally {
        setLoading(false);
        setLoadingDropdowns(false); // Selesai memuat dropdown
      }
    }
    loadInitialData();
  }, [id]);

  // --- EFEK 2 & 3 (Hampir sama, tapi lebih sederhana) ---
  // Kita perlu memuat Divisi & Jabatan berdasarkan ID yang sudah ada
  useEffect(() => {
    if (!selectedPeriodeId || loadingDropdowns) return; // Jangan jalankan jika data awal belum siap
    async function fetchDivisi() {
      try {
        const { data, error } = await supabase.from('divisi').select('id, nama_divisi').eq('periode_id', selectedPeriodeId).order('nama_divisi', { ascending: true });
        if (error) throw error;
        setDivisiList(data || []);
      } catch (error) { alert("Gagal memuat daftar divisi: " + error.message); }
    }
    fetchDivisi();
  }, [selectedPeriodeId, loadingDropdowns]);

  useEffect(() => {
    if (!selectedDivisiId || divisiList.length === 0 || loadingDropdowns) return;
    const divisiTerpilih = divisiList.find(d => d.id == selectedDivisiId);
    if (divisiTerpilih) {
      let tipeYangDicari = (divisiTerpilih.nama_divisi === 'Pengurus Inti') ? 'Inti' : 'Divisi';
      const tipeKustom = allJabatanList.find(j => j.tipe_jabatan === divisiTerpilih.nama_divisi);
      if (tipeKustom) tipeYangDicari = divisiTerpilih.nama_divisi;
      const filteredJabatan = allJabatanList.filter(j => j.tipe_jabatan === tipeYangDicari).map(j => j.nama_jabatan);
      setJabatanOptions(filteredJabatan);
      // Jangan reset 'selectedJabatan' karena kita sedang mengedit
    } else {
      setJabatanOptions([]);
    }
  }, [selectedDivisiId, divisiList, allJabatanList, loadingDropdowns]);
  
  // --- FUNGSI VALIDASI (Sama seperti Tambah) ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setSelectedFile(null);
      // Jika dibatalkan, kembalikan ke foto lama
      setPreviewUrl(oldFotoUrl || placeholderFoto); 
      return;
    }
    // 1. Validasi Tipe
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert("Tipe file tidak valid. Harap pilih file .jpg, .png, atau .webp.");
      e.target.value = null;
      return;
    }
    // 2. Validasi Ukuran (BATAS KETAT 200KB)
    const maxSizeInBytes = 200 * 1024; // 200KB
    if (file.size > maxSizeInBytes) {
      alert(`Ukuran file terlalu besar (${(file.size / 1024).toFixed(0)} KB). Harap kompres file Anda di bawah 200 KB.`);
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
    if (!selectedPeriodeId || !selectedDivisiId || !selectedJabatan) {
      alert("Harap lengkapi Periode, Divisi, dan Jabatan.");
      return;
    }
    
    setUploading(true);
    let finalFotoUrl = oldFotoUrl; // Defaultnya adalah foto lama

    try {
      // --- LANGKAH A: Jika ada file baru yang dipilih ---
      if (selectedFile) {
        console.log("Ada file baru, memulai proses upload...");
        // 1. Tentukan nama file
        const fileToUpload = selectedFile;
        const fileExt = fileToUpload.name.split('.').pop() || 'jpg';
        const fileName = `${nama.replace(/ /g, '-')}-${Date.now()}.${fileExt}`;

        // 2. Upload file BARU
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, fileToUpload);
        if (uploadError) throw uploadError;

        // 3. Dapatkan URL Publik BARU
        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(uploadData.path);
        finalFotoUrl = publicUrlData.publicUrl; // Ganti URL dengan yang baru
        console.log("URL baru:", finalFotoUrl);

        // 4. Hapus file LAMA (jika ada)
        if (oldFotoUrl) {
          const oldFileName = oldFotoUrl.split('/').pop();
          console.log("Menghapus file lama:", oldFileName);
          await supabase.storage.from('avatars').remove([oldFileName]);
        }
      }
      // --- Jika tidak ada file baru, 'finalFotoUrl' akan tetap 'oldFotoUrl' ---

      // --- LANGKAH B: Simpan data ke Database (UPDATE) ---
      console.log('Menyimpan data anggota ke database...');
      const { error: updateError } = await supabase
        .from('anggota')
        .update({ 
          nama: nama,
          foto_url: finalFotoUrl, // Simpan URL (baru atau lama)
          motto: motto, 
          instagram_username: instagram, 
          jabatan_di_divisi: selectedJabatan,
          divisi_id: selectedDivisiId, 
          periode_id: selectedPeriodeId
        })
        .eq('id', id); // <-- Kunci WHERE

      if (updateError) throw updateError;

      alert('Anggota berhasil diperbarui!');
      navigate('/admin/kelola-anggota');

    } catch (error) {
      alert(`Gagal memperbarui anggota: ${error.message}`);
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
  const buttonStyle = { padding: '10px 15px', fontSize: '1em', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer', marginTop: '10px' };
  const fotoPreviewStyle = { width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #eee', marginBottom: '10px', backgroundColor: '#f9f9f9' };

  if (loading) {
    return <h2>Memuat data anggota...</h2>;
  }
  
  const isProcessing = uploading || loading;

  return (
    <div>
      <h2>Edit Anggota</h2>
      <form style={formStyle} onSubmit={handleSubmit}>
        
        {/* Dropdown (dibuat 'disabled' karena kita tidak boleh memindahkan anggota) */}
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="periode">1. Periode:</label>
          <select id="periode" style={selectStyle} value={selectedPeriodeId} disabled required>
            <option value="" disabled>-- Pilih Periode --</option>
            {periodeList.map(periode => <option key={periode.id} value={periode.id}>{periode.tahun_mulai}/{periode.tahun_selesai} ({periode.nama_kabinet || 'Tanpa Nama'})</option>)}
          </select>
          <small>Periode dan Divisi tidak dapat diubah setelah dibuat.</small>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ ...inputGroupStyle, flex: 1 }}>
            <label style={labelStyle} htmlFor="divisi">2. Divisi:</label>
            <select id="divisi" style={selectStyle} value={selectedDivisiId} disabled required>
              <option value="" disabled>-- Pilih Divisi --</option>
              {divisiList.map(divisi => <option key={divisi.id} value={divisi.id}>{divisi.nama_divisi}</option>)}
            </select>
          </div>
          <div style={{ ...inputGroupStyle, flex: 1 }}>
            <label style={labelStyle} htmlFor="jabatan">3. Jabatan:</label>
            <select id="jabatan" style={selectStyle} value={selectedJabatan}
              onChange={(e) => setSelectedJabatan(e.target.value)} required
              disabled={loadingDropdowns || jabatanOptions.length === 0} >
              <option value="" disabled>-- Pilih Jabatan --</option>
              {jabatanOptions.map(jabatan => (<option key={jabatan} value={jabatan}>{jabatan}</option>))}
            </select>
          </div>
        </div>
        
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="foto">4. Foto Anggota:</label>
          <img src={previewUrl} alt="Preview Foto" style={fotoPreviewStyle} />
          <input 
            style={inputStyle} 
            type="file" 
            id="foto" 
            accept="image/png, image/jpeg, image/webp"
            onChange={handleFileChange} 
            // TIDAK 'required', karena boleh tidak ganti foto
          />
          <small>Pilih file baru jika ingin mengganti. **Maks 200 KB.**</small>
        </div>

        <div style={inputGroupStyle}><label style={labelStyle} htmlFor="nama">5. Nama Lengkap:</label><input style={inputStyle} type="text" id="nama" value={nama} onChange={(e) => setNama(e.target.value)} required /></div>
        <div style={inputGroupStyle}><label style={labelStyle} htmlFor="motto">Motto (Opsional):</label><input style={inputStyle} type="text" id="motto" value={motto} onChange={(e) => setMotto(e.target.value)} /></div>
        <div style={inputGroupStyle}><label style={labelStyle} htmlFor="instagram">Username Instagram (Opsional, tanpa @):</label><input style={inputStyle} type="text" id="instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} /></div>
        
        <button style={buttonStyle} type="submit" disabled={isProcessing}>
          {uploading ? 'Mengupload foto...' : (isProcessing ? 'Memuat...' : 'Simpan Perubahan')}
        </button>
      </form>
    </div>
  );
}

export default EditAnggota;