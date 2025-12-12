import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import styles from "./LayoutZigZag.module.css";

const LayoutZigZag = ({ data, isAdmin, onEdit, onDelete }) => {
  return (
    <div className={styles.container}>
      {data.map((item) => (
        <div key={item.id} className={styles.row}>
          {/* LOGIC GAMBAR */}
          {item.image_url && (
            <div className={styles.imageWrapper}>
              <img
                src={item.image_url}
                alt={item.judul}
                className={styles.image}
              />
            </div>
          )}

          {/* LOGIC CONTENT */}
          {/* Jika tidak ada gambar, tambahkan class fullWidth agar teks di tengah */}
          <div
            className={`${styles.contentWrapper} ${
              !item.image_url ? styles.fullWidth : ""
            }`}
          >
            <h2 className={styles.title}>{item.judul}</h2>

            <div className={styles.bodyContent}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {item.isi}
              </ReactMarkdown>
            </div>

            {isAdmin && (
              <div className={styles.adminControls}>
                <button onClick={() => onEdit(item)} className={styles.textBtn}>
                  <FiEdit /> Edit
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className={`${styles.textBtn} ${styles.deleteBtn}`}
                >
                  <FiTrash2 /> Hapus
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LayoutZigZag;
