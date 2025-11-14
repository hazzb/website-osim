// src/pages/KelolaProgramKerja.jsx
// --- VERSI 2.0 (Menggunakan View dan Filter) ---

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

// --- BAGIAN BARU: Modal Hapus Aman ---
function DeleteProgjaModal({ progja, onClose, onConfirm }) {
  const [confirmationInput, setConfirmationInput] = useState('');
  const confirmationText = progja.nama_acara; // Konfirmasi dengan nama acara
  const isMatch = confirmationInput === confirmationText;

  // (Styling Modal disalin dari KelolaAnggota)
  const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
  const modalContentStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' };
  const inputStyle = { width: '100%', padding: '8px', boxSizing: 'border-box', margin: '10px 0' };
  const buttonDisabledStyle = { backgroundColor: '#ccc', cursor: 'not-allowed', padding: '10px', width: '100%', border: 'none', color: 'white' };
  const buttonEnabledStyle = { ...buttonDisabledStyle, backgroundColor: '#dc3545', cursor: 'pointer' };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ color: '#dc3545', marginTop: 0 }}>Konfirmasi Hapus Progja</h3>
        <p>Anda akan menghapus program kerja: <strong>{progja.nama_acara}</strong>.</p>
        <p>Tindakan ini tidak dapat dibatalkan.</p>
        <p>Silakan ketik <strong>{confirmationText}</strong> untuk mengonfirmasi.</p>
        <input type="text" style={inputStyle} value={confirmationInput} onChange={(e) => setConfirmationInput(e.target.value)} />
        <button style={isMatch ? buttonEnabledStyle : buttonDisabledStyle} disabled={!isMatch} onClick={onConfirm}>Hapus Permanen Progja Ini</button>
        <button style={{ ...inputStyle, backgroundColor: '#6c757d', color: 'white', cursor: 'pointer', border: 'none' }} onClick={onClose}>Batal</button>
      </div>
    </div>
  );
}

// --- Komponen Utama KelolaProgramKerja ---
function KelolaProgramKerja() {
  const [progjaList, setProgjaList] = useState([]); // Daftar yg sudah difilter
  const [fullProgjaList, setFullProgjaList] = useState([]); // Daftar lengkap periode aktif
  
  // State Filter
  const [divisiList, setDivisiList] = useState([]); // Untuk filter dropdown
  const [selectedDivisiId, setSelectedDivisiId] = useState('semua');
  const [selectedStatus, setSelectedStatus] = useState('semua');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State modal hapus
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [progjaToDelete, setProgjaToDelete] = useState(null);

  // --- Fungsi untuk mengambil data awal ---
  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      // 1. Ambil SEMUA progja dari periode AKTIF (via View)
      //    View 'program_kerja_detail_view' sudah otomatis filter 'is_active = TRUE'
      const { data: progjaData, error: progjaError } = await supabase
        .from('program_kerja_detail_view')
        .select('*')
        .order('tanggal', { ascending: false }); // Progja terbaru di atas
        
      if (progjaError) throw progjaError;
      
      setProgjaList(progjaData || []); // Tampilkan semua di awal
      setFullProgjaList(progjaData || []); // Simpan data master

      // 2. Buat daftar Divisi unik dari data progja (untuk filter)
      const divisiUnik = new Map();
      progjaData.forEach(progja => {
        if (!divisiUnik.has(progja.divisi_id)) {
          divisiUnik.set(progja.divisi_id, progja.nama_divisi);
        }
      });
      const divisiFilterList = Array.from(divisiUnik, ([id, nama_divisi]) => ({ id, nama_divisi }));
      setDivisiList(divisiFilterList);

    } catch (error) {
      console.error("Error fetching progja:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Ambil data saat halaman dimuat
  useEffect(() => {
    fetchData();
  }, []);

  // --- EFEK untuk FILTER (berjalan di sisi React) ---
  useEffect(() => {
    let filteredList = fullProgjaList;

    // Filter berdasarkan Divisi
    if (selectedDivisiId !== 'semua') {
      filteredList = filteredList.filter(
        progja => progja.divisi_id == selectedDivisiId
      );
    }

    // Filter berdasarkan Status
    if (selectedStatus !== 'semua') {
      filteredList = filteredList.filter(
        progja => progja.status === selectedStatus
      );
    }

    setProgjaList(filteredList);
  }, [selectedDivisiId, selectedStatus, fullProgjaList]); // 'Trigger' saat filter berubah

  // --- Fungsi Hapus ---
  const handleOpenDeleteModal = (progja) => {
    setProgjaToDelete(progja);
    setShowDeleteModal(true);
  };
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setProgjaToDelete(null);
  };
  const handleConfirmDelete = async () => {
    if (!progjaToDelete) return;
    setError(null);
    try {
      // Kita HAPUS dari tabel 'program_kerja' asli, bukan view
      const { error } = await supabase
        .from('program_kerja')
        .delete()
        .eq('id', progjaToDelete.id);
        
      if (error) throw error;
      
      alert(`Program Kerja "${progjaToDelete.nama_acara}" telah dihapus.`);
      handleCloseDeleteModal();
      fetchData(); // Ambil ulang SEMUA data
      
    } catch (error) {
      console.error("Error deleting progja:", error.message);
      setError("Gagal menghapus program kerja: " + error.message);
    }
  };

  // --- Styling ---
  const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '20px' };
  const thTdStyle = { border: '1px solid #ddd', padding: '8px', textAlign: 'left' };
  const thStyle = { ...thTdStyle, backgroundColor: '#f2f2f2', fontWeight: 'bold' };
  const buttonStyle = { marginRight: '5px', padding: '5px 10px', cursor: 'pointer', border: 'none', borderRadius: '4px' };
  const addButtonStyle = { ...buttonStyle, backgroundColor: '#28a745', color: 'white', textDecoration: 'none', display: 'inline-block' };
  const deleteButtonStyle = { ...buttonStyle, backgroundColor: '#dc3545', color: 'white' };
  const filterGroupStyle = { margin: '20px 0', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', display: 'flex', gap: '20px' };
  const labelStyle = { fontWeight: 'bold', marginRight: '10px' };
  const selectStyle = { padding: '8px', fontSize: '1em' };

  return (
    <div>
      {/* Render Modal Hapus */}
      {showDeleteModal && (
        <DeleteProgjaModal
          progja={progjaToDelete}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
        />
      )}
    
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Kelola Program Kerja (Periode Aktif)</h2>
        <Link to="/admin/program-kerja/tambah" style={addButtonStyle}>
          + Tambah Progja Baru
        </Link>
      </div>

      {/* --- Filter UI --- */}
      <div style={filterGroupStyle}>
        <div>
          <label style={labelStyle} htmlFor="divisiFilter">Filter Divisi:</label>
          <select 
            id="divisiFilter" 
            style={selectStyle}
            value={selectedDivisiId}
            onChange={(e) => setSelectedDivisiId(e.target.value)}
            disabled={loading}
          >
            <option value="semua">-- Semua Divisi --</option>
            {divisiList.map(divisi => (
              <option key={divisi.id} value={divisi.id}>
                {divisi.nama_divisi}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle} htmlFor="statusFilter">Filter Status:</label>
          <select 
            id="statusFilter" 
            style={selectStyle}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            disabled={loading}
          >
            <option value="semua">-- Semua Status --</option>
            <option value="Rencana">Rencana</option>
            <option value="Akan Datang">Akan Datang</option>
            <option value="Selesai">Selesai</option>
          </select>
        </div>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Tanggal</th>
            <th style={thStyle}>Nama Acara</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Divisi</th>
            <th style={thStyle}>Penanggung Jawab</th>
            <th style={thStyle}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="6" style={thTdStyle}>Memuat data program kerja...</td>
            </tr>
          ) : progjaList.length > 0 ? (
            progjaList.map((progja) => (
              <tr key={progja.id}>
                <td style={thTdStyle}>{new Date(progja.tanggal).toLocaleDateString('id-ID')}</td>
                <td style={thTdStyle}>{progja.nama_acara}</td>
                <td style={thTdStyle}>{progja.status}</td>
                <td style={thTdStyle}>{progja.nama_divisi}</td>
                <td style={thTdStyle}>{progja.nama_penanggung_jawab}</td>
                <td style={thTdStyle}>
                  <Link to={`/admin/program-kerja/edit/${progja.id}`} style={buttonStyle}>Edit</Link>
                  <button 
                    style={deleteButtonStyle}
                    onClick={() => handleOpenDeleteModal(progja)}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={thTdStyle}>Tidak ada program kerja untuk filter ini.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default KelolaProgramKerja;