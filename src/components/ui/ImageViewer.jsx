import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";

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
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative max-w-6xl max-h-[90vh] bg-slate-900 rounded-lg overflow-hidden shadow-2xl animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-all z-10 border-0 cursor-pointer"
          onClick={onClose}
        >
          <FiX size={24} />
        </button>
        <img
          src={src}
          alt={alt || "Image"}
          className="max-w-full max-h-[85vh] w-auto h-auto object-contain"
        />
        {caption && (
          <div className="bg-slate-800 text-white px-6 py-3 text-sm text-center">
            {caption}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default ImageViewer;
