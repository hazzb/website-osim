// src/pages/EditProgramKerja.jsx
// --- VERSI 2.3 (FIXED Logic Loop) ---

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';

function EditProgramKerja() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State untuk data form
  const [namaAcara, setNamaAcara] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [status, setStatus] = useState('Rencana');
  const [deskripsi, setDeskripsi] = useState('');
  
  // Data asli untuk perbandingan
  const [originalProgja, setOriginalProgja] = useState(null);

  // State untuk Dropdown 1: Periode
  const [periodeList, setPeriodeList] = useState([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState('');
  
  // State untuk Dropdown 2: Divisi
  const [divisiList, setDivisiList] = useState([]);
  const [selectedDivisiId, setSelectedDivisiId] = useState('');
  const [loadingDivisi, setLoadingDivisi] = useState(false);

  // State untuk Dropdown 3: Penanggung Jawab (PJ)
  const [anggotaList, setAnggotaList] = useState([]);
  const [selectedPjId, setSelectedPjId] = useState('');
  const [loadingAnggota, setLoadingAnggota] = useState(false);

  // State UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // --- Flag 'isInitialLoad' DIHAPUS ---

  // --- EFEK 1: Ambil data awal (Progja, Periode List) ---
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      try {
        // 1. Ambil data progja
        const { data: progjaData, error: progjaError } = await supabase
          .from('program_kerja')
          .select('*')
          .eq('id', id)
          .single();
        
        if (progjaError) throw progjaError;
        if (!progjaData) {
          alert("Program kerja tidak ditemukan!");
          navigate('/admin/kelola-program-kerja');
          return;
        }

        // 2. Isi form simpel & simpan data asli
        setNamaAcara(progjaData.nama_acara);
        setTanggal(progjaData.tanggal);
        setStatus(progjaData.status);
        setDeskripsi(progjaData.deskripsi || '');
        setOriginalProgja(progjaData); // Simpan data asli
        
        // 3. Ambil daftar periode
        const { data: periodes, error: periodeError } = await supabase
          .from('periode_jabatan')
          .select('id, nama_kabinet, tahun_mulai, tahun_selesai')
          .order('tahun_mulai', { ascending: false });
        
        if (periodeError) throw periodeError;
        setPeriodeList(periodes || []);

        // 4. HANYA set dropdown PERTAMA (Periode)
        // Ini akan memicu EFEK 2
        setSelectedPeriodeId(progjaData.periode_id); 
        
      } catch (error) {
        alert("Gagal memuat data progja: " + error.message);
        setLoading(false);
      }
    }
    
    loadInitialData();
  }, [id, navigate]); // [] = Hanya berjalan sekali

  // --- EFEK 2: Ambil daftar DIVISI (Logika Baru) ---
  useEffect(() => {
    // Jangan jalankan jika periode_id atau data asli belum siap
    if (!selectedPeriodeId || !originalProgja) return;

    async function fetchDivisi() {
      setLoadingDivisi(true);
      try {
        const { data, error } = await supabase
          .from('divisi')
          .select('id, nama_divisi')
          .eq('periode_id', selectedPeriodeId)
          .order('nama_divisi', { ascending: true });
        
        if (error) throw error;
        setDivisiList(data || []);
        
        // --- LOGIKA BARU ---
        // Cek apakah periode yg dipilih = periode asli progja?
        // (Kita gunakan '==' untuk perbandingan longgar tipe data)
        if (selectedPeriodeId == originalProgja.periode_id) {
          // Ya, ini masih bagian dari load awal, JADI SET DIVISI
          // Ini akan memicu EFEK 3
          setSelectedDivisiId(originalProgja.divisi_id);
        } else {
          // Tidak, admin telah mengganti periode, JADI RESET
          setSelectedDivisiId('');
          setAnggotaList([]);
          setSelectedPjId('');
        }
        
      } catch (error) {
        alert("Gagal memuat daftar divisi: " + error.message);
      } finally {
        setLoadingDivisi(false);
      }
    }
    fetchDivisi();
  }, [selectedPeriodeId, originalProgja]); // Hapus 'isInitialLoad'

  // --- EFEK 3: Ambil daftar ANGGOTA (Logika Baru) ---
  useEffect(() => {
    // Jangan jalankan jika divisi_id atau data asli belum siap
    if (!selectedDivisiId || !originalProgja) {
      // Jika divisi kosong, pastikan loading utama selesai
      if (!selectedDivisiId) {
        setLoading(false);
      }
      return;
    }

    async function fetchAnggota() {
      setLoadingAnggota(true);
      try {
        const { data, error } = await supabase
          .from('anggota')
          .select('id, nama')
          .eq('divisi_id', selectedDivisiId)
          .order('nama', { ascending: true });
        
        if (error) throw error;
        setAnggotaList(data || []);
        
        // --- LOGIKA BARU ---
        // Cek apakah divisi yg dipilih = divisi asli progja?
        if (selectedDivisiId == originalProgja.divisi_id) {
          // Ya, ini masih load awal, JADI SET PJ
          setSelectedPjId(originalProgja.penanggung_jawab_id);
        } else {
          // Tidak, admin telah mengganti divisi, JADI RESET
          setSelectedPjId('');
        }
        
      } catch (error) {
        alert("Gagal memuat daftar anggota (PJ): " + error.message);
      } finally {
        setLoadingAnggota(false);
        // Ini adalah akhir dari rantai loading awal
        setLoading(false); 
      }
    }
    fetchAnggota();
  }, [selectedDivisiId, originalProgja]); // Hapus 'isInitialLoad'

  // --- FUNGSI SUBMIT (Tidak berubah) ---
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
        .update({ 
          nama_acara: namaAcara, tanggal: tanggal, status: status,
          deskripsi: deskripsi, periode_id: selectedPeriodeId,
          divisi_id: selectedDivisiId, penanggung_jawab_id: selectedPjId
        })
        .eq('id', id);

      if (error) throw error;
      alert('Program kerja berhasil diperbarui!');
      navigate('/admin/kelola-program-kerja');

    } catch (error) {
      alert(`Gagal memperbarui program kerja: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // --- Styling (Sama) ---
  const formStyle = { display: 'flex', flexDirection: 'column', maxWidth: '800px', margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' };
  const inputGroupStyle = { marginBottom: '15px' };
  const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold' };
  const inputStyle = { width: '100%', padding: '8px', boxSizing: 'border-box' };
  const selectStyle = { ...inputStyle, padding: '8px', backgroundColor: '#f9f9f9' };
  const textareaStyle = { ...inputStyle, minHeight: '100px' };
  const buttonStyle = { padding: '10px 15px', fontSize: '1em', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer', marginTop: '10px' };

  if (loading) {
    return <h2>Memuat editor program kerja...</h2>;
  }

  // --- RETURN JSX (Lengkap) ---
  return (
    <div>
      <h2>Edit Program Kerja</h2>
      <form style={formStyle} onSubmit={handleSubmit}>

        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          {/* Dropdown 1: Periode */}
          <div style={{ ...inputGroupStyle, flex: 1, minWidth: '200px' }}>
            <label style={labelStyle} htmlFor="periode">1. Periode:</label>
            <select id="periode" style={selectStyle}
              value={selectedPeriodeId}
              onChange={(e) => setSelectedPeriodeId(e.target.value)}
              required
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
          <div style={{ ...inputGroupStyle, flex: 1 }}>
            <label style={labelStyle} htmlFor="tanggal">Tanggal Pelaksanaan:</label>
            <input style={inputStyle} type="date" id="tanggal"
              value={tanggal} onChange={(e) => setTanggal(e.target.value)} required />
          </div>
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
        
        <button style={buttonStyle} type="submit" disabled={saving || loading || loadingDivisi || loadingAnggota}>
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </form>
    </div>
  );
}

export default EditProgramKerja;