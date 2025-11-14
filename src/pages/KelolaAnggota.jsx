// src/pages/KelolaAnggota.jsx
// --- VERSI 2.0 (Menggunakan View dan Filter Divisi) ---

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

// --- BAGIAN BARU: Modal Hapus Aman (Mirip seperti kemarin) ---
function DeleteAnggotaModal({ anggota, onClose, onConfirm }) {
  const [confirmationInput, setConfirmationInput] = useState('');
  const confirmationText = anggota.nama; // Konfirmasi dengan nama
  const isMatch = confirmationInput === confirmationText;

  // (Styling Modal disalin dari KelolaPeriode)
  const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
  const modalContentStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' };
  const inputStyle = { width: '100%', padding: '8px', boxSizing: 'border-box', margin: '10px 0' };
  const buttonDisabledStyle = { backgroundColor: '#ccc', cursor: 'not-allowed', padding: '10px', width: '100%', border: 'none', color: 'white' };
  const buttonEnabledStyle = { ...buttonDisabledStyle, backgroundColor: '#dc3545', cursor: 'pointer' };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ color: '#dc3545', marginTop: 0 }}>Konfirmasi Hapus Anggota</h3>
        <p>Anda akan menghapus anggota: <strong>{anggota.nama}</strong>.</p>
        <p>Tindakan ini juga akan menghapus anggota ini sebagai Penanggung Jawab (PJ) program kerja, tapi program kerjanya akan tetap ada (di-set ke NULL).</p>
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
  const [anggotaList, setAnggotaList] = useState([]); // Daftar anggota yang sudah difilter
  const [fullAnggotaList, setFullAnggotaList] = useState([]); // Daftar lengkap anggota periode aktif
  const [divisiList, setDivisiList] = useState([]); // Untuk filter dropdown
  
  const [selectedDivisiId, setSelectedDivisiId] = useState('semua'); // Filter state
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State untuk modal hapus
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [anggotaToDelete, setAnggotaToDelete] = useState(null);

  // --- Fungsi untuk mengambil SEMUA data awal ---
  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      // 1. Ambil SEMUA anggota dari periode AKTIF (via View)
      //    View 'anggota_detail_view' sudah otomatis filter 'is_active = TRUE'
      const { data: anggotaData, error: anggotaError } = await supabase
        .from('anggota_detail_view')
        .select('*')
        .order('nama', { ascending: true });
        
      if (anggotaError) throw anggotaError;
      
      setAnggotaList(anggotaData || []); // Tampilkan semua di awal
      setFullAnggotaList(anggotaData || []); // Simpan data master

      // 2. Buat daftar Divisi unik dari data anggota (untuk filter)
      const divisiUnik = new Map();
      anggotaData.forEach(anggota => {
        if (!divisiUnik.has(anggota.divisi_id)) {
          divisiUnik.set(anggota.divisi_id, anggota.nama_divisi);
        }
      });
      // Konversi Map ke array [ {id, nama_divisi} ]
      const divisiFilterList = Array.from(divisiUnik, ([id, nama_divisi]) => ({ id, nama_divisi }));
      setDivisiList(divisiFilterList);

    } catch (error) {
      console.error("Error fetching anggota:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Ambil data saat halaman pertama kali dimuat
  useEffect(() => {
    fetchData();
  }, []); // [] = Hanya berjalan sekali

  // --- EFEK untuk FILTER (berjalan di sisi React, bukan database) ---
  useEffect(() => {
    if (selectedDivisiId === 'semua') {
      setAnggotaList(fullAnggotaList); // Tampilkan semua
    } else {
      // Filter daftar anggota master berdasarkan divisi_id
      const filteredList = fullAnggotaList.filter(
        // '==' karena ID bisa jadi angka atau string
        anggota => anggota.divisi_id == selectedDivisiId 
      );
      setAnggotaList(filteredList);
    }
  }, [selectedDivisiId, fullAnggotaList]); // 'Trigger' saat filter atau data master berubah

  // --- Fungsi Hapus (sama seperti KelolaPeriode) ---
  const handleOpenDeleteModal = (anggota) => {
    setAnggotaToDelete(anggota);
    setShowDeleteModal(true);
  };
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setAnggotaToDelete(null);
  };
  const handleConfirmDelete = async () => {
    if (!anggotaToDelete) return;
    setError(null);
    try {
      // Kita HAPUS dari tabel 'anggota' asli, bukan view
      const { error } = await supabase
        .from('anggota')
        .delete()
        .eq('id', anggotaToDelete.id); // Hapus berdasarkan UUID
        
      if (error) throw error;
      
      alert(`Anggota "${anggotaToDelete.nama}" telah dihapus.`);
      handleCloseDeleteModal();
      fetchData(); // Ambil ulang SEMUA data untuk me-refresh tabel
      
    } catch (error) {
      console.error("Error deleting anggota:", error.message);
      setError("Gagal menghapus anggota: " + error.message);
    }
  };

  // --- Styling ---
  const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '20px' };
  const thTdStyle = { border: '1px solid #ddd', padding: '8px', textAlign: 'left' };
  const thStyle = { ...thTdStyle, backgroundColor: '#f2f2f2', fontWeight: 'bold' };
  const buttonStyle = { marginRight: '5px', padding: '5px 10px', cursor: 'pointer', border: 'none', borderRadius: '4px' };
  const addButtonStyle = { ...buttonStyle, backgroundColor: '#28a745', color: 'white', textDecoration: 'none', display: 'inline-block' };
  const deleteButtonStyle = { ...buttonStyle, backgroundColor: '#dc3545', color: 'white' };
  const filterGroupStyle = { margin: '20px 0', display: 'flex', alignItems: 'center' };
  const labelStyle = { fontWeight: 'bold', marginRight: '10px' };
  const selectStyle = { padding: '8px', fontSize: '1em' };

  return (
    <div>
      {/* Render Modal Hapus */}
      {showDeleteModal && (
        <DeleteAnggotaModal
          anggota={anggotaToDelete}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
        />
      )}
    
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Kelola Anggota (Periode Aktif)</h2>
        <Link to="/admin/anggota/tambah" style={addButtonStyle}>
          + Tambah Anggota Baru
        </Link>
      </div>

      <div style={filterGroupStyle}>
        <label style={labelStyle} htmlFor="divisiFilter">Filter berdasarkan Divisi:</label>
        <select 
          id="divisiFilter" 
          style={selectStyle}
          value={selectedDivisiId}
          onChange={(e) => setSelectedDivisiId(e.target.value)}
          disabled={loading}
        >
          <option value="semua">-- Tampilkan Semua Divisi --</option>
          {divisiList.map(divisi => (
            <option key={divisi.id} value={divisi.id}>
              {divisi.nama_divisi}
            </option>
          ))}
        </select>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Nama</th>
            <th style={thStyle}>Divisi</th>
            <th style={thStyle}>Jabatan</th>
            <th style={thStyle}>Instagram</th>
            <th style={thStyle}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="5" style={thTdStyle}>Memuat data anggota...</td>
            </tr>
          ) : anggotaList.length > 0 ? (
            anggotaList.map((anggota) => (
              <tr key={anggota.id}>
                <td style={thTdStyle}>{anggota.nama}</td>
                <td style={thTdStyle}>{anggota.nama_divisi}</td>
                <td style={thTdStyle}>{anggota.jabatan_di_divisi}</td>
                <td style={thTdStyle}>@{anggota.instagram_username || '-'}</td>
                <td style={thTdStyle}>
                  <Link to={`/admin/anggota/edit/${anggota.id}`} style={buttonStyle}>Edit</Link>
                  <button 
                    style={deleteButtonStyle}
                    onClick={() => handleOpenDeleteModal(anggota)}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={thTdStyle}>Tidak ada anggota untuk filter ini.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default KelolaAnggota;