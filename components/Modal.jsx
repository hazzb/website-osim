"use client";

import React, { useEffect } from "react";

function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "500px",
  closeOnOverlayClick = false,
}) {
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

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      if (closeOnOverlayClick) {
        onClose();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[1000] animate-fadeIn"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-bg-card rounded-xl shadow-2xl w-full overflow-hidden animate-scaleIn"
        style={{ maxWidth: maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-border-dim bg-bg-page">
          <h3 className="text-lg font-bold text-text-main m-0">{title}</h3>
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-body hover:bg-border-dim transition-all text-2xl leading-none border-0 bg-transparent cursor-pointer"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
