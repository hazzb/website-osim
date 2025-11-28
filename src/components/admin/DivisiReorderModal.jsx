import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";

// Import CSS Module Lokal (Untuk styling list)
import styles from "./DivisiReorderModal.module.css";

// Import Style Global untuk tombol (Konsistensi)
import globalFormStyles from "./AdminForm.module.css";

export default function DivisiReorderModal({
  isOpen,
  onClose,
  divisiList,
  activePeriodeId,
  onSuccess,
}) {
  const [reorderList, setReorderList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const filtered = divisiList.filter(
        (d) => d.periode_id == activePeriodeId
      );
      const sorted = [...filtered].sort(
        (a, b) => (a.urutan || 99) - (b.urutan || 99)
      );
      setReorderList(sorted);
    }
  }, [isOpen, divisiList, activePeriodeId]);

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
        if (error) throw error;
      }
      alert("Urutan berhasil disimpan!");
      onSuccess();
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
      <p className={styles.instruction}>
        Gunakan panah untuk mengatur posisi. No. 1 tampil paling awal.
      </p>

      {reorderList.length === 0 ? (
        <div className={styles.empty}>Tidak ada divisi di periode ini.</div>
      ) : (
        <div className={styles.list}>
          {reorderList.map((div, index) => (
            <div key={div.id} className={styles.item}>
              <div className={styles.info}>
                <div className={styles.number}>{index + 1}</div>
                <span className={styles.name}>{div.nama_divisi}</span>
              </div>

              <div className={styles.controls}>
                <button
                  type="button"
                  className={styles.btnArrow}
                  onClick={() => moveDivisi(index, "up")}
                  disabled={index === 0}
                  title="Naikkan"
                >
                  ▲
                </button>
                <button
                  type="button"
                  className={styles.btnArrow}
                  onClick={() => moveDivisi(index, "down")}
                  disabled={index === reorderList.length - 1}
                  title="Turunkan"
                >
                  ▼
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FOOTER MENGGUNAKAN GLOBAL STYLE (CAMELCASE) */}
      <div className={globalFormStyles.formFooter}>
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
