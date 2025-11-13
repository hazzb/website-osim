// src/pages/EditAnggota.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useParams } from 'react-router-dom'; 

function EditAnggota() {
  const { id } = useParams(); // Ambil ID anggota dari URL
  const navigate = useNavigate();

  // --- State untuk Form ---
  const [nama, setNama] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [motto, setMotto] = useState('');
  const [instagram, setInstagram] = useState('');
  
  // --- State ganda: untuk daftar periode DAN untuk data anggota ---
  const [periode, setPeriode] = useState(''); // Akan menyimpan ID periode anggota
  const [periodeList, setPeriodeList] = useState([]); // Akan menyimpan daftar periode
  
  // --- State Loading Ganda ---
  // loading: untuk submit form
  // pageLoading: untuk mengambil data awal (anggota + daftar periode)
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // --- useEffect BARU: Mengambil SEMUA data yang dibutuhkan halaman ---
  useEffect(() => {
    async function loadPageData() {
      setPageLoading(true);
      try {
        // FETCH 1: Ambil daftar periode (untuk mengisi dropdown)
        const { data: periodesData, error: periodesError } = await supabase
          .from('periode_jabatan')
          .select('id, tahun_mulai, tahun_selesai, nama_kabinet')
          .order('tahun_mulai', { ascending: false });

        if (periodesError) throw periodesError;
        setPeriodeList(periodesData || []);

        // FETCH 2: Ambil data anggota yang spesifik (untuk mengisi form)
        const { data: anggotaData, error: anggotaError } = await supabase
          .from('anggota')
          .select('*') // Ambil semua, termasuk 'periode_id'
          .eq('id', id)
          .single(); 

        if (anggotaError) throw anggotaError;

        // Isi 'state' form dengan data anggota yang didapat
        if (anggotaData) {
          setNama(anggotaData.nama);
          setJabatan(anggotaData.jabatan);
          setFotoUrl(anggotaData.foto_url || ''); 
          setMotto(anggotaData.motto || '');
          setInstagram(anggotaData.instagram_username || '');
          
          // INI KUNCINYA:
          // Set 'periode' (state) ke 'periode_id' (dari data anggota)
          // Ini akan otomatis memilih dropdown yang benar
          setPeriode(anggotaData.periode_id); 
        }
      } catch (error) {
        alert(`Gagal mengambil data: ${error.message}`);
      } finally {
        setPageLoading(false);
      }
    }
    
    loadPageData();
  }, [id]); // <-- Bergantung pada 'id' dari URL

  // --- handleSubmit diperbarui untuk 'periode_id' ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('anggota')
        .update({ 
          nama: nama, 
          jabatan: jabatan, 
          periode_id: parseInt(periode), // <-- Kolom database baru kita
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

  // --- STYLING LENGKAP (Sudah termasuk) ---
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
  const buttonStyle = {
    padding: '10px 15px',
    fontSize: '1em',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    cursor: 'pointer'
  };
  
  // Tampilkan satu loading screen untuk semua
  if (pageLoading) { 
    return <p>Memuat data editor anggota...</p>;
  }

  return (
    <div>
      <h2>Edit Anggota OSIM</h2>
      <form style={formStyle} onSubmit={handleSubmit}>
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="nama">Nama Lengkap:</label>
          <input style={inputStyle} type="text" id="nama" value={nama}
            onChange={(e) => setNama(e.target.value)} required />
        </div>
        
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="jabatan">Jabatan:</label>
          <input style={inputStyle} type="text" id="jabatan" value={jabatan}
            onChange={(e) => setJabatan(e.target.value)} required />
        </div>

        {/* --- FIELD PERIODE (DROPDOWN) --- */}
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="periode">Periode Jabatan:</label>
          <select
            style={inputStyle}
            id="periode"
            value={periode} // 'value' ini akan diisi oleh data anggota
            onChange={(e) => setPeriode(e.target.value)}
            required
          >
            <option value="" disabled>-- Pilih Periode --</option>
            {periodeList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.tahun_mulai}/{p.tahun_selesai} 
                {p.nama_kabinet ? ` (${p.nama_kabinet})` : ''}
              </option>
            ))}
          </select>
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