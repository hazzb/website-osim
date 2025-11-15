// src/pages/EditProgramKerja.jsx
// --- VERSI 2.7 (Menggunakan Embed HTML) ---

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';

function EditProgramKerja() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State form
  const [namaAcara, setNamaAcara] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [status, setStatus] = useState('Rencana');
  const [deskripsi, setDeskripsi] = useState('');
  const [linkDokumentasi, setLinkDokumentasi] = useState('');
  // --- STATE DIMODIFIKASI ---
  const [embedHtml, setEmbedHtml] = useState(''); // Menggantikan linkInstagram

  // ... (State Dropdown & UI - tidak berubah) ...
  const [periodeList, setPeriodeList] = useState([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState('');
  const [divisiList, setDivisiList] = useState([]);
  const [selectedDivisiId, setSelectedDivisiId] = useState('');
  const [anggotaList, setAnggotaList] = useState([]);
  const [selectedPjId, setSelectedPjId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [initialPjId, setInitialPjId] = useState(null);
  const divisiUmum = { id: 'null', nama_divisi: 'Umum (Semua Divisi)' };

  // --- EFEK 1 (DIMODIFIKASI) ---
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true); setLoadingDropdowns(true);
      let progjaData;
      try {
        const { data, error } = await supabase.from('program_kerja').select('*').eq('id', id).single();
        if (error) throw error;
        progjaData = data;
        
        // Isi state form
        setNamaAcara(progjaData.nama_acara);
        setTanggal(progjaData.tanggal);
        setStatus(progjaData.status);
        setDeskripsi(progjaData.deskripsi || '');
        setLinkDokumentasi(progjaData.link_dokumentasi || '');
        setEmbedHtml(progjaData.embed_html || ''); // <-- ISI DATA
        setSelectedPeriodeId(progjaData.periode_id);
        setSelectedDivisiId(progjaData.divisi_id === null ? 'null' : progjaData.divisi_id);
        setSelectedPjId(progjaData.penanggung_jawab_id);
        setInitialPjId(progjaData.penanggung_jawab_id);
        setLoading(false);

        // Ambil data dropdown
        const fetchPeriode = supabase.from('periode_jabatan').select('id, nama_kabinet, tahun_mulai, tahun_selesai');
        const fetchDivisi = supabase.from('divisi').select('id, nama_divisi').eq('periode_id', progjaData.periode_id).order('urutan', { ascending: true });
        const [periodeRes, divisiRes] = await Promise.all([fetchPeriode, fetchDivisi]);
        if (periodeRes.error) throw periodeRes.error;
        if (divisiRes.error) throw divisiRes.error;
        setPeriodeList(periodeRes.data || []);
        setDivisiList([divisiUmum, ...(divisiRes.data || [])]);
      } catch (error) {
        alert("Gagal memuat data: " + error.message);
        setLoading(false);
      } finally {
        setLoadingDropdowns(false);
      }
    }
    loadInitialData();
  }, [id]);

  // --- (Efek 2 & 3 - tidak berubah dari v2.6 sebelumnya) ---
  useEffect(() => {
    if (loadingDropdowns) return;
    if (selectedPeriodeId) {
      async function fetchDivisi() {
        setDivisiList([]); setSelectedDivisiId(''); setAnggotaList([]); setSelectedPjId('');
        try {
          const { data, error } = await supabase.from('divisi').select('id, nama_divisi').eq('periode_id', selectedPeriodeId).order('urutan', { ascending: true });
          if (error) throw error;
          setDivisiList([divisiUmum, ...(data || [])]);
        } catch (error) { alert("Gagal memuat daftar divisi: " + error.message); }
      }
    }
  }, [selectedPeriodeId, loadingDropdowns]);
  useEffect(() => {
    if (loadingDropdowns || !selectedDivisiId || divisiList.length === 0) return;
    async function fetchAnggota() {
      setAnggotaList([]);
      try {
        let query = supabase.from('anggota').select('id, nama');
        if (selectedDivisiId === 'null') {
          query = query.eq('periode_id', selectedPeriodeId);
        } else {
          query = query.eq('divisi_id', selectedDivisiId);
        }
        const { data, error } = await query.order('nama', { ascending: true });
        if (error) throw error;
        setAnggotaList(data || []);
        const pjMasihValid = data.some(a => a.id == initialPjId);
        if (pjMasihValid) {
          setSelectedPjId(initialPjId);
        } else {
          setSelectedPjId('');
        }
      } catch (error) { alert("Gagal memuat daftar anggota (PJ): " + error.message); }
    }
    fetchAnggota();
  }, [selectedDivisiId, divisiList, loadingDropdowns, selectedPeriodeId, initialPjId]);

  // --- FUNGSI SUBMIT (DIMODIFIKASI) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const finalDivisiId = selectedDivisiId === 'null' ? null : selectedDivisiId;
    try {
      const { error } = await supabase
        .from('program_kerja')
        .update({ 
            nama_acara: namaAcara, tanggal: tanggal, status: status,
            deskripsi: deskripsi,
            link_dokumentasi: linkDokumentasi,
            embed_html: embedHtml, // <-- UPDATE DATA BARU
            periode_id: selectedPeriodeId,
            divisi_id: finalDivisiId,
            penanggung_jawab_id: selectedPjId
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

  // --- Styling ---
  const formStyle = { display: 'flex', flexDirection: 'column', maxWidth: '800px', margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' };
  const inputGroupStyle = { marginBottom: '15px' };
  const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold' };
  const inputStyle = { width: '100%', padding: '8px', boxSizing: 'border-box' };
  const selectStyle = { ...inputStyle, padding: '8px', backgroundColor: '#f9f9f9' };
  const textareaStyle = { ...inputStyle, minHeight: '100px', fontFamily: 'Arial' };
  const buttonStyle = { padding: '10px 15px', fontSize: '1em', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer', marginTop: '10px' };

  if (loading) {
    return <h2>Memuat data program kerja...</h2>;
  }
  const isProcessing = saving || loadingDropdowns;

  return (
    <div>
      <h2>Edit Program Kerja</h2>
      <form style={formStyle} onSubmit={handleSubmit}>
        {/* ... (Dropdowns, Nama, Tanggal, Status, Deskripsi - tidak berubah) ... */}
        <div style={inputGroupStyle}><label style={labelStyle} htmlFor="periode">1. Periode (Terkunci):</label><select id="periode" style={{...selectStyle, backgroundColor: '#eee'}} value={selectedPeriodeId} disabled required><option value="" disabled>-- Pilih Periode --</option>{periodeList.map(p => <option key={p.id} value={p.id}>{p.tahun_mulai}/{p.tahun_selesai} ({p.nama_kabinet})</option>)}</select></div>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <div style={{ ...inputGroupStyle, flex: 1, minWidth: '200px' }}><label style={labelStyle} htmlFor="divisi">2. Divisi:</label><select id="divisi" style={selectStyle} value={selectedDivisiId} onChange={(e) => setSelectedDivisiId(e.target.value)} disabled={isProcessing} required><option value="" disabled>-- Pilih Divisi --</option>{divisiList.map(d => <option key={d.id} value={d.id}>{d.nama_divisi}</option>)}</select></div>
          <div style={{ ...inputGroupStyle, flex: 1, minWidth: '200px' }}><label style={labelStyle} htmlFor="pj">3. Penanggung Jawab (PJ):</label><select id="pj" style={selectStyle} value={selectedPjId} onChange={(e) => setSelectedPjId(e.target.value)} disabled={isProcessing || anggotaList.length === 0} required><option value="" disabled>-- Pilih PJ --</option>{anggotaList.map(a => <option key={a.id} value={a.id}>{a.nama}</option>)}</select></div>
        </div>
        <hr style={{margin: '10px 0'}} />
        <div style={inputGroupStyle}><label style={labelStyle} htmlFor="namaAcara">Nama Acara:</label><input style={inputStyle} type="text" id="namaAcara" value={namaAcara} onChange={(e) => setNamaAcara(e.target.value)} required /></div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ ...inputGroupStyle, flex: 1 }}><label style={labelStyle} htmlFor="tanggal">Tanggal Pelaksanaan:</label><input style={inputStyle} type="date" id="tanggal" value={tanggal} onChange={(e) => setTanggal(e.target.value)} required /></div>
          <div style={{ ...inputGroupStyle, flex: 1 }}><label style={labelStyle} htmlFor="status">Status:</label><select id="status" style={selectStyle} value={status} onChange={(e) => setStatus(e.target.value)} required><option value="Rencana">Rencana</option><option value="Akan Datang">Akan Datang</option><option value="Selesai">Selesai</option></select></div>
        </div>
        <div style={inputGroupStyle}><label style={labelStyle} htmlFor="deskripsi">Deskripsi (Opsional):</label><textarea style={textareaStyle} id="deskripsi" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} /></div>
        
        {/* --- FIELD LINK DIMODIFIKASI --- */}
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="linkDokumentasi">Link Dokumentasi (Opsional):</label>
          <input style={inputStyle} type="url" id="linkDokumentasi"
            value={linkDokumentasi} onChange={(e) => setLinkDokumentasi(e.target.value)} />
          <small>Tempel link ke album Google Drive/Photos di sini (jika status "Selesai").</small>
        </div>
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="embedHtml">Kode Embed (Opsional):</label>
          <textarea style={{...textareaStyle, minHeight: '120px'}} id="embedHtml"
            value={embedHtml} onChange={(e) => setEmbedHtml(e.target.value)} />
          <small>Tempel kode embed dari Instagram, YouTube, Google Slides, dll.</small>
        </div>
        
        <button style={buttonStyle} type="submit" disabled={isProcessing}>
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </form>
    </div>
  );
}
export default EditProgramKerja;