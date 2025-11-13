// src/pages/TambahProgramKerja.jsx

import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

function TambahProgramKerja() {
  // Buat 'state' untuk setiap field di tabel 'program_kerja'
  const [tanggal, setTanggal] = useState('');
  const [namaAcara, setNamaAcara] = useState('');
  const [divisi, setDivisi] = useState('');
  const [penanggungJawab, setPenanggungJawab] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [linkDokumentasi, setLinkDokumentasi] = useState('');
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fungsi yang dipanggil saat form disubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Perintah 'CREATE' (insert) ke 'program_kerja'
      const { error } = await supabase
        .from('program_kerja')
        .insert([
          { 
            tanggal: tanggal, 
            nama_acara: namaAcara, 
            divisi: divisi,
            penanggung_jawab: penanggungJawab,
            deskripsi: deskripsi,
            link_dokumentasi: linkDokumentasi
          }
        ]);

      if (error) throw error;

      alert('Program kerja baru berhasil ditambahkan!');
      // Arahkan admin kembali ke tabel kelola
      navigate('/admin/kelola-program-kerja');

    } catch (error) {
      alert(`Gagal menambahkan program kerja: ${error.message}`);
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
    boxSizing: 'border-box'
  };
  const textareaStyle = {
    ...inputStyle,
    height: '100px'
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
      <h2>Tambah Program Kerja Baru</h2>
      <form style={formStyle} onSubmit={handleSubmit}>
        
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="tanggal">Tanggal Acara:</label>
          <input 
            style={inputStyle}
            type="date" // Gunakan tipe 'date'
            id="tanggal"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            required 
          />
        </div>
        
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="namaAcara">Nama Acara:</label>
          <input 
            style={inputStyle}
            type="text" 
            id="namaAcara"
            value={namaAcara}
            onChange={(e) => setNamaAcara(e.target.value)}
            required 
          />
        </div>
        
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="divisi">Divisi:</label>
          <input 
            style={inputStyle}
            type="text" 
            id="divisi"
            value={divisi}
            onChange={(e) => setDivisi(e.target.value)}
          />
        </div>

        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="penanggungJawab">Penanggung Jawab:</label>
          <input 
            style={inputStyle}
            type="text" 
            id="penanggungJawab"
            value={penanggungJawab}
            onChange={(e) => setPenanggungJawab(e.target.value)}
          />
        </div>
        
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="deskripsi">Deskripsi Singkat:</label>
          <textarea 
            style={textareaStyle}
            id="deskripsi"
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
          />
        </div>

        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="linkDokumentasi">Link Dokumentasi (Instagram, dll):</label>
          <input 
            style={inputStyle}
            type="text" 
            id="linkDokumentasi"
            placeholder="https://www.instagram.com/p/..."
            value={linkDokumentasi}
            onChange={(e) => setLinkDokumentasi(e.target.value)}
          />
        </div>
        
        <button 
          style={buttonStyle} 
          type="submit" 
          disabled={loading}
        >
          {loading ? 'Menyimpan...' : 'Simpan Program Kerja'}
        </button>
      </form>
    </div>
  );
}

export default TambahProgramKerja;