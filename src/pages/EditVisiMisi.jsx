// src/pages/EditVisiMisi.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

function EditVisiMisi() {
  // Kita tidak perlu 'useParams' karena kita TAHU slug-nya adalah 'visi-misi'
  
  const [judul, setJudul] = useState('');
  const [kontenMarkdown, setKontenMarkdown] = useState('');
  
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Hook untuk redirect

  // 1. useEffect untuk MENGAMBIL (FETCH) data 'visi-misi'
  useEffect(() => {
    async function getKonten() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('konten_halaman')
          .select('judul, konten_markdown') // Kita hanya butuh 2 kolom ini
          .eq('slug', 'visi-misi') // Kunci utamanya
          .single(); // Kita hanya mengharapkan satu hasil

        if (error) throw error;

        // Isi 'state' form dengan data yang didapat dari database
        if (data) {
          setJudul(data.judul);
          setKontenMarkdown(data.konten_markdown || '');
        }
      } catch (error) {
        alert(`Gagal mengambil data konten: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
    
    getKonten();
  }, []); // <-- Array kosong, hanya berjalan sekali saat load

  // 2. Fungsi 'handleSubmit' untuk MENG-UPDATE data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Ini adalah perintah 'UPDATE'
      const { error } = await supabase
        .from('konten_halaman')
        .update({ 
          judul: judul, 
          konten_markdown: kontenMarkdown
        })
        .eq('slug', 'visi-misi'); // <-- DI MANA 'slug' adalah 'visi-misi'

      if (error) throw error;

      alert('Konten Visi & Misi berhasil diperbarui!');
      // Arahkan kembali ke dashboard admin
      navigate('/admin/dashboard');

    } catch (error) {
      alert(`Gagal memperbarui konten: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- Styling Sederhana untuk Form ---
  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '800px', // Lebih lebar untuk editor markdown
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
  // Style khusus untuk <textarea>
  const textareaStyle = {
    ...inputStyle,
    height: '400px', // Jauh lebih tinggi
    fontFamily: 'monospace' // Font yang baik untuk coding/markdown
  };
  const buttonStyle = {
    padding: '10px 15px',
    fontSize: '1em',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    cursor: 'pointer'
  };
  
  if (loading && !judul) { 
    return <p>Memuat konten Visi Misi...</p>;
  }

  return (
    <div>
      <h2>Edit Konten Visi & Misi</h2>
      <p>Anda bisa menggunakan format Markdown (cth: `### Judul`, `* item`) di sini.</p>
      
      <form style={formStyle} onSubmit={handleSubmit}>
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="judul">Judul Halaman:</label>
          <input 
            style={inputStyle} 
            type="text" 
            id="judul" 
            value={judul}
            onChange={(e) => setJudul(e.target.value)} 
            required 
          />
        </div>
        
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="konten">Konten (Markdown):</label>
          {/* KITA PAKAI <textarea> DI SINI */}
          <textarea 
            style={textareaStyle}
            id="konten"
            value={kontenMarkdown}
            onChange={(e) => setKontenMarkdown(e.target.value)}
          />
        </div>
        
        <button style={buttonStyle} type="submit" disabled={loading}>
          {loading ? 'Menyimpan...' : 'Perbarui Konten'}
        </button>
      </form>
    </div>
  );
}

export default EditVisiMisi;