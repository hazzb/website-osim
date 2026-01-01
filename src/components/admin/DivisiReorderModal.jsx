import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { FiChevronUp, FiChevronDown, FiSave } from "react-icons/fi";
import Modal from "../Modal";

const DivisiReorderModal = ({ isOpen, onClose, divisiList, onSuccess }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && divisiList) {
      const sorted = [...divisiList].sort(
        (a, b) => (a.urutan || 99) - (b.urutan || 99)
      );
      setItems(sorted);
    }
  }, [isOpen, divisiList]);

  const moveUp = (index) => {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [
      newItems[index],
      newItems[index - 1],
    ];
    setItems(newItems);
  };

  const moveDown = (index) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    [newItems[index + 1], newItems[index]] = [
      newItems[index],
      newItems[index + 1],
    ];
    setItems(newItems);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updates = items.map((item, index) => {
        return supabase
          .from("divisi")
          .update({ urutan: index + 1 })
          .eq("id", item.id);
      });
      const results = await Promise.all(updates);
      const error = results.find((r) => r.error);
      if (error) throw error.error;

      alert("Urutan berhasil diperbarui!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      alert("Gagal: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Atur Urutan Divisi"
      maxWidth="450px"
    >
      {/* Padding Modal Body dikurangi */}
      <div style={{ padding: "0.5rem" }}>
        <p
          style={{
            fontSize: "0.8rem",
            color: "#64748b",
            marginBottom: "0.5rem",
            marginTop: 0,
          }}
        >
          Gunakan tombol panah untuk mengatur urutan.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.3rem", // Jarak antar item dirapatkan
            maxHeight: "60vh",
            overflowY: "auto",
            paddingRight: "2px",
          }}
        >
          {items.map((item, index) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.4rem 0.8rem", // Padding item dikecilkan
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                fontSize: "0.9rem",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}
              >
                <span
                  style={{
                    fontWeight: "700",
                    color: "#cbd5e1",
                    width: "16px",
                    textAlign: "center",
                    fontSize: "0.8rem",
                  }}
                >
                  {index + 1}
                </span>
                <span style={{ fontWeight: "600", color: "#1e293b" }}>
                  {item.nama_divisi}
                </span>
              </div>

              <div style={{ display: "flex", gap: "2px" }}>
                <button
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="button button-secondary"
                  style={{
                    padding: "4px",
                    width: "28px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "4px",
                  }}
                  title="Naik"
                >
                  <FiChevronUp size={14} />
                </button>
                <button
                  onClick={() => moveDown(index)}
                  disabled={index === items.length - 1}
                  className="button button-secondary"
                  style={{
                    padding: "4px",
                    width: "28px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "4px",
                  }}
                  title="Turun"
                >
                  <FiChevronDown size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            marginTop: "1rem",
            paddingTop: "0.75rem",
            borderTop: "1px solid #f1f5f9",
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.5rem",
          }}
        >
          <button
            onClick={onClose}
            className="button button-secondary"
            disabled={loading}
            style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="button button-primary"
            disabled={loading}
            style={{
              padding: "0.4rem 0.8rem",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {loading ? (
              "Menyimpan..."
            ) : (
              <>
                <FiSave size={14} /> Simpan
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DivisiReorderModal;
