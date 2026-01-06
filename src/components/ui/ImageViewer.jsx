import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import styles from "./ImageViewer.module.css";

const ImageViewer = ({ isOpen, onClose, src, alt, caption }) => {
  // Tutup jika tekan tombol ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !src) return null;

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <FiX size={24} />
        </button>
        <img src={src} alt={alt || "Image"} className={styles.image} />
        {caption && <div className={styles.caption}>{caption}</div>}
      </div>
    </div>,
    document.body
  );
};

export default ImageViewer;
