// src/components/layouts/visimisi/LayoutModular.jsx
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import styles from "./LayoutModular.module.css"; // Pastikan path benar

const LayoutModular = ({ data, isAdmin, onEdit, onDelete }) => {
  return (
    <div className={styles.modularGrid}>
      {data.map((item) => (
        <div key={item.id} className={styles.card}>
          {/* --- TAMPILKAN GAMBAR JIKA ADA --- */}
          {item.image_url && (
            <div
              className={styles.cardImageWrapper}
              style={{
                height: "180px",
                overflow: "hidden",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <img
                src={item.image_url}
                alt={item.judul}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          )}
          {/* ---------------------------------- */}

          <div className={styles.cardBody} style={{ padding: "1.5rem" }}>
            <h3 className={styles.cardTitle}>{item.judul}</h3>
            <div className={styles.cardContent}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {item.isi}
              </ReactMarkdown>
            </div>
          </div>

          {isAdmin && (
            <div className={styles.cardActions}>
              <button onClick={() => onEdit(item)} className={styles.actionBtn}>
                <FiEdit />
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className={`${styles.actionBtn} ${styles.deleteBtn}`}
              >
                <FiTrash2 />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default LayoutModular;
