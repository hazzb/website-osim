// src/components/AgendaItem.jsx

import React from 'react';

/*
* Dokumentasi Komponen 'AgendaItem':
* Komponen ini menerima 'props' dari blueprint program_kerja.
*/
function AgendaItem({ agenda }) {
  const itemStyle = {
    border: '1px solid #eee',
    backgroundColor: '#fafafa',
    padding: '16px',
    margin: '16px 0',
    borderRadius: '8px'
  };

  return (
    <div style={itemStyle}>
      {/* Tampilkan tanggal dan nama acara */}
      <h3>{agenda.tanggal} - {agenda.nama_acara}</h3>

      {/* Tampilkan deskripsi */}
      <p>{agenda.deskripsi}</p>

      <hr style={{border: '0', borderTop: '1px solid #eee'}} />

      {/* Info tambahan */}
      <small>
        Divisi: <strong>{agenda.divisi}</strong> | 
        PJ: <strong>{agenda.penanggung_jawab}</strong>
      </small>

      {/* Tampilkan link dokumentasi HANYA JIKA ada */}
      {agenda.link_dokumentasi && (
        <div style={{marginTop: '10px'}}>
          <a 
            href={agenda.link_dokumentasi} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Lihat Dokumentasi (Instagram)
          </a>
        </div>
      )}
    </div>
  );
}

export default AgendaItem;