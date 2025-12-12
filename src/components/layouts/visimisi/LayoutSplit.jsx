import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import styles from "./LayoutSplit.module.css";

const LayoutSplit = ({ data, isAdmin, onEdit, onDelete }) => {
  return (
    <div className={styles.container}>
      {data.map((item) => (
        <div key={item.id} className={styles.card}>
          {/* Bagian Gambar (Hanya tampil jika ada) */}
          {item.image_url && (
            <div className={styles.imageSection}>
              <img
                src={item.image_url}
                alt={item.judul}
                className={styles.image}
              />
            </div>
          )}

          {/* Bagian Konten (Sekarang polos tanpa border warna) */}
          <div className={styles.contentSection}>
            <h3 className={styles.title}>{item.judul}</h3>

            <div className={styles.bodyContent}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {item.isi}
              </ReactMarkdown>
            </div>

            {isAdmin && (
              <div className={styles.actions}>
                <button
                  onClick={() => onEdit(item)}
                  className={styles.actionBtn}
                >
                  <FiEdit size={14} /> Edit
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className={`${styles.actionBtn} ${styles.deleteBtn}`}
                >
                  <FiTrash2 size={14} /> Hapus
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LayoutSplit;
