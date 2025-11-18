// src/pages/KelolaAnggota.jsx
// --- VERSI 7.3 (Perbaikan: Menggunakan CSS Module untuk Filter Pill) ---

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import styles from '../components/admin/AdminTable.module.css'; // Path impor sudah benar

const PER_PAGE = 10;

function KelolaAnggota() {
  // ... (Semua state dan logic tidak berubah) ...
  const [anggotaList, setAnggotaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periodeList, setPeriodeList] = useState([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState('');
  const [loadingPeriode, setLoadingPeriode] = useState(true);
  const [divisiList, setDivisiList] = useState([]);
  const [selectedDivisiId, setSelectedDivisiId] = useState('semua');
  const [loadingDivisi, setLoadingDivisi] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.ceil(totalCount / PER_PAGE);

  // ... (Semua useEffect dan handleHapus tidak berubah) ...
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
        const activePeriode = data.find(p => p.is_active);
        if (activePeriode) {
          setSelectedPeriodeId(activePeriode.id);
        } else if (data.length > 0) {
          setSelectedPeriodeId(data[0].id);
        }
      } catch (err) {
        setError("Gagal memuat periode: " + err.message);
      } finally {
        setLoadingPeriode(false);
      }
    }
    fetchPeriode();
  }, []);

  useEffect(() => {
    if (!selectedPeriodeId) return;
    async function fetchDivisi() {
      setLoadingDivisi(true);
      setDivisiList([]);
      setSelectedDivisiId('semua');
      try {
        const { data, error } = await supabase
          .from('divisi')
          .select('id, nama_divisi')
          .eq('periode_id', selectedPeriodeId)
          .order('urutan', { ascending: true });
        if (error) throw error;
        setDivisiList(data || []);
      } catch (err) {
        console.error("Gagal memuat divisi:", err.message);
      } finally {
        setLoadingDivisi(false);
      }
    }
    fetchDivisi();
  }, [selectedPeriodeId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPeriodeId, selectedDivisiId, searchTerm]);

  useEffect(() => {
    if (!selectedPeriodeId) {
      setAnggotaList([]);
      setLoading(false);
      return;
    }
    async function fetchAnggota() {
      setLoading(true);
      setError(null);
      const from = (currentPage - 1) * PER_PAGE;
      const to = from + PER_PAGE - 1;
      try {
        let query = supabase
          .from('anggota_detail_view')
          .select('*', { count: 'exact' })
          .eq('periode_id', selectedPeriodeId)
          .order('urutan', { ascending: true })
          .order('nama', { ascending: true })
          .range(from, to);
        if (selectedDivisiId !== 'semua') {
          query = query.eq('divisi_id', selectedDivisiId);
        }
        if (searchTerm) {
          query = query.ilike('nama', `%${searchTerm}%`); 
        }
        const { data, error, count } = await query;
        if (error) throw error;
        setAnggotaList(data || []);
        setTotalCount(count || 0);
      } catch (err) {
        setError("Gagal memuat data anggota: " + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnggota();
  }, [selectedPeriodeId, selectedDivisiId, currentPage, searchTerm]);

  const handleHapus = async (anggotaId, fotoUrl) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus anggota ini?')) {
      return;
    }
    try {
      setLoading(true);
      const { error: deleteError } = await supabase
        .from('anggota')
        .delete()
        .eq('id', anggotaId);
      if (deleteError) throw deleteError;
      if (fotoUrl) {
        const filePath = fotoUrl.split('gambar-osim/')[1];
        if (filePath) {
          await supabase.storage.from('gambar-osim').remove([filePath]);
        }
      }
      setAnggotaList(prevList => prevList.filter(item => item.id !== anggotaId));
      setTotalCount(prev => prev - 1);
      alert('Anggota berhasil dihapus.');
    } catch (err) {
      setError("Gagal menghapus anggota: " + err.message);
      alert("Gagal menghapus: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const isLoading = loading || loadingPeriode;

  return (
    <div className="main-content">
      <div className={styles['admin-page-header']}>
        <h1 className="page-title">Kelola Anggota</h1>
        <Link to="/admin/anggota/tambah" className="button button-primary">
          + Tambah Anggota
        </Link>
      </div>

      {/* --- [INI PERBAIKANNYA] --- */}
      <div className={styles['table-filter-container']}>
        {/* Menggunakan style dari module */}
        <div className={styles['filter-group']}>
          <label htmlFor="periode-select">Periode:</label>
          <select 
            id="periode-select" 
            className={styles['filter-select']}
            value={selectedPeriodeId}
            onChange={(e) => setSelectedPeriodeId(e.target.value)}
            disabled={loadingPeriode}
          >
            {periodeList.map(p => (
              <option key={p.id} value={p.id}>
                {p.nama_kabinet || `${p.tahun_mulai}/${p.tahun_selesai}`} 
                {p.is_active && ' (Aktif)'}
              </option>
            ))}
          </select>
        </div>
        
        {/* Menggunakan style dari module */}
        <div className={styles['filter-group']}>
          <label htmlFor="divisi-select">Divisi:</label>
          <select 
            id="divisi-select" 
            className={styles['filter-select']}
            value={selectedDivisiId}
            onChange={(e) => setSelectedDivisiId(e.target.value)}
            disabled={loadingDivisi || !selectedPeriodeId}
          >
            <option value="semua">Semua Divisi</option>
            {divisiList.map(d => (
              <option key={d.id} value={d.id}>{d.nama_divisi}</option>
            ))}
          </select>
        </div>

        {/* Ini sudah benar dari sebelumnya */}
        <div className={styles['search-input-group']}>
          <span>🔍</span>
          <input
            type="text"
            placeholder="Cari nama anggota..."
            className={styles['search-input']}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      {/* --- [AKHIR PERBAIKAN] --- */}


      {error && <p className="error-text">{error}</p>}
      
      {/* Sisa file (tabel dan pagination) tidak berubah */ }
      <div className={styles['table-container']}>
        <table className={styles['admin-table']}>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Divisi</th>
              <th>Jabatan</th>
              <th>Gender</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>Memuat data...</td>
              </tr>
            ) : anggotaList.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>
                  {searchTerm ? 'Tidak ada anggota yang cocok dengan pencarian.' : 'Tidak ada anggota untuk filter ini.'}
                </td>
              </tr>
            ) : (
              anggotaList.map(anggota => (
                <tr key={anggota.id}>
                  <td className={styles['avatar-cell']}>
                    <img
                      src={anggota.foto_url || 'https://via.placeholder.com/40.png/eee/808080?text=?'}
                      alt={anggota.nama}
                      className={styles['avatar-image']}
                    />
                    <strong>{anggota.nama}</strong>
                  </td>
                  <td>{anggota.nama_divisi}</td>
                  <td>{anggota.jabatan_di_divisi}</td>
                  <td>{anggota.jenis_kelamin}</td>
                  <td className={styles['actions-cell']}>
                    <Link 
                      to={`/admin/anggota/edit/${anggota.id}`} 
                      className={`${styles['button-table']} ${styles['button-edit']}`}
                    >
                      Edit
                    </Link>
                    <button 
                      onClick={() => handleHapus(anggota.id, anggota.foto_url)}
                      className={`${styles['button-table']} ${styles['button-delete']}`}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={styles['pagination-container']}>
        <span className={styles['pagination-info']}>
          Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong> (Total: {totalCount} anggota)
        </span>
        <div className={styles['pagination-buttons']}>
          <button 
            className={styles['pagination-button']}
            onClick={() => setCurrentPage(p => p - 1)}
            disabled={currentPage === 1 || isLoading}
          >
            &larr; Sebelumnya
          </button>
          <button 
            className={styles['pagination-button']}
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={currentPage === totalPages || isLoading || anggotaList.length === 0}
          >
            Selanjutnya &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}

export default KelolaAnggota;