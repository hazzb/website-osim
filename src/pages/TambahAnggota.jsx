// src/pages/TambahAnggota.jsx

import React, { useState, useEffect } from 'react'; 
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

function TambahAnggota() {
  // State untuk data anggota
  const [nama, setNama] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [motto, setMotto] = useState('');
  const [instagram, setInstagram] = useState('');
  
  // State untuk dropdown
  const [periodeList, setPeriodeList] = useState([]); 
  const [periode, setPeriode] = useState(''); // Default tetap string kosong
  
  // State untuk loading
  const [loading, setLoading] = useState(false); 
  const [loadingPeriode, setLoadingPeriode] = useState(true); 
  
  const navigate = useNavigate();

  // --- PERUBAHAN UTAMA ADA DI DALAM useEffect INI ---
  useEffect(() => {
    async function fetchPeriode() {
      setLoadingPeriode(true);
      try {
        // 1. Ambil data dari tabel 'periode_jabatan'
        //    KITA HARUS menyertakan 'is_active' dalam 'select'
        const { data, error } = await supabase
          .from('periode_jabatan')
          .select('id, tahun_mulai, tahun_selesai, nama_kabinet, is_active') // <-- TAMBAHKAN is_active
          .order('tahun_mulai', { ascending: false }); 

        if (error) throw error;
        
        const fetchedData = data || [];
        setPeriodeList(fetchedData); // 2. Isi daftar dropdown (sama seperti sebelumnya)

        // --- INI LOGIKA BARUNYA ---
        // 3. Cari periode yang 'is_active'
        const activePeriode = fetchedData.find(p => p.is_active === true);
        
        // 4. Jika kita menemukannya...
        if (activePeriode) {
          // ...atur state 'periode' ke ID-nya secara otomatis
          setPeriode(activePeriode.id); 
          // Ini akan membuat dropdown memilih periode tersebut
        }
        // Jika tidak ada yang aktif, 'periode' akan tetap '' (string kosong),
        // yang akan memaksa admin memilih "-- Pilih Periode --"
        // --- AKHIR DARI LOGIKA BARU ---
        
      } catch (error) {
        alert("Gagal mengambil daftar periode: " + error.message);
      } finally {
        setLoadingPeriode(false);
      }
    }
    
    fetchPeriode();
  }, []); // [] = Berjalan sekali saat halaman dimuat

  // handleSubmit (Tidak ada perubahan)
  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setLoading(true);

    try {
      const { error } = await supabase
        .from('anggota')
        .insert([
          { 
            nama: nama, 
            jabatan: jabatan, 
            periode_id: parseInt(periode), 
            foto_url: fotoUrl,
            motto: motto,
            instagram_username: instagram 
          }
        ]);

      if (error) throw error;
      alert('Anggota baru berhasil ditambahkan!');
      navigate('/admin/kelola-anggota');

    } catch (error) {
      alert(`Gagal menambahkan anggota: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- STYLING LENGKAP (Tidak ada perubahan) ---
  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '500px',
    margin: '20px auto',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px'
  };
  const inputGroupStyle = {
    marginBottom: '15px'
  };
  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold'
  };
  const inputStyle = {
    width: '100%',
    padding: '8px',
    boxSizing: 'border-box'
  };
  const buttonStyle = {
    padding: '10px 15px',
    fontSize: '1em',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    cursor: 'pointer'
  };

  return (
    <div>
      <h2>Tambah Anggota OSIM Baru</h2>
      <form style={formStyle} onSubmit={handleSubmit}>
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="nama">Nama Lengkap:</label>
          <input 
            style={inputStyle} type="text" id="nama"
            value={nama} onChange={(e) => setNama(e.target.value)} required 
          />
        </div>
        
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="jabatan">Jabatan:</label>
          <input 
            style={inputStyle} type="text" id="jabatan"
            value={jabatan} onChange={(e) => setJabatan(e.target.value)} required 
          />
        </div>

        {/* --- FIELD PERIODE --- */}
        {/* Tidak ada perubahan di JSX, perilakunya akan berubah karena state 'periode' */}
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="periode">Periode Jabatan:</label>
          {loadingPeriode ? (
            <p>Memuat daftar periode...</p>
          ) : (
            <select
              style={inputStyle}
              id="periode"
              value={periode} // 'value' ini sekarang akan otomatis diisi
              onChange={(e) => setPeriode(e.target.value)}
              required
            >
              <option value="" disabled>-- Pilih Periode --</option>
              {periodeList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.tahun_mulai}/{p.tahun_selesai} 
                  {p.nama_kabinet ? ` (${p.nama_kabinet})` : ''}
                </option>
              ))}
            </select>
          )}
        </div>
        
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="fotoUrl">URL Foto:</label>
          <input 
            style={inputStyle} type="text" id="fotoUrl"
            placeholder="https://... (ingat, ini hanya link)"
            value={fotoUrl} onChange={(e) => setFotoUrl(e.target.value)} 
          />
        </div>

        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="motto">Motto:</label>
          <input 
            style={inputStyle} type="text" id="motto"
            value={motto} onChange={(e) => setMotto(e.target.value)} 
          />
        </div>
        
        <div style={inputGroupStyle}>
          <label style={labelStyle} htmlFor="instagram">Instagram Username:</label>
          <input 
            style={inputStyle} type="text" id="instagram"
            placeholder="cth: osim.insanmulia (tanpa @)"
            value={instagram} onChange={(e) => setInstagram(e.target.value)} 
          />
        </div>
        
        <button 
          style={buttonStyle} 
          type="submit" 
          disabled={loading || loadingPeriode} 
        >
          {loading ? 'Menyimpan...' : 'Simpan Anggota Baru'}
        </button>
      </form>
    </div>
  );
}

export default TambahAnggota;