import React from "react";

// 1. BASE SKELETON (Kotak Abu-abu Berdenyut)
// Ini blok dasar yang bisa dipakai di mana saja
export const Skeleton = ({
  width = "100%",
  height = "20px",
  borderRadius = "4px",
  style = {},
}) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: "#e2e8f0", // Warna abu-abu dasar
        animation: "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        ...style,
      }}
    >
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </div>
  );
};

// 2. PROGJA SKELETON CARD (Bentuk Kartu Progja)
export const ProgjaSkeletonCard = () => {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        height: "200px",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      {/* Judul */}
      <Skeleton width="70%" height="24px" />
      {/* Tanggal */}
      <Skeleton width="40%" height="16px" />
      {/* Spacer & Footer */}
      <div style={{ marginTop: "auto" }}>
        <Skeleton width="100%" height="30px" borderRadius="8px" />
      </div>
    </div>
  );
};

// 3. PROGJA SKELETON GRID (Susunan Halaman Full)
export const ProgjaSkeletonGrid = () => {
  return (
    <div style={{ marginTop: "2rem" }}>
      {/* Section 1 Skeleton */}
      <div style={{ marginBottom: "2rem" }}>
        <Skeleton
          width="200px"
          height="32px"
          borderRadius="8px"
          style={{ marginBottom: "1rem" }}
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <ProgjaSkeletonCard />
          <ProgjaSkeletonCard />
          <ProgjaSkeletonCard />
        </div>
      </div>

      {/* Section 2 Skeleton */}
      <div>
        <Skeleton
          width="200px"
          height="32px"
          borderRadius="8px"
          style={{ marginBottom: "1rem" }}
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <ProgjaSkeletonCard />
          <ProgjaSkeletonCard />
        </div>
      </div>
    </div>
  );
};

export const AnggotaSkeletonCard = () => {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem",
        height: "280px",
      }}
    >
      {/* Avatar Bulat */}
      <Skeleton width="100px" height="100px" borderRadius="50%" />

      {/* Nama & Jabatan */}
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <Skeleton width="80%" height="24px" />
        <Skeleton width="50%" height="16px" />
      </div>

      {/* Motto / Social */}
      <div
        style={{
          marginTop: "auto",
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Skeleton width="40%" height="20px" />
      </div>
    </div>
  );
};

// 5. ANGGOTA SKELETON GRID (Tampilan Full Halaman)
export const AnggotaSkeletonGrid = () => {
  return (
    <div
      style={{
        marginTop: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "4rem",
      }}
    >
      {/* Fake Divisi 1 */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "1.5rem",
            paddingBottom: "0.5rem",
            borderBottom: "2px solid #e2e8f0",
          }}
        >
          <Skeleton width="40px" height="40px" borderRadius="8px" />{" "}
          {/* Logo Divisi */}
          <Skeleton width="200px" height="32px" /> {/* Judul Divisi */}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <AnggotaSkeletonCard />
          <AnggotaSkeletonCard />
          <AnggotaSkeletonCard />
        </div>
      </div>

      {/* Fake Divisi 2 */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "1.5rem",
            paddingBottom: "0.5rem",
            borderBottom: "2px solid #e2e8f0",
          }}
        >
          <Skeleton width="40px" height="40px" borderRadius="8px" />
          <Skeleton width="150px" height="32px" />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <AnggotaSkeletonCard />
          <AnggotaSkeletonCard />
        </div>
      </div>
    </div>
  );
};
export const HeroSkeleton = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "500px", // Tinggi Hero
        borderRadius: "16px",
        overflow: "hidden",
        position: "relative",
        marginBottom: "2rem",
      }}
    >
      <Skeleton width="100%" height="100%" borderRadius="0" />

      {/* Simulasi Teks di tengah */}
      <div
        style={{
          position: "absolute",
          bottom: "40px",
          left: "40px",
          width: "50%",
        }}
      >
        <Skeleton width="70%" height="40px" style={{ marginBottom: "1rem" }} />
        <Skeleton width="90%" height="20px" />
      </div>
    </div>
  );
};
