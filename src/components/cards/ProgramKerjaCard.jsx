import React from "react";
import { Link } from "react-router-dom";
import styles from "./ProgramKerjaCard.module.css";

const ProgramKerjaCard = ({ data, isAdmin, onEdit, onDelete }) => {
  // Helper: Menentukan warna badge berdasarkan status
  const getStatusClass = (status) => {
    if (status === "Selesai") return styles["status-selesai"];
    if (status === "Akan Datang") return styles["status-akan-datang"];
    return styles["status-rencana"];
  };

  // Helper: Format Tanggal Indonesia
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className={styles.card}>
      {/* 1. MEDIA SECTION (Hanya muncul jika ada embed html) */}
      {data.embed_html && (
        <div className={styles.mediaContainer}>
          <div
            className={styles.embedWrapper}
            dangerouslySetInnerHTML={{ __html: data.embed_html }}
          />
        </div>
      )}

      <div className={styles.cardBody}>
        {/* 2. HEADER (Status Badge & Hidden Indicator) */}
        <div className={styles.cardHeader}>
          <span
            className={`${styles.statusBadge} ${getStatusClass(data.status)}`}
          >
            {data.status}
          </span>
          {/* Indikator khusus Admin jika post disembunyikan */}
          {isAdmin && data.tampilkan_di_publik === false && (
            <span className={styles.hiddenBadge}>🔒 Hidden</span>
          )}
        </div>

        {/* 3. TITLE */}
        <h3 className={styles.cardTitle}>{data.nama_acara}</h3>

        {/* 4. META INFO (Tanggal, Divisi, PJ) */}
        <div className={styles.cardMeta}>
          <div className={styles.metaItem}>
            <span>🗓️</span>
            <span>{formatDate(data.tanggal)}</span>
          </div>
          <div className={styles.metaItem}>
            <span>🏢</span>
            <span>{data.nama_divisi || data.divisi?.nama_divisi || "-"}</span>
          </div>
          <div className={styles.metaItem}>
            <span>👤</span>
            <span className={styles.textPj}>
              {data.nama_penanggung_jawab || data.anggota?.nama || "-"}
            </span>
          </div>
        </div>

        {/* 5. DESCRIPTION (Dibatasi 3 baris) */}
        <p className={styles.cardDesc}>
          {data.deskripsi || "Tidak ada deskripsi."}
        </p>

        {/* 6. FOOTER LINK */}
        <Link to={`/program-kerja/${data.id}`} className={styles.btnDetail}>
          Lihat Detail &rarr;
        </Link>

        {/* 7. ADMIN ACTIONS (Hanya muncul jika login) */}
        {isAdmin && (
          <div className={styles.adminActions}>
            <button
              onClick={() => onEdit && onEdit(data)}
              className={`${styles.btnAction} ${styles.btnEdit}`}
              title="Edit Program"
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => onDelete && onDelete(data.id)}
              className={`${styles.btnAction} ${styles.btnDelete}`}
              title="Hapus Program"
            >
              🗑️ Hapus
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramKerjaCard;
