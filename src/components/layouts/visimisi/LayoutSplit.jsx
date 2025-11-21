import React from "react";
import styles from "./LayoutSplit.module.css"; // Import CSS Lokal

const LayoutSplit = ({ data, isAdmin, onEdit, onDelete }) => {
  return (
    <div className={styles.grid}>
      {data.map((item) => (
        <div key={item.id} className={styles.card}>
          <div>
            <h2 className={styles.cardTitle}>{item.judul}</h2>
          </div>
          <div className={styles.cardBody}>
            {item.isi.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>

          {isAdmin && (
            <div className={styles.adminAbsolute}>
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
      ))}
    </div>
  );
};

export default LayoutSplit;
