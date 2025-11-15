// src/pages/EditAnggota.jsx
// --- VERSI 5.5 (Ganti Laki-laki -> Ikhwan) ---

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';

function EditAnggota() {
  const { id } = useParams();
  const navigate = useNavigate();
  const placeholderFoto = 'https://via.placeholder.com/400.png/eee/808080?text=Preview+Foto';

  // State form
  const [nama, setNama] = useState('');
  const [motto, setMotto] = useState('');
  const [instagram, setInstagram] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState('');
  const [alamat, setAlamat] = useState('');
  const [oldFotoUrl, setOldFotoUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(placeholderFoto);
  const [uploading, setUploading] = useState(false);
  const [periodeList, setPeriodeList] = useState([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState('');
  const [divisiList, setDivisiList] = useState([]);
  const [selectedDivisiId, setSelectedDivisiId] = useState('');
  const [allJabatanList, setAllJabatanList] = useState([]);
  const [jabatanOptions, setJabatanOptions] = useState([]);
  const [selectedJabatan, setSelectedJabatan] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // --- (Efek 1, 2, 3 - tidak berubah) ---
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true); setLoadingDropdowns(true); setIsInitialLoad(true);
      try {
        const { data: anggotaData, error: anggotaError } = await supabase.from('anggota').select('*').eq('id', id).single();
        if (anggotaError) throw anggotaError;
        const fetchPeriode = supabase.from('periode_jabatan').select('id, nama_kabinet, tahun_mulai, tahun_selesai');
        const fetchJabatan = supabase.from('master_jabatan').select('nama_jabatan, tipe_jabatan');
        const [periodeResult, jabatanResult] = await Promise.all([fetchPeriode, fetchJabatan]);
        if (periodeResult.error) throw periodeResult.error;
        if (jabatanResult.error) throw jabatanResult.error;
        setPeriodeList(periodeResult.data || []);
        setAllJabatanList(jabatanResult.data || []);
        if (anggotaData) {
          setNama(anggotaData.nama);
          setMotto(anggotaData.motto || '');
          setInstagram(anggotaData.instagram_username || '');
          setJenisKelamin(anggotaData.jenis_kelamin || '');
          setAlamat(anggotaData.alamat || '');
          setSelectedPeriodeId(anggotaData.periode_id);
          setSelectedDivisiId(anggotaData.divisi_id);
          setSelectedJabatan(anggotaData.jabatan_di_divisi);
          setPreviewUrl(anggotaData.foto_url || placeholderFoto);
          setOldFotoUrl(anggotaData.foto_url || '');
        }
      } catch (error) {
        alert("Gagal memuat data: " + error.message);
      } finally {
        setLoading(false); setLoadingDropdowns(false);
      }
    }
    loadInitialData();
  }, [id]);
  useEffect(() => {
    if (!selectedPeriodeId || loadingDropdowns) return;
    async function fetchDivisi() {
      try {
        const { data, error } = await supabase.from('divisi').select('id, nama_divisi').eq('periode_id', selectedPeriodeId).order('urutan', { ascending: true });
        if (error) throw error;
        setDivisiList(data || []);
      } catch (error) { alert("Gagal memuat daftar divisi: " + error.message); }
    }
    fetchDivisi();
  }, [selectedPeriodeId, loadingDropdowns]);
  useEffect(() => {
    if (!selectedDivisiId || divisiList.length === 0 || loadingDropdowns) {
      setJabatanOptions([]);
      return;
    }
    const divisiTerpilih = divisiList.find(d => d.id == selectedDivisiId);
    if (divisiTerpilih) {
      let tipeYangDicari = (divisiTerpilih.nama_divisi === 'Pengurus Inti') ? 'Inti' : 'Divisi';
      const tipeKustom = allJabatanList.find(j => j.tipe_jabatan === divisiTerpilih.nama_divisi);
      if (tipeKustom) tipeYangDicari = divisiTerpilih.nama_divisi;
      const filteredJabatan = allJabatanList.filter(j => j.tipe_jabatan === tipeYangDicari).map(j => j.nama_jabatan);
      setJabatanOptions(filteredJabatan);
      if (!isInitialLoad) {
        setSelectedJabatan('');
      } else {
        if (!filteredJabatan.includes(selectedJabatan)) {
          setSelectedJabatan('');
        }
      }
    } else {
      setJabatanOptions([]);
      setSelectedJabatan('');
    }
    if (isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [selectedDivisiId, divisiList, allJabatanList, loadingDropdowns]);
  
  // --- (Fungsi handleFileChange - tidak berubah) ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setSelectedFile(null); setPreviewUrl(oldFotoUrl || placeholderFoto); return;
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert("Tipe file tidak valid. Harap pilih file .jpg, .png, atau .webp.");
      e.target.value = null; return;
    }
    const maxSizeInBytes = 200 * 1024; // 200KB
    if (file.size > maxSizeInBytes) {
      alert(`Ukuran file terlalu besar (${(file.size / 1024).toFixed(0)} KB). Harap kompres file Anda di bawah 200 KB.`);
      e.target.value = null; return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file)); 
  };

  // --- (Fungsi handleSubmit - tidak berubah, 'jenisKelamin' sudah dinamis) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPeriodeId || !selectedDivisiId || !selectedJabatan || !jenisKelamin) {
      alert("Harap lengkapi Periode, Divisi, Jabatan, dan Ikhwan/Akhwat.");
      return;
    }
    setUploading(true);
    let finalFotoUrl = oldFotoUrl;
    try {
      if (selectedFile) {
        const fileToUpload = selectedFile;
        const fileExt = fileToUpload.name.split('.').pop() || 'jpg';
        const fileName = `${nama.replace(/ /g, '-')}-${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage.from('avatars').upload(fileName, fileToUpload);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(uploadData.path);
        finalFotoUrl = publicUrlData.publicUrl;
        if (oldFotoUrl) {
          const oldFileName = oldFotoUrl.split('/').pop();
          await supabase.storage.from('avatars').remove([oldFileName]);
        }
      }
      const { error: updateError } = await supabase
        .from('anggota')
        .update({ 
          nama: nama, foto_url: finalFotoUrl, motto: motto, 
          instagram_username: instagram, jenis_kelamin: jenisKelamin,
          alamat: alamat, jabatan_di_divisi: selectedJabatan,
          divisi_id: selectedDivisiId, periode_id: selectedPeriodeId
        })
        .eq('id', id);
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
  const textareaStyle = { ...inputStyle, minHeight: '80px', fontFamily: 'Arial' };
  const selectStyle = { ...inputStyle, padding: '8px', backgroundColor: '#f9f9f9' };
  const buttonStyle = { padding: '10px 15px', fontSize: '1em', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer', marginTop: '10px' };
  const fotoPreviewStyle = { width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #eee', marginBottom: '10px', backgroundColor: '#f9f9f9' };
  const radioGroupStyle = { display: 'flex', gap: '20px', alignItems: 'center', marginTop: '5px', minHeight: '40px' };
  const radioLabelStyle = { cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' };
  if (loading) { return <h2>Memuat data anggota...</h2>; }
  const isProcessing = uploading || loading;

  return (
    <div>
      <h2>Edit Anggota</h2>
      <form style={formStyle} onSubmit={handleSubmit}>
        {/* ... (Dropdown Periode & Divisi - tidak berubah) ... */}
        <div style={inputGroupStyle}><label style={labelStyle} htmlFor="periode">1. Periode (Terkunci):</label><select id="periode" style={{...selectStyle, backgroundColor: '#eee'}} value={selectedPeriodeId} disabled required><option value="" disabled>-- Pilih Periode --</option>{periodeList.map(periode => <option key={periode.id} value={periode.id}>{periode.tahun_mulai}/{periode.tahun_selesai} ({periode.nama_kabinet || 'Tanpa Nama'})</option>)}</select><small>Periode tidak dapat diubah.</small></div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ ...inputGroupStyle, flex: 1 }}><label style={labelStyle} htmlFor="divisi">2. Divisi:</label><select id="divisi" style={selectStyle} value={selectedDivisiId} onChange={(e) => setSelectedDivisiId(e.target.value)} disabled={loadingDropdowns || divisiList.length === 0} required><option value="" disabled>-- Pilih Divisi --</option>{divisiList.map(divisi => <option key={divisi.id} value={divisi.id}>{divisi.nama_divisi}</option>)}</select></div>
          <div style={{ ...inputGroupStyle, flex: 1 }}><label style={labelStyle} htmlFor="jabatan">3. Jabatan:</label><select id="jabatan" style={selectStyle} value={selectedJabatan} onChange={(e) => setSelectedJabatan(e.target.value)} required disabled={loadingDropdowns || jabatanOptions.length === 0} ><option value="" disabled>-- Pilih Jabatan --</option>{jabatanOptions.map(jabatan => (<option key={jabatan} value={jabatan}>{jabatan}</option>))}</select></div>
        </div>
        
        {/* ... (Input Foto - tidak berubah) ... */}
        <div style={inputGroupStyle}><label style={labelStyle} htmlFor="foto">4. Foto Anggota:</label><img src={previewUrl} alt="Preview Foto" style={fotoPreviewStyle} /><input style={inputStyle} type="file" id="foto" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} /><small>Pilih file baru jika ingin mengganti. **Maks 200 KB.**</small></div>

        {/* --- FORM NAMA & JENIS KELAMIN (DIUBAH) --- */}
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ ...inputGroupStyle, flex: 2 }}><label style={labelStyle} htmlFor="nama">5. Nama Lengkap:</label><input style={inputStyle} type="text" id="nama" value={nama} onChange={(e) => setNama(e.target.value)} required /></div>
          <div style={{ ...inputGroupStyle, flex: 1 }}>
            <label style={labelStyle}>6. Ikhwan/Akhwat:</label> {/* <-- Label diubah */}
            <div style={radioGroupStyle}>
              <label style={radioLabelStyle}>
                <input
                  type="radio" value="Ikhwan" // <-- Value diubah
                  checked={jenisKelamin === 'Ikhwan' || jenisKelamin === 'Laki-laki'} // <-- Handle data lama
                  onChange={(e) => setJenisKelamin(e.target.value)}
                  name="jenisKelamin" required
                /> Ikhwan {/* <-- Teks diubah */}
              </label>
              <label style={radioLabelStyle}>
                <input
                  type="radio" value="Akhwat" // <-- Value diubah
                  checked={jenisKelamin === 'Akhwat' || jenisKelamin === 'Perempuan'} // <-- Handle data lama
                  onChange={(e) => setJenisKelamin(e.target.value)}
                  name="jenisKelamin" required
                /> Akhwat {/* <-- Teks diubah */}
              </label>
            </div>
          </div>
        </div>
        
        {/* ... (Sisa form tidak berubah) ... */}
        <div style={inputGroupStyle}><label style={labelStyle} htmlFor="alamat">7. Alamat (Opsional):</label><textarea style={textareaStyle} id="alamat" value={alamat} onChange={(e) => setAlamat(e.target.value)} /><small>Data ini bersifat rahasia dan tidak akan ditampilkan ke publik secara default.</small></div>
        <div style={inputGroupStyle}><label style={labelStyle} htmlFor="motto">8. Motto (Opsional):</label><input style={inputStyle} type="text" id="motto" value={motto} onChange={(e) => setMotto(e.target.value)} /></div>
        <div style={inputGroupStyle}><label style={labelStyle} htmlFor="instagram">9. Username Instagram (Opsional, tanpa @):</label><input style={inputStyle} type="text" id="instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} /></div>
        
        <button style={buttonStyle} type="submit" disabled={isProcessing}>
          {uploading ? 'Mengupload foto...' : (isProcessing ? 'Memuat...' : 'Simpan Perubahan')}
        </button>
      </form>
    </div>
  );
}
export default EditAnggota;