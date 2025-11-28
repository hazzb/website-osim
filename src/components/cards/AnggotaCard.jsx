import React from "react";
import styles from "./AnggotaCard.module.css";
import HoverCard from "../ui/HoverCard.jsx";
import { FiEdit, FiTrash2, FiMapPin, FiInstagram } from "react-icons/fi";

const AnggotaCard = ({ data, isAdmin, onEdit, onDelete }) => {
  const genderClass =
    data.jenis_kelamin === "Akhwat"
      ? styles["card-akhwat"]
      : styles["card-ikhwan"];

  return (
    <HoverCard className={genderClass}>
      <div
        style={{
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <img
          src={
            data.foto_url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              data.nama
            )}&background=random&color=fff`
          }
          alt={data.nama}
          className={styles["anggota-card-image"]}
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />

        <div className={styles["anggota-card-content"]}>
          <div className={styles["anggota-card-nama"]}>{data.nama}</div>

          {/* PERBAIKAN 1: Baca dari jabatan_di_divisi */}
          <div className={styles["anggota-card-jabatan"]}>
            {data.jabatan_di_divisi || "Anggota"}
          </div>

          {data.alamat && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                fontSize: "0.8rem",
                color: "#4a5568",
                marginBottom: "0.5rem",
                fontWeight: "600",
              }}
            >
              <FiMapPin />
              <span>{data.alamat}</span>
            </div>
          )}

          {data.motto && (
            <div className={styles["anggota-card-info"]}>"{data.motto}"</div>
          )}

          {/* PERBAIKAN 2: Baca dari instagram_username */}
          {data.instagram_username && (
            <a
              href={`https://instagram.com/${data.instagram_username.replace(
                "@",
                ""
              )}`}
              target="_blank"
              rel="noreferrer"
              className={styles["instagram-link"]}
              style={{
                marginTop: "auto",
                paddingTop: "0.8rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
              }}
            >
              <FiInstagram /> @{data.instagram_username.replace("@", "")}
            </a>
          )}
        </div>

        {isAdmin && (
          <div className={styles["admin-card-actions"]}>
            <button
              onClick={() => onEdit(data)}
              className={`${styles["btn-card-action"]} ${styles["btn-edit"]}`}
            >
              <FiEdit /> Edit
            </button>
            <button
              onClick={() => onDelete(data.id)}
              className={`${styles["btn-card-action"]} ${styles["btn-delete"]}`}
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
