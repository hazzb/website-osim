import React, { useState } from "react";
import { createPortal } from "react-dom";
import { FiEdit, FiTrash2, FiInstagram, FiMapPin, FiX } from "react-icons/fi";
import styles from "./AnggotaCard.module.css";

const AnggotaCard = ({
  data,
  isAdmin,
  onEdit,
  onDelete,
  showPeriode,
  layout = "aesthetic",
}) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const isCompact = layout === "compact";
  const layoutClass = isCompact ? styles.layoutCompact : styles.layoutAesthetic;

  const genderKey = data.jenis_kelamin === "Akhwat" ? "Akhwat" : "Ikhwan";
  const colorClass = isCompact
    ? styles[`compact${genderKey}`]
    : styles[`aesthetic${genderKey}`];

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  };

  const openLightbox = (e) => {
    e.stopPropagation();
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
          onClick={openLightbox}
          title="Klik untuk zoom"
        />
      );
    }
    return (
      <div className={styles.imagePlaceholder}>
        <span className={styles.initials}>{getInitials(data.nama)}</span>
      </div>
    );
  };

  return (
    <>
      <div className={`${styles.card} ${layoutClass} ${colorClass}`}>
        {/* Badge Periode (Tetap di pojok kiri atas) */}
        {showPeriode && data.periode_jabatan?.nama_kabinet && (
          <div className={styles.periodeBadge}>
            {data.periode_jabatan.nama_kabinet}
          </div>
        )}

        {/* --- WRAPPER FOTO & TOMBOL (Media Section) --- */}
        <div className={styles.mediaSection}>
          {/* Foto */}
          <div className={styles.imageWrapper}>{renderImage()}</div>

          {/* Tombol Aksi (Tepat di bawah foto) */}
          {isAdmin && (
            <div className={styles.adminActions}>
              <button
                onClick={() => onEdit(data)}
                className={styles.actionBtn}
                title="Edit"
              >
                <FiEdit size={14} />
              </button>
              <button
                onClick={() => onDelete(data.id)}
                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                title="Hapus"
              >
                <FiTrash2 size={14} />
              </button>
            </div>
          )}
        </div>

        {/* --- KONTEN TEKS --- */}
        <div className={styles.cardContent}>
          <h3 className={styles.name} title={data.nama}>
            {data.nama}
          </h3>

          <div className={styles.jabatan}>
            <span>{data.master_jabatan?.nama_jabatan || "Anggota"}</span>
            {data.jabatan_di_divisi && (
              <span className={styles.subJabatan}>
                {data.jabatan_di_divisi}
              </span>
            )}
          </div>

          <div className={styles.divider}></div>

          <div className={styles.infoGroup}>
            {data.alamat && (
              <div className={styles.alamatRow}>
                <FiMapPin
                  size={12}
                  style={{ marginTop: "2px", flexShrink: 0 }}
                />{" "}
                <span>{data.alamat}</span>
              </div>
            )}
            {data.motto && <p className={styles.motto}>"{data.motto}"</p>}
          </div>

          {data.instagram_username && (
            <a
              href={`https://instagram.com/${data.instagram_username.replace(
                "@",
                ""
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              <FiInstagram size={12} /> @
              {data.instagram_username.replace("@", "")}
            </a>
          )}
        </div>
      </div>

      {/* Lightbox Portal */}
      {isLightboxOpen &&
        data.foto_url &&
        createPortal(
          <div className={styles.lightboxOverlay} onClick={closeLightbox}>
            <div
              className={styles.lightboxContent}
              onClick={(e) => e.stopPropagation()}
            >
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
