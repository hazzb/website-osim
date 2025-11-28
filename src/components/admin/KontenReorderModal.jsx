import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";

// Reuse CSS yang sudah ada (List Style)
import styles from "./DivisiReorderModal.module.css";
// Import Global Form Style (Footer Style)
import globalFormStyles from "./AdminForm.module.css";

export default function KontenReorderModal({
  isOpen,
  onClose,
  contentList,
  onSuccess,
}) {
  const [reorderList, setReorderList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Sort berdasarkan urutan saat ini
      const sorted = [...contentList].sort(
        (a, b) => (a.urutan || 99) - (b.urutan || 99)
      );
      setReorderList(sorted);
    }
  }, [isOpen, contentList]);

  const moveItem = (index, direction) => {
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
      // Update Sequential (Satu per satu agar aman)
      for (let i = 0; i < reorderList.length; i++) {
        const item = reorderList[i];
        const urutanBaru = i + 1; // 1, 2, 3...
        const { error } = await supabase
          .from("konten_halaman")
          .update({ urutan: urutanBaru })
          .eq("id", item.id);
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
        <strong>Catatan Penting:</strong> Item urutan <strong>No. 1</strong>{" "}
        akan otomatis menjadi <strong>Judul Utama (Hero)</strong> halaman (jika
        fitur Hero diaktifkan).
      </p>

      {reorderList.length === 0 ? (
        <div className={styles.empty}>Tidak ada konten.</div>
      ) : (
        <div className={styles.list}>
          {reorderList.map((item, index) => (
            <div key={item.id} className={styles.item}>
              <div className={styles.info}>
                <div className={styles.number}>{index + 1}</div>
                <span className={styles.name}>
                  {item.judul}
                  {index === 0 && (
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: "#3182ce",
                        marginLeft: "8px",
                        background: "#ebf8ff",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontWeight: "600",
                      }}
                    >
                      (HEADER UTAMA)
                    </span>
                  )}
                </span>
              </div>

              <div className={styles.controls}>
                <button
                  type="button"
                  className={styles.btnArrow}
                  onClick={() => moveItem(index, "up")}
                  disabled={index === 0}
                  title="Naikkan"
                >
                  ▲
                </button>
                <button
                  type="button"
                  className={styles.btnArrow}
                  onClick={() => moveItem(index, "down")}
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
