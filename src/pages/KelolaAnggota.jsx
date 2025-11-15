// src/pages/KelolaAnggota.jsx
// --- VERSI 3.3 (Ganti Judul Kolom) ---

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

// --- (Modal Hapus Tunggal - tidak berubah) ---
function DeleteConfirmationModal({ anggota, onClose, onConfirm }) {
  const [confirmationInput, setConfirmationInput] = useState('');
  const confirmationText = anggota.nama;
  const isMatch = confirmationInput === confirmationText;
  const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
  const modalContentStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' };
  const inputStyle = { width: '100%', padding: '8px', boxSizing: 'border-box', margin: '10px 0' };
  const buttonDisabledStyle = { backgroundColor: '#ccc', cursor: 'not-allowed', padding: '10px', width: '100%', border: 'none', color: 'white' };
  const buttonEnabledStyle = { ...buttonDisabledStyle, backgroundColor: '#dc3545', cursor: 'pointer' };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ color: '#dc3545', marginTop: 0 }}>Konfirmasi Hapus Anggota</h3>
        <p>Tindakan ini akan menghapus anggota <strong>{confirmationText}</strong> secara permanen.</p>
        <p>Silakan ketik <strong>{confirmationText}</strong> untuk mengonfirmasi.</p>
        <input type="text" style={inputStyle} value={confirmationInput} onChange={(e) => setConfirmationInput(e.target.value)} />
        <button style={isMatch ? buttonEnabledStyle : buttonDisabledStyle} disabled={!isMatch} onClick={onConfirm}>Hapus Permanen Anggota Ini</button>
        <button style={{ ...inputStyle, backgroundColor: '#6c757d', color: 'white', cursor: 'pointer', border: 'none' }} onClick={onClose}>Batal</button>
      </div>
    </div>
  );
}

// --- Komponen Utama KelolaAnggota ---
function KelolaAnggota() {
  const [anggotaList, setAnggotaList] = useState([]);
  const [periodeList, setPeriodeList] = useState([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [anggotaToDelete, setAnggotaToDelete] = useState(null);
  const placeholderFoto = 'https://via.placeholder.com/400.png/eee/808080?text=Foto';

  // ... (Fungsi fetch & delete - tidak berubah) ...
  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const { data: periodeData, error: periodeError } = await supabase.from('periode_jabatan').select('id, nama_kabinet, tahun_mulai, tahun_selesai, is_active').order('tahun_mulai', { ascending: false });
      if (periodeError) throw periodeError;
      setPeriodeList(periodeData || []);
      let filterPeriodeId = selectedPeriodeId;
      if (!selectedPeriodeId && periodeData.length > 0) {
        const activePeriode = periodeData.find(p => p.is_active);
        filterPeriodeId = activePeriode ? activePeriode.id : periodeData[0].id;
        setSelectedPeriodeId(filterPeriodeId);
      }
      if (filterPeriodeId) {
        const { data: anggotaData, error: anggotaError } = await supabase.from('anggota').select(`*, divisi ( nama_divisi )`).eq('periode_id', filterPeriodeId).order('nama', { ascending: true });
        if (anggotaError) throw anggotaError;
        setAnggotaList(anggotaData || []);
      } else {
        setAnggotaList([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { fetchData(); }, [selectedPeriodeId]);
  const handleOpenDeleteModal = (anggota) => { setAnggotaToDelete(anggota); setShowDeleteModal(true); };
  const handleCloseDeleteModal = () => { setShowDeleteModal(false); setAnggotaToDelete(null); };
  const handleConfirmDelete = async () => {
    if (!anggotaToDelete) return;
    try {
      if (anggotaToDelete.foto_url) {
        const oldFileName = anggotaToDelete.foto_url.split('/').pop();
        await supabase.storage.from('avatars').remove([oldFileName]);
      }
      const { error } = await supabase.from('anggota').delete().eq('id', anggotaToDelete.id);
      if (error) throw error;
      alert(`Anggota "${anggotaToDelete.nama}" telah dihapus.`);
      handleCloseDeleteModal();
      fetchData();
    } catch (error) {
      setError("Gagal menghapus anggota: " + error.message);
    }
  };

  // --- Styling ---
  const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '20px' };
  const thTdStyle = { border: '1px solid #ddd', padding: '8px', textAlign: 'left', verticalAlign: 'middle' };
  const thStyle = { ...thTdStyle, backgroundColor: '#f2f2f2', fontWeight: 'bold' };
  const buttonStyle = { marginRight: '5px', padding: '5px 10px', cursor: 'pointer', border: 'none', borderRadius: '4px' };
  const addButtonStyle = { ...buttonStyle, backgroundColor: '#28a745', color: 'white', textDecoration: 'none', display: 'inline-block' };
  const deleteButtonStyle = { ...buttonStyle, backgroundColor: '#dc3545', color: 'white' };
  const editButtonStyle = { ...buttonStyle, backgroundColor: '#007bff', color: 'white', textDecoration: 'none' };
  const filterGroupStyle = { margin: '20px 0', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px' };
  const labelStyle = { fontWeight: 'bold', marginRight: '10px' };
  const selectStyle = { padding: '8px', fontSize: '1em' };
  const fotoPreviewStyle = { width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' };

  return (
    <div>
      {showDeleteModal && <DeleteConfirmationModal anggota={anggotaToDelete} onClose={handleCloseDeleteModal} onConfirm={handleConfirmDelete} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Kelola Anggota</h2>
        <Link to="/admin/anggota/tambah" style={addButtonStyle}>+ Tambah Anggota Baru</Link>
      </div>
      <div style={filterGroupStyle}>
        <label style={labelStyle} htmlFor="periodeFilter">Tampilkan anggota untuk periode:</label>
        <select id="periodeFilter" style={selectStyle} value={selectedPeriodeId} onChange={(e) => setSelectedPeriodeId(e.target.value)}>
          {periodeList.map(periode => (
            <option key={periode.id} value={periode.id}>
              {periode.tahun_mulai}/{periode.tahun_selesai} ({periode.nama_kabinet || 'Tanpa Nama'})
            </option>
          ))}
        </select>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Foto</th>
            <th style={thStyle}>Nama</th>
            <th style={thStyle}>Ikhwan/Akhwat</th> {/* <-- JUDUL KOLOM DIUBAH --> */}
            <th style={thStyle}>Divisi</th>
            <th style={thStyle}>Jabatan</th>
            <th style={thStyle}>Instagram</th>
            <th style={thStyle}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="7" style={thTdStyle}>Memuat data anggota...</td></tr>
          ) : anggotaList.length > 0 ? (
            anggotaList.map((anggota) => (
              <tr key={anggota.id}>
                <td style={thTdStyle}><img src={anggota.foto_url || placeholderFoto} alt="Foto" style={fotoPreviewStyle} /></td>
                <td style={thTdStyle}>{anggota.nama}</td>
                <td style={thTdStyle}>{anggota.jenis_kelamin || '-'}</td> {/* <-- Data akan otomatis Ikhwan/Akhwat --> */}
                <td style={thTdStyle}>{anggota.divisi ? anggota.divisi.nama_divisi : 'N/A'}</td>
                <td style={thTdStyle}>{anggota.jabatan_di_divisi}</td>
                <td style={thTdStyle}>{anggota.instagram_username ? `@${anggota.instagram_username}` : '-'}</td>
                <td style={thTdStyle}>
                  <Link to={`/admin/anggota/edit/${anggota.id}`} style={editButtonStyle}>Edit</Link>
                  <button style={deleteButtonStyle} onClick={() => handleOpenDeleteModal(anggota)}>Hapus</button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="7" style={thTdStyle}>Belum ada anggota untuk periode ini.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
export default KelolaAnggota;