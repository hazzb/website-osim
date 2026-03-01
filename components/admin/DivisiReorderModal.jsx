"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { FiChevronUp, FiChevronDown, FiSave } from "react-icons/fi";

const DivisiReorderModal = ({ isOpen, onClose, divisiList, onSuccess }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (isOpen && divisiList) {
      const sorted = [...divisiList].sort(
        (a, b) => (a.urutan || 99) - (b.urutan || 99),
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
    <div className="p-2">
      <p className="text-xs text-slate-500 mb-6 font-medium bg-slate-50 p-3 rounded-lg border border-slate-100">
        Gunakan tombol panah untuk mengatur urutan tampilan divisi di beranda
        dan halaman publik.
      </p>

      <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-1">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 px-4 bg-white border border-slate-200 rounded-xl text-sm transition-all hover:border-blue-200 hover:shadow-sm"
          >
            <div className="flex items-center gap-4">
              <span className="font-black text-slate-300 text-[10px] w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center">
                {index + 1}
              </span>
              <span className="font-bold text-slate-800">
                {item.nama_divisi}
              </span>
            </div>

            <div className="flex gap-1">
              <button
                onClick={() => moveUp(index)}
                disabled={index === 0}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90"
              >
                <FiChevronUp size={16} />
              </button>
              <button
                onClick={() => moveDown(index)}
                disabled={index === items.length - 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90"
              >
                <FiChevronDown size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={loading}
          className="px-5 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all border border-slate-200"
        >
          Batal
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 rounded-xl text-white hover:bg-blue-700 text-xs font-black uppercase flex items-center gap-2 transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            "Menyimpan..."
          ) : (
            <>
              <FiSave /> Simpan
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DivisiReorderModal;
