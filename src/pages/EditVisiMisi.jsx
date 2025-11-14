// src/pages/EditVisiMisi.jsx
// --- VERSI DIPERBARUI (setelah Skrip Nuklir) ---

import React, { useState, useEffect } from 'react';
// Path ini sudah benar: EditVisiMisi.jsx (di pages) -> ../ (ke src) -> supabaseClient.js
import { supabase } from '../supabaseClient'; 
import { useNavigate } from 'react-router-dom';

function EditVisiMisi() {
  // Kita butuh 2 state, satu untuk Visi, satu untuk Misi
  const [visi, setVisi] = useState('');
  const [misi, setMisi] = useState('');
  
  const [loading, setLoading] = useState(true); // Untuk fetch data awal
  const [saving, setSaving] = useState(false);  // Untuk tombol simpan
  const navigate = useNavigate();

  // LANGKAH 1: FETCH data Visi dan Misi saat halaman dimuat
  useEffect(() => {
    async function fetchKonten() {
      setLoading(true);
      try {
        // Ambil Visi (dari nama_halaman = 'visi')
        const { data: visiData, error: visiError } = await supabase
          .from('konten_halaman')
          .select('konten')
          .eq('nama_halaman', 'visi') // <-- Kolom baru kita
          .single();
        
        if (visiError) throw visiError;
        if (visiData) setVisi(visiData.konten);

        // Ambil Misi (dari nama_halaman = 'misi')
        const { data: misiData, error: misiError } = await supabase
          .from('konten_halaman')
          .select('konten')
          .eq('nama_halaman', 'misi') // <-- Kolom baru kita
          .single();

        if (misiError) throw misiError;
        if (misiData) setMisi(misiData.konten);

      } catch (error) {
        alert("Gagal mengambil data Visi & Misi: " + error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchKonten();
  }, []); // [] = Hanya berjalan sekali

  // LANGKAH 2: FUNGSI SIMPAN (Harus meng-update 2 baris)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Update Visi
      const { error: visiError } = await supabase
        .from('konten_halaman')
        .update({ 
          konten: visi,
          updated_at: new Date() // Set waktu update
        })
        .eq('nama_halaman', 'visi'); // <-- Kondisi update baru
      
      if (visiError) throw visiError;

      // Update Misi
      const { error: misiError } = await supabase
        .from('konten_halaman')
        .update({ 
          konten: misi,
          updated_at: new Date() 
        })
        .eq('nama_halaman', 'misi'); // <-- Kondisi update baru

      if (misiError) throw misiError;

      alert('Visi & Misi berhasil diperbarui!');
      navigate('/admin/dashboard'); // Kembali ke dashboard setelah simpan

    } catch (error) {
      alert('Gagal menyimpan data: ' + error.message);
    } finally {
      setSaving(false);
    }
  };
  
  // --- Styling (Disesuaikan agar lebih rapi) ---
  const formStyle = { display: 'flex', flexDirection: 'column', maxWidth: '800px', margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' };
  const inputGroupStyle = { marginBottom: '20px' };
  const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '1.2em' };
  const textareaStyle = { width: '100%', minHeight: '150px', padding: '10px', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', fontSize: '1em', lineHeight: '1.6' };
  const buttonStyle = { padding: '12px 20px', fontSize: '1em', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px' };

  if (loading) {
    return <p>Memuat editor Visi & Misi...</p>;
  }

  return (
    <div>
      <h2>Edit Visi & Misi</h2>
      <form style={formStyle} onSubmit={handleSubmit}>
        
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="visi">Visi:</label>
          <textarea 
            style={textareaStyle} 
            id="visi"
            value={visi}
            onChange={(e) => setVisi(e.target.value)}
          />
        </div>

        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="misi">Misi:</label>
          <textarea 
            style={textareaStyle} 
            id="misi"
            value={misi}
            onChange={(e) => setMisi(e.target.value)}
          />
          <small>Tips: Gunakan "1." "2." untuk baris baru agar rapi di halaman publik.</small>
        </div>
        
        <button style={buttonStyle} type="submit" disabled={saving}>
          {saving ? 'Menyimpan...' : 'Simpan Perubahan Visi & Misi'}
        </button>
      </form>
    </div>
  );
}

export default EditVisiMisi;