// src/pages/TambahAnggota.jsx
// --- VERSI 7.0 (Logika Database-Driven) ---

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from '../components/admin/AdminForm.module.css'; 
import FormInput from '../components/admin/FormInput.jsx';

function TambahAnggota() {
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
  
  // State Dropdown
  const [periodeList, setPeriodeList] = useState([]);
  const [divisiList, setDivisiList] = useState([]);
  const [jabatanList, setJabatanList] = useState([]); // Daftar jabatan yang sudah difilter
  
  const [loading, setLoading] = useState(false);
  const [loadingRelasi, setLoadingRelasi] = useState(true);
  const [loadingJabatan, setLoadingJabatan] = useState(false); // Loading khusus jabatan
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // --- Efek 1: Memuat Periode & Divisi (HANYA) ---
  useEffect(() => {
    async function fetchRelasi() {
      setLoadingRelasi(true);
      try {
        const { data: periode, error: periodeError } = await supabase.from('periode_jabatan').select('id, nama_kabinet, tahun_mulai, tahun_selesai');
        if (periodeError) throw periodeError;
        setPeriodeList(periode);
        
        const { data: divisi, error: divisiError } = await supabase.from('divisi').select('id, nama_divisi, periode_id');
        if (divisiError) throw divisiError;
        setDivisiList(divisi);
        
        const paramPeriodeId = searchParams.get('periode_id');
        const paramDivisiId = searchParams.get('divisi_id');
        if (paramPeriodeId) {
          setFormData(prev => ({ ...prev, periode_id: paramPeriodeId }));
        }
        if (paramDivisiId) {
          setFormData(prev => ({ ...prev, divisi_id: paramDivisiId }));
        }
      } catch (err) {
        setError("Gagal memuat data relasi: " + err.message);
      } finally {
        setLoadingRelasi(false);
      }
    }
    fetchRelasi();
  }, [searchParams]);

  // --- [EFEK BARU]: Memuat Jabatan saat Divisi berubah ---
  useEffect(() => {
    // Jangan lakukan apa-apa jika divisi tidak dipilih
    if (!formData.divisi_id) {
      setJabatanList([]); // Kosongkan jabatan
      return;
    }

    async function fetchJabatansForDivisi() {
      setLoadingJabatan(true);
      setError(null);
      try {
        // Ambil data dari tabel 'divisi_jabatan_link'
        const { data, error } = await supabase
          .from('divisi_jabatan_link')
          .select('master_jabatan (id, nama_jabatan)') // Ambil data jabatan melalui relasi
          .eq('divisi_id', formData.divisi_id);
        
        if (error) throw error;

        // Ubah format data dari { master_jabatan: { id: ... } } menjadi { id: ... }
        const jabatans = data.map(item => item.master_jabatan);
        setJabatanList(jabatans);
        
        if (jabatans.length === 0) {
          setError("Tidak ada jabatan yang terdaftar untuk divisi ini. Silakan atur di database.");
        }

      } catch (err) {
        setError("Gagal memuat jabatan: " + err.message);
      } finally {
        setLoadingJabatan(false);
      }
    }
    
    fetchJabatansForDivisi();
  }, [formData.divisi_id]); // Dijalankan setiap kali divisi_id berubah

  // ... (useEffect preview file tidak berubah) ...
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

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
    }
  };

  // ... (handleSubmit v6.8 sudah benar, tidak berubah) ...
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
    let finalFotoUrl = null;
    try {
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}_${Date.now()}.${fileExt}`;
        const filePath = `anggota/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('gambar-osim').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('gambar-osim').getPublicUrl(filePath);
        finalFotoUrl = publicUrlData.publicUrl;
      }
      const { error: insertError } = await supabase.from('anggota').insert({
          nama: formData.nama,
          jenis_kelamin: formData.jenis_kelamin,
          alamat: formData.alamat || null,
          motto: formData.motto || null,
          instagram_username: formData.instagram_username || null,
          periode_id: formData.periode_id,
          divisi_id: formData.divisi_id,
          jabatan_di_divisi: formData.jabatan_di_divisi,
          foto_url: finalFotoUrl,
        });
      if (insertError) throw insertError;
      alert('Anggota baru berhasil ditambahkan!');
      navigate('/admin/anggota'); 
    } catch (err) {
      setError("Gagal menambahkan anggota: " + err.message);
      console.error(err);
      if (finalFotoUrl) {
        const filePath = finalFotoUrl.split('gambar-osim/')[1];
        await supabase.storage.from('gambar-osim').remove([filePath]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Opsi Dropdown Divisi (yang difilter berdasarkan Periode)
  const filteredDivisiOptions = divisiList.filter(
    d => d.periode_id == formData.periode_id
  );

  return (
    <div className="main-content">
      <form className={styles['form-card']} onSubmit={handleSubmit}>
        <h1 className={styles['form-title']}>Tambah Anggota Baru</h1>
        {loadingRelasi && <p className="loading-text">Memuat data...</p>}
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
          
          <FormInput type="select" label="Periode" name="periode_id" span="col-span-1" value={formData.periode_id} onChange={handleChange} required disabled={loadingRelasi}>
            <option value="">-- Pilih Periode --</option>
            {periodeList.map(p => (
              <option key={p.id} value={p.id}>{p.nama_kabinet || `${p.tahun_mulai}/${p.tahun_selesai}`}</option>
            ))}
          </FormInput>
          
          <FormInput type="select" label="Divisi" name="divisi_id" span="col-span-1" value={formData.divisi_id} onChange={handleChange} required
            disabled={!formData.periode_id || filteredDivisiOptions.length === 0}
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
          <FormInput type="file" label="Upload Foto" name="foto" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" span="col-span-2" />
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
          <button type="submit" className="button button-primary" disabled={loading || loadingRelasi || loadingJabatan}>
            {loading ? 'Menyimpan...' : 'Simpan Anggota'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TambahAnggota;