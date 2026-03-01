import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";

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
        (a, b) => (a.urutan || 99) - (b.urutan || 99),
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
      <p className="text-sm text-slate-500 mb-4 bg-yellow-50 p-2 border border-yellow-100 rounded">
        <strong>Catatan Penting:</strong> Item urutan <strong>No. 1</strong>{" "}
        akan otomatis menjadi <strong>Judul Utama (Hero)</strong> halaman (jika
        fitur Hero diaktifkan).
      </p>

      {reorderList.length === 0 ? (
        <div className="text-center py-8 text-slate-400 italic bg-slate-50 border border-dashed border-slate-200 rounded-lg">
          Tidak ada konten.
        </div>
      ) : (
        <div className="flex flex-col gap-2 mb-6 max-h-[300px] overflow-y-auto pr-1">
          {reorderList.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-md shadow-sm transition-all hover:border-blue-400 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center border border-slate-200">
                  {index + 1}
                </div>
                <span className="font-medium text-slate-700 text-sm flex items-center gap-2">
                  {item.judul}
                  {index === 0 && (
                    <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 mt-[1px]">
                      (HEADER UTAMA)
                    </span>
                  )}
                </span>
              </div>

              <div className="flex gap-1">
                <button
                  type="button"
                  className="w-8 h-8 flex items-center justify-center rounded bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:hover:bg-slate-50 transition-colors"
                  onClick={() => moveItem(index, "up")}
                  disabled={index === 0}
                  title="Naikkan"
                >
                  ▲
                </button>
                <button
                  type="button"
                  className="w-8 h-8 flex items-center justify-center rounded bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:hover:bg-slate-50 transition-colors"
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

      {/* FOOTER */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-white border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-white hover:bg-blue-700 text-sm font-medium transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Simpan Urutan"}
        </button>
      </div>
    </div>
  );
}
