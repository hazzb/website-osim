// src/pages/EditAnggota.jsx
// --- VERSI 2.0 (Fetch, Cascading Dropdowns, dan Update) ---

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';

function EditAnggota() {
  const { id } = useParams(); // Mengambil ID anggota dari URL
  const navigate = useNavigate();

  // State untuk data form
  const [nama, setNama] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [motto, setMotto] = useState('');
  const [instagram, setInstagram] = useState('');
  const [jabatanDiDivisi, setJabatanDiDivisi] = useState('');

  // State untuk Cascading Dropdowns
  const [periodeList, setPeriodeList] = useState([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState('');
  
  const [divisiList, setDivisiList] = useState([]);
  const [selectedDivisiId, setSelectedDivisiId] = useState('');

  // State untuk UI
  const [loading, setLoading] = useState(true); // Loading data awal
  const [loadingDivisi, setLoadingDivisi] = useState(false); // Loading dropdown divisi
  const [saving, setSaving] = useState(false);

  // --- EFEK 1: Ambil data anggota & daftar periode saat halaman dimuat ---
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      try {
        // 1. Ambil daftar SEMUA periode untuk dropdown
        const { data: periodes, error: periodeError } = await supabase
          .from('periode_jabatan')
          .select('id, nama_kabinet, tahun_mulai, tahun_selesai')
          .order('tahun_mulai', { ascending: false });
        
        if (periodeError) throw periodeError;
        setPeriodeList(periodes || []);

        // 2. Ambil data SPESIFIK anggota yang akan diedit
        const { data: anggota, error: anggotaError } = await supabase
          .from('anggota')
          .select('*')
          .eq('id', id) // Berdasarkan ID dari URL
          .single(); // Kita hanya butuh 1 data
        
        if (anggotaError) throw anggotaError;
        if (!anggota) {
          alert("Data anggota tidak ditemukan!");
          navigate('/admin/kelola-anggota');
          return;
        }

        // 3. Isi semua state form dengan data yang ada
        setNama(anggota.nama);
        setFotoUrl(anggota.foto_url || 'https://placehold.co/400x400/png');
        setMotto(anggota.motto || '');
        setInstagram(anggota.instagram_username || '');
        setJabatanDiDivisi(anggota.jabatan_di_divisi || '');
        
        // 4. Set state dropdown ke nilai yang ada di database
        //    Ini akan otomatis memicu EFEK 2
        setSelectedPeriodeId(anggota.periode_id); 
        setSelectedDivisiId(anggota.divisi_id);

      } catch (error) {
        alert("Gagal memuat data anggota: " + error.message);
        setLoading(false);
      }
      // 'loading' di-set ke false nanti di EFEK 2, setelah divisi juga dimuat
    }
    
    loadInitialData();
  }, [id, navigate]); // [] = Hanya berjalan sekali saat halaman dimuat

  // --- EFEK 2: Ambil daftar DIVISI saat 'selectedPeriodeId' berubah ---
  useEffect(() => {
    if (!selectedPeriodeId) {
      setDivisiList([]);
      return;
    }

    async function fetchDivisi() {
      setLoadingDivisi(true);
      try {
        const { data, error } = await supabase
          .from('divisi')
          .select('id, nama_divisi')
          .eq('periode_id', selectedPeriodeId) // <-- KUNCI CASCADING
          .order('nama_divisi', { ascending: true });
        
        if (error) throw error;
        setDivisiList(data || []);
        
      } catch (error) {
        alert("Gagal memuat daftar divisi: " + error.message);
      } finally {
        setLoading(false); // Data awal (anggota + periode + divisi) selesai dimuat
        setLoadingDivisi(false);
      }
    }
    
    fetchDivisi();
  }, [selectedPeriodeId]); // <-- 'Trigger' saat state ini berubah

  // --- Handler saat admin MENGGANTI periode ---
  const handlePeriodeChange = (e) => {
    setSelectedPeriodeId(e.target.value);
    // KOSONGKAN pilihan divisi, karena divisi lama tidak valid
    setSelectedDivisiId(''); 
  };

  // --- FUNGSI SUBMIT (UPDATE) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPeriodeId || !selectedDivisiId) {
      alert("Harap pilih Periode dan Divisi.");
      return;
    }
    setSaving(true);

    try {
      // Kita gunakan 'update' bukan 'insert'
      const { error } = await supabase
        .from('anggota')
        .update({ 
          nama: nama,
          foto_url: fotoUrl,
          motto: motto,
          instagram_username: instagram,
          jabatan_di_divisi: jabatanDiDivisi,
          divisi_id: selectedDivisiId,   // FK Divisi (bisa jadi baru)
          periode_id: selectedPeriodeId // FK Periode (bisa jadi baru)
        })
        .eq('id', id); // <-- KUNCI UPDATE: WHERE id = ...

      if (error) throw error;
      alert('Anggota berhasil diperbarui!');
      navigate('/admin/kelola-anggota'); // Arahkan kembali ke tabel

    } catch (error) {
      alert(`Gagal memperbarui anggota: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // --- Styling (Sama seperti TambahAnggota) ---
  const formStyle = { display: 'flex', flexDirection: 'column', maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' };
  const inputGroupStyle = { marginBottom: '15px' };
  const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold' };
  const inputStyle = { width: '100%', padding: '8px', boxSizing: 'border-box' };
  const selectStyle = { ...inputStyle, padding: '8px', backgroundColor: '#f9f9f9' };
  const buttonStyle = { padding: '10px 15px', fontSize: '1em', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer', marginTop: '10px' };

  if (loading) {
    return <h2>Memuat data anggota untuk diedit...</h2>;
  }

  return (
    <div>
      <h2>Edit Anggota: {nama}</h2>
      <form style={formStyle} onSubmit={handleSubmit}>

        <div style={{ display: 'flex', gap: '15px' }}>
          {/* Kolom Dropdown Periode */}
          <div style={{ ...inputGroupStyle, flex: 1 }}>
            <label style={labelStyle} htmlFor="periode">Periode:</label>
            <select 
              id="periode" style={selectStyle}
              value={selectedPeriodeId}
              onChange={handlePeriodeChange} // <-- Pakai handler khusus
              required
            >
              <option value="" disabled>-- Pilih Periode --</option>
              {periodeList.map(periode => (
                <option key={periode.id} value={periode.id}>
                  {periode.tahun_mulai}/{periode.tahun_selesai} ({periode.nama_kabinet || 'Tanpa Nama'})
                </option>
              ))}
            </select>
          </div>
          
          {/* Kolom Dropdown Divisi */}
          <div style={{ ...inputGroupStyle, flex: 1 }}>
            <label style={labelStyle} htmlFor="divisi">Divisi:</label>
            {loadingDivisi ? <p>Memuat...</p> : (
              <select 
                id="divisi" style={selectStyle}
                value={selectedDivisiId}
                onChange={(e) => setSelectedDivisiId(e.target.value)}
                required
                disabled={divisiList.length === 0}
              >
                <option value="" disabled>-- Pilih Divisi --</option>
                {divisiList.map(divisi => (
                  <option key={divisi.id} value={divisi.id}>
                    {divisi.nama_divisi}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* --- Input fields (sama seperti TambahAnggota) --- */}
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="nama">Nama Lengkap:</label>
          <input style={inputStyle} type="text" id="nama"
            value={nama} onChange={(e) => setNama(e.target.value)} required />
        </div>
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="jabatanDiDivisi">Jabatan di Divisi:</label>
          <input style={inputStyle} type="text" id="jabatanDiDivisi"
            value={jabatanDiDivisi} onChange={(e) => setJabatanDiDivisi(e.target.value)} required />
        </div>
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="fotoUrl">URL Foto:</label>
          <input style={inputStyle} type="text" id="fotoUrl"
            value={fotoUrl} onChange={(e) => setFotoUrl(e.target.value)} />
        </div>
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="motto">Motto (Opsional):</label>
          <input style={inputStyle} type="text" id="motto"
            value={motto} onChange={(e) => setMotto(e.target.value)} />
        </div>
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="instagram">Username Instagram (Opsional, tanpa @):</label>
          <input style={inputStyle} type="text" id="instagram"
            value={instagram} onChange={(e) => setInstagram(e.target.value)} />
        </div>
        
        <button style={buttonStyle} type="submit" disabled={saving || loading || loadingDivisi}>
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </form>
    </div>
  );
}

export default EditAnggota;