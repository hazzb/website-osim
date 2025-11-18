// src/pages/KelolaJabatan.jsx
// --- VERSI 8.0 (Hook + Modal) ---

import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAdminTable } from '../hooks/useAdminTable';
import styles from '../components/admin/AdminTable.module.css';
import formStyles from '../components/admin/AdminForm.module.css';
import FormInput from '../components/admin/FormInput.jsx';
import Modal from '../components/Modal.jsx';

function KelolaJabatan() {
  const {
    data: jabatanList, loading, error, 
    currentPage, setCurrentPage, totalPages, 
    searchTerm, setSearchTerm, handleDelete, refreshData
  } = useAdminTable({
    tableName: 'master_jabatan',
    searchColumn: 'nama_jabatan',
    defaultOrder: { column: 'nama_jabatan', ascending: true }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [modalLoading, setModalLoading] = useState(false);

  const openModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData(item);
    } else {
      setEditingId(null);
      setFormData({ tipe_jabatan: 'DIVISI' }); // Default
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      const payload = { 
        nama_jabatan: formData.nama_jabatan, 
        tipe_jabatan: formData.tipe_jabatan 
      };

      if (editingId) {
        await supabase.from('master_jabatan').update(payload).eq('id', editingId);
      } else {
        await supabase.from('master_jabatan').insert(payload);
      }
      
      alert("Berhasil disimpan!");
      setIsModalOpen(false);
      refreshData();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className={styles['admin-page-header']}>
        <h1 className="page-title">Kelola Jabatan</h1>
        <button onClick={() => openModal()} className="button button-primary">+ Tambah Jabatan</button>
      </div>

      <div className={styles['table-filter-container']}>
        <div className={styles['search-input-group']}>
           <span>🔍</span>
           <input type="text" placeholder="Cari jabatan..." className={styles['search-input']} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className={styles['table-container']}>
        <table className={styles['admin-table']}>
          <thead>
            <tr>
              <th>Nama Jabatan</th>
              <th>Tipe</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="3" className="loading-text">Memuat...</td></tr> : 
             jabatanList.map(item => (
               <tr key={item.id}>
                 <td><strong>{item.nama_jabatan}</strong></td>
                 <td>{item.tipe_jabatan}</td>
                 <td className={styles['actions-cell']}>
                   <button onClick={() => openModal(item)} className={`${styles['button-table']} ${styles['button-edit']}`}>Edit</button>
                   <button onClick={() => handleDelete(item.id)} className={`${styles['button-table']} ${styles['button-delete']}`}>Hapus</button>
                 </td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={styles['pagination-container']}>
         <span className={styles['pagination-info']}>Page {currentPage} of {totalPages}</span>
         <div className={styles['pagination-buttons']}>
           <button className={styles['pagination-button']} onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>Prev</button>
           <button className={styles['pagination-button']} onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>Next</button>
         </div>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Jabatan" : "Tambah Jabatan"}>
        <form onSubmit={handleSubmit}>
          <div className={formStyles['form-grid']}>
            <FormInput label="Nama Jabatan" name="nama_jabatan" type="text" value={formData.nama_jabatan || ''} onChange={(e) => setFormData({...formData, nama_jabatan: e.target.value})} required span="col-span-3" />
            
            {/* PENTING: Sesuaikan value option ini dengan apa yang ada di database Anda saat kita debug Anggota tadi */}
            <FormInput label="Tipe Jabatan" name="tipe_jabatan" type="select" value={formData.tipe_jabatan || 'DIVISI'} onChange={(e) => setFormData({...formData, tipe_jabatan: e.target.value})} span="col-span-3">
               <option value="DIVISI">DIVISI (Untuk Anggota Biasa)</option>
               <option value="BPH">BPH (Untuk Pengurus Inti)</option>
            </FormInput>
          </div>
          <div className={formStyles['form-footer']}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="button button-secondary">Batal</button>
            <button type="submit" className="button button-primary" disabled={modalLoading}>Simpan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default KelolaJabatan;