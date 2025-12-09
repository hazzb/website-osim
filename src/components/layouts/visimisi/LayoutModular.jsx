import React from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const LayoutModular = ({ data, isAdmin, onEdit, onDelete }) => {
  return (
    <div className="masonry-container">
      {data.map((item) => (
        <div key={item.id} className="masonry-item">
          {/* JUDUL */}
          <h3
            style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "#2d3748",
              marginBottom: "1rem",
              lineHeight: 1.2,
            }}
          >
            {item.judul}
          </h3>

          {/* ISI */}
          <p
            style={{
              fontSize: "1rem",
              color: "#4a5568",
              lineHeight: "1.6",
              whiteSpace: "pre-line",
              marginBottom: "1.5rem",
            }}
          >
            <div className="prose-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {item.isi}
              </ReactMarkdown>
            </div>
          </p>

          {/* TOMBOL ADMIN */}
          {isAdmin && (
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                borderTop: "1px solid #edf2f7",
                paddingTop: "1rem",
              }}
            >
              <button onClick={() => onEdit(item)} className="card-btn-edit">
                <FiEdit />
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="card-btn-delete"
              >
                <FiTrash2 />
              </button>
            </div>
          )}
        </div>
      ))}

      {/* CSS KHUSUS MASONRY (Inject Style) */}
      <style>{`
        /* Container Kolom */
        .masonry-container {
          column-count: 1; /* Default Mobile */
          column-gap: 1.5rem;
        }
        
        /* Item Kartu */
        .masonry-item {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem; /* Jarak bawah antar item */
          break-inside: avoid;   /* PENTING: Agar kartu tidak terpotong di tengah */
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
          transition: transform 0.2s;
        }
        .masonry-item:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
        }

        /* Tombol Kecil */
        .card-btn-edit, .card-btn-delete {
          width: 32px; height: 32px; border-radius: 6px; border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s;
        }
        .card-btn-edit { background: #f7fafc; color: #4a5568; }
        .card-btn-edit:hover { background: #ebf8ff; color: #3182ce; }
        .card-btn-delete { background: #fff5f5; color: #e53e3e; }
        .card-btn-delete:hover { background: #fed7d7; }

        /* Responsive Columns */
        @media (min-width: 768px) {
          .masonry-container { column-count: 2; }
        }
        @media (min-width: 1024px) {
          .masonry-container { column-count: 3; }
        }
      `}</style>
    </div>
  );
};

export default LayoutModular;
