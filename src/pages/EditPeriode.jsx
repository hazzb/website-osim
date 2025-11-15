// src/pages/EditPeriode.jsx
// --- FILE BARU ---

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';

function EditPeriode() {
  const { id } = useParams(); // Ambil ID periode dari URL
  const navigate = useNavigate();

  // State form
  const [namaKabinet, setNamaKabinet] = useState('');
  const [tahunMulai, setTahunMulai] = useState('');
  const [tahunSelesai, setTahunSelesai] = useState('');
  const [mottoKabinet, setMottoKabinet] = useState('');
  
  // State UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Efek untuk mengambil data periode yang ada
  useEffect(() => {
    async function fetchPeriode() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('periode_jabatan')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        if (data) {
          setNamaKabinet(data.nama_kabinet);
          setTahunMulai(data.tahun_mulai);
          setTahunSelesai(data.tahun_selesai);
          setMottoKabinet(data.motto_kabinet || ''); // Isi motto
        } else {
          alert("Periode tidak ditemukan!");
          navigate('/admin/kelola-periode');
        }
      } catch (error) {
        alert("Gagal memuat data periode: " + error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPeriode();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Hanya update data, JANGAN sentuh 'is_active'
      const { error } = await supabase
        .from('periode_jabatan')
        .update({ 
          nama_kabinet: namaKabinet,
          tahun_mulai: tahunMulai,
          tahun_selesai: tahunSelesai,
          motto_kabinet: mottoKabinet // <-- Update motto
        })
        .eq('id', id);

      if (error) throw error;
      alert('Periode berhasil diperbarui!');
      navigate('/admin/kelola-periode');
    } catch (error) {
      alert(`Gagal memperbarui periode: ${error.message}`);
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
  const textareaStyle = { ...inputStyle, minHeight: '100px', fontFamily: 'Arial, sans-serif' };

  if (loading) {
    return <h2>Memuat data periode...</h2>;
  }

  return (
    <div>
      <h2>Edit Periode</h2>
      <form style={formStyle} onSubmit={handleSubmit}>
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="namaKabinet">Nama Kabinet:</label>
          <input style={inputStyle} type="text" id="namaKabinet"
            value={namaKabinet} onChange={(e) => setNamaKabinet(e.target.value)} required />
        </div>
        
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="mottoKabinet">Motto Kabinet (Opsional):</label>
          <textarea style={textareaStyle} id="mottoKabinet"
            value={mottoKabinet} onChange={(e) => setMottoKabinet(e.target.value)} />
          <small>Anda bisa menggunakan Markdown untuk format (cth: `**Tebal**` atau `*Miring*`).</small>
        </div>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ ...inputGroupStyle, flex: 1 }}>
            <label style={labelStyle} htmlFor="tahunMulai">Tahun Mulai:</label>
            <input style={inputStyle} type="number" id="tahunMulai"
              value={tahunMulai} onChange={(e) => setTahunMulai(e.target.value)} required />
          </div>
          <div style={{ ...inputGroupStyle, flex: 1 }}>
            <label style={labelStyle} htmlFor="tahunSelesai">Tahun Selesai:</label>
            <input style={inputStyle} type="number" id="tahunSelesai"
              value={tahunSelesai} onChange={(e) => setTahunSelesai(e.target.value)} required />
          </div>
        </div>
        
        <p style={{fontStyle: 'italic', color: '#555'}}>Status 'Aktif' hanya bisa diubah melalui tombol "Jadikan Aktif" di halaman utama "Kelola Periode".</p>
        
        <button style={buttonStyle} type="submit" disabled={saving}>
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </form>
    </div>
  );
}

export default EditPeriode;