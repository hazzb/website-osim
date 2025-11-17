// src/pages/ProgramKerjaDetail.jsx
// --- VERSI 7.4 (Status Pill Editable & Tombol Edit Compact) ---

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import styles from './ProgramKerjaDetail.module.css';

function ProgramKerjaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [progja, setProgja] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { session } = useAuth();
  const isAdmin = !!session;

  useEffect(() => {
    async function fetchProgramKerjaDetail() {
      // ... (Logika fetch data tidak berubah) ...
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('program_kerja_detail_view')
          .select('*')
          .eq('id', id)
          .single();
        if (error) {
          if (error.code === 'PGRST116') {
            setError("Program kerja tidak ditemukan.");
            setProgja(null);
            return;
          }
          throw error;
        }
        setProgja(data);
      } catch (err) {
        console.error("Error fetching program kerja detail:", err.message);
        setError("Gagal memuat detail program kerja: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProgramKerjaDetail();
  }, [id, navigate]);

  // --- [PERUBAHAN 1: Fungsi Handle Status Baru] ---
  // Fungsi ini dipicu oleh <select>
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    if (!window.confirm(`Apakah Anda yakin ingin mengubah status menjadi '${newStatus}'?`)) {
      // Reset <select> ke nilai semula jika dibatalkan
      e.target.value = progja.status;
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('program_kerja')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      setProgja(prev => ({ ...prev, status: newStatus }));
      alert(`Status program kerja berhasil diubah menjadi '${newStatus}'.`);
    } catch (err) {
      setError("Gagal mengubah status: " + err.message);
      alert("Gagal mengubah status: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  // --- [AKHIR PERUBAHAN 1] ---

  if (loading && !progja) {
    return <div className="main-content"><p className="loading-text">Memuat detail program kerja...</p></div>;
  }

  if (error || !progja) {
    return (
      <div className="main-content">
        <p className="error-text">{error || "Program Kerja Tidak Ditemukan"}</p>
        <div style={{textAlign: 'center', marginTop: '1rem'}}>
          <Link to="/program-kerja" className="button button-primary">Kembali ke Daftar Program Kerja</Link>
        </div>
      </div>
    );
  }

  // Tentukan class status (tetap diperlukan untuk <select> dan <span>)
  let statusClass = styles['status-rencana'];
  if (progja.status === 'Selesai') {
    statusClass = styles['status-selesai'];
  } else if (progja.status === 'Akan Datang') {
    statusClass = styles['status-akan-datang'];
  }

  const Breadcrumbs = () => (
    <nav className="breadcrumbs" aria-label="breadcrumbs">
        <Link to="/">Home</Link> / 
        <Link to="/program-kerja">Program Kerja</Link> / 
        <span>{progja.nama_acara}</span>
    </nav>
  );

  return (
    <div className="main-content">
      <Breadcrumbs />
      
      <div className={styles['detail-card']}>
        {/* Kolom Kiri */}
        <div className={styles['left-column']}>
          
          {/* --- [PERUBAHAN 2: Header Status Baru] --- */}
          <div className={styles['status-header']}>
            {isAdmin ? (
              // Jika ADMIN: Tampilkan <select>
              <select 
                value={progja.status} 
                onChange={handleStatusChange}
                disabled={loading}
                className={`${styles['status-select']} ${statusClass}`}
              >
                <option value="Akan Datang">Akan Datang</option>
                <option value="Rencana">Rencana</option>
                <option value="Selesai">Selesai</option>
              </select>
            ) : (
              // Jika PUBLIK: Tampilkan <span>
              <span className={`${styles['status-badge']} ${statusClass}`}>
                {progja.status}
              </span>
            )}
            
            {/* Tombol Edit dipindahkan ke sini, hanya untuk admin */}
            {isAdmin && (
              <Link to={`/admin/program-kerja/edit/${progja.id}`} className={styles['edit-button']} title="Edit Program Kerja">
                <span role="img" aria-label="edit">✏️</span>
              </Link>
            )}
          </div>
          {/* --- [AKHIR PERUBAHAN 2] --- */}

          <h1 className={styles['progja-title']}>{progja.nama_acara}</h1>
          <div className={styles['progja-meta']}>
            <p><strong>Tanggal:</strong> {new Date(progja.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p><strong>Divisi:</strong> {progja.nama_divisi || 'N/A'}</p>
            <p><strong>PJ:</strong> {progja.nama_penanggung_jawab || '-'}</p>
          </div>

          {/* --- [PERUBAHAN 3: Tombol Pintasan Dihapus] --- */}
          {/* Blok isAdmin yang lama di sini sudah dihapus */}

          <h2 className={styles['description-section-title']}>Deskripsi Lengkap</h2>
          <div className={styles['markdown-content']}>
            {progja.deskripsi ? (
              <ReactMarkdown>{progja.deskripsi}</ReactMarkdown>
            ) : (
              <p className="info-text">Tidak ada deskripsi lengkap.</p>
            )}
          </div>
        </div>

        {/* Kolom Kanan (Tidak berubah) */}
        <div className={styles['right-column']}>
          <div className={styles['embed-container']}>
            {progja.embed_html ? (
              <div dangerouslySetInnerHTML={{ __html: progja.embed_html }} />
            ) : (
              <div className={styles['embed-placeholder']}>Tidak ada video</div>
            )}
          </div>

          {progja.link_dokumentasi && (
            <div className={styles['document-link-card']}>
              <h3 className={styles['document-link-title']}>Link Dokumentasi</h3>
              <a 
                href={progja.link_dokumentasi} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles['document-link-item']}
              >
                <span role="img" aria-label="file" style={{ marginRight: '0.25rem' }}>📄</span>
                Lihat Dokumen
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProgramKerjaDetail;