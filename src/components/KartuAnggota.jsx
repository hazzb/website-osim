// src/components/KartuAnggota.jsx

import React from 'react';

/*
* Dokumentasi Komponen 'KartuAnggota':
* Komponen ini menerima 'props' (properti) dari 'parent'-nya.
* - 'nama': Nama anggota
* - 'jabatan': Jabatan anggota
* - 'fotoUrl': Link ke foto
*/
function KartuAnggota({ nama, jabatan, fotoUrl }) {
  // Kita bisa tambahkan styling di sini nanti
  const cardStyle = {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '16px',
    margin: '10px',
    width: '200px',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const imgStyle = {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    objectFit: 'cover'
  };

  return (
    <div style={cardStyle}>
      <img 
        src={fotoUrl || 'https://via.placeholder.com/100'} // '||' berarti jika fotoUrl tidak ada, pakai placeholder
        alt={`Foto ${nama}`} 
        style={imgStyle} 
      />
      <h3>{nama}</h3>
      <p>{jabatan}</p>
    </div>
  );
}

export default KartuAnggota;