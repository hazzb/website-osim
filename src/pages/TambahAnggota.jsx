// src/pages/TambahAnggota.jsx

import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // Pastikan path ini benar
import { useNavigate } from 'react-router-dom'; // Untuk redirect setelah submit

function TambahAnggota() {
  // Buat 'state' untuk setiap field di form
  const [nama, setNama] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [motto, setMotto] = useState('');
  const [instagram, setInstagram] = useState('');
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook untuk redirect

  // Fungsi yang dipanggil saat form disubmit
  const handleSubmit = async (e) => {
    e.preventDefault(); // Mencegah form refresh halaman
    setLoading(true);

    try {
      // Ini adalah perintah 'CREATE' (insert) ke Supabase
      const { error } = await supabase
        .from('anggota')
        .insert([
          { 
            nama: nama, 
            jabatan: jabatan, 
            foto_url: fotoUrl, // pastikan nama kolom di Supabase benar
            motto: motto,
            instagram_username: instagram // pastikan nama kolom di Supabase benar
          }
        ]);

      if (error) throw error;

      alert('Anggota baru berhasil ditambahkan!');
      // Setelah sukses, 'tendang' admin kembali ke tabel kelola anggota
      navigate('/admin/kelola-anggota');

    } catch (error) {
      alert(`Gagal menambahkan anggota: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- Styling Sederhana untuk Form ---
  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '500px',
    margin: '20px auto',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px'
  };
  const inputGroupStyle = {
    marginBottom: '15px'
  };
  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold'
  };
  const inputStyle = {
    width: '100%',
    padding: '8px',
    boxSizing: 'border-box' // Penting agar padding tidak merusak lebar
  };
  const buttonStyle = {
    padding: '10px 15px',
    fontSize: '1em',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    cursor: 'pointer'
  };

  return (
    <div>
      <h2>Tambah Anggota OSIM Baru</h2>
      <form style={formStyle} onSubmit={handleSubmit}>
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="nama">Nama Lengkap:</label>
          <input 
            style={inputStyle}
            type="text" 
            id="nama"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required 
          />
        </div>
        
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="jabatan">Jabatan:</label>
          <input 
            style={inputStyle}
            type="text" 
            id="jabatan"
            value={jabatan}
            onChange={(e) => setJabatan(e.target.value)}
            required 
          />
        </div>
        
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="fotoUrl">URL Foto:</label>
          <input 
            style={inputStyle}
            type="text" 
            id="fotoUrl"
            placeholder="https://... (ingat, ini hanya link)"
            value={fotoUrl}
            onChange={(e) => setFotoUrl(e.target.value)}
          />
        </div>

        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="motto">Motto:</label>
          <input 
            style={inputStyle}
            type="text" 
            id="motto"
            value={motto}
            onChange={(e) => setMotto(e.target.value)}
          />
        </div>
        
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="instagram">Instagram Username:</label>
          <input 
            style={inputStyle}
            type="text" 
            id="instagram"
            placeholder="cth: osim.insanmulia (tanpa @)"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
          />
        </div>
        
        <button 
          style={buttonStyle} 
          type="submit" 
          disabled={loading}
        >
          {loading ? 'Menyimpan...' : 'Simpan Anggota Baru'}
        </button>
      </form>
    </div>
  );
}

export default TambahAnggota;