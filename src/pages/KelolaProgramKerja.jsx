// src/pages/KelolaProgramKerja.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

function KelolaProgramKerja() {
  const [programList, setProgramList] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fungsi untuk mengambil data (READ)
  async function getProgramKerja() {
    setLoading(true);
    let { data, error } = await supabase
      .from('program_kerja') // <-- Tabel diubah
      .select('*')
      .order('tanggal', { ascending: false }); // Urutkan: tanggal terbaru dulu

    if (error) console.error("Error fetching program kerja: ", error);
    if (data) setProgramList(data);
    
    setLoading(false);
  }

  // 2. Ambil data saat halaman dimuat
  useEffect(() => {
    getProgramKerja();
  }, []);

  // 3. Fungsi untuk menghapus (DELETE)
  const handleDelete = async (programId, namaAcara) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus "${namaAcara}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('program_kerja') // <-- Tabel diubah
        .delete()
        .eq('id', programId);

      if (error) throw error;

      alert(`"${namaAcara}" berhasil dihapus.`);
      getProgramKerja(); // Muat ulang data

    } catch (error) {
      alert(`Gagal menghapus: ${error.message}`);
    }
  };

  // --- Styling (Sama seperti KelolaAnggota) ---
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
    return <p>Loading data program kerja...</p>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Kelola Program Kerja OSIM</h2>
        {/* Link ini akan kita buat di langkah selanjutnya */}
        <Link to="/admin/program-kerja/tambah">
          <button style={{...buttonStyle, backgroundColor: '#28a745', color: 'white', border: 'none'}}>
            + Tambah Program Kerja
          </button>
        </Link> 
      </div>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Tanggal</th>
            <th style={thStyle}>Nama Acara</th>
            <th style={thStyle}>Divisi</th>
            <th style={thStyle}>Penanggung Jawab</th>
            <th style={thStyle}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {programList.map((program) => (
            <tr key={program.id}>
              <td style={thTdStyle}>{program.tanggal}</td>
              <td style={thTdStyle}>{program.nama_acara}</td>
              <td style={thTdStyle}>{program.divisi}</td>
              <td style={thTdStyle}>{program.penanggung_jawab}</td>
              <td style={thTdStyle}>
                <button style={buttonStyle}>Edit</button>
                <button 
                  style={deleteButtonStyle}
                  onClick={() => handleDelete(program.id, program.nama_acara)}
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

export default KelolaProgramKerja;