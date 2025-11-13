// src/components/ProgramKerjaCard.jsx

import React from 'react';

function ProgramKerjaCard({ program }) {
  
  // --- Styling untuk Kartu ---
  const cardStyle = {
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '16px',
    margin: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    flexBasis: '100%' // Kartu akan mengisi lebar kolom
  };

  const titleStyle = {
    margin: '0 0 8px 0',
    fontSize: '1.1em',
    color: '#333'
  };

  const detailStyle = {
    fontSize: '0.9em',
    color: '#666',
    margin: '4px 0'
  };
  
  const linkStyle = {
    display: 'inline-block',
    marginTop: '10px',
    fontSize: '0.9em',
    color: '#007bff',
    textDecoration: 'none',
    fontWeight: 'bold'
  };

  return (
    <div style={cardStyle}>
      <h4 style={titleStyle}>{program.nama_acara}</h4>
      
      {/* Tampilkan tanggal HANYA jika statusnya bukan 'Rencana' */}
      {program.status !== 'Rencana' && (
        <p style={detailStyle}>
          <strong>Tanggal:</strong> {program.tanggal}
        </p>
      )}
      
      {program.divisi && (
        <p style={detailStyle}>
          <strong>Divisi:</strong> {program.divisi}
        </p>
      )}
      
      {program.penanggung_jawab && (
        <p style={detailStyle}>
          <strong>PJ:</strong> {program.penanggung_jawab}
        </p>
      )}
      
      {program.deskripsi && (
        <p style={{ ...detailStyle, color: '#333', marginTop: '10px' }}>
          {program.deskripsi}
        </p>
      )}

      {/* Tampilkan link HANYA jika statusnya 'Selesai' dan link-nya ada */}
      {program.status === 'Selesai' && program.link_dokumentasi && (
        <a href={program.link_dokumentasi} target="_blank" rel="noopener noreferrer" style={linkStyle}>
          Lihat Dokumentasi →
        </a>
      )}
    </div>
  );
}

export default ProgramKerjaCard;