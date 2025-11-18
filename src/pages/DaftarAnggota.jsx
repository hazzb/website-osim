// src/pages/DaftarAnggota.jsx
// --- VERSI 9.2 (Refaktor: Menggunakan Komponen Form Terpisah) ---

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient'; 
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Styles & Components
import styles from './DaftarAnggota.module.css';
import Modal from '../components/Modal.jsx';

// --- IMPORT FORM BARU ---
import PeriodeForm from '../components/forms/PeriodeForm.jsx';
import DivisiForm from '../components/forms/DivisiForm.jsx';
import AnggotaForm from '../components/forms/AnggotaForm.jsx';

// Komponen Kartu (Tidak Berubah)
function AnggotaCard({ anggota, isAdmin, pengaturan, onEdit }) {
  const showMotto = pengaturan?.tampilkan_anggota_motto && anggota.motto;
  const showIg = pengaturan?.tampilkan_anggota_ig && anggota.instagram_username;
  const showAlamat = pengaturan?.tampilkan_anggota_alamat && anggota.alamat;

  const cardClasses = `${styles.card} ${
    anggota.jenis_kelamin === 'Ikhwan' ? styles['card-ikhwan'] :
    anggota.jenis_kelamin === 'Akhwat' ? styles['card-akhwat'] : ''
  }`;

  return (
    <div className={cardClasses}>
      {isAdmin && (
        <button onClick={() => onEdit(anggota)} title={`Edit ${anggota.nama}`} className={styles['card-edit-button']}>✏️</button>
      )}
      <img src={anggota.foto_url || 'https://via.placeholder.com/150.png/eee/808080?text=Foto'} alt={`Foto ${anggota.nama}`} className={styles['anggota-card-image']} />
      <div className={styles['anggota-card-content']}>
        <h3 className={styles['anggota-card-nama']}>{anggota.nama}</h3>
        <p className={styles['anggota-card-jabatan']}>
          {anggota.jabatan_di_divisi}
          {anggota.jenis_kelamin && ( <span style={{fontSize:'0.75em', color:'#718096'}}> ({anggota.jenis_kelamin === 'Ikhwan' ? 'L' : 'P'})</span> )}
        </p>
        {(showMotto || showIg || showAlamat) && (
          <>
            <hr style={{borderTop:'1px solid rgba(0,0,0,0.05)', margin:'0.5rem 0'}} />
            <div className={styles['anggota-card-info']}>
              {showMotto && ( <p style={{fontStyle:'italic'}}>"{anggota.motto}"</p> )}
              {showIg && ( <p>📸 @{anggota.instagram_username}</p> )}
              {showAlamat && ( <p>🏠 {anggota.alamat}</p> )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DaftarAnggota() {
  const { session } = useAuth();
  const isAdmin = !!session; 

  // State Data
  const [unfilteredAnggota, setUnfilteredAnggota] = useState([]);
  const [periodeList, setPeriodeList] = useState([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState('');
  const [divisiOptions, setDivisiOptions] = useState([]); 
  const [allDivisiList, setAllDivisiList] = useState([]); // Untuk dropdown form
  const [jabatanList, setJabatanList] = useState([]);    // Untuk dropdown form
  const [pengaturan, setPengaturan] = useState(null); 
  
  // State UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDivisiFilter, setSelectedDivisiFilter] = useState('semua');
  const [selectedGenderFilter, setSelectedGenderFilter] = useState('semua');

  // State Modal & Form
  const [activeModal, setActiveModal] = useState(null); 
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [formFile, setFormFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formPreview, setFormPreview] = useState(null);
  const [existingFotoUrl, setExistingFotoUrl] = useState(null);

  // --- 1. Fetch Data Awal ---
  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const { data: periodes } = await supabase.from('periode_jabatan').select('*').order('tahun_mulai', { ascending: false });
      setPeriodeList(periodes || []);
      if (!selectedPeriodeId && periodes?.length > 0) {
        const active = periodes.find(p => p.is_active);
        setSelectedPeriodeId(active ? active.id : periodes[0].id);
      }
      const { data: settings } = await supabase.from('pengaturan').select('*').single();
      if (settings) setPengaturan(settings);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };
  useEffect(() => { fetchInitialData(); }, []);

  // --- 2. Fetch Anggota ---
  const fetchAnggota = async () => {
    if (!selectedPeriodeId) return;
    setLoading(true); setUnfilteredAnggota([]);
    try {
      const { data, error } = await supabase.from('anggota_detail_view').select('*').eq('periode_id', selectedPeriodeId).order('urutan', { ascending: true }).order('nama', { ascending: true });
      if (error) throw error;
      setUnfilteredAnggota(data || []);
      const uniqueDivisi = [...new Map(data.map(item => [item.divisi_id, { id: item.divisi_id, nama_divisi: item.nama_divisi, urutan: item.urutan }])).values()];
      uniqueDivisi.sort((a, b) => a.urutan - b.urutan);
      setDivisiOptions(uniqueDivisi);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };
  useEffect(() => { fetchAnggota(); }, [selectedPeriodeId]);

  // --- 3. Filter Logic ---
  const filteredDivisiList = useMemo(() => {
    if (unfilteredAnggota.length === 0) return [];
    let result = unfilteredAnggota;
    if (selectedGenderFilter !== 'semua') result = result.filter(a => a.jenis_kelamin === selectedGenderFilter);
    if (selectedDivisiFilter !== 'semua') result = result.filter(a => a.divisi_id == selectedDivisiFilter);
    
    const groups = new Map();
    result.forEach(anggota => {
      const { nama_divisi, urutan, divisi_id, periode_id, logo_url } = anggota;
      if (!groups.has(nama_divisi)) {
        groups.set(nama_divisi, { nama: nama_divisi || 'Tanpa Divisi', urutan: urutan || 99, divisi_id, periode_id, logo_url, anggota: [] });
      }
      groups.get(nama_divisi).anggota.push(anggota);
    });
    return Array.from(groups.values()).sort((a, b) => a.urutan - b.urutan);
  }, [unfilteredAnggota, selectedDivisiFilter, selectedGenderFilter]);

  // --- 4. Handlers ---
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'divisi_id' && activeModal === 'anggota') {
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

  const fetchJabatanForDivisi = async (divisiId) => {
    if (!divisiId) return;
    const { data } = await supabase.from('divisi_jabatan_link').select('master_jabatan (id, nama_jabatan)').eq('divisi_id', divisiId);
    if (data) setJabatanList(data.map(i => i.master_jabatan));
  };

  // Fetch Divisi List untuk Dropdown Form
  useEffect(() => {
    if(activeModal === 'anggota' && formData.periode_id) {
       const fetchAllDivisi = async () => {
         const { data } = await supabase.from('divisi').select('id, nama_divisi').eq('periode_id', formData.periode_id).order('urutan');
         setAllDivisiList(data || []);
       }
       fetchAllDivisi();
    }
  }, [activeModal, formData.periode_id]);

  const openAddModal = (type, specificDivisiId = null) => {
    setEditingId(null); setFormData({}); setFormFile(null); setFormPreview(null); setExistingFotoUrl(null); setJabatanList([]);
    
    if (type === 'anggota') {
      setFormData({ periode_id: selectedPeriodeId, divisi_id: specificDivisiId || '', jenis_kelamin: 'Ikhwan' });
      if (specificDivisiId) fetchJabatanForDivisi(specificDivisiId);
    } else if (type === 'divisi') {
      setFormData({ periode_id: selectedPeriodeId, urutan: 10 });
    } else if (type === 'periode') {
      setFormData({ tahun_mulai: new Date().getFullYear(), tahun_selesai: new Date().getFullYear() + 1, is_active: false });
    }
    setActiveModal(type);
  };

  const openEditModal = async (anggota) => {
    setEditingId(anggota.id); setFormFile(null);
    setFormData({
      nama: anggota.nama, jenis_kelamin: anggota.jenis_kelamin, alamat: anggota.alamat || '', motto: anggota.motto || '',
      instagram_username: anggota.instagram_username || '', periode_id: anggota.periode_id, divisi_id: anggota.divisi_id,
      jabatan_di_divisi: anggota.jabatan_di_divisi,
    });
    setExistingFotoUrl(anggota.foto_url); setFormPreview(anggota.foto_url);
    await fetchJabatanForDivisi(anggota.divisi_id);
    setActiveModal('anggota');
  };

  const closeModal = () => setActiveModal(null);

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault(); setModalLoading(true);
    try {
      if (activeModal === 'periode') {
         await supabase.from('periode_jabatan').insert({ ...formData });
         alert("Periode ditambahkan!"); fetchInitialData();
      } 
      else if (activeModal === 'divisi') {
         let logoUrl = null;
         if (formFile) {
           const fileName = `divisi_${Date.now()}.${formFile.name.split('.').pop()}`;
           const { data } = await supabase.storage.from('gambar-osim').upload(`divisi/${fileName}`, formFile);
           if(data) logoUrl = supabase.storage.from('gambar-osim').getPublicUrl(`divisi/${fileName}`).data.publicUrl;
         }
         await supabase.from('divisi').insert({ ...formData, logo_url: logoUrl });
         alert("Divisi ditambahkan!"); window.location.reload();
      } 
      else if (activeModal === 'anggota') {
         let finalFotoUrl = existingFotoUrl;
         if (formFile) {
           const fileName = `anggota_${Date.now()}.${formFile.name.split('.').pop()}`;
           const { data } = await supabase.storage.from('gambar-osim').upload(`anggota/${fileName}`, formFile);
           if(data) finalFotoUrl = supabase.storage.from('gambar-osim').getPublicUrl(`anggota/${fileName}`).data.publicUrl;
         }
         const payload = { ...formData, foto_url: finalFotoUrl };
         if (editingId) {
            await supabase.from('anggota').update(payload).eq('id', editingId);
            alert("Data diperbarui!");
         } else {
            await supabase.from('anggota').insert(payload);
            alert("Anggota ditambahkan!");
         }
         fetchAnggota();
      }
      closeModal();
    } catch (err) { alert("Error: " + err.message); } finally { setModalLoading(false); }
  };

  // --- RENDER UI ---
  return (
    <div className="main-content"> 
      <h1 className="page-title">Daftar Anggota</h1>

      {isAdmin && (
        <div className={styles['action-buttons']}>
          <button onClick={() => openAddModal('periode')} className={`${styles['modern-button']} ${styles['btn-purple']}`}>📅 Tambah Periode</button>
          <button onClick={() => openAddModal('divisi')} className={`${styles['modern-button']} ${styles['btn-orange']}`}>🏢 Tambah Divisi</button>
          <button onClick={() => openAddModal('anggota')} className={`${styles['modern-button']} ${styles['btn-blue']}`}>👤 Tambah Anggota</button>
        </div>
      )}

      <div className={styles['filter-bar']}>
        {/* (Filter Period, Divisi, Gender - Sama seperti sebelumnya) */}
        <div className={styles['filter-group']}>
          <label className={styles['filter-label']}>Periode:</label>
          <select className={styles['filter-select']} value={selectedPeriodeId} onChange={(e) => setSelectedPeriodeId(e.target.value)}>
            {periodeList.map(p => <option key={p.id} value={p.id}>{p.nama_kabinet || `${p.tahun_mulai}/${p.tahun_selesai}`}</option>)}
          </select>
        </div>
        <div className={styles['filter-group']}>
          <label className={styles['filter-label']}>Divisi:</label>
          <select className={styles['filter-select']} value={selectedDivisiFilter} onChange={(e) => setSelectedDivisiFilter(e.target.value)}>
            <option value="semua">Semua Divisi</option>
            {divisiOptions.map(d => <option key={d.id} value={d.id}>{d.nama_divisi}</option>)}
          </select>
        </div>
        <div className={styles['filter-group']}>
          <label className={styles['filter-label']}>Gender:</label>
          <select className={styles['filter-select']} value={selectedGenderFilter} onChange={(e) => setSelectedGenderFilter(e.target.value)}>
            <option value="semua">Semua</option>
            <option value="Ikhwan">Ikhwan</option>
            <option value="Akhwat">Akhwat</option>
          </select>
        </div>
      </div>
      
      {loading && <p className="loading-text">Memuat...</p>}
      
      {!loading && (
        <div className={styles['divisi-list']}>
          {filteredDivisiList.length > 0 ? filteredDivisiList.map(divisi => (
            <section key={divisi.nama} className={styles['divisi-section']}>
              <div className={styles['divisi-header']}>
                {divisi.logo_url && <img src={divisi.logo_url} alt="Logo" className={styles['divisi-logo']} />}
                <h2 className={styles['divisi-title']}>{divisi.nama}</h2>
                {isAdmin && <button className={styles['btn-add-circle']} onClick={() => openAddModal('anggota', divisi.divisi_id)} title="Tambah Anggota">+</button>}
                <Link to={`/divisi/${divisi.divisi_id}`} className={styles['btn-detail-outline']}>Lihat Detail Divisi &rarr;</Link>
              </div>
              <div className={styles['card-grid']}>
                {divisi.anggota.map(anggota => (
                  <AnggotaCard 
                    key={anggota.id} 
                    anggota={anggota} 
                    isAdmin={isAdmin} 
                    pengaturan={pengaturan || {}}
                    onEdit={openEditModal}
                  />
                ))}
              </div>
            </section>
          )) : <p className="info-text">Tidak ada data anggota.</p>}
        </div>
      )}

      {/* --- MODALS MENGGUNAKAN KOMPONEN FORM TERPISAH --- */}
      <Modal isOpen={activeModal === 'anggota'} onClose={closeModal} title={editingId ? "Edit Anggota" : "Tambah Anggota Baru"}>
        <AnggotaForm 
           formData={formData} onChange={handleFormChange} onFileChange={handleFileChange} 
           onSubmit={handleSubmit} onCancel={closeModal} loading={modalLoading}
           periodeList={periodeList} divisiList={allDivisiList} jabatanList={jabatanList} preview={formPreview}
        />
      </Modal>
      
      <Modal isOpen={activeModal === 'divisi'} onClose={closeModal} title="Tambah Divisi">
         <DivisiForm 
            formData={formData} onChange={handleFormChange} onFileChange={handleFileChange}
            onSubmit={handleSubmit} onCancel={closeModal} loading={modalLoading} periodeList={periodeList}
         />
      </Modal>

      <Modal isOpen={activeModal === 'periode'} onClose={closeModal} title="Tambah Periode">
         <PeriodeForm 
            formData={formData} onChange={handleFormChange} 
            onSubmit={handleSubmit} onCancel={closeModal} loading={modalLoading}
         />
      </Modal>

    </div>
  );
}
export default DaftarAnggota;