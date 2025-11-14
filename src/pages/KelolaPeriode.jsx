// src/pages/KelolaPeriode.jsx
// --- VERSI 2.0 (Termasuk Fitur Hapus Aman) ---

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; 
import { Link } from 'react-router-dom';

// --- BAGIAN BARU 1: Komponen Modal ---
// Kita buat komponen Modal di dalam file yang sama agar mudah
function DeleteConfirmationModal({ periode, onClose, onConfirm }) {
  const [confirmationInput, setConfirmationInput] = useState('');
  
  // Nama kabinet yang harus diketik untuk konfirmasi
  const confirmationText = periode.nama_kabinet || `${periode.tahun_mulai}/${periode.tahun_selesai}`;
  const isMatch = confirmationInput === confirmationText;

  // --- Styling untuk Modal ---
  const modalOverlayStyle = {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
    justifyContent: 'center', alignItems: 'center', zIndex: 1000
  };
  const modalContentStyle = {
    backgroundColor: 'white', padding: '20px', borderRadius: '8px',
    width: '400px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
  };
  const inputStyle = { width: '100%', padding: '8px', boxSizing: 'border-box', margin: '10px 0' };
  const buttonDisabledStyle = { backgroundColor: '#ccc', cursor: 'not-allowed', padding: '10px', width: '100%', border: 'none', color: 'white' };
  const buttonEnabledStyle = { ...buttonDisabledStyle, backgroundColor: '#dc3545', cursor: 'pointer' };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ color: '#dc3545', marginTop: 0 }}>Konfirmasi Hapus</h3>
        <p>Ini adalah tindakan berbahaya dan **tidak dapat dibatalkan**.</p>
        <p>
          Menghapus periode ini juga akan menghapus **semua divisi, anggota, dan program kerja** yang terkait dengannya (ON DELETE CASCADE).
        </p>
        <p>
          Silakan ketik <strong>{confirmationText}</strong> untuk mengonfirmasi.
        </p>
        <input
          type="text"
          style={inputStyle}
          value={confirmationInput}
          onChange={(e) => setConfirmationInput(e.target.value)}
        />
        <button
          style={isMatch ? buttonEnabledStyle : buttonDisabledStyle}
          disabled={!isMatch}
          onClick={onConfirm}
        >
          Saya mengerti, Hapus Permanen Periode Ini
        </button>
        <button
          style={{ ...inputStyle, backgroundColor: '#6c757d', color: 'white', cursor: 'pointer', border: 'none' }}
          onClick={onClose}
        >
          Batal
        </button>
      </div>
    </div>
  );
}


// --- Komponen Utama KelolaPeriode ---
function KelolaPeriode() {
  const [periodeList, setPeriodeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activatingId, setActivatingId] = useState(null);

  // --- BAGIAN BARU 2: State untuk Modal Hapus ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [periodeToDelete, setPeriodeToDelete] = useState(null); // (akan berisi {id, nama_kabinet, ...})

  // --- (Fungsi fetchPeriode dan handleSetAktif tidak berubah) ---
  async function fetchPeriode() {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('periode_jabatan')
        .select('*')
        .order('tahun_mulai', { ascending: false });

      if (error) throw error;
      setPeriodeList(data || []);

    } catch (error) {
      console.error("Error fetching periode:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPeriode();
  }, []);

  const handleSetAktif = async (periodeId) => {
    // ... (kode handleSetAktif Anda dari kemarin, tidak berubah) ...
    if (!window.confirm("Apakah Anda yakin ingin menjadikan periode ini aktif? Ini akan mengubah apa yang tampil di website publik.")) {
      return;
    }
    setActivatingId(periodeId);
    setError(null);
    try {
      const { error: resetError } = await supabase
        .from('periode_jabatan')
        .update({ is_active: false })
        .eq('is_active', true);
      if (resetError) throw resetError;
      const { error: updateError } = await supabase
        .from('periode_jabatan')
        .update({ is_active: true })
        .eq('id', periodeId);
      if (updateError) throw updateError;
      alert('Periode aktif berhasil diperbarui!');
      fetchPeriode(); 
    } catch (error) {
      console.error("Error setting active period:", error.message);
      setError("Gagal memperbarui periode: " + error.message);
    } finally {
      setActivatingId(null);
    }
  };

  // --- BAGIAN BARU 3: Fungsi untuk Hapus ---
  
  // 1. Saat tombol "Hapus" di tabel diklik
  const handleOpenDeleteModal = (periode) => {
    setPeriodeToDelete(periode); // Simpan info periode yg akan dihapus
    setShowDeleteModal(true);
  };
  
  // 2. Saat tombol "Batal" di modal diklik
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setPeriodeToDelete(null);
  };

  // 3. Saat tombol "Konfirmasi Hapus" di modal diklik
  const handleConfirmDelete = async () => {
    if (!periodeToDelete) return;
    
    setError(null);
    try {
      // Ini adalah 'CASCADE DELETE'
      const { error } = await supabase
        .from('periode_jabatan')
        .delete()
        .eq('id', periodeToDelete.id);
        
      if (error) throw error;
      
      alert(`Periode "${periodeToDelete.nama_kabinet || periodeToDelete.tahun_mulai}" dan semua data terkaitnya (divisi, anggota, progja) telah dihapus permanen.`);
      
      // Tutup modal dan refresh tabel
      handleCloseDeleteModal();
      fetchPeriode();
      
    } catch (error) {
      console.error("Error deleting period:", error.message);
      setError("Gagal menghapus periode: " + error.message);
    }
  };


  // --- Styling (Tidak ada perubahan) ---
  const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '20px' };
  const thTdStyle = { border: '1px solid #ddd', padding: '8px', textAlign: 'left' };
  const thStyle = { ...thTdStyle, backgroundColor: '#f2f2f2', fontWeight: 'bold' };
  const buttonStyle = { marginRight: '5px', padding: '5px 10px', cursor: 'pointer', border: 'none', borderRadius: '4px' };
  const addButtonStyle = { ...buttonStyle, backgroundColor: '#28a745', color: 'white', textDecoration: 'none', display: 'inline-block' };
  const activeButtonStyle = { ...buttonStyle, backgroundColor: '#007bff', color: 'white' };
  const disabledButtonStyle = { ...buttonStyle, backgroundColor: '#ccc', color: '#666', cursor: 'not-allowed' };
  const deleteButtonStyle = { ...buttonStyle, backgroundColor: '#dc3545', color: 'white' };
  const statusActiveStyle = { padding: '5px 10px', backgroundColor: 'green', color: 'white', borderRadius: '5px', fontWeight: 'bold' };
  const statusInactiveStyle = { ...statusActiveStyle, backgroundColor: '#aaa', color: '#333' };


  return (
    <div>
      {/* --- BAGIAN BARU 4: Render Modal (jika showDeleteModal true) --- */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          periode={periodeToDelete}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
        />
      )}
    
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Kelola Periode Jabatan</h2>
        <Link to="/admin/periode/tambah" style={addButtonStyle}>
          + Tambah Periode Baru
        </Link>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Tahun</th>
            <th style={thStyle}>Nama Kabinet</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="4" style={thTdStyle}>Memuat data...</td>
            </tr>
          ) : (
            periodeList.map((periode) => (
              <tr key={periode.id}>
                <td style={thTdStyle}>{periode.tahun_mulai} / {periode.tahun_selesai}</td>
                <td style={thTdStyle}>{periode.nama_kabinet || '-'}</td>
                <td style={thTdStyle}>
                  {periode.is_active ? (
                    <span style={statusActiveStyle}>Aktif</span>
                  ) : (
                    <span style={statusInactiveStyle}>Non-Aktif</span>
                  )}
                </td>
                <td style={thTdStyle}>
                  <button
                    style={periode.is_active ? disabledButtonStyle : activeButtonStyle}
                    disabled={periode.is_active || activatingId !== null} 
                    onClick={() => handleSetAktif(periode.id)}
                  >
                    {activatingId === periode.id ? 'Menyimpan...' : 'Jadikan Aktif'}
                  </button>
                  
                  {/* --- BAGIAN BARU 5: Tombol Hapus --- */}
                  <button
                    style={deleteButtonStyle}
                    // Tidak bisa menghapus periode yang sedang aktif
                    disabled={periode.is_active || activatingId !== null}
                    onClick={() => handleOpenDeleteModal(periode)}
                  >
                    Hapus
                  </button>
                  {/* TODO: Tambah tombol Edit di sini nanti */}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default KelolaPeriode;