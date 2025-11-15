// src/pages/KelolaPeriode.jsx
// --- VERSI 3.0 (Tombol Edit Aktif) ---

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom'; // <-- Pastikan Link di-impor

function KelolaPeriode() {
  const [periodeList, setPeriodeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fungsi untuk mengambil data
  async function fetchPeriode() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('periode_jabatan')
        .select('*')
        .order('tahun_mulai', { ascending: false });
      if (error) throw error;
      setPeriodeList(data || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Ambil data saat komponen dimuat
  useEffect(() => {
    fetchPeriode();
  }, []);

  // Fungsi untuk 'Jadikan Aktif'
  const handleSetActive = async (periodeId) => {
    setLoading(true);
    try {
      // 1. Nonaktifkan periode aktif saat ini
      const { error: updateError } = await supabase
        .from('periode_jabatan')
        .update({ is_active: false })
        .eq('is_active', true);
      if (updateError) throw updateError;
      
      // 2. Aktifkan periode yang dipilih
      const { error: activeError } = await supabase
        .from('periode_jabatan')
        .update({ is_active: true })
        .eq('id', periodeId);
      if (activeError) throw activeError;
      
      // 3. Muat ulang data
      fetchPeriode();
      
    } catch (error) {
      setError("Gagal mengubah periode aktif: " + error.message);
      setLoading(false);
    }
  };

  // --- Styling ---
  const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '20px' };
  const thTdStyle = { border: '1px solid #ddd', padding: '10px', textAlign: 'left', verticalAlign: 'middle' };
  const thStyle = { ...thTdStyle, backgroundColor: '#f2f2f2', fontWeight: 'bold' };
  const buttonStyle = { marginRight: '5px', padding: '5px 10px', cursor: 'pointer', border: 'none', borderRadius: '4px', textDecoration: 'none' };
  const addButtonStyle = { ...buttonStyle, backgroundColor: '#28a745', color: 'white', display: 'inline-block' };
  const activeButtonStyle = { ...buttonStyle, backgroundColor: '#17a2b8', color: 'white' };
  const alreadyActiveStyle = { ...buttonStyle, backgroundColor: '#28a745', color: 'white', cursor: 'default' };
  // --- Style Baru ---
  const editButtonStyle = { ...buttonStyle, backgroundColor: '#007bff', color: 'white' };
  const mottoStyle = { fontSize: '0.9em', color: '#444', fontStyle: 'italic', whiteSpace: 'pre-wrap' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Kelola Periode Jabatan</h2>
        <Link to="/admin/periode/tambah" style={addButtonStyle}>+ Tambah Periode Baru</Link>
      </div>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Kabinet</th>
            <th style={thStyle}>Tahun</th>
            <th style={thStyle}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="4" style={thTdStyle}>Memuat data periode...</td></tr>
          ) : periodeList.length > 0 ? (
            periodeList.map((periode) => (
              <tr key={periode.id}>
                <td style={thTdStyle}>
                  {periode.is_active ? (
                    <span style={alreadyActiveStyle}>✔ Aktif</span>
                  ) : (
                    <button style={activeButtonStyle} onClick={() => handleSetActive(periode.id)}>
                      Jadikan Aktif
                    </button>
                  )}
                </td>
                <td style={thTdStyle}>
                  <strong style={{fontSize: '1.1em'}}>{periode.nama_kabinet}</strong>
                  {/* --- Tampilkan Motto (BARU) --- */}
                  {periode.motto_kabinet && (
                    <p style={mottoStyle}>"{periode.motto_kabinet}"</p>
                  )}
                </td>
                <td style={thTdStyle}>{periode.tahun_mulai} / {periode.tahun_selesai}</td>
                <td style={thTdStyle}>
                  {/* --- TOMBOL EDIT (BARU) --- */}
                  <Link to={`/admin/periode/edit/${periode.id}`} style={editButtonStyle}>
                    Edit
                  </Link>
                  {/* Tombol Hapus bisa ditambahkan di sini nanti jika perlu */}
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="4" style={thTdStyle}>Belum ada periode. Silakan tambahkan.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default KelolaPeriode;