// src/pages/DivisiDetail.jsx
// --- HALAMAN BARU ---

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import styles from './DivisiDetail.module.css'; // File CSS baru

// --- [KOMPONEN ANGGOTA CARD (Disalin dari DaftarAnggota.jsx)] ---
function AnggotaCard({ anggota, isAdmin, pengaturan }) {
  const showMotto = pengaturan.tampilkan_anggota_motto && anggota.motto;
  const showIg = pengaturan.tampilkan_anggota_ig && anggota.instagram_username;
  const showAlamat = pengaturan.tampilkan_anggota_alamat && anggota.alamat;

  return (
    // Menggunakan class 'card' dari DivisiDetail.module.css
    <div className={styles.card}> 
      {isAdmin && (
        <Link to={`/admin/anggota/edit/${anggota.id}`} title={`Edit ${anggota.nama}`} className={styles['card-edit-button']}>
          ✏️
        </Link>
      )}
      <img 
        src={anggota.foto_url || 'https://via.placeholder.com/150.png/eee/808080?text=Foto'}
        alt={`Foto ${anggota.nama}`}
        className={styles['anggota-card-image']}
      />
      <div className={styles['anggota-card-content']}>
        <h3 className={styles['anggota-card-nama']}>{anggota.nama}</h3>
        <p className={styles['anggota-card-jabatan']}>
          {anggota.jabatan_di_divisi}
          {anggota.jenis_kelamin && (
            <span> ({anggota.jenis_kelamin})</span>
          )}
        </p>
        {(showMotto || showIg || showAlamat) && (
          <>
            <hr className="card-divider" /> {/* Pakai class global */}
            <div className={styles['anggota-card-info']}>
              {showMotto && ( <p className={styles['info-motto']}>"{anggota.motto}"</p> )}
              {showIg && ( <p><strong>IG:</strong> @{anggota.instagram_username}</p> )}
              {showAlamat && ( <p><strong>Alamat:</strong> {anggota.alamat}</p> )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
// --- [AKHIR SALINAN ANGGOTA CARD] ---


function DivisiDetail() {
  const { id } = useParams();
  const [divisi, setDivisi] = useState(null);
  const [anggotaList, setAnggotaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { session } = useAuth();
  const isAdmin = !!session;
  
  // Kita tetap butuh pengaturan untuk AnggotaCard
  const [pengaturan, setPengaturan] = useState(null); 

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      
      if (!id) {
        setError("ID Divisi tidak ditemukan.");
        setLoading(false);
        return;
      }

      try {
        // 1. Fetch data divisi (untuk Visi/Misi)
        const { data: divisiData, error: divisiError } = await supabase
          .from('divisi')
          .select('*')
          .eq('id', id)
          .single();
        
        if (divisiError) throw new Error(`Divisi tidak ditemukan: ${divisiError.message}`);
        setDivisi(divisiData);

        // 2. Fetch anggota untuk divisi ini
        const { data: anggotaData, error: anggotaError } = await supabase
          .from('anggota_detail_view')
          .select('*')
          .eq('divisi_id', id)
          .order('nama', { ascending: true });
        
        if (anggotaError) throw new Error(`Gagal memuat anggota: ${anggotaError.message}`);
        setAnggotaList(anggotaData || []);

        // 3. Fetch pengaturan (untuk AnggotaCard)
        const { data: settingsData, error: settingsError } = await supabase
          .from('pengaturan')
          .select('id, tampilkan_anggota_motto, tampilkan_anggota_ig, tampilkan_anggota_alamat')
          .single();
        
        if (settingsError) throw new Error(`Gagal memuat pengaturan: ${settingsError.message}`);
        setPengaturan(settingsData);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) {
    return <div className="main-content"><p className="loading-text">Memuat detail divisi...</p></div>;
  }
  
  if (error) {
    return <div className="main-content"><p className="error-text">{error}</p></div>;
  }

  if (!divisi) {
    return <div className="main-content"><p className="info-text">Divisi tidak ditemukan.</p></div>;
  }

  return (
    <div className="main-content">
      {/* --- Header Halaman --- */}
      <div className={styles['detail-header']}>
        {divisi.logo_url && (
          <img src={divisi.logo_url} alt={`Logo ${divisi.nama_divisi}`} className={styles['detail-logo']} />
        )}
        {/* Class 'page-title' adalah global */}
        <h1 className="page-title" style={{ marginBottom: 0 }}>{divisi.nama_divisi}</h1>
      </div>

      {/* --- Visi & Misi (Deskripsi Markdown) --- */}
      <div className={styles['deskripsi-card']}>
        <h2 className={styles['section-title']}>Visi & Misi Divisi</h2>
        <div className={styles['markdown-content']}>
          {divisi.deskripsi ? (
            <ReactMarkdown>{divisi.deskripsi}</ReactMarkdown>
          ) : (
            <p className="info-text">Deskripsi (Visi/Misi) untuk divisi ini belum ditambahkan.</p>
          )}
        </div>
      </div>

      {/* --- Daftar Anggota --- */}
      <div className={styles['anggota-section']}>
        <h2 className={styles['section-title']}>Daftar Anggota</h2>
        {anggotaList.length > 0 && pengaturan ? (
          <div className={styles['card-grid']}>
            {anggotaList.map(anggota => (
              <AnggotaCard 
                key={anggota.id} 
                anggota={anggota} 
                isAdmin={isAdmin} 
                pengaturan={pengaturan} 
              />
            ))}
          </div>
        ) : (
          <p className="info-text">Belum ada anggota di divisi ini.</p>
        )}
      </div>
    </div>
  );
}

export default DivisiDetail;