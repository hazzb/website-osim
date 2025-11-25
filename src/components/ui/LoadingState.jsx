// src/components/ui/LoadingState.jsx
import React from "react";
import { FiLoader } from "react-icons/fi";

const LoadingState = ({ message = "Sedang memuat data..." }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "300px" /* Tinggi minimal agar layout tidak 'gepeng' */,
        color: "#94a3b8" /* Warna abu-abu soft */,
        gap: "1rem",
        width: "100%",
      }}
    >
      {/* Ikon Spinner */}
      <FiLoader size={32} style={{ animation: "spin 1s linear infinite" }} />

      {/* Teks Pesan */}
      <span style={{ fontSize: "0.95rem", fontWeight: 500 }}>{message}</span>

      {/* Style Animasi Putar (Inject langsung agar praktis) */}
      <style>{`
        @keyframes spin { 
          from { transform: rotate(0deg); } 
          to { transform: rotate(360deg); } 
        }
      `}</style>
    </div>
  );
};

export default LoadingState;
