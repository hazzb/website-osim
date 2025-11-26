import React from "react";
import { Link } from "react-router-dom";
import styles from "./ProgramKerjaCard.module.css";

// ICONS
import {
  FiCalendar,
  FiBriefcase,
  FiUser,
  FiArrowRight,
  FiEdit,
  FiTrash2,
} from "react-icons/fi";
import HoverCard from "../ui/HoverCard";

const ProgramKerjaCard = ({ data, isAdmin, onEdit, onDelete }) => {
  // Helper: Menentukan warna badge
  const getStatusClass = (status) => {
    if (status === "Selesai") return styles["status-selesai"];
    if (status === "Akan Datang") return styles["status-akan-datang"];
    return styles["status-rencana"]; // Default: Rencana
  };

  // Helper: Format Tanggal Indonesia
  const formatDate = (dateString) => {
    if (!dateString) return "Jadwal belum ditentukan";
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <HoverCard className={styles.cardOverride}>
      {/* 1. MEDIA SECTION (Jika ada Embed Instagram) */}
      {data.embed_html && (
        <div className={styles.mediaContainer}>
          <div
            className={styles.embedWrapper}
            dangerouslySetInnerHTML={{ __html: data.embed_html }}
          />
          {/* Overlay agar kartu bisa diklik link detail-nya, bukan play video instagram */}
          <Link
            to={`/program-kerja/${data.id}`}
            className={styles.mediaOverlay}
          />
        </div>
      )}

      <div className={styles.cardBody}>
        {/* 2. HEADER (Badges) */}
        <div className={styles.cardHeader}>
          <span
            className={`${styles.statusBadge} ${getStatusClass(data.status)}`}
          >
            {data.status}
          </span>

          {/* Badge Hidden (Admin Only) */}
          {isAdmin && data.tampilkan_di_publik === false && (
            <span className={styles.hiddenBadge}>Hidden</span>
          )}
        </div>

        {/* 3. TITLE */}
        <h3 className={styles.cardTitle}>
          <Link to={`/program-kerja/${data.id}`}>{data.nama_acara}</Link>
        </h3>

        {/* 4. META INFO */}
        <div className={styles.metaList}>
          {/* Tanggal */}
          <div className={styles.metaItem}>
            <FiCalendar className={styles.metaIcon} />
            <span>{formatDate(data.tanggal)}</span>
          </div>

          {/* Divisi */}
          <div className={styles.metaItem}>
            <FiBriefcase className={styles.metaIcon} />
            <span>{data.nama_divisi || data.divisi?.nama_divisi || "-"}</span>
          </div>

          {/* PJ */}
          <div className={styles.metaItem}>
            <FiUser className={styles.metaIcon} />
            <span className={styles.textPj}>
              PJ: {data.nama_penanggung_jawab || data.anggota?.nama || "-"}
            </span>
          </div>
        </div>

        {/* 5. DESCRIPTION */}
        <p className={styles.cardDesc}>
          {data.deskripsi || "Tidak ada deskripsi singkat."}
        </p>

        {/* 6. FOOTER (Action Buttons) */}
        <div className={styles.cardFooter}>
          {/* Link Detail */}
          <Link to={`/program-kerja/${data.id}`} className={styles.btnDetail}>
            Detail <FiArrowRight />
          </Link>

          {/* Admin Actions */}
          {isAdmin && (
            <div className={styles.adminActions}>
              <button
                onClick={() => onEdit && onEdit(data)}
                className={styles.btnIcon}
                title="Edit"
              >
                <FiEdit />
              </button>
              <button
                onClick={() => onDelete && onDelete(data.id)}
                className={`${styles.btnIcon} ${styles.btnDelete}`}
                title="Hapus"
              >
                <FiTrash2 />
              </button>
            </div>
          )}
        </div>
      </div>
    </HoverCard>
  );
};

export default ProgramKerjaCard;
