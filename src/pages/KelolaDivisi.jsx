// src/pages/KelolaDivisi.jsx
// --- VERSI 8.0 (Custom Hook + Modal System) ---

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

// Reusable Stuff
import { useAdminTable } from '../hooks/useAdminTable'; // <-- HOOK BARU
import styles from '../components/admin/AdminTable.module.css';
import formStyles from '../components/admin/AdminForm.module.css';
import FormInput from '../components/admin/FormInput.jsx';
import Modal from '../components/Modal.jsx';

function KelolaDivisi() {
  const { user } = useAuth();

  // --- 1. GUNAKAN HOOK (Menghemat 50 baris kode!) ---
  const {
    data: divisiList,
    loading,
    error,
    currentPage,
    setCurrentPage,
    totalPages,
    searchTerm,
    setSearchTerm,
    handleDelete,
    refreshData
  } = useAdminTable({
    tableName: 'divisi',
    select: '*, periode_jabatan(nama_kabinet)', // Join tabel
    defaultOrder: { column: 'urutan', ascending: true },
    searchColumn: 'nama_divisi'
  });

  // --- 2. STATE MODAL & FORM ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [formFile, setFormFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [periodeList, setPeriodeList] = useState([]); // Dropdown data

  // Fetch Periode untuk Dropdown Form
  useEffect(() => {
    const fetchP = async () => {
      const { data } = await supabase.from('periode_jabatan').select('id, nama_kabinet').order('tahun_mulai', { ascending: false });
      setPeriodeList(data || []);
    };
    fetchP();
  }, []);

  // --- 3. HANDLERS FORM ---
  const openModal = (divisi = null) => {
    setFormFile(null);
    if (divisi) {
      // Mode Edit
      setEditingId(divisi.id);
      setFormData(divisi);
      setPreview(divisi.logo_url);
    } else {
      // Mode Tambah
      setEditingId(null);
      setFormData({ urutan: 10, periode_id: periodeList[0]?.id });
      setPreview(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      let finalLogoUrl = formData.logo_url;

      // Upload Logo jika ada file baru
      if (formFile) {
        const ext = formFile.name.split('.').pop();
        const fileName = `divisi_${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('gambar-osim').upload(`divisi/${fileName}`, formFile);
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from('gambar-osim').getPublicUrl(`divisi/${fileName}`);
        finalLogoUrl = urlData.publicUrl;
      }

      const payload = {
        nama_divisi: formData.nama_divisi,
        deskripsi: formData.deskripsi,
        urutan: formData.urutan,
        periode_id: formData.periode_id,
        logo_url: finalLogoUrl
      };

      if (editingId) {
        await supabase.from('divisi').update(payload).eq('id', editingId);
      } else {
        await supabase.from('divisi').insert(payload);
      }

      alert("Berhasil disimpan!");
      setIsModalOpen(false);
      refreshData(); // Refresh tabel otomatis via Hook
    } catch (err) {
      alert("Gagal: " + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className={styles['admin-page-header']}>
        <h1 className="page-title">Kelola Divisi</h1>
        <button onClick={() => openModal()} className="button button-primary">+ Tambah Divisi</button>
      </div>

      {/* Filter Search */}
      <div className={styles['table-filter-container']}>
        <div className={styles['search-input-group']}>
          <span>🔍</span>
          <input 
            type="text" placeholder="Cari divisi..." className={styles['search-input']} 
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className={styles['table-container']}>
        <table className={styles['admin-table']}>
          <thead>
            <tr>
              <th>Logo</th>
              <th>Nama Divisi</th>
              <th>Periode</th>
              <th>Urutan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="5" className="loading-text">Memuat...</td></tr> : 
             divisiList.map(divisi => (
              <tr key={divisi.id}>
                <td className={styles['avatar-cell']}>
                  {divisi.logo_url ? <img src={divisi.logo_url} alt="logo" className={styles['avatar-image']} style={{objectFit:'contain'}} /> : '-'}
                </td>
                <td><strong>{divisi.nama_divisi}</strong></td>
                <td>{divisi.periode_jabatan?.nama_kabinet || '-'}</td>
                <td>{divisi.urutan}</td>
                <td className={styles['actions-cell']}>
                  <button onClick={() => openModal(divisi)} className={`${styles['button-table']} ${styles['button-edit']}`}>Edit</button>
                  <button onClick={() => handleDelete(divisi.id, divisi.logo_url)} className={`${styles['button-table']} ${styles['button-delete']}`}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination dari Hook */}
      <div className={styles['pagination-container']}>
         <span className={styles['pagination-info']}>Page {currentPage} of {totalPages}</span>
         <div className={styles['pagination-buttons']}>
           <button className={styles['pagination-button']} onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>Prev</button>
           <button className={styles['pagination-button']} onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>Next</button>
         </div>
      </div>

      {/* Modal Form */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Divisi" : "Tambah Divisi"}>
        <form onSubmit={handleSubmit}>
          <div className={formStyles['form-grid']}>
            <FormInput label="Nama Divisi" name="nama_divisi" type="text" value={formData.nama_divisi || ''} onChange={(e) => setFormData({...formData, nama_divisi: e.target.value})} required span="col-span-2" />
            <FormInput label="Urutan" name="urutan" type="number" value={formData.urutan || ''} onChange={(e) => setFormData({...formData, urutan: e.target.value})} span="col-span-1" />
            
            <FormInput label="Periode" name="periode_id" type="select" value={formData.periode_id || ''} onChange={(e) => setFormData({...formData, periode_id: e.target.value})} required span="col-span-3">
               <option value="">-- Pilih --</option>
               {periodeList.map(p => <option key={p.id} value={p.id}>{p.nama_kabinet}</option>)}
            </FormInput>

            <FormInput label="Visi Misi (Markdown)" name="deskripsi" type="textarea" value={formData.deskripsi || ''} onChange={(e) => setFormData({...formData, deskripsi: e.target.value})} span="col-span-3" style={{minHeight: '150px'}} />

            <FormInput label="Logo" name="logo" type="file" onChange={(e) => {
                setFormFile(e.target.files[0]);
                setPreview(URL.createObjectURL(e.target.files[0]));
            }} span="col-span-2" />
            
            {preview && (
              <div className={`${formStyles['form-group']} ${formStyles['col-span-1']}`}>
                <label className={formStyles['form-label']}>Preview</label>
                <img src={preview} className={formStyles['form-image-preview']} style={{objectFit:'contain'}} />
              </div>
            )}
          </div>
          <div className={formStyles['form-footer']}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="button button-secondary">Batal</button>
            <button type="submit" className="button button-primary" disabled={modalLoading}>{modalLoading ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default KelolaDivisi;