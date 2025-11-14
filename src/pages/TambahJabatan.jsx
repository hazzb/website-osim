// src/pages/TambahJabatan.jsx
// --- VERSI 5.1 (Validasi + Keterangan) ---

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

function TambahJabatan() {
  const [namaJabatan, setNamaJabatan] = useState('');
  const [tipeSuggestions, setTipeSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [selectedTipe, setSelectedTipe] = useState(''); 
  const [isLainnya, setIsLainnya] = useState(false);
  const [otherTipeValue, setOtherTipeValue] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchTipeJabatan() {
      setLoadingSuggestions(true);
      try {
        const { data, error } = await supabase
          .from('master_jabatan')
          .select('tipe_jabatan');
        if (error) throw error;
        const uniqueTipes = [...new Set(data.map(item => item.tipe_jabatan))];
        setTipeSuggestions(uniqueTipes);
        if (uniqueTipes.length > 0) {
          // Set default ke saran pertama, tapi JANGAN centang 'lainnya'
          setSelectedTipe(uniqueTipes[0]);
          setIsLainnya(false); 
        } else {
          // Jika tidak ada saran, paksa ke 'lainnya'
          setIsLainnya(true);
        }
      } catch (error) {
        console.error("Gagal mengambil saran tipe jabatan:", error.message);
      } finally {
        setLoadingSuggestions(false);
      }
    }
    fetchTipeJabatan();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // --- VALIDASI BARU ---
    let finalTipeJabatan = '';
    if (isLainnya) {
      finalTipeJabatan = otherTipeValue.trim();
      if (!finalTipeJabatan) {
        // Mencegah input 'Lainnya' yang kosong
        alert("Tipe Jabatan 'Lainnya' tidak boleh kosong.");
        return; 
      }
    } else {
      finalTipeJabatan = selectedTipe;
    }
    
    if (!finalTipeJabatan) {
      alert("Harap pilih Tipe Jabatan.");
      return;
    }
    // ----------------------
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('master_jabatan')
        .insert([
          { 
            nama_jabatan: namaJabatan, 
            tipe_jabatan: finalTipeJabatan
          }
        ]);
      if (error) throw error;
      alert('Jabatan baru berhasil ditambahkan!');
      navigate('/admin/kelola-jabatan');
    } catch (error) {
      alert(`Gagal menambahkan jabatan: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };
  
  const handleCheckboxChange = (e) => {
    setIsLainnya(e.target.checked);
  };
  
  const handleDropdownChange = (e) => {
    setSelectedTipe(e.target.value);
  };
  
  const handleOtherInputChange = (e) => {
    setOtherTipeValue(e.target.value);
  };

  // --- Styling ---
  const formStyle = { display: 'flex', flexDirection: 'column', maxWidth: '500px', margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' };
  const inputGroupStyle = { marginBottom: '15px' };
  const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold' };
  const inputStyle = { width: '100%', padding: '8px', boxSizing: 'border-box' };
  const selectStyle = { ...inputStyle, padding: '8px' };
  const buttonStyle = { padding: '10px 15px', fontSize: '1em', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' };
  const otherGroupStyle = { display: 'flex', alignItems: 'center', gap: '10px' };
  const helperTextStyle = { fontSize: '0.9em', color: '#666', marginTop: '5px' }; // <-- KETERANGAN

  return (
    <div>
      <h2>Tambah Jabatan Baru</h2>
      <form style={formStyle} onSubmit={handleSubmit}>
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="namaJabatan">Nama Jabatan:</label>
          <input style={inputStyle} type="text" id="namaJabatan"
            placeholder="Contoh: Koordinator"
            value={namaJabatan} 
            onChange={(e) => setNamaJabatan(e.target.value)} required />
          <small style={helperTextStyle}>Nama jabatan yang akan muncul di dropdown form anggota.</small>
        </div>
        
        <div style={inputGroupStyle}>
          <label style={labelStyle}>Tipe Jabatan:</label>
          {loadingSuggestions ? <p>Memuat tipe...</p> : (
            <>
              <select 
                style={selectStyle}
                value={selectedTipe}
                onChange={handleDropdownChange}
                disabled={isLainnya}
              >
                {tipeSuggestions.map((tipe, index) => (
                  <option key={index} value={tipe}>
                    {tipe}
                  </option>
                ))}
              </select>
              <small style={helperTextStyle}>Pilih tipe yang sudah ada (misal: "Divisi") untuk konsistensi.</small>
              
              <hr style={{margin: '15px 0', border: 'none', borderTop: '1px dashed #ccc'}} />
              
              <div style={otherGroupStyle}>
                <input
                  type="checkbox"
                  id="isLainnya"
                  checked={isLainnya}
                  onChange={handleCheckboxChange}
                  style={{width: '18px', height: '18px'}}
                />
                <label htmlFor="isLainnya" style={{cursor: 'pointer'}}>Lainnya:</label>
                <input 
                  type="text"
                  style={{...inputStyle, flex: 1}}
                  placeholder="Ketik tipe baru..."
                  value={otherTipeValue}
                  onChange={handleOtherInputChange}
                  disabled={!isLainnya}
                />
              </div>
              <small style={helperTextStyle}>Centang untuk membuat Kategori Tipe baru, misal: "Pembina".</small>
            </>
          )}
        </div>
        
        <button style={buttonStyle} type="submit" disabled={saving || loadingSuggestions}>
          {saving ? 'Menyimpan...' : 'Simpan Jabatan'}
        </button>
      </form>
    </div>
  );
}

export default TambahJabatan;