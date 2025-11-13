// src/pages/EditAnggota.jsx
// --- VERSI YANG SUDAH DIPERBAIKI (TYPO inputSyle -> inputStyle) ---

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useParams } from 'react-router-dom'; 

function EditAnggota() {
  const { id } = useParams(); 
  
  const [nama, setNama] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [motto, setMotto] = useState('');
  const [instagram, setInstagram] = useState('');
  
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // useEffect untuk MENGAMBIL (FETCH) data anggota yang ada
  useEffect(() => {
    async function getAnggotaById() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('anggota')
          .select('*')
          .eq('id', id)
          .single(); 

        if (error) throw error;

        if (data) {
          setNama(data.nama);
          setJabatan(data.jabatan);
          setFotoUrl(data.foto_url || ''); 
          setMotto(data.motto || '');
          setInstagram(data.instagram_username || '');
        }
      } catch (error) {
        alert(`Gagal mengambil data anggota: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
    
    getAnggotaById();
  }, [id]); 

  // Fungsi 'handleSubmit' untuk MENG-UPDATE data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('anggota')
        .update({ 
          nama: nama, 
          jabatan: jabatan, 
          foto_url: fotoUrl,
          motto: motto,
          instagram_username: instagram
        })
        .eq('id', id);

      if (error) throw error;

      alert('Data anggota berhasil diperbarui!');
      navigate('/admin/kelola-anggota');

    } catch (error) {
      alert(`Gagal memperbarui anggota: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- STYLING LENGKAP ---
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
  const inputStyle = { // <-- Didefinisikan dengan 't' ganda
    width: '100%',
    padding: '8px',
    boxSizing: 'border-box' 
  };
  const buttonStyle = {
    padding: '10px 15px',
    fontSize: '1em',
    backgroundColor: '#007bff', // Biru untuk 'Update'
    color: 'white',
    border: 'none',
    cursor: 'pointer'
  };
  // ------------------------------------
  
  if (loading && !nama) { 
    return <p>Memuat data anggota untuk diedit...</p>;
  }

  return (
    <div>
      <h2>Edit Anggota OSIM</h2>
      <form style={formStyle} onSubmit={handleSubmit}>
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="nama">Nama Lengkap:</label>
          
          {/* --- INI ADALAH PERBAIKANNYA --- */}
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
          <input style={inputStyle} type="text" id="jabatan" value={jabatan}
            onChange={(e) => setJabatan(e.target.value)} required />
        </div>
        
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="fotoUrl">URL Foto:</label>
          <input style={inputStyle} type="text" id="fotoUrl" value={fotoUrl}
            onChange={(e) => setFotoUrl(e.target.value)} />
        </div>

        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="motto">Motto:</label>
          <input style={inputStyle} type="text" id="motto" value={motto}
            onChange={(e) => setMotto(e.target.value)} />
        </div>
        
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="instagram">Instagram Username:</label>
          <input style={inputStyle} type="text" id="instagram" value={instagram}
            onChange={(e) => setInstagram(e.target.value)} />
        </div>
        
        <button style={buttonStyle} type="submit" disabled={loading}>
          {loading ? 'Menyimpan...' : 'Perbarui Data Anggota'}
        </button>
      </form>
    </div>
  );
}

export default EditAnggota;