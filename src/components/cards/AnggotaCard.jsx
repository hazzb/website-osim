import React, { useState } from "react";
import { createPortal } from "react-dom"; // IMPORT PENTING: Untuk melempar element ke body
import { FiEdit, FiTrash2, FiUser, FiInstagram, FiMapPin, FiX } from "react-icons/fi";
import styles from "./AnggotaCard.module.css";

const AnggotaCard = ({ data, isAdmin, onEdit, onDelete, showPeriode }) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  
  const genderClass = data.jenis_kelamin === "Akhwat" ? styles.cardAkhwat : styles.cardIkhwan;

  // Fungsi Buka/Tutup
  const openLightbox = (e) => {
    e.stopPropagation(); // Mencegah klik tembus
    if (data.foto_url) setIsLightboxOpen(true);
  };

  const closeLightbox = (e) => {
    e.stopPropagation();
    setIsLightboxOpen(false);
  };

  const renderImage = () => {
    if (data.foto_url) {
      return (
        <img 
          src={data.foto_url} 
          alt={data.nama} 
          className={styles.cardImage} 
          onClick={openLightbox} // Klik foto untuk zoom
          title="Klik untuk memperbesar"
        />
      );
    }
    return (
      <div className={styles.imagePlaceholder}>
        <FiUser size={36} />
      </div>
    );
  };

  return (
    <>
      {/* --- KARTU UTAMA --- */}
      <div className={`${styles.card} ${genderClass}`}>
        
        {/* Badge Periode */}
        {showPeriode && data.periode_jabatan?.nama_kabinet && (
          <div className={styles.periodeBadge}>
            {data.periode_jabatan.nama_kabinet}
          </div>
        )}

        <div className={styles.imageWrapper}>
          {renderImage()}
          
          {isAdmin && (
            <div className={styles.adminOverlay}>
              <button onClick={() => onEdit(data)} className={styles.actionBtn} title="Edit">
                <FiEdit size={14} />
              </button>
              <button onClick={() => onDelete(data.id)} className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Hapus">
                <FiTrash2 size={14} />
              </button>
            </div>
          )}
        </div>

        <div className={styles.cardContent}>
          <h3 className={styles.name} title={data.nama}>
            {data.nama}
          </h3>
          
          <div className={styles.jabatan}>
            <strong>{data.master_jabatan?.nama_jabatan || "Anggota"}</strong>
            {data.jabatan_di_divisi && (
              <span className={styles.subJabatan}>{data.jabatan_di_divisi}</span>
            )}
          </div>

          {data.motto && <p className={styles.motto}>"{data.motto}"</p>}

          {/* Alamat (Optional) */}
          {data.alamat && (
            <div className={styles.alamatRow}>
               <FiMapPin size={10} style={{flexShrink:0}} /> {data.alamat}
            </div>
          )}

          {data.instagram_username && (
            <a
              href={`https://instagram.com/${data.instagram_username.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              <FiInstagram /> @{data.instagram_username.replace("@", "")}
            </a>
          )}
        </div>
      </div>

      {/* --- LIGHTBOX (PORTAL) --- */}
      {/* Ini akan merender Lightbox langsung di <body> agar tidak tertutup apapun */}
      {isLightboxOpen && data.foto_url && createPortal(
        <div className={styles.lightboxOverlay} onClick={closeLightbox}>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            
            <button className={styles.closeButton} onClick={closeLightbox}>
                <FiX size={24} />
            </button>
            
            <img 
              src={data.foto_url} 
              alt={`Zoom ${data.nama}`} 
              className={styles.lightboxImage} 
            />
            
            <div className={styles.lightboxCaption}>
              <h3>{data.nama}</h3>
              <p>{data.master_jabatan?.nama_jabatan || "Anggota"}</p>
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default AnggotaCard;