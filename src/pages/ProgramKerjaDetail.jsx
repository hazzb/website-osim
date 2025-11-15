// src/pages/ProgramKerjaDetail.jsx
// --- FILE BARU ---

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useParams, Link } from 'react-router-dom';

// Komponen helper untuk merender embed HTML dengan aman
function RenderEmbed({ htmlString }) {
  if (!htmlString) return null;
  
  // Style untuk membuat iframe (seperti embed IG) responsif
  const embedWrapperStyle = {
    position: 'relative',
    paddingBottom: '120%', // Sesuaikan rasio ini jika perlu
    height: 0,
    overflow: 'hidden',
    maxWidth: '100%',
    background: '#f9f9f9',
    margin: '20px 0'
  };

  const iframeStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    border: 0
  };

  // Kita perlu memodifikasi string HTML untuk menambahkan style
  // Ini sedikit 'hacky' tapi diperlukan untuk iframe responsif
  let styledHtml = htmlString;
  if (htmlString.includes('<iframe')) {
     styledHtml = htmlString.replace(
       '<iframe', 
       `<iframe style="${Object.entries(iframeStyle).map(([k, v]) => `${k}:${v}`).join(';')}"`
     );
  } else if (htmlString.includes('<blockquote')) {
    // Khusus untuk embed Instagram
    styledHtml = `<div style="max-width: 540px; margin: 0 auto;">${htmlString}</div>`;
  }

  return (
    <div 
      style={htmlString.includes('<iframe') ? embedWrapperStyle : {}}
      dangerouslySetInnerHTML={{ __html: styledHtml }} 
    />
  );
}


function ProgramKerjaDetail() {
  const { id } = useParams(); // Ambil ID dari URL
  const [progja, setProgja] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Efek untuk mengambil data detail
  useEffect(() => {
    async function fetchProgjaDetail() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('program_kerja_detail_view')
          .select('*')
          .eq('id', id)
          .single(); // Ambil satu baris

        if (error) throw error;
        if (data) {
          setProgja(data);
        } else {
          setError("Program kerja tidak ditemukan.");
        }
      } catch (error) {
        setError("Gagal memuat data: " + error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProgjaDetail();
  }, [id]); // 'Trigger' ulang jika ID di URL berubah

  // --- Styling ---
  const pageStyle = { maxWidth: '800px', margin: '20px auto', padding: '20px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '8px' };
  const headerStyle = { borderBottom: '2px solid #eee', paddingBottom: '15px', marginBottom: '20px' };
  const titleStyle = { margin: 0, color: '#0056b3' };
  const infoGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '20px' };
  const infoBoxStyle = { padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '5px' };
  const labelStyle = { fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '5px' };
  const sectionStyle = { marginBottom: '30px' };
  const sectionTitleStyle = { borderBottom: '2px solid #007bff', paddingBottom: '5px', color: '#007bff' };
  const docButtonStyle = { display: 'inline-block', padding: '10px 15px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold' };
  const backLinkStyle = { display: 'inline-block', marginTop: '20px', color: '#007bff', textDecoration: 'none' };

  if (loading) {
    return <h2 style={{textAlign: 'center'}}>Memuat detail program kerja...</h2>;
  }
  if (error) {
    return <h2 style={{textAlign: 'center', color: 'red'}}>Error: {error}</h2>;
  }
  if (!progja) {
    return <h2 style={{textAlign: 'center'}}>Program kerja tidak ditemukan.</h2>;
  }

  return (
    <div style={pageStyle}>
      <Link to="/program-kerja" style={backLinkStyle}>&larr; Kembali ke Semua Progja</Link>

      <div style={headerStyle}>
        <h1 style={titleStyle}>{progja.nama_acara}</h1>
      </div>
      
      {/* --- Info Utama --- */}
      <div style={infoGridStyle}>
        <div style={infoBoxStyle}>
          <span style={labelStyle}>Tanggal</span>
          {new Date(progja.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
        <div style={infoBoxStyle}>
          <span style={labelStyle}>Status</span>
          {progja.status}
        </div>
        <div style={infoBoxStyle}>
          <span style={labelStyle}>Divisi</span>
          {progja.nama_divisi}
        </div>
        <div style={infoBoxStyle}>
          <span style={labelStyle}>Penanggung Jawab (PJ)</span>
          {progja.nama_penanggung_jawab || '-'}
        </div>
      </div>
      
      {/* --- Deskripsi --- */}
      {progja.deskripsi && (
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Deskripsi</h2>
          <p style={{lineHeight: '1.6'}}>{progja.deskripsi}</p>
        </section>
      )}
      
      {/* --- Link Dokumentasi --- */}
      {progja.status === 'Selesai' && (
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Dokumentasi (Album)</h2>
          {progja.link_dokumentasi ? (
            <a href={progja.link_dokumentasi} target="_blank" rel="noopener noreferrer" style={docButtonStyle}>
              Lihat Album (Google Drive/Photos)
            </a>
          ) : (
            <p><i>Dokumentasi album tidak tersedia.</i></p>
          )}
        </section>
      )}

      {/* --- Embed Instagram/YouTube --- */}
      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Media (Instagram/YouTube)</h2>
        {progja.embed_html ? (
          <RenderEmbed htmlString={progja.embed_html} />
        ) : (
          <p><i>Media embed tidak tersedia.</i></p>
        )}
      </section>

    </div>
  );
}

export default ProgramKerjaDetail;