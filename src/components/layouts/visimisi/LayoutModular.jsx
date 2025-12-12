import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import styles from "./LayoutModular.module.css";

const LayoutModular = ({ data, isAdmin, onEdit, onDelete }) => {
  return (
    <div className={styles.grid}>
      {data.map((item) => (
        <div key={item.id} className={styles.card}>
          {/* LOGIC: Hanya render wrapper jika gambar ada */}
          {item.image_url && (
            <div className={styles.cardImageWrapper}>
              <img
                src={item.image_url}
                alt={item.judul}
                className={styles.cardImage}
              />
            </div>
          )}

          <div className={styles.cardBody}>
            <h3 className={styles.cardTitle}>{item.judul}</h3>

            <div className={styles.cardContent}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {item.isi}
              </ReactMarkdown>
            </div>
          </div>

          {isAdmin && (
            <div className={styles.cardActions}>
              <button
                onClick={() => onEdit(item)}
                className={styles.actionBtn}
                title="Edit Konten"
              >
                <FiEdit /> Edit
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                title="Hapus Konten"
              >
                <FiTrash2 /> Hapus
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default LayoutModular;
