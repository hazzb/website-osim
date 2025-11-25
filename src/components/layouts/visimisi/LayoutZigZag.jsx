import React from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";

const LayoutZigZag = ({ data, isAdmin, onEdit, onDelete }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
      {data.map((item, index) => {
        // Cek ganjil/genap untuk zigzag
        const isEven = index % 2 === 0;

        return (
          <div
            key={item.id}
            style={{
              display: "flex",
              // Desktop: Genap normal (Row), Ganjil dibalik (Row-Reverse)
              flexDirection: isEven ? "row" : "row-reverse",
              alignItems: "center",
              gap: "3rem",
              background: "white",
              borderRadius: "20px",
              padding: "2rem",
              border: "1px solid #e2e8f0",
              // Beri background sedikit beda untuk visual zigzag
              background: isEven ? "#ffffff" : "#f8fafc",
            }}
          >
            {/* BAGIAN JUDUL (Sebagai Visual Anchor) */}
            <div style={{ flex: 1, textAlign: isEven ? "right" : "left" }}>
              <h2
                style={{
                  fontSize: "2rem",
                  fontWeight: "900",
                  color: "#2d3748",
                  margin: 0,
                  lineHeight: 1.1,
                }}
              >
                {item.judul}
              </h2>
              <div
                style={{
                  height: "6px",
                  width: "60px",
                  background: "#3182ce",
                  borderRadius: "3px",
                  margin: isEven ? "1rem 0 0 auto" : "1rem auto 0 0", // Garis ikut rata kanan/kiri
                }}
              ></div>
            </div>

            {/* BAGIAN ISI */}
            <div
              style={{
                flex: 2,
                borderLeft: isEven ? "2px solid #e2e8f0" : "none",
                borderRight: !isEven ? "2px solid #e2e8f0" : "none",
                padding: "0 2rem",
              }}
            >
              <p
                style={{
                  fontSize: "1.05rem",
                  color: "#4a5568",
                  lineHeight: "1.8",
                  whiteSpace: "pre-line" /* Fix Enter */,
                }}
              >
                {item.isi}
              </p>

              {isAdmin && (
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginTop: "1.5rem",
                  }}
                >
                  <button
                    onClick={() => onEdit(item)}
                    className="admin-btn-edit"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="admin-btn-delete"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              )}
            </div>

            {/* Style lokal untuk tombol kecil */}
            <style>{`
              .admin-btn-edit, .admin-btn-delete {
                width: 32px; height: 32px;
                display: flex; align-items: center; justify-content: center;
                border-radius: 6px; border: 1px solid #cbd5e0;
                background: white; cursor: pointer; transition: all 0.2s;
              }
              .admin-btn-edit { color: #4a5568; }
              .admin-btn-edit:hover { background: #ebf8ff; color: #3182ce; border-color: #3182ce; }
              .admin-btn-delete { color: #e53e3e; }
              .admin-btn-delete:hover { background: #fff5f5; border-color: #e53e3e; }
              
              @media (max-width: 768px) {
                /* Reset ZigZag di HP jadi tumpuk biasa */
                div[style*="flex-direction"] { flexDirection: column !important; gap: 1rem !important; text-align: left !important; }
                div[style*="text-align"] { text-align: left !important; }
                div[style*="margin"] { margin: 1rem 0 0 0 !important; } /* Reset garis margin */
                div[style*="borderLeft"], div[style*="borderRight"] { border: none !important; padding: 0 !important; }
              }
            `}</style>
          </div>
        );
      })}
    </div>
  );
};

export default LayoutZigZag;
