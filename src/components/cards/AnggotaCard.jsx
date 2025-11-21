// src/components/cards/AnggotaCard.jsx
import React from "react";
import styles from "./AnggotaCard.module.css";

const AnggotaCard = ({ data, isAdmin, onEdit, onDelete }) => {
  // Fallback jika onEdit/onDelete lupa dikirim dari parent, agar tidak crash
  const handleEditClick = () => {
    if (onEdit) onEdit(data);
    else console.warn("Fungsi onEdit belum dipasang di parent component");
  };

  const handleDeleteClick = () => {
    if (onDelete) onDelete(data.id);
    else console.warn("Fungsi onDelete belum dipasang di parent component");
  };

  return (
    <div
      className={`${styles.card} ${
        data.jenis_kelamin === "Akhwat"
          ? styles["card-akhwat"]
          : styles["card-ikhwan"]
      }`}
    >
      {/* Foto Profil */}
      <img
        src={data.foto_url || "https://via.placeholder.com/150?text=No+Foto"}
        alt={data.nama}
        className={styles["anggota-card-image"]}
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/150?text=Error";
        }}
      />

      <div className={styles["anggota-card-content"]}>
        <h3 className={styles["anggota-card-nama"]}>{data.nama}</h3>
        <p className={styles["anggota-card-jabatan"]}>
          {data.jabatan_di_divisi || "Anggota"}
        </p>

        {data.motto && (
          <div className={styles["anggota-card-info"]}>
            <p>"{data.motto}"</p>
          </div>
        )}

        {data.instagram_username && (
          <a
            href={`https://instagram.com/${data.instagram_username.replace(
              "@",
              ""
            )}`}
            target="_blank"
            rel="noreferrer"
            className={styles["instagram-link"]}
          >
            @{data.instagram_username.replace("@", "")}
          </a>
        )}

        {/* --- BAGIAN INI YANG MEMBUATNYA DEFAULT --- */}
        {/* Tombol hanya muncul jika isAdmin = true */}
        {isAdmin && (
          <div className={styles["admin-card-actions"]}>
            <button
              onClick={handleEditClick}
              className={`${styles["btn-card-action"]} ${styles["btn-edit"]}`}
              title="Edit Anggota"
            >
              ✏️ Edit
            </button>
            <button
              onClick={handleDeleteClick}
              className={`${styles["btn-card-action"]} ${styles["btn-delete"]}`}
              title="Hapus Anggota"
            >
              🗑️ Hapus
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnggotaCard;
