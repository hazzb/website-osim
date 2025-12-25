import React from "react";
import { FiEdit, FiTrash2, FiUser, FiInstagram, FiMapPin } from "react-icons/fi"; // Tambah FiMapPin
import styles from "./AnggotaCard.module.css";

const AnggotaCard = ({ data, isAdmin, onEdit, onDelete, showPeriode }) => {
  
  const genderClass = data.jenis_kelamin === "Akhwat" ? styles.cardAkhwat : styles.cardIkhwan;

  const renderImage = () => {
    if (data.foto_url) {
      return <img src={data.foto_url} alt={data.nama} className={styles.cardImage} />;
    }
    return (
      <div className={styles.imagePlaceholder}>
        <FiUser size={36} />
      </div>
    );
  };

  return (
    <div className={`${styles.card} ${genderClass}`}>
      
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

        {/* MOTTO (Tetap Ada) */}
        {data.motto && <p className={styles.motto}>"{data.motto}"</p>}

        {/* ALAMAT (DIKEMBALIKAN) */}
        {data.alamat && (
          <div style={{fontSize: '0.7rem', color: '#64748b', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', textAlign: 'center', lineHeight: '1.2'}}>
             <FiMapPin size={10} style={{flexShrink:0}} /> {data.alamat}
          </div>
        )}

        {/* SOCIAL MEDIA */}
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
  );
};

export default AnggotaCard;