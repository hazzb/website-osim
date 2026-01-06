import React, { useState } from "react";
import { FiEdit, FiTrash2, FiInstagram, FiMapPin } from "react-icons/fi";
import styles from "./AnggotaCard.module.css";
import ImageViewer from "../ui/ImageViewer.jsx";

const AnggotaCard = ({
  data,
  isAdmin,
  onEdit,
  onDelete,
  showPeriode,
  layout = "aesthetic",
}) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // --- Layout Logic ---
  const isCompact = layout === "compact";
  const layoutClass = isCompact ? styles.layoutCompact : styles.layoutAesthetic;

  // GENDER BACKGROUND LOGIC
  const genderKey = data.jenis_kelamin === "Akhwat" ? "Akhwat" : "Ikhwan";
  const colorClass = styles[`bg${genderKey}`]; // Menggunakan bgIkhwan / bgAkhwat

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

  return (
    <>
      <div className={`${styles.card} ${layoutClass} ${colorClass}`}>
        {/* IMAGE CONTAINER */}
        <div
          className={styles.imageContainer}
          onClick={openLightbox}
          style={{ cursor: data.foto_url ? "zoom-in" : "default" }}
        >
          {data.foto_url ? (
            <img
              src={data.foto_url}
              alt={data.nama}
              className={styles.image}
              loading="lazy"
            />
          ) : (
            <div className={styles.imagePlaceholder}>
              <span className={styles.initials}>{getInitials(data.nama)}</span>
            </div>
          )}

          {/* Admin Actions */}
          {isAdmin && (
            <div className={styles.cardActions}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className={styles.actionBtn}
                title="Edit"
              >
                <FiEdit size={14} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                title="Hapus"
              >
                <FiTrash2 size={14} />
              </button>
            </div>
          )}
        </div>

        {/* INFO CONTAINER */}
        <div className={styles.info}>
          <div className={styles.mainInfo}>
            <h3 className={styles.nama}>{data.nama}</h3>

            <div className={styles.roleWrapper}>
              <span className={styles.role}>
                {data.jabatan_di_divisi ||
                  data.master_jabatan?.nama_jabatan ||
                  "Anggota"}
              </span>
              {data.divisi?.nama_divisi && (
                <span className={styles.divisiTag}>
                  {data.divisi.nama_divisi}
                </span>
              )}
            </div>

            {/* Motto (Fleksibel Height) */}
            {data.motto && <p className={styles.motto}>"{data.motto}"</p>}
          </div>

          <div className={styles.metaInfo}>
            {/* 1. ALAMAT (Sekarang di ATAS) */}
            {data.alamat && (
              <span className={styles.location}>
                <FiMapPin size={14} /> {data.alamat}
              </span>
            )}

            {/* 2. INSTAGRAM (Sekarang di BAWAH) */}
            {data.instagram_username && (
              <a
                href={`https://instagram.com/${data.instagram_username.replace(
                  "@",
                  ""
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                onClick={(e) => e.stopPropagation()}
              >
                <FiInstagram size={14} />@
                {data.instagram_username.replace("@", "")}
              </a>
            )}
          </div>
        </div>
      </div>

      <ImageViewer
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        src={data.foto_url}
        alt={data.nama}
        caption={`${data.nama} - ${
          data.master_jabatan?.nama_jabatan || "Anggota"
        }`}
      />
    </>
  );
};

export default AnggotaCard;
