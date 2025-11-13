// src/pages/KelolaProgramKerja.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

function KelolaProgramKerja() {
  const [programList, setProgramList] = useState([]);
  const [loading, setLoading] = useState(true);

  // getProgramKerja() TIDAK perlu diubah, 'select *' sudah mengambil 'status'
  async function getProgramKerja() {
    setLoading(true);
    let { data, error } = await supabase
      .from('program_kerja')
      .select('*') 
      .order('tanggal', { ascending: false }); 

    if (error) console.error("Error fetching program kerja: ", error);
    if (data) setProgramList(data);
    
    setLoading(false);
  }

  useEffect(() => {
    getProgramKerja();
  }, []);

  // handleDelete() TIDAK perlu diubah
  const handleDelete = async (programId, namaAcara) => {
    // ... (kode ini sudah benar)
    if (!window.confirm(`Apakah Anda yakin ingin menghapus "${namaAcara}"?`)) {
      return;
    }
    try {
      const { error } = await supabase.from('program_kerja').delete().eq('id', programId);
      if (error) throw error;
      alert(`"${namaAcara}" berhasil dihapus.`);
      getProgramKerja(); 
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
    return <p>Loading data program kerja...</p>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Kelola Program Kerja OSIM</h2>
        <Link to="/admin/program-kerja/tambah">
          <button style={addButtonStyle}>
            + Tambah Program Kerja
          </button>
        </Link>
      </div>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Tanggal</th>
            <th style={thStyle}>Nama Acara</th>
            <th style={thStyle}>Penanggung Jawab</th>
            <th style={thStyle}>Status</th> {/* <-- PERUBAHAN 1: Tambah Kolom TH */}
            <th style={thStyle}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {programList.map((program) => (
            <tr key={program.id}>
              <td style={thTdStyle}>{program.tanggal}</td>
              <td style={thTdStyle}>{program.nama_acara}</td>
              <td style={thTdStyle}>{program.penanggung_jawab}</td>
              <td style={thTdStyle}>{program.status}</td> {/* <-- PERUBAHAN 2: Tambah Kolom TD */}
              <td style={thTdStyle}>
                <Link to={`/admin/program-kerja/edit/${program.id}`}>
                  <button style={editButtonStyle}>Edit</button>
                </Link>
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