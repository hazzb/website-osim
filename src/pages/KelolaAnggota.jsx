// src/pages/KelolaAnggota.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom'; // Pastikan Link diimpor

function KelolaAnggota() {
  const [anggotaList, setAnggotaList] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fungsi untuk mengambil data (READ)
  async function getAnggota() {
    setLoading(true);
    let { data, error } = await supabase
      .from('anggota')
      .select('*')
      .order('nama', { ascending: true });

    if (error) console.error("Error fetching anggota: ", error);
    if (data) setAnggotaList(data);
    
    setLoading(false);
  }

  // 2. Ambil data saat halaman dimuat
  useEffect(() => {
    getAnggota();
  }, []);

  // 3. Fungsi untuk menghapus anggota (DELETE)
  const handleDelete = async (anggotaId, namaAnggota) => {
    // Tampilkan konfirmasi
    if (!window.confirm(`Apakah Anda yakin ingin menghapus "${namaAnggota}"?`)) {
      return; // Batal jika pengguna klik 'Cancel'
    }

    try {
      const { error } = await supabase
        .from('anggota')
        .delete()
        .eq('id', anggotaId); 

      if (error) throw error;

      alert(`"${namaAnggota}" berhasil dihapus.`);
      // Muat ulang data anggota setelah menghapus
      getAnggota(); 

    } catch (error) {
      alert(`Gagal menghapus: ${error.message}`);
    }
  };

  // --- Styling Sederhana untuk Tabel ---
  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px'
  };
  const thTdStyle = {
    border: '1px solid #ddd',
    padding: '8px',
    textAlign: 'left'
  };
  const thStyle = {
    ...thTdStyle,
    backgroundColor: '#f2f2f2',
    fontWeight: 'bold'
  };
  const buttonStyle = {
    marginRight: '5px',
    padding: '5px 10px',
    cursor: 'pointer',
    border: '1px solid #ccc',
    backgroundColor: '#f0f0f0'
  };
  const deleteButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none'
  };

  if (loading) {
    return <p>Loading data anggota...</p>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Kelola Anggota OSIM</h2>
        <Link to="/admin/anggota/tambah">
          <button style={{...buttonStyle, backgroundColor: '#28a745', color: 'white', border: 'none'}}>
            + Tambah Anggota Baru
          </button>
        </Link>
      </div>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Nama</th>
            <th style={thStyle}>Jabatan</th>
            <th style={thStyle}>Instagram</th>
            <th style={thStyle}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {anggotaList.map((anggota) => (
            <tr key={anggota.id}>
              <td style={thTdStyle}>{anggota.nama}</td>
              <td style={thTdStyle}>{anggota.jabatan}</td>
              <td style={thTdStyle}>{anggota.instagram_username}</td>
              <td style={thTdStyle}>
                
                {/* --- PERUBAHAN UTAMA ADA DI SINI --- */}
                {/* Tombol 'Edit' sekarang menjadi Link dinamis ke rute baru */}
                <Link to={`/admin/anggota/edit/${anggota.id}`}>
                  <button style={buttonStyle}>Edit</button>
                </Link>
                
                <button 
                  style={deleteButtonStyle}
                  onClick={() => handleDelete(anggota.id, anggota.nama)}
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default KelolaAnggota;