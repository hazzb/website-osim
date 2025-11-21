// src/components/admin/DivisiReorderModal.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import styles from "../../pages/DaftarAnggota.module.css"; // Menggunakan CSS yang sama
import formStyles from "./AdminForm.module.css";

export default function DivisiReorderModal({
  isOpen,
  onClose,
  divisiList,
  activePeriodeId,
  onSuccess,
}) {
  const [reorderList, setReorderList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Reset list saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      // Filter hanya periode aktif & sort berdasarkan urutan saat ini
      const filtered = divisiList.filter(
        (d) => d.periode_id == activePeriodeId
      );
      const sorted = [...filtered].sort(
        (a, b) => (a.urutan || 99) - (b.urutan || 99)
      );
      setReorderList(sorted);
    }
  }, [isOpen, divisiList, activePeriodeId]);

  // Logika Panah
  const moveDivisi = (index, direction) => {
    const newList = [...reorderList];
    if (direction === "up" && index > 0) {
      [newList[index], newList[index - 1]] = [
        newList[index - 1],
        newList[index],
      ];
    } else if (direction === "down" && index < newList.length - 1) {
      [newList[index], newList[index + 1]] = [
        newList[index + 1],
        newList[index],
      ];
    }
    setReorderList(newList);
  };

  // Logika Simpan (Sequential Update agar aman)
  const handleSave = async () => {
    if (reorderList.length === 0) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      for (let i = 0; i < reorderList.length; i++) {
        const div = reorderList[i];
        const urutanBaru = i + 1;

        const { error } = await supabase
          .from("divisi")
          .update({ urutan: urutanBaru })
          .eq("id", div.id);

        if (error) throw new Error(error.message);
      }

      alert("Urutan berhasil disimpan!");
      onSuccess(); // Refresh data di parent
      onClose();
    } catch (err) {
      alert("Gagal menyimpan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div>
      <p style={{ fontSize: "0.9rem", color: "#718096", marginBottom: "1rem" }}>
        Mengatur urutan divisi untuk Periode yang sedang aktif.
      </p>

      {reorderList.length === 0 ? (
        <p style={{ color: "red", fontStyle: "italic", textAlign: "center" }}>
          Tidak ada divisi di periode ini.
        </p>
      ) : (
        <div className={styles["reorder-list"]}>
          {reorderList.map((div, index) => (
            <div key={div.id} className={styles["reorder-item"]}>
              <div className={styles["reorder-info"]}>
                <div className={styles["reorder-number"]}>{index + 1}</div>
                <span className={styles["reorder-name"]}>
                  {div.nama_divisi}
                </span>
              </div>
              <div className={styles["reorder-controls"]}>
                <button
                  type="button"
                  className={styles["btn-arrow"]}
                  onClick={() => moveDivisi(index, "up")}
                  disabled={index === 0}
                >
                  ▲
                </button>
                <button
                  type="button"
                  className={styles["btn-arrow"]}
                  onClick={() => moveDivisi(index, "down")}
                  disabled={index === reorderList.length - 1}
                >
                  ▼
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        className={formStyles["form-footer"]}
        style={{ marginTop: "1.5rem" }}
      >
        <button
          type="button"
          onClick={onClose}
          className="button button-secondary"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="button button-primary"
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Simpan Urutan"}
        </button>
      </div>
    </div>
  );
}
