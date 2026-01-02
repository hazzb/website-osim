import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiCalendar,
  FiUser,
  FiExternalLink,
  FiEdit,
  FiTrash2,
  FiInfo,
} from "react-icons/fi";
import DOMPurify from "dompurify";
import styles from "./ProgramKerjaCard.module.css"; // Import Module CSS

const sanitizeConfig = {
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
};

const ProgramKerjaCard = ({ data, isAdmin, onEdit, onDelete }) => {
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

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = { day: "numeric", month: "long", year: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Selesai":
        return styles.statusSelesai;
      case "Akan Datang":
        return styles.statusAkanDatang;
      case "Batal":
        return styles.statusBatal;
      default:
        return styles.statusDefault;
    }
  };

  const createMarkup = (htmlContent) => {
    const cleanHTML = DOMPurify.sanitize(htmlContent, sanitizeConfig);
    const responsiveHTML = cleanHTML
      .replace(/<iframe\s+width="\d+"/g, '<iframe width="100%"')
      .replace(/<iframe([^>]+)height="\d+"/g, '<iframe$1height="100%"');
    return { __html: responsiveHTML };
  };

  const isInstagram = data.embed_html && data.embed_html.includes("instagram");

  return (
    <div className={styles.card}>
      {/* 1. EMBED HTML */}
      {data.embed_html && (
        <div
          className={styles.embedWrapper}
          style={{
            aspectRatio: isInstagram ? "auto" : "16/9",
            minHeight: isInstagram ? "300px" : "auto",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
            }}
            dangerouslySetInnerHTML={createMarkup(data.embed_html)}
          />
        </div>
      )}

      {/* WRAPPER KONTEN */}
      <div
        className={`${styles.content} ${
          data.embed_html ? styles.contentCompact : ""
        }`}
      >
        {/* HEADER: Tanggal & Status */}
        <div className={styles.header}>
          <div className={styles.date}>
            <FiCalendar /> {formatDate(data.tanggal)}
          </div>
          <span
            className={`${styles.statusBadge} ${getStatusClass(data.status)}`}
          >
            {data.status}
          </span>
        </div>

        {/* JUDUL */}
        <Link to={`/program-kerja/${data.id}`} className={styles.titleLink}>
          <h3 className={styles.title}>{data.nama_acara}</h3>
        </Link>

        {/* META: PJ & Divisi */}
        <div className={styles.metaInfo}>
          <div className={styles.metaRow}>
            <FiUser size={14} /> <strong>PJ:</strong> {data.pj?.nama || "-"}
          </div>
          {data.divisi && (
            <div className={styles.metaRow}>
              <span className={styles.divisiDot}>#</span>
              {data.divisi.nama_divisi}
            </div>
          )}
        </div>

        {/* DESKRIPSI */}
        {data.deskripsi && (
          <p className={styles.description}>{data.deskripsi}</p>
        )}

        {/* FOOTER ACTIONS */}
        <div className={styles.footer}>
          <Link to={`/program-kerja/${data.id}`} className={styles.detailBtn}>
            <FiInfo size={16} /> Detail
          </Link>

          {data.link_dokumentasi && (
            <a
              href={data.link_dokumentasi}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.docLink}
            >
              <FiExternalLink size={16} />
            </a>
          )}
        </div>
      </div>

      {/* ADMIN ACTIONS */}
      {isAdmin && (
        <div className={styles.adminActions}>
          <button
            onClick={onEdit}
            className={`${styles.adminBtn} ${styles.editBtn}`}
            title="Edit Program"
          >
            <FiEdit />
          </button>
          <button
            onClick={onDelete}
            className={`${styles.adminBtn} ${styles.deleteBtn}`}
            title="Hapus Program"
          >
            <FiTrash2 />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProgramKerjaCard;
