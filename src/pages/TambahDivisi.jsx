// src/pages/TambahDivisi.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

function TambahDivisi() {
  const [namaDivisi, setNamaDivisi] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [selectedPeriodeId, setSelectedPeriodeId] = useState(''); // ID periode tujuan
  
  const [periodeList, setPeriodeList] = useState([]); // Untuk dropdown
  const [loadingPeriode, setLoadingPeriode] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // Ambil daftar periode untuk ditampilkan di dropdown
  useEffect(() => {
    async function fetchPeriode() {
      setLoadingPeriode(true);
      try {
        const { data, error } = await supabase
          .from('periode_jabatan')
          .select('id, nama_kabinet, tahun_mulai, tahun_selesai')
          .order('tahun_mulai', { ascending: false });
        
        if (error) throw error;
        setPeriodeList(data || []);
        
        // Otomatis pilih periode pertama (terbaru)
        if (data && data.length > 0) {
          setSelectedPeriodeId(data[0].id);
        }
      } catch (error) {
        alert("Gagal memuat daftar periode: " + error.message);
      } finally {
        setLoadingPeriode(false);
      }
    }
    fetchPeriode();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPeriodeId) {
      alert("Silakan pilih periode jabatan terlebih dahulu.");
      return;
    }
    setSaving(true);

    try {
      const { error } = await supabase
        .from('divisi')
        .insert([
          { 
            nama_divisi: namaDivisi, 
            deskripsi: deskripsi,
            periode_id: selectedPeriodeId // <-- KUNCI RELASI
          }
        ]);

      if (error) throw error;
      alert('Divisi baru berhasil ditambahkan!');
      navigate('/admin/kelola-divisi'); // Arahkan kembali ke tabel

    } catch (error) {
      alert(`Gagal menambahkan divisi: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // --- Styling (Sederhana) ---
  const formStyle = { display: 'flex', flexDirection: 'column', maxWidth: '500px', margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' };
  const inputGroupStyle = { marginBottom: '15px' };
  const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold' };
  const inputStyle = { width: '100%', padding: '8px', boxSizing: 'border-box' };
  const selectStyle = { ...inputStyle, padding: '8px' };
  const textareaStyle = { ...inputStyle, minHeight: '100px' };
  const buttonStyle = { padding: '10px 15px', fontSize: '1em', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' };

  return (
    <div>
      <h2>Tambah Divisi Baru</h2>
      <form style={formStyle} onSubmit={handleSubmit}>
        
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="periode">Pilih Periode:</label>
          {loadingPeriode ? (
            <p>Memuat periode...</p>
          ) : (
            <select 
              id="periode" 
              style={selectStyle}
              value={selectedPeriodeId}
              onChange={(e) => setSelectedPeriodeId(e.target.value)}
              required
            >
              <option value="" disabled>-- Pilih Periode --</option>
              {periodeList.map(periode => (
                <option key={periode.id} value={periode.id}>
                  {periode.tahun_mulai}/{periode.tahun_selesai} ({periode.nama_kabinet || 'Tanpa Nama'})
                </option>
              ))}
            </select>
          )}
        </div>
        
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="namaDivisi">Nama Divisi:</label>
          <input style={inputStyle} type="text" id="namaDivisi"
            placeholder="Contoh: Pengurus Inti"
            value={namaDivisi} 
            onChange={(e) => setNamaDivisi(e.target.value)} required />
        </div>
        
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="deskripsi">Deskripsi (Opsional):</label>
          <textarea style={textareaStyle} id="deskripsi"
            value={deskripsi} 
            onChange={(e) => setDeskripsi(e.target.value)} />
        </div>
        
        <button style={buttonStyle} type="submit" disabled={saving || loadingPeriode}>
          {saving ? 'Menyimpan...' : 'Simpan Divisi'}
        </button>
      </form>
    </div>
  );
}

export default TambahDivisi;