// src/pages/KelolaPeriode.jsx
// --- VERSI 8.0 (Hook + Modal) ---

import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAdminTable } from '../hooks/useAdminTable';
import styles from '../components/admin/AdminTable.module.css';
import formStyles from '../components/admin/AdminForm.module.css';
import FormInput from '../components/admin/FormInput.jsx';
import Modal from '../components/Modal.jsx';

function KelolaPeriode() {
  const {
    data: periodeList, loading, error, 
    currentPage, setCurrentPage, totalPages, 
    searchTerm, setSearchTerm, handleDelete, refreshData
  } = useAdminTable({
    tableName: 'periode_jabatan',
    searchColumn: 'nama_kabinet',
    defaultOrder: { column: 'tahun_mulai', ascending: false }
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
      setFormData({ 
        tahun_mulai: new Date().getFullYear(), 
        tahun_selesai: new Date().getFullYear() + 1,
        is_active: false 
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      const payload = { 
        nama_kabinet: formData.nama_kabinet, 
        tahun_mulai: formData.tahun_mulai,
        tahun_selesai: formData.tahun_selesai,
        motto_kabinet: formData.motto_kabinet,
        is_active: formData.is_active === 'true' || formData.is_active === true
      };

      // Logic: Jika periode ini di-set aktif, nonaktifkan yang lain
      if (payload.is_active) {
         await supabase.from('periode_jabatan').update({ is_active: false }).neq('id', 0);
      }

      if (editingId) {
        await supabase.from('periode_jabatan').update(payload).eq('id', editingId);
      } else {
        await supabase.from('periode_jabatan').insert(payload);
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
        <h1 className="page-title">Kelola Periode</h1>
        <button onClick={() => openModal()} className="button button-primary">+ Tambah Periode</button>
      </div>

      <div className={styles['table-filter-container']}>
        <div className={styles['search-input-group']}>
           <span>🔍</span>
           <input type="text" placeholder="Cari kabinet..." className={styles['search-input']} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className={styles['table-container']}>
        <table className={styles['admin-table']}>
          <thead>
            <tr>
              <th>Nama Kabinet</th>
              <th>Tahun</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="4" className="loading-text">Memuat...</td></tr> : 
             periodeList.map(item => (
               <tr key={item.id}>
                 <td><strong>{item.nama_kabinet}</strong></td>
                 <td>{item.tahun_mulai} - {item.tahun_selesai}</td>
                 <td>
                   {item.is_active ? <span style={{color:'green', fontWeight:'bold'}}>AKTIF</span> : <span style={{color:'gray'}}>Non-Aktif</span>}
                 </td>
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
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Periode" : "Tambah Periode"}>
        <form onSubmit={handleSubmit}>
          <div className={formStyles['form-grid']}>
            <FormInput label="Nama Kabinet" name="nama_kabinet" type="text" value={formData.nama_kabinet || ''} onChange={(e) => setFormData({...formData, nama_kabinet: e.target.value})} required span="col-span-3" />
            
            <FormInput label="Tahun Mulai" name="tahun_mulai" type="number" value={formData.tahun_mulai || ''} onChange={(e) => setFormData({...formData, tahun_mulai: e.target.value})} required span="col-span-1" />
            <FormInput label="Tahun Selesai" name="tahun_selesai" type="number" value={formData.tahun_selesai || ''} onChange={(e) => setFormData({...formData, tahun_selesai: e.target.value})} required span="col-span-1" />
            
            <FormInput label="Status Aktif" name="is_active" type="select" value={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.value})} span="col-span-1">
               <option value={false}>Tidak</option>
               <option value={true}>Ya, Aktif</option>
            </FormInput>

            <FormInput label="Motto Kabinet" name="motto_kabinet" type="textarea" value={formData.motto_kabinet || ''} onChange={(e) => setFormData({...formData, motto_kabinet: e.target.value})} span="col-span-3" />
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

export default KelolaPeriode;