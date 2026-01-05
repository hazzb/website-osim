import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiCalendar,
  FiUser,
  FiExternalLink,
  FiEdit,
  FiTrash2,
  FiInfo,
  FiUsers,
  FiArrowRight,
} from "react-icons/fi";
import DOMPurify from "dompurify";
import styles from "./ProgramKerjaCard.module.css";

const ProgramKerjaCard = ({ data, isAdmin, onEdit, onDelete }) => {
  const gender = data.target_gender || "Semua";
  const bgClassKey = `bg${gender}`;
  const textClassKey = `text${gender}`;

  const formattedDate = data.tanggal ? (
    new Date(data.tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  ) : (
    <i>Waktu Tidak ditentukan</i>
  );

  const isSelesai = data.status === "Selesai";

  useEffect(() => {
    if (data.embed_html && data.embed_html.includes("instagram")) {
      if (!window.instgrm) {
        const script = document.createElement("script");
        script.src = "//www.instagram.com/embed.js";
        script.async = true;
        document.body.appendChild(script);
      } else {
        window.instgrm.Embeds.process();
      }
    }
  }, [data.embed_html]);

  return (
    <div className={`${styles.card} ${styles[bgClassKey]}`}>
      {/* Embed (Video/IG) */}
      {data.embed_html && (
        <div className={styles.embedWrapper}>
          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(data.embed_html, {
                ADD_TAGS: ["iframe", "blockquote", "script"],
                ADD_ATTR: [
                  "allow",
                  "allowfullscreen",
                  "frameborder",
                  "scrolling",
                  "src",
                  "width",
                  "height",
                  "class",
                  "data-instgrm-permalink",
                  "data-instgrm-version",
                ],
              }),
            }}
          />
        </div>
      )}

      {/* Konten Utama */}
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.headerGroup}>
          <h3 className={styles.title}>{data.nama_acara}</h3>
          <span
            className={`${styles.statusBadge} ${
              isSelesai ? styles.statusSelesai : styles.statusRencana
            }`}
          >
            {data.status}
          </span>
        </div>

        {/* Info Meta */}
        <div className={styles.metaInfo}>
          <div className={styles.metaRow}>
            <span className={`${styles.genderBadge} ${styles[textClassKey]}`}>
              <FiUsers size={12} /> {gender}
            </span>
            {data.nama_divisi && (
              <>
                <span className={styles.divisiDot}>•</span>
                <span style={{ fontWeight: 600 }}>{data.nama_divisi}</span>
              </>
            )}
          </div>

          <div className={styles.metaRow}>
            <FiCalendar size={14} className={styles[textClassKey]} />
            <span>{formattedDate}</span>
          </div>

          <div className={styles.metaRow}>
            <FiUser size={14} className={styles[textClassKey]} />
            <span>{data.pj?.nama || "PJ Tidak Ada"}</span>
          </div>
        </div>

        {data.deskripsi && (
          <p className={styles.description}>{data.deskripsi}</p>
        )}

        {/* FOOTER: Gabungan Admin Actions & Public Links */}
        <div className={styles.footer}>
          {/* KIRI: Admin Actions (Edit/Delete) */}
          <div className={styles.adminActions}>
            {isAdmin ? (
              <>
                <button
                  onClick={onEdit}
                  className={`${styles.adminBtn} ${styles.editBtn}`}
                  title="Edit"
                >
                  <FiEdit size={14} />
                </button>
                <button
                  onClick={onDelete}
                  className={`${styles.adminBtn} ${styles.deleteBtn}`}
                  title="Hapus"
                >
                  <FiTrash2 size={14} />
                </button>
              </>
            ) : (
              // Spacer kosong jika bukan admin agar layout tetap rapi
              <div />
            )}
          </div>

          {/* KANAN: Public Links (Link/Detail) */}
          <div className={styles.rightActions}>
            {data.link_dokumentasi && (
              <a
                href={data.link_dokumentasi}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.linkButton}
                title="Lihat Dokumentasi"
              >
                <FiExternalLink size={16} />
              </a>
            )}

            <Link
              to={`/program-kerja/${data.id}`}
              className={styles.actionButton}
            >
              Detail <FiArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramKerjaCard;
