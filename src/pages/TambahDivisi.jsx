// src/pages/TambahDivisi.jsx
// --- VERSI 2.0 (dengan field 'urutan') ---

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

function TambahDivisi() {
  const [namaDivisi, setNamaDivisi] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [selectedPeriodeId, setSelectedPeriodeId] = useState('');
  const [periodeList, setPeriodeList] = useState([]);
  
  // --- STATE BARU ---
  const [urutan, setUrutan] = useState(10); // Default 10 (divisi biasa)
  
  const [loadingPeriode, setLoadingPeriode] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPeriode() {
      setLoadingPeriode(true);
      try {
        const { data, error } = await supabase
          .from('periode_jabatan')
          .select('id, nama_kabinet, tahun_mulai, tahun_selesai, is_active')
          .order('tahun_mulai', { ascending: false });
        
        if (error) throw error;
        setPeriodeList(data || []);
        
        const activePeriode = data.find(p => p.is_active);
        if (activePeriode) {
          setSelectedPeriodeId(activePeriode.id);
        } else if (data.length > 0) {
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
      alert("Harap pilih periode.");
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
            periode_id: selectedPeriodeId,
            urutan: urutan // <-- TAMBAHKAN 'urutan'
          }
        ]);
      if (error) throw error;
      alert('Divisi baru berhasil ditambahkan!');
      navigate('/admin/kelola-divisi');
    } catch (error) {
      alert(`Gagal menambahkan divisi: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // --- Styling ---
  const formStyle = { display: 'flex', flexDirection: 'column', maxWidth: '500px', margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' };
  const inputGroupStyle = { marginBottom: '15px' };
  const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold' };
  const inputStyle = { width: '100%', padding: '8px', boxSizing: 'border-box' };
  const selectStyle = { ...inputStyle, padding: '8px' };
  const buttonStyle = { padding: '10px 15px', fontSize: '1em', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' };

  return (
    <div>
      <h2>Tambah Divisi Baru</h2>
      <form style={formStyle} onSubmit={handleSubmit}>
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="periode">Tautkan ke Periode:</label>
          {loadingPeriode ? <p>Memuat...</p> : (
            <select id="periode" style={selectStyle}
              value={selectedPeriodeId}
              onChange={(e) => setSelectedPeriodeId(e.target.value)} required >
              {periodeList.map(p => (
                <option key={p.id} value={p.id}>
                  {p.tahun_mulai}/{p.tahun_selesai} ({p.nama_kabinet || 'Tanpa Nama'})
                </option>
              ))}
            </select>
          )}
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
        
        {/* --- INPUT BARU --- */}
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="urutan">Urutan Tampil:</label>
          <input style={inputStyle} type="number" id="urutan"
            value={urutan} onChange={(e) => setUrutan(parseInt(e.target.value) || 10)} />
          <small>Angka kecil tampil lebih dulu. (Contoh: PI = 1, Pembina = 2, Divisi biasa = 10).</small>
        </div>
        
        <button style={buttonStyle} type="submit" disabled={saving || loadingPeriode}>
          {saving ? 'Menyimpan...' : 'Simpan Divisi'}
        </button>
      </form>
    </div>
  );
}

export default TambahDivisi;