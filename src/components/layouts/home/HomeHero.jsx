import React from "react";
import { Link } from "react-router-dom";
import { FiEdit } from "react-icons/fi";

const HomeHero = ({ data, isAdmin, onEdit }) => {
  if (!data) return null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "3rem",
        alignItems: "center",
        marginBottom: "4rem",
        position: "relative",
      }}
      className="home-hero"
    >
      {/* KIRI: TEKS */}
      <div>
        <h1
          style={{
            fontSize: "3rem",
            fontWeight: "800",
            lineHeight: 1.1,
            color: "#1a202c",
            marginBottom: "1.5rem",
          }}
        >
          {data.judul}
        </h1>
        <p
          style={{
            fontSize: "1.2rem",
            lineHeight: 1.6,
            color: "#4a5568",
            marginBottom: "2rem",
            whiteSpace: "pre-line",
          }}
        >
          {data.isi}
        </p>

        {data.button_text && (
          <Link
            to={data.button_link || "#"}
            className="button button-primary"
            style={{ padding: "0.8rem 2rem", fontSize: "1rem" }}
          >
            {data.button_text}
          </Link>
        )}
      </div>

      {/* KANAN: GAMBAR */}
      <div style={{ position: "relative" }}>
        {data.image_url ? (
          <img
            src={data.image_url}
            alt="Hero"
            style={{
              width: "100%",
              borderRadius: "20px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "300px",
              background: "#edf2f7",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#cbd5e0",
            }}
          >
            No Image
          </div>
        )}
      </div>

      {/* ADMIN EDIT */}
      {isAdmin && (
        <button
          onClick={() => onEdit(data)}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            background: "white",
            border: "1px solid #cbd5e0",
            padding: "0.5rem",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          <FiEdit /> Edit Hero
        </button>
      )}

      {/* CSS RESPONSIVE */}
      <style>{`
        @media (max-width: 768px) {
          .home-hero { grid-template-columns: 1fr !important; gap: 2rem !important; text-align: center; }
          .home-hero img { max-width: 80%; margin: 0 auto; }
        }
      `}</style>
    </div>
  );
};

export default HomeHero;
