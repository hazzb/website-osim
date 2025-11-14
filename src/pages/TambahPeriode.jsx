// src/pages/TambahPeriode.jsx
// --- VERSI 3.0 (Default Salin Divisi dengan Checkbox) ---

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

function TambahPeriode() {
  // State untuk form
  const [tahunMulai, setTahunMulai] = useState(new Date().getFullYear());
  const [tahunSelesai, setTahunSelesai] = useState(new Date().getFullYear() + 1);
  const [namaKabinet, setNamaKabinet] = useState('');
  
  // --- PERUBAHAN: State untuk Fitur "Salin Divisi" ---
  const [salinDivisi, setSalinDivisi] = useState(true); // Checkbox tercentang default
  const [templatePeriodeId, setTemplatePeriodeId] = useState(''); // ID periode terakhir
  const [templatePeriodeName, setTemplatePeriodeName] = useState(''); // Nama periode terakhir
  const [loadingPeriode, setLoadingPeriode] = useState(true);
  // --------------------------------------------------
  
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // Ambil periode terakhir (hanya 1) untuk dijadikan template default
  useEffect(() => {
    async function fetchPeriodeTemplate() {
      setLoadingPeriode(true);
      try {
        const { data, error } = await supabase
          .from('periode_jabatan')
          .select('id, nama_kabinet, tahun_mulai, tahun_selesai')
          .order('tahun_mulai', { ascending: false })
          .limit(1); // <-- Hanya ambil 1 yang terbaru
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const p = data[0];
          setTemplatePeriodeId(p.id); // Simpan ID-nya
          // Simpan namanya untuk label
          setTemplatePeriodeName(`${p.tahun_mulai}/${p.tahun_selesai} (${p.nama_kabinet || 'Tanpa Nama'})`);
        } else {
          // Jika tidak ada periode sama sekali, matikan checkbox
          setSalinDivisi(false);
        }
      } catch (error) {
        alert("Gagal memuat periode template: " + error.message);
        setSalinDivisi(false); // Matikan jika error
      } finally {
        setLoadingPeriode(false);
      }
    }
    fetchPeriodeTemplate();
  }, []); // [] = Hanya berjalan sekali

  // --- FUNGSI SUBMIT (Logikanya hampir sama) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    let newPeriodeId = null;

    try {
      // LANGKAH 1: Buat Periode Baru
      const { data: newPeriode, error: periodeError } = await supabase
        .from('periode_jabatan')
        .insert([{ 
          tahun_mulai: tahunMulai, 
          tahun_selesai: tahunSelesai, 
          nama_kabinet: namaKabinet 
        }])
        .select('id')
        .single();

      if (periodeError) throw periodeError;
      newPeriodeId = newPeriode.id;

      // LANGKAH 2: Cek apakah Checkbox "Salin Divisi" tercentang
      if (salinDivisi && templatePeriodeId) {
        // Ambil semua divisi dari periode template
        const { data: templateDivisi, error: divisiError } = await supabase
          .from('divisi')
          .select('nama_divisi, deskripsi')
          .eq('periode_id', templatePeriodeId);
        
        if (divisiError) throw divisiError;

        if (templateDivisi && templateDivisi.length > 0) {
          // Buat array baru, ganti 'periode_id' dengan ID periode baru kita
          const divisiBaru = templateDivisi.map(divisi => ({
            ...divisi,
            periode_id: newPeriodeId // Tautkan ke periode baru
          }));

          // Masukkan semua divisi baru
          const { error: insertDivisiError } = await supabase
            .from('divisi')
            .insert(divisiBaru);
          
          if (insertDivisiError) throw insertDivisiError;
        }
      }

      alert('Periode baru berhasil ditambahkan!');
      navigate('/admin/kelola-periode');

    } catch (error) {
      alert(`Gagal menambahkan periode: ${error.message}`);
      if (newPeriodeId) {
        // Bersihkan periode yang gagal dibuat
        await supabase.from('periode_jabatan').delete().eq('id', newPeriodeId);
      }
    } finally {
      setSaving(false);
    }
  };

  // --- Styling ---
  const formStyle = { display: 'flex', flexDirection: 'column', maxWidth: '500px', margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' };
  const inputGroupStyle = { marginBottom: '15px' };
  const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold' };
  const inputStyle = { width: '100%', padding: '8px', boxSizing: 'border-box' };
  const buttonStyle = { padding: '10px 15px', fontSize: '1em', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer', marginTop: '10px' };
  const templateGroupStyle = { ...inputGroupStyle, marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed #ccc', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '5px' };
  const checkboxLabelStyle = { display: 'flex', alignItems: 'center', fontSize: '1.1em', cursor: 'pointer' };
  const checkboxStyle = { marginRight: '10px', width: '18px', height: '18px' };

  return (
    <div>
      <h2>Tambah Periode Jabatan Baru</h2>
      <form style={formStyle} onSubmit={handleSubmit}>
        
        {/* ... (Input Tahun Mulai, Selesai, Nama Kabinet - tidak berubah) ... */}
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="tahunMulai">Tahun Mulai:</label>
          <input style={inputStyle} type="number" id="tahunMulai"
            value={tahunMulai} 
            onChange={(e) => setTahunMulai(e.target.value)} required />
        </div>
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="tahunSelesai">Tahun Selesai:</label>
          <input style={inputStyle} type="number" id="tahunSelesai"
            value={tahunSelesai} 
            onChange={(e) => setTahunSelesai(e.target.value)} required />
        </div>
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="namaKabinet">Nama Kabinet:</label>
          <input style={inputStyle} type="text" id="namaKabinet"
            placeholder="Contoh: Kabinet Perintis"
            value={namaKabinet} 
            onChange={(e) => setNamaKabinet(e.target.value)} />
        </div>
        
        {/* --- INI UI BARUNYA (CHECKBOX) --- */}
        <div style={templateGroupStyle}>
          {loadingPeriode ? (
            <p>Memeriksa periode template...</p>
          ) : templatePeriodeId ? (
            <label style={checkboxLabelStyle}>
              <input 
                type="checkbox" 
                style={checkboxStyle}
                checked={salinDivisi}
                onChange={(e) => setSalinDivisi(e.target.checked)}
              />
              Salin struktur divisi dari periode terakhir
              <br/>
              <small style={{ marginLeft: '28px', color: '#555', fontWeight: 'normal' }}>
                (Template: {templatePeriodeName})
              </small>
            </label>
          ) : (
            <p style={{color: '#777'}}>Tidak ada periode sebelumnya untuk disalin.</p>
          )}
        </div>
        
        <button style={buttonStyle} type="submit" disabled={saving || loadingPeriode}>
          {saving ? 'Menyimpan...' : 'Simpan Periode Baru'}
        </button>
      </form>
    </div>
  );
}

export default TambahPeriode;