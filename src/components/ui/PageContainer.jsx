import React from "react";
import Breadcrumbs from "../Breadcrumbs.jsx"; // Pastikan path import benar

const PageContainer = ({ children, breadcrumbText, className = "" }) => {
  return (
    // Wrapper Utama: Mengatur agar konten selalu di tengah (max 1200px)
    <div
      className={className}
      style={{
        maxWidth: "1200px",
        margin: "0 auto" /* Tengah horizontal */,
        padding: "0 1.5rem" /* Padding kiri kanan */,
        width: "100%",
        minHeight:
          "80vh" /* Minimal tinggi agar footer tidak naik (opsional) */,
        boxSizing: "border-box",
      }}
    >
      {/* Area Breadcrumb Otomatis */}
      <div style={{ marginTop: "2rem", marginBottom: "1.5rem" }}>
        <Breadcrumbs overrideLastText={breadcrumbText} />
      </div>

      {/* Area Konten Halaman (Hero, Grid, dll) */}
      <div style={{ paddingBottom: "3rem" }}>{children}</div>
    </div>
  );
};

export default PageContainer;
