// src/pages/TambahDivisi.jsx
// --- VERSI REFAKTOR (Menggunakan Form Reusable) ---

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Impor modul reusable
import styles from '../components/admin/AdminForm.module.css';
import FormInput from '../components/admin/FormInput.jsx';

function TambahDivisi() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nama_divisi: '',
    deskripsi: '', // Untuk Visi/Misi (Markdown)
    periode_id: '',
    urutan: '10',
    logo_url: ''
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [periodeList, setPeriodeList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Ambil daftar periode untuk dropdown
    const fetchPeriode = async () => {
      const { data } = await supabase.from('periode_jabatan').select('*').order('tahun_mulai', { ascending: false });
      setPeriodeList(data || []);
    };
    fetchPeriode();
  }, []);

  // Efek Preview Gambar
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Sesi habis. Login kembali.");
    
    setLoading(true);
    try {
      let finalLogoUrl = null;

      // 1. Upload Logo
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `logo_${Date.now()}.${fileExt}`;
        const filePath = `divisi/${fileName}`;
        
        const { error: uploadError } = await supabase.storage.from('gambar-osim').upload(filePath, file);
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage.from('gambar-osim').getPublicUrl(filePath);
        finalLogoUrl = urlData.publicUrl;
      }

      // 2. Insert Data
      const { error } = await supabase.from('divisi').insert({
        nama_divisi: formData.nama_divisi,
        deskripsi: formData.deskripsi,
        periode_id: formData.periode_id,
        urutan: parseInt(formData.urutan),
        logo_url: finalLogoUrl
      });

      if (error) throw error;
      alert("Divisi berhasil ditambahkan!");
      navigate('/admin/divisi');
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <form className={styles['form-card']} onSubmit={handleSubmit}>
        <h1 className={styles['form-title']}>Tambah Divisi</h1>
        
        <div className={styles['form-grid']}>
          <FormInput 
            type="text" 
            label="Nama Divisi" 
            name="nama_divisi" 
            span="col-span-2" 
            value={formData.nama_divisi} 
            onChange={handleChange} 
            required 
          />
          
          <FormInput 
            type="number" 
            label="Urutan Tampil" 
            name="urutan" 
            span="col-span-1" 
            value={formData.urutan} 
            onChange={handleChange} 
          />

          <FormInput 
            type="select" 
            label="Periode" 
            name="periode_id" 
            span="col-span-3" 
            value={formData.periode_id} 
            onChange={handleChange} 
            required
          >
            <option value="">-- Pilih Periode --</option>
            {periodeList.map(p => (
              <option key={p.id} value={p.id}>
                {p.nama_kabinet || `${p.tahun_mulai}/${p.tahun_selesai}`}
              </option>
            ))}
          </FormInput>

          <FormInput 
            type="textarea" 
            label="Visi & Misi (Markdown)" 
            name="deskripsi" 
            span="col-span-3" 
            value={formData.deskripsi} 
            onChange={handleChange} 
            style={{minHeight: '200px'}}
            placeholder="# Visi&#10;...&#10;&#10;# Misi&#10;1. ..."
          />
          
          <hr className="card-divider col-span-3" />

          <FormInput 
            type="file" 
            label="Logo Divisi" 
            name="logo" 
            span="col-span-2" 
            onChange={handleFileChange} 
            accept="image/*" 
          />
          
          {preview && (
            <div className={`${styles['form-group']} ${styles['col-span-1']}`}>
              <label className={styles['form-label']}>Preview</label>
              <img src={preview} alt="Preview" className={styles['form-image-preview']} style={{objectFit: 'contain'}} />
            </div>
          )}
        </div>

        <div className={styles['form-footer']}>
          <button type="button" className="button button-secondary" onClick={() => navigate('/admin/divisi')} disabled={loading}>Batal</button>
          <button type="submit" className="button button-primary" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</button>
        </div>
      </form>
    </div>
  );
}

export default TambahDivisi;