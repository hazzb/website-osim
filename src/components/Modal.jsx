import React, { useEffect } from "react";
import styles from "./Modal.module.css";
// Jika Anda menggunakan react-icons, ganti &times; dengan icon agar lebih rapi
// import { FiX } from "react-icons/fi";

function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "500px", // Default lebar
  closeOnOverlayClick = false, // Default FALSE agar aman (tidak nutup sendiri)
}) {
  // 1. KUNCI SCROLL BODY SAAT MODAL BUKA
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // 2. HANDLER KLIK OVERLAY (Hanya tutup jika diizinkan)
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      if (closeOnOverlayClick) {
        onClose();
      }
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      style={{ zIndex: 1000 }} // Pastikan di atas elemen lain
    >
      {/* 3. STOP PROPAGATION AGAR KLIK DI DALAM TIDAK TEMBUS KELUAR */}
      <div
        className={styles.modal}
        style={{ maxWidth: maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
          >
            &times; {/* Atau gunakan <FiX /> jika pakai react-icons */}
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}

export default Modal;
