import React from "react";
import styles from "./LayoutZigZag.module.css"; // Import CSS Lokal

const LayoutZigZag = ({ data, isAdmin, onEdit, onDelete }) => {
  return (
    <div className={styles.grid}>
      {data.map((item) => (
        <div key={item.id} className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>{item.judul}</h2>
            {isAdmin && (
              <div className={styles.adminActions}>
                <button onClick={() => onEdit(item)} className={styles.iconBtn}>
                  ✏️
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className={`${styles.iconBtn} ${styles.deleteBtn}`}
                >
                  🗑️
                </button>
              </div>
            )}
          </div>
          <div className={styles.cardBody}>
            {item.isi.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LayoutZigZag;
