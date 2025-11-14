// src/pages/EditDivisi.jsx
// --- FILE BARU ---

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';

function EditDivisi() {
  const { id } = useParams(); // Ambil ID dari URL
  const navigate = useNavigate();

  // State untuk form
  const [namaDivisi, setNamaDivisi] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [urutan, setUrutan] = useState(10);
  
  // State untuk info (tidak bisa diedit)
  const [namaKabinet, setNamaKabinet] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchDivisi() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('divisi')
          .select(`
            *,
            periode_jabatan ( nama_kabinet ) 
          `) // Ambil data divisi & nama kabinet terkait
          .eq('id', id)
          .single();
          
        if (error) throw error;
        if (data) {
          setNamaDivisi(data.nama_divisi);
          setDeskripsi(data.deskripsi || '');
          setUrutan(data.urutan || 10);
          setNamaKabinet(data.periode_jabatan.nama_kabinet || 'Periode Tidak Dikenal');
        } else {
          alert("Divisi tidak ditemukan!");
          navigate('/admin/kelola-divisi');
        }
      } catch (error) {
        alert("Gagal memuat data divisi: " + error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDivisi();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('divisi')
        .update({ 
          nama_divisi: namaDivisi,
          deskripsi: deskripsi,
          urutan: urutan 
        })
        .eq('id', id); // UPDATE data berdasarkan ID

      if (error) throw error;
      alert('Divisi berhasil diperbarui!');
      navigate('/admin/kelola-divisi');
    } catch (error) {
      alert(`Gagal memperbarui divisi: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // --- Styling ---
  const formStyle = { display: 'flex', flexDirection: 'column', maxWidth: '500px', margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' };
  const inputGroupStyle = { marginBottom: '15px' };
  const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold' };
  const inputStyle = { width: '100%', padding: '8px', boxSizing: 'border-box' };
  const buttonStyle = { padding: '10px 15px', fontSize: '1em', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' };
  const infoBoxStyle = { ...inputGroupStyle, padding: '10px', backgroundColor: '#f4f4f4', borderRadius: '5px' };

  if (loading) {
    return <h2>Memuat data divisi...</h2>;
  }

  return (
    <div>
      <h2>Edit Divisi</h2>
      <form style={formStyle} onSubmit={handleSubmit}>
        
        <div style={infoBoxStyle}>
          <label style={labelStyle}>Periode:</label>
          <strong>{namaKabinet}</strong>
          <small> (Periode tidak dapat diubah setelah divisi dibuat.)</small>
        </div>

        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="namaDivisi">Nama Divisi:</label>
          <input style={inputStyle} type="text" id="namaDivisi"
            value={namaDivisi} onChange={(e) => setNamaDivisi(e.target.value)} required />
        </div>
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="deskripsi">Deskripsi (Opsional):</label>
          <input style={inputStyle} type="text" id="deskripsi"
            value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} />
        </div>
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="urutan">Urutan Tampil:</label>
          <input style={inputStyle} type="number" id="urutan"
            value={urutan} onChange={(e) => setUrutan(parseInt(e.target.value) || 10)} />
          <small>Angka kecil tampil lebih dulu. (Contoh: PI = 1, Pembina = 2, Divisi biasa = 10).</small>
        </div>
        
        <button style={buttonStyle} type="submit" disabled={saving}>
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </form>
    </div>
  );
}

export default EditDivisi;