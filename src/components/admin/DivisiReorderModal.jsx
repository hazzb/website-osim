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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Atur Urutan Divisi"
      maxWidth="450px"
    >
      <div className="p-2">
        <p className="text-sm text-slate-500 mb-2">
          Gunakan tombol panah untuk mengatur urutan.
        </p>

        <div className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto pr-1">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2 px-3 bg-white border border-slate-200 rounded-md text-sm"
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-300 text-xs w-4 text-center">
                  {index + 1}
                </span>
                <span className="font-semibold text-slate-800">
                  {item.nama_divisi}
                </span>
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="w-7 h-7 flex items-center justify-center rounded bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Naik"
                >
                  <FiChevronUp size={14} />
                </button>
                <button
                  onClick={() => moveDown(index)}
                  disabled={index === items.length - 1}
                  className="w-7 h-7 flex items-center justify-center rounded bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Turun"
                >
                  <FiChevronDown size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-3 py-1.5 bg-blue-600 rounded text-white hover:bg-blue-700 text-sm font-medium flex items-center gap-1.5 transition-colors disabled:opacity-70"
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
