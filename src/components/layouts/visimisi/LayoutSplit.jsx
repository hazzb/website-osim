import React from "react";
import { FiEdit, FiTrash2, FiExternalLink } from "react-icons/fi";
import { Link } from "react-router-dom";
import SimpleCarousel from "../../ui/SimpleCarousel.jsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const LayoutSplit = ({ data, isAdmin, onEdit, onDelete }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4rem" }}>
      {data.map((item, index) => {
        const hasText = item.judul || item.isi;
        const hasImage = !!item.image_url;
        // Deteksi Carousel (Array & Length > 0)
        const hasCarousel =
          item.gallery_urls &&
          Array.isArray(item.gallery_urls) &&
          item.gallery_urls.length > 0;
        const isEven = index % 2 === 0;

        // --- KASUS 1: CAROUSEL ---
        if (hasCarousel) {
          return (
            <div
              key={item.id}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "1000px",
                margin: "0 auto",
              }}
            >
              <SimpleCarousel items={item.gallery_urls} />
              {isAdmin && (
                <AdminOverlay
                  onEdit={() => onEdit(item)}
                  onDelete={() => onDelete(item.id)}
                />
              )}
            </div>
          );
        }

        // --- KASUS 2: HANYA GAMBAR (Banner / Galeri Single) ---
        if (hasImage && !hasText) {
          return (
            <div
              key={item.id}
              style={{
                position: "relative",
                width: "100%",
                textAlign: "center",
              }}
            >
              <img
                src={item.image_url}
                alt="Banner"
                style={{
                  width: "100%",
                  maxWidth: "1000px", // Batasi lebar banner
                  aspectRatio: "16 / 9", // Cinematic Ratio untuk Banner
                  objectFit: "cover",
                  borderRadius: "24px",
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                  margin: "0 auto",
                }}
              />
              {isAdmin && (
                <AdminOverlay
                  onEdit={() => onEdit(item)}
                  onDelete={() => onDelete(item.id)}
                />
              )}
            </div>
          );
        }

        // --- KASUS 3: HANYA TEKS ---
        if (hasText && !hasImage) {
          return (
            <div
              key={item.id}
              style={{
                background: "white",
                padding: "3rem",
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                textAlign: "center",
                position: "relative",
              }}
            >
              <h2
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "800",
                  color: "#2d3748",
                  marginBottom: "1.5rem",
                }}
              >
                {item.judul}
              </h2>
              <p
                style={{
                  fontSize: "1.1rem",
                  color: "#4a5568",
                  lineHeight: 1.8,
                  whiteSpace: "pre-line",
                  maxWidth: "800px",
                  margin: "0 auto",
                }}
              >
                <div className="prose-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {item.isi}
                  </ReactMarkdown>
                </div>
              </p>

              {item.button_text && (
                <div style={{ marginTop: "2rem" }}>
                  <Link
                    to={item.button_link || "#"}
                    className="button button-primary"
                  >
                    {item.button_text}
                  </Link>
                </div>
              )}
              {isAdmin && (
                <AdminOverlay
                  onEdit={() => onEdit(item)}
                  onDelete={() => onDelete(item.id)}
                />
              )}
            </div>
          );
        }

        // --- KASUS 4: SPLIT (Zig-Zag) ---
        // Jika ada Gambar (Single) + Teks
        return (
          <div
            key={item.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "3rem",
              alignItems: "center",
              position: "relative",
            }}
            className="split-item"
          >
            {/* Bagian Teks (Order dinamis untuk efek ZigZag) */}
            <div style={{ order: isEven ? 1 : 2 }}>
              <h2
                style={{
                  fontSize: "2.2rem",
                  fontWeight: "800",
                  color: "#1a202c",
                  marginBottom: "1rem",
                  lineHeight: 1.2,
                }}
              >
                {item.judul}
              </h2>
              <div
                style={{
                  width: "60px",
                  height: "4px",
                  background: "#3182ce",
                  marginBottom: "1.5rem",
                  borderRadius: "2px",
                }}
              ></div>
              <p
                style={{
                  fontSize: "1.1rem",
                  color: "#4a5568",
                  lineHeight: 1.7,
                  marginBottom: "2rem",
                  whiteSpace: "pre-line",
                }}
              >
                <div className="prose-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {item.isi}
                  </ReactMarkdown>
                </div>
              </p>

              {item.button_text && (
                <Link
                  to={item.button_link || "#"}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#3182ce",
                    fontWeight: "700",
                    textDecoration: "none",
                  }}
                >
                  {item.button_text} <FiExternalLink />
                </Link>
              )}

              {isAdmin && (
                <div style={{ marginTop: "2rem" }}>
                  <AdminActions
                    onEdit={() => onEdit(item)}
                    onDelete={() => onDelete(item.id)}
                  />
                </div>
              )}
            </div>

            {/* Bagian Gambar (Fixed 1:1) */}
            <div style={{ order: isEven ? 2 : 1 }}>
              <img
                src={item.image_url}
                alt={item.judul}
                style={{
                  width: "100%",
                  aspectRatio: "1 / 1", // KOTAK SEMPURNA
                  objectFit: "cover",
                  borderRadius: "24px",
                  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
                }}
              />
            </div>

            <style>{`
              @media (max-width: 768px) {
                .split-item { grid-template-columns: 1fr !important; gap: 2rem !important; }
                .split-item > div { order: unset !important; }
              }
            `}</style>
          </div>
        );
      })}
    </div>
  );
};

// --- SUB-COMPONENTS (Admin Buttons) ---
const AdminOverlay = ({ onEdit, onDelete }) => (
  <div
    style={{
      position: "absolute",
      top: "1rem",
      right: "1rem",
      display: "flex",
      gap: "0.5rem",
      background: "rgba(255,255,255,0.9)",
      padding: "5px",
      borderRadius: "8px",
      zIndex: 10,
    }}
  >
    <AdminActions onEdit={onEdit} onDelete={onDelete} />
  </div>
);

const AdminActions = ({ onEdit, onDelete }) => (
  <div style={{ display: "flex", gap: "0.5rem" }}>
    <button onClick={onEdit} title="Edit" style={btnStyle}>
      <FiEdit />
    </button>
    <button
      onClick={onDelete}
      title="Hapus"
      style={{ ...btnStyle, color: "#e53e3e" }}
    >
      <FiTrash2 />
    </button>
  </div>
);

const btnStyle = {
  width: "36px",
  height: "36px",
  border: "1px solid #cbd5e0",
  background: "white",
  borderRadius: "6px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#4a5568",
};

export default LayoutSplit;
