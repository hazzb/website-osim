// src/pages/EditAnggota.jsx
// --- VERSI 6.8 (Logika Database-Driven) ---

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from '../components/admin/AdminForm.module.css'; 
import FormInput from '../components/admin/FormInput.jsx'; 

function EditAnggota() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    nama: '',
    jenis_kelamin: 'Ikhwan',
    alamat: '',
    motto: '',
    instagram_username: '',
    periode_id: '',
    divisi_id: '',
    jabatan_di_divisi: '',
    foto_url: '',
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [oldFotoUrl, setOldFotoUrl] = useState(null);

  const [periodeList, setPeriodeList] = useState([]);
  const [divisiList, setDivisiList] = useState([]);
  const [jabatanList, setJabatanList] = useState([]); // Daftar jabatan yang sudah difilter
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingJabatan, setLoadingJabatan] = useState(false);
  const [error, setError] = useState(null);

  // --- Efek 1: Memuat SEMUA data ---
  useEffect(() => {
    async function fetchAnggotaData() {
      if (!id) {
        setLoadingData(false);
        setError("ID anggota tidak ditemukan di URL.");
        return; 
      }
      setLoadingData(true);
      setError(null);
      try {
        // 1. Ambil data anggota
        const { data: anggotaData, error: anggotaError } = await supabase
          .from('anggota') 
          .select('*')
          .eq('id', id)
          .single();
        if (anggotaError) throw new Error(`Gagal memuat anggota: ${anggotaError.message}`);

        setFormData({
          nama: anggotaData.nama || '',
          jenis_kelamin: anggotaData.jenis_kelamin || 'Ikhwan',
          alamat: anggotaData.alamat || '',
          motto: anggotaData.motto || '',
          instagram_username: anggotaData.instagram_username || '',
          periode_id: anggotaData.periode_id,
          divisi_id: anggotaData.divisi_id,
          jabatan_di_divisi: anggotaData.jabatan_di_divisi || '',
          foto_url: anggotaData.foto_url || '',
        });
        setOldFotoUrl(anggotaData.foto_url); 
        setPreview(anggotaData.foto_url); 

        // 2. Ambil data relasi (Periode, Divisi)
        const { data: periode, error: pError } = await supabase.from('periode_jabatan').select('id, nama_kabinet, tahun_mulai, tahun_selesai');
        if (pError) throw pError;
        setPeriodeList(periode);
        
        const { data: divisi, error: dError } = await supabase.from('divisi').select('id, nama_divisi, periode_id');
        if (dError) throw dError;
        setDivisiList(divisi);
        
        // 3. Ambil daftar jabatan yang BENAR untuk divisi yang SUDAH DIPILIH
        if (anggotaData.divisi_id) {
          setLoadingJabatan(true);
          const { data: jabatansData, error: jError } = await supabase
            .from('divisi_jabatan_link')
            .select('master_jabatan (id, nama_jabatan)')
            .eq('divisi_id', anggotaData.divisi_id);
          if (jError) throw jError;
          setJabatanList(jabatansData.map(item => item.master_jabatan));
          setLoadingJabatan(false);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingData(false);
      }
    }
    fetchAnggotaData();
  }, [id]);

  // --- [EFEK BARU]: Memuat ulang Jabatan saat Divisi diubah ---
  useEffect(() => {
    // Jangan jalankan saat load awal (karena sudah ditangani di efek pertama)
    if (loadingData) return; 
    
    if (!formData.divisi_id) {
      setJabatanList([]);
      return;
    }

    async function fetchJabatansForDivisi() {
      setLoadingJabatan(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('divisi_jabatan_link')
          .select('master_jabatan (id, nama_jabatan)')
          .eq('divisi_id', formData.divisi_id);
        
        if (error) throw error;
        const jabatans = data.map(item => item.master_jabatan);
        setJabatanList(jabatans);
      } catch (err) {
        setError("Gagal memuat jabatan: " + err.message);
      } finally {
        setLoadingJabatan(false);
      }
    }
    
    fetchJabatansForDivisi();
  }, [formData.divisi_id, loadingData]); // Dijalankan saat divisi_id berubah (dan data awal selesai load)

  // ... (useEffect preview file tidak berubah) ...
  useEffect(() => {
    if (!file) {
      setPreview(oldFotoUrl); 
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file, oldFotoUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'divisi_id') {
      setFormData(prev => ({ ...prev, jabatan_di_divisi: '' }));
    }
  };
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  // ... (handleSubmit v6.5 sudah benar, tidak berubah) ...
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("Sesi Anda telah berakhir. Silakan login kembali untuk menyimpan data.");
      alert("Sesi Anda telah berakhir. Silakan login kembali.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    let finalFotoUrl = oldFotoUrl; 
    try {
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}_${Date.now()}.${fileExt}`;
        const filePath = `anggota/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('gambar-osim').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('gambar-osim').getPublicUrl(filePath);
        finalFotoUrl = publicUrlData.publicUrl;
        if (oldFotoUrl) {
          const oldFilePath = oldFotoUrl.split('gambar-osim/')[1];
          if (oldFilePath) {
            await supabase.storage.from('gambar-osim').remove([oldFilePath]);
          }
        }
      }
      const { error: updateError } = await supabase.from('anggota').update({
          nama: formData.nama,
          jenis_kelamin: formData.jenis_kelamin,
          alamat: formData.alamat || null,
          motto: formData.motto || null,
          instagram_username: formData.instagram_username || null,
          periode_id: formData.periode_id,
          divisi_id: formData.divisi_id,
          jabatan_di_divisi: formData.jabatan_di_divisi,
          foto_url: finalFotoUrl,
        }).eq('id', id);
      if (updateError) throw updateError;
      alert('Data anggota berhasil diperbarui!');
      navigate('/admin/anggota');
    } catch (err) {
      setError("Gagal memperbarui anggota: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDivisiOptions = divisiList.filter(
    d => d.periode_id == formData.periode_id
  );

  if (loadingData) {
    return <div className="main-content"><p className="loading-text">Memuat data anggota...</p></div>;
  }

  return (
    <div className="main-content">
      <form className={styles['form-card']} onSubmit={handleSubmit}>
        <h1 className={styles['form-title']}>Edit Anggota</h1>
        {error && <p className="error-text">{error}</p>}
        <div className={styles['form-grid']}>
          {/* ... (Nama, Gender, IG, Alamat, Motto tidak berubah) ... */}
          <FormInput type="text" label="Nama Lengkap" name="nama" span="col-span-3" value={formData.nama} onChange={handleChange} required />
          <FormInput type="select" label="Jenis Kelamin" name="jenis_kelamin" span="col-span-1" value={formData.jenis_kelamin} onChange={handleChange}>
            <option value="Ikhwan">Ikhwan</option>
            <option value="Akhwat">Akhwat</option>
          </FormInput>
          <FormInput type="text" label="Instagram (tanpa @)" name="instagram_username" span="col-span-2" value={formData.instagram_username} onChange={handleChange} />
          <FormInput type="text" label="Alamat" name="alamat" span="col-span-3" value={formData.alamat} onChange={handleChange} />
          <FormInput type="textarea" label="Motto" name="motto" span="col-span-3" value={formData.motto} onChange={handleChange} />
          <hr className="card-divider col-span-3" />
          
          <FormInput type="select" label="Periode" name="periode_id" span="col-span-1" value={formData.periode_id} onChange={handleChange} required disabled={loadingData}>
            <option value="">-- Pilih Periode --</option>
            {periodeList.map(p => (
              <option key={p.id} value={p.id}>{p.nama_kabinet || `${p.tahun_mulai}/${p.tahun_selesai}`}</option>
            ))}
          </FormInput>
          
          <FormInput type="select" label="Divisi" name="divisi_id" span="col-span-1" value={formData.divisi_id} onChange={handleChange} required
            disabled={loadingData || !formData.periode_id || filteredDivisiOptions.length === 0}
            error={!formData.periode_id ? 'Pilih Periode' : null}
          >
            <option value="">-- Pilih Divisi --</option>
            {filteredDivisiOptions.map(d => (
              <option key={d.id} value={d.id}>{d.nama_divisi}</option>
            ))}
          </FormInput>

          {/* --- [PERBAIKAN 4: Render Jabatan dari state 'jabatanList' baru] --- */}
          <FormInput type="select" label="Jabatan" name="jabatan_di_divisi" span="col-span-1"
            value={formData.jabatan_di_divisi}
            onChange={handleChange}
            required
            disabled={loadingJabatan || jabatanList.length === 0}
            error={!formData.divisi_id ? 'Pilih Divisi' : (loadingJabatan ? 'Memuat...' : null)}
          >
            <option value="">-- Pilih Jabatan --</option>
            {jabatanList.map(j => (
              <option key={j.id} value={j.nama_jabatan}>{j.nama_jabatan}</option>
            ))}
          </FormInput>
          
          <hr className="card-divider col-span-3" />
          {/* ... (Upload Foto & Tombol Submit tidak berubah) ... */}
          <FormInput type="file" label="Ganti Foto" name="foto" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" span="col-span-2" />
          {preview && (
            <div className={`${styles['form-group']} ${styles['col-span-1']}`}>
              <label className={styles['form-label']}>Preview Foto</label>
              <img src={preview} alt="Preview Foto" className={styles['form-image-preview']} />
            </div>
          )}
        </div>
        <div className={styles['form-footer']}>
          <button type="button" className="button button-secondary" onClick={() => navigate('/admin/anggota')} disabled={loading}>
            Batal
          </button>
          <button type="submit" className="button button-primary" disabled={loading || loadingData || loadingJabatan}>
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditAnggota;