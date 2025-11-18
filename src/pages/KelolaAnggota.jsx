// src/pages/KelolaAnggota.jsx
// --- VERSI 8.0 (All-in-One Modal System) ---

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

// Style & Components
import styles from '../components/admin/AdminTable.module.css'; // Style untuk Tabel
import formStyles from '../components/admin/AdminForm.module.css'; // Style untuk Form (Grid, dll)
import FormInput from '../components/admin/FormInput.jsx';
import Modal from '../components/Modal.jsx';

const PER_PAGE = 10;

function KelolaAnggota() {
  const { user } = useAuth();
  
  // --- STATE UTAMA (TABEL) ---
  const [anggotaList, setAnggotaList] = useState([]);
  const [loadingTable, setLoadingTable] = useState(true);
  const [error, setError] = useState(null);
  
  // State Filter & Pagination
  const [selectedPeriodeId, setSelectedPeriodeId] = useState('');
  const [selectedDivisiId, setSelectedDivisiId] = useState('semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.ceil(totalCount / PER_PAGE);

  // --- STATE FORM (MODAL) ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = Tambah, ID = Edit
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [formData, setFormData] = useState({});
  const [formFile, setFormFile] = useState(null); // File baru
  const [formPreview, setFormPreview] = useState(null); // Preview
  const [existingFotoUrl, setExistingFotoUrl] = useState(null); // Foto lama (untuk edit)

  // --- STATE RELASI (DROPDOWN) ---
  const [periodeList, setPeriodeList] = useState([]);
  const [divisiList, setDivisiList] = useState([]);
  const [jabatanList, setJabatanList] = useState([]); // Dinamis
  const [allDivisiForForm, setAllDivisiForForm] = useState([]); // Semua divisi untuk form

  // =========================================
  // 1. FETCH DATA AWAL (Periode, Divisi Filter)
  // =========================================
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // Fetch Periode
      const { data: periodes } = await supabase.from('periode_jabatan').select('*').order('tahun_mulai', { ascending: false });
      setPeriodeList(periodes || []);
      
      // Set default filter periode
      if (periodes?.length > 0) {
        const active = periodes.find(p => p.is_active);
        setSelectedPeriodeId(active ? active.id : periodes[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // =========================================
  // 2. FETCH TABEL ANGGOTA & DIVISI FILTER
  // =========================================
  useEffect(() => {
    if (!selectedPeriodeId) return;

    // Fetch Divisi untuk Filter (Hanya yg ada di periode ini)
    const fetchDivisiFilter = async () => {
      const { data } = await supabase.from('divisi').select('id, nama_divisi').eq('periode_id', selectedPeriodeId).order('urutan');
      setDivisiList(data || []);
    };
    fetchDivisiFilter();

    // Fetch Tabel Anggota
    fetchAnggotaTable();
  }, [selectedPeriodeId, selectedDivisiId, currentPage, searchTerm]);

  const fetchAnggotaTable = async () => {
    setLoadingTable(true);
    const from = (currentPage - 1) * PER_PAGE;
    const to = from + PER_PAGE - 1;

    try {
      let query = supabase
        .from('anggota_detail_view')
        .select('*', { count: 'exact' })
        .eq('periode_id', selectedPeriodeId)
        .order('urutan', { ascending: true })
        .order('nama', { ascending: true })
        .range(from, to);
      
      if (selectedDivisiId !== 'semua') query = query.eq('divisi_id', selectedDivisiId);
      if (searchTerm) query = query.ilike('nama', `%${searchTerm}%`);

      const { data, error, count } = await query;
      if (error) throw error;
      
      setAnggotaList(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      setError("Gagal memuat tabel: " + err.message);
    } finally {
      setLoadingTable(false);
    }
  };

  // =========================================
  // 3. MODAL & FORM LOGIC
  // =========================================

  // Buka Modal Tambah
  const openAddModal = async () => {
    setEditingId(null); // Mode Tambah
    setFormData({ 
      jenis_kelamin: 'Ikhwan', 
      periode_id: selectedPeriodeId // Default ke periode yang sedang dilihat
    }); 
    setFormFile(null);
    setFormPreview(null);
    setExistingFotoUrl(null);
    setJabatanList([]);
    
    // Ambil semua divisi untuk dropdown form (sesuai periode terpilih di form)
    fetchDivisiForForm(selectedPeriodeId);
    
    setIsModalOpen(true);
  };

  // Buka Modal Edit
  const openEditModal = async (anggotaView) => {
    setEditingId(anggotaView.id); // Mode Edit
    setLoadingSubmit(true); // Tampilkan loading sebentar saat fetch detail
    setIsModalOpen(true);

    try {
      // Fetch data asli dari tabel 'anggota' (bukan view)
      const { data, error } = await supabase.from('anggota').select('*').eq('id', anggotaView.id).single();
      if (error) throw error;

      setFormData(data);
      setExistingFotoUrl(data.foto_url);
      setFormPreview(data.foto_url);
      setFormFile(null);

      // Siapkan dropdown
      await fetchDivisiForForm(data.periode_id);
      await fetchJabatanForDivisi(data.divisi_id); // Load jabatan yang sesuai divisi ini

    } catch (err) {
      alert("Gagal memuat detail: " + err.message);
      setIsModalOpen(false);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({});
  };

  // Helper: Fetch Divisi untuk Dropdown Form
  const fetchDivisiForForm = async (periodeId) => {
    if (!periodeId) return;
    const { data } = await supabase.from('divisi').select('id, nama_divisi').eq('periode_id', periodeId);
    setAllDivisiForForm(data || []);
  };

  // Helper: Fetch Jabatan Dinamis (Database-Driven)
  const fetchJabatanForDivisi = async (divisiId) => {
    if (!divisiId) {
      setJabatanList([]);
      return;
    }
    const { data } = await supabase
      .from('divisi_jabatan_link')
      .select('master_jabatan (id, nama_jabatan)')
      .eq('divisi_id', divisiId);
    
    if (data) {
      setJabatanList(data.map(item => item.master_jabatan));
    }
  };

  // Handler Input Form
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Jika periode berubah di form, refresh list divisi
    if (name === 'periode_id') {
        setFormData(prev => ({ ...prev, divisi_id: '', jabatan_di_divisi: '' }));
        fetchDivisiForForm(value);
    }

    // Jika divisi berubah di form, refresh list jabatan
    if (name === 'divisi_id') {
      setFormData(prev => ({ ...prev, jabatan_di_divisi: '' }));
      fetchJabatanForDivisi(value);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormFile(file);
      setFormPreview(URL.createObjectURL(file));
    }
  };

  // Handler Submit (Insert / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Sesi habis.");
    setLoadingSubmit(true);

    try {
      let finalFotoUrl = existingFotoUrl;

      // 1. Upload Foto Baru (jika ada)
      if (formFile) {
        const ext = formFile.name.split('.').pop();
        const fileName = `anggota_${user.id}_${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('gambar-osim').upload(`anggota/${fileName}`, formFile);
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from('gambar-osim').getPublicUrl(`anggota/${fileName}`);
        finalFotoUrl = urlData.publicUrl;

        // Hapus foto lama jika update
        if (editingId && existingFotoUrl) {
            const oldPath = existingFotoUrl.split('gambar-osim/')[1];
            if(oldPath) await supabase.storage.from('gambar-osim').remove([oldPath]);
        }
      }

      const payload = {
        nama: formData.nama,
        jenis_kelamin: formData.jenis_kelamin,
        alamat: formData.alamat,
        motto: formData.motto,
        instagram_username: formData.instagram_username,
        periode_id: formData.periode_id,
        divisi_id: formData.divisi_id,
        jabatan_di_divisi: formData.jabatan_di_divisi,
        foto_url: finalFotoUrl
      };

      if (editingId) {
        // UPDATE
        const { error } = await supabase.from('anggota').update(payload).eq('id', editingId);
        if (error) throw error;
        alert("Data diperbarui!");
      } else {
        // INSERT
        const { error } = await supabase.from('anggota').insert(payload);
        if (error) throw error;
        alert("Anggota ditambahkan!");
      }

      closeModal();
      fetchAnggotaTable(); // Refresh tabel

    } catch (err) {
      alert("Gagal menyimpan: " + err.message);
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Handler Hapus
  const handleHapus = async (id, fotoUrl) => {
    if (!window.confirm('Hapus anggota ini?')) return;
    try {
      setLoadingTable(true);
      const { error } = await supabase.from('anggota').delete().eq('id', id);
      if (error) throw error;
      if (fotoUrl) {
        const path = fotoUrl.split('gambar-osim/')[1];
        if(path) await supabase.storage.from('gambar-osim').remove([path]);
      }
      fetchAnggotaTable(); // Refresh tabel
    } catch (err) {
      alert("Gagal menghapus: " + err.message);
      setLoadingTable(false);
    }
  };

  return (
    <div className="main-content">
      <div className={styles['admin-page-header']}>
        <h1 className="page-title">Kelola Anggota</h1>
        <button onClick={openAddModal} className="button button-primary">
          + Tambah Anggota
        </button>
      </div>

      {/* --- FILTER & SEARCH --- */}
      <div className={styles['table-filter-container']}>
        <div className={styles['filter-group']}>
          <label>Periode:</label>
          <select className={styles['filter-select']} value={selectedPeriodeId} onChange={(e) => setSelectedPeriodeId(e.target.value)}>
            {periodeList.map(p => <option key={p.id} value={p.id}>{p.nama_kabinet || `${p.tahun_mulai}/${p.tahun_selesai}`}</option>)}
          </select>
        </div>
        <div className={styles['filter-group']}>
          <label>Divisi:</label>
          <select className={styles['filter-select']} value={selectedDivisiId} onChange={(e) => setSelectedDivisiId(e.target.value)}>
            <option value="semua">Semua Divisi</option>
            {divisiList.map(d => <option key={d.id} value={d.id}>{d.nama_divisi}</option>)}
          </select>
        </div>
        <div className={styles['search-input-group']}>
          <span>🔍</span>
          <input type="text" placeholder="Cari nama..." className={styles['search-input']} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}
      
      {/* --- TABEL --- */}
      <div className={styles['table-container']}>
        <table className={styles['admin-table']}>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Divisi</th>
              <th>Jabatan</th>
              <th>Gender</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loadingTable ? (
              <tr><td colSpan="5" style={{textAlign:'center'}}>Memuat...</td></tr>
            ) : anggotaList.length === 0 ? (
              <tr><td colSpan="5" style={{textAlign:'center'}}>Tidak ada data.</td></tr>
            ) : (
              anggotaList.map(anggota => (
                <tr key={anggota.id}>
                  <td className={styles['avatar-cell']}>
                    <img src={anggota.foto_url || 'https://via.placeholder.com/40'} alt={anggota.nama} className={styles['avatar-image']} />
                    <strong>{anggota.nama}</strong>
                  </td>
                  <td>{anggota.nama_divisi}</td>
                  <td>{anggota.jabatan_di_divisi}</td>
                  <td>{anggota.jenis_kelamin}</td>
                  <td className={styles['actions-cell']}>
                    <button onClick={() => openEditModal(anggota)} className={`${styles['button-table']} ${styles['button-edit']}`}>
                      Edit
                    </button>
                    <button onClick={() => handleHapus(anggota.id, anggota.foto_url)} className={`${styles['button-table']} ${styles['button-delete']}`}>
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL FORM (INSERT & UPDATE) --- */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Edit Anggota" : "Tambah Anggota Baru"}>
        <form onSubmit={handleSubmit}>
          <div className={formStyles['form-grid']}> {/* Reusing AdminForm CSS Grid */}
            <FormInput label="Nama Lengkap" name="nama" type="text" value={formData.nama || ''} onChange={handleFormChange} required span="col-span-3" />
            
            <FormInput label="Gender" name="jenis_kelamin" type="select" value={formData.jenis_kelamin || 'Ikhwan'} onChange={handleFormChange} span="col-span-1">
               <option value="Ikhwan">Ikhwan</option>
               <option value="Akhwat">Akhwat</option>
            </FormInput>

            <FormInput label="Instagram" name="instagram_username" type="text" value={formData.instagram_username || ''} onChange={handleFormChange} span="col-span-2" />

            <FormInput label="Periode" name="periode_id" type="select" value={formData.periode_id || ''} onChange={handleFormChange} required span="col-span-1">
               <option value="">-- Pilih --</option>
               {periodeList.map(p => <option key={p.id} value={p.id}>{p.nama_kabinet}</option>)}
            </FormInput>

            <FormInput label="Divisi" name="divisi_id" type="select" value={formData.divisi_id || ''} onChange={handleFormChange} required disabled={!formData.periode_id} span="col-span-1">
               <option value="">-- Pilih --</option>
               {allDivisiForForm.map(d => <option key={d.id} value={d.id}>{d.nama_divisi}</option>)}
            </FormInput>

            <FormInput label="Jabatan" name="jabatan_di_divisi" type="select" value={formData.jabatan_di_divisi || ''} onChange={handleFormChange} required disabled={!formData.divisi_id || jabatanList.length === 0} span="col-span-1">
               <option value="">-- Pilih --</option>
               {jabatanList.map(j => <option key={j.id} value={j.nama_jabatan}>{j.nama_jabatan}</option>)}
            </FormInput>

            <FormInput label="Alamat" name="alamat" type="text" value={formData.alamat || ''} onChange={handleFormChange} span="col-span-3" />
            <FormInput label="Motto" name="motto" type="textarea" value={formData.motto || ''} onChange={handleFormChange} span="col-span-3" />
            
            <hr className="card-divider col-span-3" />
            
            <FormInput label="Foto" name="foto" type="file" onChange={handleFileChange} span="col-span-2" />
            {formPreview && (
               <div className={`${formStyles['form-group']} ${formStyles['col-span-1']}`}>
                 <label className={formStyles['form-label']}>Preview</label>
                 <img src={formPreview} alt="Preview" className={formStyles['form-image-preview']} />
               </div>
            )}
          </div>

          <div className={formStyles['form-footer']}>
             <button type="button" onClick={closeModal} className="button button-secondary" disabled={loadingSubmit}>Batal</button>
             <button type="submit" className="button button-primary" disabled={loadingSubmit}>{loadingSubmit ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

export default KelolaAnggota;