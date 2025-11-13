// src/pages/KelolaAnggota.jsx
// --- VERSI YANG DIPERBARUI (dengan Relasi Foreign Key) ---

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

function KelolaAnggota() {
  const [anggotaList, setAnggotaList] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- PERUBAHAN UTAMA 1: FUNGSI getAnggota() ---
  async function getAnggota() {
    setLoading(true);
    
    // Kita tidak bisa lagi mengurutkan berdasarkan 'periode' (Teks)
    // Kita harus 'join' tabel dan mengurutkan berdasarkan data terkait.
    try {
      let { data, error } = await supabase
        .from('anggota')
        // Ini adalah "JOIN": Ambil semua kolom anggota,
        // DAN juga ambil kolom-kolom ini dari tabel 'periode_jabatan' yang terhubung
        .select(`
          *, 
          periode_jabatan (
            id,
            tahun_mulai,
            tahun_selesai,
            nama_kabinet
          )
        `)
        // Urutkan berdasarkan 'tahun_mulai' dari tabel 'periode_jabatan'
        // Ini adalah cara yang benar untuk mengurutkan berdasarkan relasi
        .order('tahun_mulai', { foreignTable: 'periode_jabatan', ascending: false })
        .order('nama', { ascending: true }); // Lalu urutkan berdasarkan nama

      if (error) throw error; // Ini akan ditangkap oleh 'catch'
      
      if (data) setAnggotaList(data);

    } catch (error) {
      // 'error' dari log Anda akan muncul di sini
      console.error("Error fetching anggota (KelolaAnggota.jsx): ", error);
      alert("Gagal mengambil data anggota: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getAnggota();
  }, []);

  // Fungsi 'handleDelete' (Tidak perlu diubah, masih berfungsi)
  const handleDelete = async (anggotaId, namaAnggota) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus "${namaAnggota}"?`)) {
      return;
    }
    try {
      const { error } = await supabase
        .from('anggota')
        .delete()
        .eq('id', anggotaId); 
      if (error) throw error;
      alert(`"${namaAnggota}" berhasil dihapus.`);
      getAnggota(); 
    } catch (error) {
      alert(`Gagal menghapus: ${error.message}`);
    }
  };

  // --- Styling (Tidak ada perubahan) ---
  const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '20px' };
  const thTdStyle = { border: '1px solid #ddd', padding: '8px', textAlign: 'left' };
  const thStyle = { ...thTdStyle, backgroundColor: '#f2f2f2', fontWeight: 'bold' };
  const buttonStyle = { marginRight: '5px', padding: '5px 10px', cursor: 'pointer', border: '1px solid #ccc', backgroundColor: '#f0f0f0' };
  const deleteButtonStyle = { ...buttonStyle, backgroundColor: '#dc3545', color: 'white', border: 'none' };
  const editButtonStyle = { ...buttonStyle, backgroundColor: '#007bff', color: 'white', border: 'none' };
  const addButtonStyle = { ...buttonStyle, backgroundColor: '#28a745', color: 'white', border: 'none' };

  if (loading) {
    return <p>Loading data anggota...</p>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Kelola Anggota OSIM</h2>
        <Link to="/admin/anggota/tambah">
          <button style={addButtonStyle}>
            + Tambah Anggota Baru
          </button>
        </Link>
      </div>

      <table style={tableStyle}>
        <thead>
          {/* Perbaikan untuk 'whitespace error': tidak ada spasi antar tag */}
          <tr>
            <th style={thStyle}>Nama</th>
            <th style={thStyle}>Jabatan</th>
            <th style={thStyle}>Periode</th>
            <th style={thStyle}>Instagram</th>
            <th style={thStyle}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {anggotaList.map((anggota) => (
            <tr key={anggota.id}>
              <td style={thTdStyle}>{anggota.nama}</td>
              <td style={thTdStyle}>{anggota.jabatan}</td>
              
              {/* --- PERUBAHAN UTAMA 2: CARA MENAMPILKAN PERIODE --- */}
              <td style={thTdStyle}>
                {/* Data sekarang ada di dalam 'anggota.periode_jabatan' */}
                {anggota.periode_jabatan ? (
                  `${anggota.periode_jabatan.tahun_mulai}/${anggota.periode_jabatan.tahun_selesai}`
                ) : (
                  'N/A' // Fallback jika periode_id-nya NULL
                )}
                {/* Tampilkan nama kabinet jika ada */}
                {anggota.periode_jabatan && anggota.periode_jabatan.nama_kabinet && (
                  <span style={{ fontSize: '0.9em', color: '#555', display: 'block' }}>
                    ({anggota.periode_jabatan.nama_kabinet})
                  </span>
                )}
              </td>
              
              <td style={thTdStyle}>{anggota.instagram_username}</td>
              <td style={thTdStyle}>
                <Link to={`/admin/anggota/edit/${anggota.id}`}>
                  {/* Saya perbarui style tombol Edit agar konsisten */}
                  <button style={editButtonStyle}>Edit</button>
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