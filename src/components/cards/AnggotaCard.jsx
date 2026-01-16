import React from "react";
import styles from "./AnggotaCard.module.css";
import { FiEdit, FiTrash2, FiInstagram, FiMapPin } from "react-icons/fi";

const AnggotaCard = ({
  data,
  layout = "aesthetic",
  isAdmin,
  onEdit,
  onDelete,
}) => {
  // Tentukan styling berdasarkan gender & layout
  const genderClass =
    data.jenis_kelamin === "Akhwat" ? styles.bgAkhwat : styles.bgIkhwan;
  const isCompact = layout === "compact";

  return (
    <div
      className={`${styles.card} ${
        isCompact ? styles.layoutCompact : styles.layoutAesthetic
      } ${genderClass}`}
    >
      {/* ACTION BUTTONS (ADMIN ONLY) */}
      {isAdmin && (
        <div className={styles.cardActions}>
          <button
            className={`${styles.actionBtn} ${styles.editBtn}`}
            onClick={() =>
              onEdit(data)
            } /* <--- PERBAIKAN DI SINI: Kirim 'data' */
            title="Edit Anggota"
          >
            <FiEdit />
          </button>

          {onDelete && (
            <button
              className={`${styles.actionBtn} ${styles.deleteBtn}`}
              onClick={() => onDelete(data.id)}
              title="Hapus Anggota"
            >
              <FiTrash2 />
            </button>
          )}
        </div>
      )}

      {/* IMAGE SECTION */}
      <div className={styles.imageContainer}>
        {data.foto_url ? (
          <img
            src={data.foto_url}
            alt={data.nama}
            className={styles.image}
            loading="lazy"
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span className={styles.initials}>
              {data.nama ? data.nama.charAt(0).toUpperCase() : "?"}
            </span>
          </div>
        )}
      </div>

      {/* INFO SECTION */}
      <div className={styles.info}>
        <div className={styles.mainInfo}>
          <h3 className={styles.nama}>{data.nama}</h3>

          <div className={styles.roleWrapper}>
            <span className={styles.role}>
              {data.jabatan_di_divisi ||
                data.master_jabatan?.nama_jabatan ||
                "Anggota"}
            </span>
            {data.divisi?.nama_divisi && (
              <span className={styles.divisiTag}>
                {data.divisi.nama_divisi}
              </span>
            )}
          </div>

          {data.motto && <p className={styles.motto}>"{data.motto}"</p>}
        </div>

        {/* META INFO (IG & ALAMAT) */}
        <div className={styles.metaInfo}>
          {data.instagram_username && (
            <a
              href={`https://instagram.com/${data.instagram_username.replace(
                "@",
                ""
              )}`}
              target="_blank"
              rel="noreferrer"
              className={styles.socialLink}
              onClick={(e) => e.stopPropagation()}
            >
              <FiInstagram /> {data.instagram_username}
            </a>
          )}

          {data.alamat && (
            <div className={styles.location}>
              <FiMapPin /> {data.alamat}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnggotaCard;
