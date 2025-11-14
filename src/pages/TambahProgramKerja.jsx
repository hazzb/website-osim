// src/pages/TambahProgramKerja.jsx
// --- VERSI 2.0 (Triple Cascading Dropdowns) ---

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

function TambahProgramKerja() {
  const navigate = useNavigate();

  // State untuk data form
  const [namaAcara, setNamaAcara] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [status, setStatus] = useState('Rencana'); // Default ke 'Rencana'
  const [deskripsi, setDeskripsi] = useState('');

  // State untuk Dropdown 1: Periode
  const [periodeList, setPeriodeList] = useState([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState('');
  const [loadingPeriode, setLoadingPeriode] = useState(true);

  // State untuk Dropdown 2: Divisi
  const [divisiList, setDivisiList] = useState([]);
  const [selectedDivisiId, setSelectedDivisiId] = useState('');
  const [loadingDivisi, setLoadingDivisi] = useState(false);

  // State untuk Dropdown 3: Penanggung Jawab (PJ)
  const [anggotaList, setAnggotaList] = useState([]);
  const [selectedPjId, setSelectedPjId] = useState('');
  const [loadingAnggota, setLoadingAnggota] = useState(false);

  // State UI
  const [saving, setSaving] = useState(false);

  // --- EFEK 1: Ambil daftar PERIODE saat halaman dimuat ---
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
        
        // Otomatis pilih periode yang 'is_active'
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
  }, []); // [] = Hanya berjalan sekali

  // --- EFEK 2: Ambil daftar DIVISI saat 'selectedPeriodeId' berubah ---
  useEffect(() => {
    // Reset dropdown di bawahnya
    setDivisiList([]);
    setSelectedDivisiId('');
    setAnggotaList([]);
    setSelectedPjId('');

    if (!selectedPeriodeId) return; // Jangan jalankan jika periode kosong

    async function fetchDivisi() {
      setLoadingDivisi(true);
      try {
        const { data, error } = await supabase
          .from('divisi')
          .select('id, nama_divisi')
          .eq('periode_id', selectedPeriodeId) // <-- KUNCI CASCADING 1
          .order('nama_divisi', { ascending: true });
        
        if (error) throw error;
        setDivisiList(data || []);
      } catch (error) {
        alert("Gagal memuat daftar divisi: " + error.message);
      } finally {
        setLoadingDivisi(false);
      }
    }
    fetchDivisi();
  }, [selectedPeriodeId]); // 'Trigger' saat periode berubah

  // --- EFEK 3: Ambil daftar ANGGOTA (PJ) saat 'selectedDivisiId' berubah ---
  useEffect(() => {
    // Reset dropdown di bawahnya
    setAnggotaList([]);
    setSelectedPjId('');

    if (!selectedDivisiId) return; // Jangan jalankan jika divisi kosong

    async function fetchAnggota() {
      setLoadingAnggota(true);
      try {
        const { data, error } = await supabase
          .from('anggota')
          .select('id, nama') // Hanya butuh ID dan Nama
          .eq('divisi_id', selectedDivisiId) // <-- KUNCI CASCADING 2
          .order('nama', { ascending: true });
        
        if (error) throw error;
        setAnggotaList(data || []);
      } catch (error) {
        alert("Gagal memuat daftar anggota (PJ): " + error.message);
      } finally {
        setLoadingAnggota(false);
      }
    }
    fetchAnggota();
  }, [selectedDivisiId]); // 'Trigger' saat divisi berubah

  // --- FUNGSI SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPeriodeId || !selectedDivisiId || !selectedPjId) {
      alert("Harap lengkapi Periode, Divisi, dan Penanggung Jawab.");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('program_kerja')
        .insert([
          { 
            nama_acara: namaAcara,
            tanggal: tanggal,
            status: status,
            deskripsi: deskripsi,
            // --- Kunci Relasi (FK) ---
            periode_id: selectedPeriodeId,
            divisi_id: selectedDivisiId,
            penanggung_jawab_id: selectedPjId
          }
        ]);

      if (error) throw error;
      alert('Program kerja baru berhasil ditambahkan!');
      navigate('/admin/kelola-program-kerja');

    } catch (error) {
      alert(`Gagal menambahkan program kerja: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // --- Styling ---
  const formStyle = { display: 'flex', flexDirection: 'column', maxWidth: '800px', margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' };
  const inputGroupStyle = { marginBottom: '15px' };
  const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold' };
  const inputStyle = { width: '100%', padding: '8px', boxSizing: 'border-box' };
  const selectStyle = { ...inputStyle, padding: '8px', backgroundColor: '#f9f9f9' };
  const textareaStyle = { ...inputStyle, minHeight: '100px' };
  const buttonStyle = { padding: '10px 15px', fontSize: '1em', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer', marginTop: '10px' };

  return (
    <div>
      <h2>Tambah Program Kerja Baru</h2>
      <form style={formStyle} onSubmit={handleSubmit}>

        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          {/* Dropdown 1: Periode */}
          <div style={{ ...inputGroupStyle, flex: 1, minWidth: '200px' }}>
            <label style={labelStyle} htmlFor="periode">1. Periode:</label>
            <select id="periode" style={selectStyle}
              value={selectedPeriodeId}
              onChange={(e) => setSelectedPeriodeId(e.target.value)}
              disabled={loadingPeriode} required
            >
              <option value="" disabled>-- Pilih Periode --</option>
              {periodeList.map(p => <option key={p.id} value={p.id}>{p.tahun_mulai}/{p.tahun_selesai} ({p.nama_kabinet})</option>)}
            </select>
          </div>
          
          {/* Dropdown 2: Divisi */}
          <div style={{ ...inputGroupStyle, flex: 1, minWidth: '200px' }}>
            <label style={labelStyle} htmlFor="divisi">2. Divisi:</label>
            <select id="divisi" style={selectStyle}
              value={selectedDivisiId}
              onChange={(e) => setSelectedDivisiId(e.target.value)}
              disabled={loadingDivisi || divisiList.length === 0} required
            >
              <option value="" disabled>-- Pilih Divisi --</option>
              {divisiList.map(d => <option key={d.id} value={d.id}>{d.nama_divisi}</option>)}
            </select>
          </div>
          
          {/* Dropdown 3: Penanggung Jawab */}
          <div style={{ ...inputGroupStyle, flex: 1, minWidth: '200px' }}>
            <label style={labelStyle} htmlFor="pj">3. Penanggung Jawab (PJ):</label>
            <select id="pj" style={selectStyle}
              value={selectedPjId}
              onChange={(e) => setSelectedPjId(e.target.value)}
              disabled={loadingAnggota || anggotaList.length === 0} required
            >
              <option value="" disabled>-- Pilih PJ --</option>
              {anggotaList.map(a => <option key={a.id} value={a.id}>{a.nama}</option>)}
            </select>
          </div>
        </div>
        
        <hr style={{margin: '10px 0'}} />

        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="namaAcara">Nama Acara:</label>
          <input style={inputStyle} type="text" id="namaAcara"
            value={namaAcara} onChange={(e) => setNamaAcara(e.target.value)} required />
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          {/* Input Tanggal */}
          <div style={{ ...inputGroupStyle, flex: 1 }}>
            <label style={labelStyle} htmlFor="tanggal">Tanggal Pelaksanaan:</label>
            <input style={inputStyle} type="date" id="tanggal"
              value={tanggal} onChange={(e) => setTanggal(e.target.value)} required />
          </div>
          
          {/* Dropdown Status */}
          <div style={{ ...inputGroupStyle, flex: 1 }}>
            <label style={labelStyle} htmlFor="status">Status:</label>
            <select id="status" style={selectStyle}
              value={status} onChange={(e) => setStatus(e.target.value)} required
            >
              <option value="Rencana">Rencana</option>
              <option value="Akan Datang">Akan Datang</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>
        </div>

        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="deskripsi">Deskripsi (Opsional):</label>
          <textarea style={textareaStyle} id="deskripsi"
            value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} />
        </div>
        
        <button style={buttonStyle} type="submit" disabled={saving || loadingPeriode || loadingDivisi || loadingAnggota}>
          {saving ? 'Menyimpan...' : 'Simpan Program Kerja'}
        </button>
      </form>
    </div>
  );
}

export default TambahProgramKerja;