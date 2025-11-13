// src/pages/Pengaturan.jsx
// --- VERSI SEDERHANA (TANPA MASTER SWITCH) ---

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function Pengaturan() {
  // State kita sekarang HANYA 3 tombol
  const [settings, setSettings] = useState({
    tampilkan_kolom_rencana: true,
    tampilkan_kolom_akan_datang: true,
    tampilkan_kolom_selesai: true
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // useEffect untuk MENGAMBIL (FETCH) pengaturan
  useEffect(() => {
    async function fetchPengaturan() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('pengaturan')
          .select('tampilkan_kolom_rencana, tampilkan_kolom_akan_datang, tampilkan_kolom_selesai') // Hanya ambil 3
          .eq('id', 1)
          .single();

        if (error) throw error;
        if (data) setSettings(data);
        
      } catch (error) {
        alert("Gagal mengambil pengaturan: " + error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPengaturan();
  }, []);

  // Fungsi untuk MENYIMPAN pengaturan
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('pengaturan')
        .update(settings) // Kirim object state (yang berisi 3 tombol)
        .eq('id', 1); 
      
      if (error) throw error;
      alert("Pengaturan berhasil disimpan!");

    } catch (error) {
      alert("Gagal menyimpan pengaturan: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Helper untuk mengubah state object
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // --- Styling ---
  const formStyle = { maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' };
  const inputGroupStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' };
  const labelStyle = { fontWeight: 'bold', marginRight: '10px' };
  const buttonStyle = { padding: '10px 15px', fontSize: '1em', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' };

  if (loading) {
    return <p>Memuat pengaturan...</p>;
  }

  return (
    <div style={formStyle}>
      <h2>Pengaturan Papan Program Kerja</h2>
      <p>Pilih kolom mana yang ingin Anda tampilkan di halaman Program Kerja publik.</p>
      
      <form onSubmit={handleSave}>
        
        {/* --- HANYA 3 TOMBOL PENGATURAN --- */}
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="tampilkan_kolom_rencana">
            Tampilkan Kolom "Rencana"?
          </label>
          <input 
            type="checkbox"
            id="tampilkan_kolom_rencana"
            name="tampilkan_kolom_rencana"
            checked={settings.tampilkan_kolom_rencana}
            onChange={handleCheckboxChange}
            style={{ transform: 'scale(1.5)' }}
          />
        </div>
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="tampilkan_kolom_akan_datang">
            Tampilkan Kolom "Akan Datang"?
          </label>
          <input 
            type="checkbox"
            id="tampilkan_kolom_akan_datang"
            name="tampilkan_kolom_akan_datang"
            checked={settings.tampilkan_kolom_akan_datang}
            onChange={handleCheckboxChange}
            style={{ transform: 'scale(1.5)' }}
          />
        </div>
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="tampilkan_kolom_selesai">
            Tampilkan Kolom "Selesai"?
          </label>
          <input 
            type="checkbox"
            id="tampilkan_kolom_selesai"
            name="tampilkan_kolom_selesai"
            checked={settings.tampilkan_kolom_selesai}
            onChange={handleCheckboxChange}
            style={{ transform: 'scale(1.5)' }}
          />
        </div>

        <hr style={{ margin: '20px 0' }} />

        <button style={buttonStyle} type="submit" disabled={saving}>
          {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </form>
    </div>
  );
}

export default Pengaturan;