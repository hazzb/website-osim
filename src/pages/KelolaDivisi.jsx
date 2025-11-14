// src/pages/KelolaDivisi.jsx
// --- VERSI 4.1 (FIXED Syntax Error) ---

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

// --- (Modal Hapus Tunggal - tidak berubah) ---
function DeleteConfirmationModal({ divisi, onClose, onConfirm }) {
  const [confirmationInput, setConfirmationInput] = useState('');
  const confirmationText = divisi.nama_divisi;
  const isMatch = confirmationInput === confirmationText;
  const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
  const modalContentStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' };
  const inputStyle = { width: '100%', padding: '8px', boxSizing: 'border-box', margin: '10px 0' };
  const buttonDisabledStyle = { backgroundColor: '#ccc', cursor: 'not-allowed', padding: '10px', width: '100%', border: 'none', color: 'white' };
  const buttonEnabledStyle = { ...buttonDisabledStyle, backgroundColor: '#dc3545', cursor: 'pointer' };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ color: '#dc3545', marginTop: 0 }}>Konfirmasi Hapus Divisi</h3>
        <p>Menghapus divisi ini juga akan menghapus <strong>semua anggota dan progja</strong> terkait (ON DELETE CASCADE).</p>
        <p>Silakan ketik <strong>{confirmationText}</strong> untuk mengonfirmasi.</p>
        <input type="text" style={inputStyle} value={confirmationInput} onChange={(e) => setConfirmationInput(e.target.value)} />
        <button style={isMatch ? buttonEnabledStyle : buttonDisabledStyle} disabled={!isMatch} onClick={onConfirm}>Hapus Permanen Divisi Ini</button>
        <button style={{ ...inputStyle, backgroundColor: '#6c757d', color: 'white', cursor: 'pointer', border: 'none' }} onClick={onClose}>Batal</button>
      </div>
    </div>
  );
}

// --- (Modal Hapus Massal - tidak berubah) ---
function MassDeleteDivisiModal({ periode, onClose, onConfirm }) {
  const [confirmationInput, setConfirmationInput] = useState('');
  const confirmationText = periode.nama_kabinet || `${periode.tahun_mulai}/${periode.tahun_selesai}`;
  const isMatch = confirmationInput === confirmationText;
  const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
  const modalContentStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' };
  const inputStyle = { width: '100%', padding: '8px', boxSizing: 'border-box', margin: '10px 0' };
  const buttonDisabledStyle = { backgroundColor: '#ccc', cursor: 'not-allowed', padding: '10px', width: '100%', border: 'none', color: 'white' };
  const buttonEnabledStyle = { ...buttonDisabledStyle, backgroundColor: '#dc3545', cursor: 'pointer' };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ color: '#dc3545', marginTop: 0 }}>Hapus SEMUA Divisi?</h3>
        <p>Ini akan menghapus <strong>SEMUA divisi</strong> untuk periode <strong>{confirmationText}</strong>.</p>
        <p>Silakan ketik <strong>{confirmationText}</strong> untuk mengonfirmasi.</p>
        <input type="text" style={inputStyle} value={confirmationInput} onChange={(e) => setConfirmationInput(e.target.value)} />
        <button style={isMatch ? buttonEnabledStyle : buttonDisabledStyle} disabled={!isMatch} onClick={onConfirm}>Hapus Semua Divisi Periode Ini</button>
        <button style={{ ...inputStyle, backgroundColor: '#6c757d', color: 'white', cursor: 'pointer', border: 'none' }} onClick={onClose}>Batal</button>
      </div>
    </div>
  );
}

// --- Komponen Utama KelolaDivisi ---
function KelolaDivisi() {
  const [divisiList, setDivisiList] = useState([]);
  const [periodeList, setPeriodeList] = useState([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [divisiToDelete, setDivisiToDelete] = useState(null);
  const [showMassDeleteModal, setShowMassDeleteModal] = useState(false);

  const getSelectedPeriode = () => {
    return periodeList.find(p => p.id == selectedPeriodeId) || null;
  }

  // --- (Fungsi fetch tidak berubah) ---
  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const { data: periodeData, error: periodeError } = await supabase.from('periode_jabatan').select('id, nama_kabinet, tahun_mulai, tahun_selesai').order('tahun_mulai', { ascending: false });
      if (periodeError) throw periodeError;
      setPeriodeList(periodeData || []);
      let filterPeriodeId = selectedPeriodeId;
      if (!selectedPeriodeId && periodeData.length > 0) {
        filterPeriodeId = periodeData[0].id;
        setSelectedPeriodeId(filterPeriodeId);
      }
      if (filterPeriodeId) {
        await fetchDivisiByPeriode(filterPeriodeId);
      } else {
        setDivisiList([]);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error.message);
      setError(error.message);
      setLoading(false);
    }
  }
  
  async function fetchDivisiByPeriode(periodeId) {
    setLoading(true);
    try {
      const { data: divisiData, error: divisiError } = await supabase
        .from('divisi')
        .select('*')
        .eq('periode_id', periodeId)
        .order('urutan', { ascending: true })
        .order('nama_divisi', { ascending: true });
      
      if (divisiError) throw divisiError;
      setDivisiList(divisiData || []);
    } catch (error) {
       console.error("Error fetching divisi:", error.message);
       setError(error.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { fetchData(); }, []);
  useEffect(() => { if (selectedPeriodeId) { fetchDivisiByPeriode(selectedPeriodeId); } }, [selectedPeriodeId]);

  // --- (Fungsi Hapus - tidak berubah) ---
  const handleOpenDeleteModal = (divisi) => { setDivisiToDelete(divisi); setShowDeleteModal(true); };
  const handleCloseDeleteModal = () => { setShowDeleteModal(false); setDivisiToDelete(null); };
  
  // --- INI ADALAH PERBAIKAN ---
  const handleConfirmDelete = async () => {
    if (!divisiToDelete) return;
    try {
      // Baris 130 yang salah: const { error } } = ...
      const { error } = await supabase.from('divisi').delete().eq('id', divisiToDelete.id); // <-- SUDAH DIPERBAIKI
      if (error) throw error;
      alert(`Divisi "${divisiToDelete.nama_divisi}" telah dihapus.`);
      handleCloseDeleteModal();
      fetchDivisiByPeriode(selectedPeriodeId); 
    } catch (error) {
      setError("Gagal menghapus divisi: " + error.message);
    }
  };
  // -----------------------------

  const handleOpenMassDeleteModal = () => setShowMassDeleteModal(true);
  const handleCloseMassDeleteModal = () => setShowMassDeleteModal(false);
  const handleConfirmMassDelete = async () => {
    try {
      const { error } = await supabase.from('divisi').delete().eq('periode_id', selectedPeriodeId);
      if (error) throw error;
      alert(`SEMUA divisi untuk periode ini telah dihapus.`);
      handleCloseMassDeleteModal();
      fetchDivisiByPeriode(selectedPeriodeId);
    } catch (error) {
      setError("Gagal menghapus semua divisi: " + error.message);
    }
  };

  // --- Styling ---
  const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '20px' };
  const thTdStyle = { border: '1px solid #ddd', padding: '8px', textAlign: 'left' };
  const thStyle = { ...thTdStyle, backgroundColor: '#f2f2f2', fontWeight: 'bold' };
  const buttonStyle = { marginRight: '5px', padding: '5px 10px', cursor: 'pointer', border: 'none', borderRadius: '4px' };
  const addButtonStyle = { ...buttonStyle, backgroundColor: '#28a745', color: 'white', textDecoration: 'none', display: 'inline-block' };
  const deleteButtonStyle = { ...buttonStyle, backgroundColor: '#dc3545', color: 'white' };
  const editButtonStyle = { ...buttonStyle, backgroundColor: '#007bff', color: 'white', textDecoration: 'none' };
  const massDeleteButtonStyle = { ...deleteButtonStyle, backgroundColor: '#b22222' };
  const filterGroupStyle = { margin: '20px 0', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
  const labelStyle = { fontWeight: 'bold', marginRight: '10px' };
  const selectStyle = { padding: '8px', fontSize: '1em' };

  return (
    <div>
      {/* ... (Render Modal) ... */}
      {showDeleteModal && <DeleteConfirmationModal divisi={divisiToDelete} onClose={handleCloseDeleteModal} onConfirm={handleConfirmDelete} />}
      {showMassDeleteModal && <MassDeleteDivisiModal periode={getSelectedPeriode()} onClose={handleCloseMassDeleteModal} onConfirm={handleConfirmMassDelete} />}
    
      {/* ... (Header) ... */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Kelola Divisi</h2>
        <Link to="/admin/divisi/tambah" style={addButtonStyle}>+ Tambah Divisi Baru</Link>
      </div>
      {/* ... (Filter Group) ... */}
      <div style={filterGroupStyle}>
        <div>
          <label style={labelStyle} htmlFor="periodeFilter">Tampilkan divisi untuk periode:</label>
          <select id="periodeFilter" style={selectStyle} value={selectedPeriodeId} onChange={(e) => setSelectedPeriodeId(e.target.value)}>
            {periodeList.map(periode => (
              <option key={periode.id} value={periode.id}>
                {periode.tahun_mulai}/{periode.tahun_selesai} ({periode.nama_kabinet || 'Tanpa Nama'})
              </option>
            ))}
          </select>
        </div>
        <button style={massDeleteButtonStyle} onClick={handleOpenMassDeleteModal} disabled={loading || divisiList.length === 0}>
          Hapus Semua Divisi Periode Ini
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {/* ... (Tabel) ... */}
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Urutan</th>
            <th style={thStyle}>Nama Divisi</th>
            <th style={thStyle}>Deskripsi</th>
            <th style={thStyle}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="4" style={thTdStyle}>Memuat data divisi...</td></tr>
          ) : divisiList.length > 0 ? (
            divisiList.map((divisi) => (
              <tr key={divisi.id}>
                <td style={thTdStyle}>{divisi.urutan}</td>
                <td style={thTdStyle}>{divisi.nama_divisi}</td>
                <td style={thTdStyle}>{divisi.deskripsi || '-'}</td>
                <td style={thTdStyle}>
                  <Link to={`/admin/divisi/edit/${divisi.id}`} style={editButtonStyle}>
                    Edit
                  </Link>
                  <button style={deleteButtonStyle} onClick={() => handleOpenDeleteModal(divisi)}>
                    Hapus
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="4" style={thTdStyle}>Belum ada divisi untuk periode ini.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default KelolaDivisi;