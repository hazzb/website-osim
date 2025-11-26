import React from "react";
import styles from "./AnggotaCard.module.css";
// Import Ikon Baru
import { FiEdit, FiTrash2, FiInstagram } from "react-icons/fi";
import HoverCard from "../ui/HoverCard";

const AnggotaCard = ({ data, isAdmin, onEdit, onDelete }) => {
  const handleEditClick = () => {
    if (onEdit) onEdit(data);
  };

  const handleDeleteClick = () => {
    if (onDelete) onDelete(data.id);
  };

  return (
    <HoverCard
      className={`${styles.cardOverride} ${
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
            <FiInstagram /> @{data.instagram_username.replace("@", "")}
          </a>
        )}

        {/* --- ADMIN ACTIONS --- */}
        {isAdmin && (
          <div className={styles["admin-card-actions"]}>
            <button
              onClick={handleEditClick}
              className={`${styles["btn-card-action"]} ${styles["btn-edit"]}`}
              title="Edit Anggota"
            >
              <FiEdit /> Edit
            </button>
            <button
              onClick={handleDeleteClick}
              className={`${styles["btn-card-action"]} ${styles["btn-delete"]}`}
              title="Hapus Anggota"
            >
              <FiTrash2 /> Hapus
            </button>
          </div>
        )}
      </div>
    </HoverCard>
  );
};

export default AnggotaCard;
