// src/pages/KelolaJabatan.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

function KelolaJabatan() {
  const [jabatanList, setJabatanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchJabatan() {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('master_jabatan')
        .select('*')
        .order('tipe_jabatan', { ascending: true })
        .order('nama_jabatan', { ascending: true });

      if (error) throw error;
      setJabatanList(data || []);
    } catch (error) {
      console.error("Error fetching jabatan:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJabatan();
  }, []);

  const handleDelete = async (id, nama) => {
    // Untuk tabel master ini, konfirmasi simpel sudah cukup
    if (!window.confirm(`Apakah Anda yakin ingin menghapus jabatan "${nama}"?`)) {
      return;
    }
    setError(null);
    try {
      const { error } = await supabase
        .from('master_jabatan')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert(`Jabatan "${nama}" berhasil dihapus.`);
      fetchJabatan(); // Refresh tabel
    } catch (error) {
      console.error("Error deleting jabatan:", error.message);
      setError("Gagal menghapus jabatan: " + error.message);
    }
  };

  // --- Styling (Sederhana) ---
  const tableStyle = { width: '100%', maxWidth: '800px', borderCollapse: 'collapse', marginTop: '20px' };
  const thTdStyle = { border: '1px solid #ddd', padding: '8px', textAlign: 'left' };
  const thStyle = { ...thTdStyle, backgroundColor: '#f2f2f2', fontWeight: 'bold' };
  const buttonStyle = { marginRight: '5px', padding: '5px 10px', cursor: 'pointer', border: 'none', borderRadius: '4px' };
  const addButtonStyle = { ...buttonStyle, backgroundColor: '#28a745', color: 'white', textDecoration: 'none', display: 'inline-block' };
  const deleteButtonStyle = { ...buttonStyle, backgroundColor: '#dc3545', color: 'white' };
  const editButtonStyle = { ...buttonStyle, backgroundColor: '#007bff', color: 'white', textDecoration: 'none' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '800px' }}>
        <h2>Kelola Master Jabatan</h2>
        <Link to="/admin/jabatan/tambah" style={addButtonStyle}>
          + Tambah Jabatan Baru
        </Link>
      </div>
      <p>Ini adalah daftar Pilihan Jabatan yang akan muncul di form Tambah/Edit Anggota.</p>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Nama Jabatan</th>
            <th style={thStyle}>Tipe Jabatan</th>
            <th style={thStyle}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="3" style={thTdStyle}>Memuat data...</td>
            </tr>
          ) : (
            jabatanList.map((jabatan) => (
              <tr key={jabatan.id}>
                <td style={thTdStyle}>{jabatan.nama_jabatan}</td>
                <td style={thTdStyle}>{jabatan.tipe_jabatan}</td>
                <td style={thTdStyle}>
                  <Link to={`/admin/jabatan/edit/${jabatan.id}`} style={editButtonStyle}>
                    Edit
                  </Link>
                  <button
                    style={deleteButtonStyle}
                    onClick={() => handleDelete(jabatan.id, jabatan.nama_jabatan)}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default KelolaJabatan;