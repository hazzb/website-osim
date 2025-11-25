import React from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";

const LayoutSplit = ({ data, isAdmin, onEdit, onDelete }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {data.map((item) => (
        <div
          key={item.id}
          style={{
            background: "white",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
            overflow: "hidden", // Agar border radius aman
            display: "flex", // Flexbox agar Kiri-Kanan
            flexDirection: "row",
            alignItems: "stretch",
            minHeight: "200px",
          }}
          className="split-card" // Class untuk media query
        >
          {/* BAGIAN KIRI: JUDUL (30%) */}
          <div
            style={{
              flex: "0 0 30%",
              background: "#f8fafc",
              padding: "2rem",
              borderRight: "1px solid #edf2f7",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
            className="split-left"
          >
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "800",
                color: "#2d3748",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {item.judul}
            </h2>
            <div
              style={{
                width: "40px",
                height: "4px",
                background: "#3182ce",
                marginTop: "1rem",
                borderRadius: "2px",
              }}
            ></div>
          </div>

          {/* BAGIAN KANAN: ISI (70%) */}
          <div
            style={{
              flex: 1,
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <p
              style={{
                fontSize: "1rem",
                color: "#4a5568",
                lineHeight: "1.8",
                margin: 0,
                whiteSpace: "pre-line",
              }}
            >
              {item.isi}
            </p>

            {/* ADMIN BUTTONS */}
            {isAdmin && (
              <div
                style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem" }}
              >
                <button onClick={() => onEdit(item)} className="split-btn">
                  <FiEdit /> Edit
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="split-btn delete"
                >
                  <FiTrash2 /> Hapus
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      <style>{`
        /* Tombol Admin */
        .split-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 6px; border: 1px solid #e2e8f0;
          background: white; color: #4a5568; font-size: 0.8rem; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
        }
        .split-btn:hover { border-color: #3182ce; color: #3182ce; }
        .split-btn.delete:hover { border-color: #e53e3e; color: #e53e3e; background: #fff5f5; }

        /* Responsive Mobile: Ubah Split jadi Stack (Atas-Bawah) */
        @media (max-width: 768px) {
          .split-card { flexDirection: column !important; }
          .split-left { 
            flex: none !important; 
            border-right: none !important; 
            border-bottom: 1px solid #edf2f7; 
            padding: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LayoutSplit;
