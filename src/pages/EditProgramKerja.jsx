// src/pages/EditProgramKerja.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';

function EditProgramKerja() {
  const { id } = useParams(); 
  const navigate = useNavigate();

  // State Form
  const [tanggal, setTanggal] = useState('');
  const [namaAcara, setNamaAcara] = useState('');
  const [divisi, setDivisi] = useState('');
  const [penanggungJawab, setPenanggungJawab] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [linkDokumentasi, setLinkDokumentasi] = useState('');
  const [status, setStatus] = useState('');
  
  // --- INI PERBAIKANNYA ---
  // 'loading' (untuk tombol submit) harus dimulai sebagai 'false'
  const [loading, setLoading] = useState(false); 
  // 'pageLoading' (untuk mengambil data) dimulai sebagai 'true'
  const [pageLoading, setPageLoading] = useState(true);
  // -------------------------

  // useEffect untuk MENGAMBIL (FETCH) data
  useEffect(() => {
    async function getProgramById() {
      setPageLoading(true); // Mulai loading halaman
      try {
        const { data, error } = await supabase
          .from('program_kerja')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          setTanggal(data.tanggal);
          setNamaAcara(data.nama_acara);
          setDivisi(data.divisi || '');
          setPenanggungJawab(data.penanggung_jawab || '');
          setDeskripsi(data.deskripsi || '');
          setLinkDokumentasi(data.link_dokumentasi || '');
          setStatus(data.status); 
        }
      } catch (error) {
        alert(`Gagal mengambil data program kerja: ${error.message}`);
      } finally {
        setPageLoading(false); // Selesai loading halaman
      }
    }
    
    getProgramById();
  }, [id]); 

  // handleSubmit untuk MENG-UPDATE data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // <-- Tombol menjadi 'Menyimpan...'

    try {
      const { error } = await supabase
        .from('program_kerja')
        .update({ 
          tanggal: tanggal, 
          nama_acara: namaAcara, 
          divisi: divisi,
          penanggung_jawab: penanggungJawab,
          deskripsi: deskripsi,
          link_dokumentasi: linkDokumentasi,
          status: status
        })
        .eq('id', id);

      if (error) throw error;
      alert('Program kerja berhasil diperbarui!');
      navigate('/admin/kelola-program-kerja');

    } catch (error) {
      alert(`Gagal memperbarui program kerja: ${error.message}`);
    } finally {
      setLoading(false); // <-- Tombol kembali normal (INI KUNCINYA)
    }
  };

  // --- Styling (Tidak ada perubahan) ---
  const formStyle = { display: 'flex', flexDirection: 'column', maxWidth: '500px', margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' };
  const inputGroupStyle = { marginBottom: '15px' };
  const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold' };
  const inputStyle = { width: '100%', padding: '8px', boxSizing: 'border-box' };
  const textareaStyle = { ...inputStyle, height: '100px' };
  const buttonStyle = { padding: '10px 15px', fontSize: '1em', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' };
  
  if (pageLoading) { 
    return <p>Memuat data program kerja untuk diedit...</p>;
  }

  return (
    <div>
      <h2>Edit Program Kerja</h2>
      <form style={formStyle} onSubmit={handleSubmit}>
        
        {/* ... (semua field form Anda) ... */}
        
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="tanggal">Tanggal Acara:</label>
          <input style={inputStyle} type="date" id="tanggal"
            value={tanggal} onChange={(e) => setTanggal(e.target.value)} required />
        </div>
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="namaAcara">Nama Acara:</label>
          <input style={inputStyle} type="text" id="namaAcara"
            value={namaAcara} onChange={(e) => setNamaAcara(e.target.value)} required />
        </div>
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="status">Status Program:</label>
          <select style={inputStyle} id="status" value={status}
            onChange={(e) => setStatus(e.target.value)} required >
            <option value="Rencana">Rencana (Masih Ide)</option>
            <option value="Akan Datang">Akan Datang (Sudah Fix)</option>
            <option value="Selesai">Selesai (Sudah Berlangsung)</option>
          </select>
        </div>
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="divisi">Divisi:</label>
          <input style={inputStyle} type="text" id="divisi"
            value={divisi} onChange={(e) => setDivisi(e.target.value)} />
        </div>
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="penanggungJawab">Penanggung Jawab:</label>
          <input style={inputStyle} type="text" id="penanggungJawab"
            value={penanggungJawab} onChange={(e) => setPenanggungJawab(e.target.value)} />
        </div>
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="deskripsi">Deskripsi Singkat:</label>
          <textarea style={textareaStyle} id="deskripsi"
            value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} />
        </div>
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="linkDokumentasi">Link Dokumentasi:</label>
          <input style={inputStyle} type="text" id="linkDokumentasi"
            value={linkDokumentasi} onChange={(e) => setLinkDokumentasi(e.target.value)} />
        </div>
        
        <button style={buttonStyle} type="submit" disabled={loading}>
          {/* Sekarang 'loading' akan 'false' saat load, dan tombol bisa diklik */}
          {loading ? 'Menyimpan...' : 'Perbarui Program Kerja'}
        </button>
      </form>
    </div>
  );
}

export default EditProgramKerja;