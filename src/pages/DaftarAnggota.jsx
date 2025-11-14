// src/pages/DaftarAnggota.jsx
// --- VERSI 3.2 (Mengganti "Tampilkan Arsip" -> "Masa Jabatan") ---

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; 
import { Link } from 'react-router-dom';

// --- (Komponen AnggotaCard - tidak berubah) ---
function AnggotaCard({ anggota }) {
  const cardStyle = { border: '1px solid #ddd', borderRadius: '8px', padding: '15px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', backgroundColor: 'white' };
  const imgStyle = { width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #eee' };
  const nameStyle = { margin: '10px 0 5px 0', color: '#333' };
  const jabatanStyle = { color: '#555', fontSize: '0.9em', fontStyle: 'italic' };
  return (
    <div key={anggota.id} style={cardStyle}>
      <img src={anggota.foto_url || 'https://placehold.co/400x400/png'} alt={`Foto ${anggota.nama}`} style={imgStyle} />
      <h3 style={nameStyle}>{anggota.nama}</h3>
      <p style={jabatanStyle}>{anggota.jabatan_di_divisi}</p>
    </div>
  );
}

// --- Komponen Utama DaftarAnggota ---
function DaftarAnggota() {
  const [divisiList, setDivisiList] = useState([]);
  const [error, setError] = useState(null);
  const [periodeList, setPeriodeList] = useState([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState('');
  const [loadingPeriode, setLoadingPeriode] = useState(true);
  const [loadingAnggota, setLoadingAnggota] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // --- (EFEK 1: Ambil Periode & Sesi - tidak berubah) ---
  useEffect(() => {
    async function fetchPeriodeAndSession() {
      setLoadingPeriode(true);
      try {
        const { data: periodes, error: periodeError } = await supabase
          .from('periode_jabatan')
          .select('id, nama_kabinet, tahun_mulai, tahun_selesai, is_active')
          .order('tahun_mulai', { ascending: false });
        if (periodeError) throw periodeError;
        setPeriodeList(periodes || []);
        const activePeriode = periodes.find(p => p.is_active);
        if (activePeriode) {
          setSelectedPeriodeId(activePeriode.id);
        } else if (periodes.length > 0) {
          setSelectedPeriodeId(periodes[0].id);
        }
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsAdmin(true);
        }
      } catch (error) {
        setError("Gagal memuat daftar periode: " + error.message);
      } finally {
        setLoadingPeriode(false);
      }
    }
    fetchPeriodeAndSession();
  }, []);

  // --- (EFEK 2: Ambil Anggota - tidak berubah) ---
  useEffect(() => {
    if (!selectedPeriodeId) return;
    async function fetchAnggota() {
      setLoadingAnggota(true);
      setError(null);
      setDivisiList([]);
      try {
        const { data, error } = await supabase
          .from('anggota_detail_view')
          .select('*')
          .eq('periode_id', selectedPeriodeId)
          .order('urutan', { ascending: true })
          .order('nama', { ascending: true }); 
        if (error) throw error;
        if (data.length === 0) {
          setError("Belum ada anggota untuk periode ini.");
          return;
        }
        const groups = new Map();
        data.forEach(anggota => {
          const { nama_divisi, urutan, divisi_id, periode_id } = anggota;
          if (!groups.has(nama_divisi)) {
            groups.set(nama_divisi, {
              nama: nama_divisi || 'Tanpa Divisi',
              urutan: urutan || 99,
              divisi_id: divisi_id,
              periode_id: periode_id,
              anggota: []
            });
          }
          groups.get(nama_divisi).anggota.push(anggota);
        });
        const groupedArray = Array.from(groups.values());
        groupedArray.sort((a, b) => a.urutan - b.urutan || a.nama.localeCompare(b.nama));
        setDivisiList(groupedArray);
      } catch (error) {
        console.error("Error fetching anggota:", error.message);
        setError(error.message);
      } finally {
        setLoadingAnggota(false);
      }
    }
    fetchAnggota();
  }, [selectedPeriodeId]);
  
  // --- (Styling - tidak berubah) ---
  const pageStyle = { maxWidth: '1200px', margin: '20px auto', padding: '0 20px' };
  const headerStyle = { borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' };
  const filterGroupStyle = { marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px' };
  const labelStyle = { fontWeight: 'bold', marginRight: '10px' };
  const selectStyle = { padding: '8px', fontSize: '1em', width: '100%', maxWidth: '400px' };
  const divisionGroupStyle = { marginBottom: '40px' };
  const divisionHeaderStyle = { display: 'flex', alignItems: 'center', gap: '15px', paddingBottom: '10px', borderBottom: '2px solid #007bff', color: '#007bff' };
  const addAnggotaToDivisiBtnStyle = { display: 'inline-block', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', padding: '4px 10px', borderRadius: '50px', fontWeight: 'bold', fontSize: '1em', lineHeight: '1', };
  const cardContainerStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' };
  const shortcutButtonStyle = { position: 'fixed', bottom: '30px', right: '30px', backgroundColor: '#28a745', color: 'white', padding: '12px 18px', borderRadius: '50px', textDecoration: 'none', fontSize: '1.1em', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', zIndex: 1000 };

  // --- Render ---
  return (
    <div style={pageStyle}>
      
      {isAdmin && (
        <Link to="/admin/anggota/tambah" style={shortcutButtonStyle} title="Tambah Anggota (Umum)">
          +
        </Link>
      )}

      <div style={headerStyle}>
        <h1>Daftar Anggota</h1>
        
        <div style={filterGroupStyle}>
          {/* --- INI ADALAH PERUBAHANNYA --- */}
          <label style={labelStyle} htmlFor="periode-select">Masa Jabatan:</label>
          {/* ------------------------------- */}
          
          {loadingPeriode ? (
            <p>Memuat periode...</p>
          ) : (
            <select 
              id="periode-select" 
              style={selectStyle}
              value={selectedPeriodeId}
              onChange={(e) => setSelectedPeriodeId(e.target.value)}
            >
              {periodeList.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nama_kabinet || `${p.tahun_mulai}/${p.tahun_selesai}`} 
                  {p.is_active && ' (Periode Aktif)'}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {loadingAnggota && <h2>Memuat Daftar Anggota...</h2>}
      {error && <h2>Error: {error}</h2>}
      
      {!loadingAnggota && !error && divisiList.map(divisi => (
        <section key={divisi.nama} style={divisionGroupStyle}>
          
          <div style={{
            ...divisionHeaderStyle,
            borderColor: (divisi.urutan === 1) ? '#0056b3' : '#007bff',
          }}>
            <h2 style={{ color: (divisi.urutan === 1) ? '#0056b3' : '#007bff', margin: 0 }}>
              {divisi.nama}
            </h2>
            {isAdmin && (
              <Link 
                to={`/admin/anggota/tambah?periode_id=${divisi.periode_id}&divisi_id=${divisi.divisi_id}`}
                style={addAnggotaToDivisiBtnStyle}
                title={`Tambah Anggota ke ${divisi.nama}`}
              >
                +
              </Link>
            )}
          </div>
          
          <div style={cardContainerStyle}>
            {divisi.anggota.map(anggota => (
              <AnggotaCard key={anggota.id} anggota={anggota} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default DaftarAnggota;