import React, { useState } from "react";
import { supabase } from "../../supabaseClient";
import { FiSave, FiLayout } from "react-icons/fi";

/**
 * LayoutSettingsForm - Form sederhana untuk mengubah layout Visi & Misi
 */
const LayoutSettingsForm = ({ currentLayout, onSuccess, onClose }) => {
  const [selectedLayout, setSelectedLayout] = useState(
    currentLayout || "modular",
  );
  const [loading, setLoading] = useState(false);

  const layouts = [
    {
      value: "modular",
      label: "Modular Grid",
      description: "Modern card grid layout",
    },
    {
      value: "split",
      label: "Split Card",
      description: "Sidebar + scrollable list",
    },
    {
      value: "zigzag",
      label: "Zig-Zag Story",
      description: "Alternating layout",
    },
    {
      value: "simple",
      label: "Simple Centered",
      description: "Clean vertical stack",
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("pengaturan")
        .update({ visi_misi_layout: selectedLayout })
        .eq("id", 1);

      if (error) throw error;

      alert("Layout berhasil diubah!");
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Gagal mengubah layout: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-text-main flex items-center gap-2">
          <FiLayout className="text-primary" /> Pilih Layout Tampilan
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {layouts.map((layout) => (
            <button
              key={layout.value}
              type="button"
              onClick={() => setSelectedLayout(layout.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selectedLayout === layout.value
                  ? "bg-primary border-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "bg-bg-card border-border-dim text-text-main hover:border-blue-300 hover:bg-primary-light/50"
              }`}
            >
              <div className="font-bold text-sm uppercase tracking-wider mb-1">
                {layout.label}
              </div>
              <div
                className={`text-xs ${selectedLayout === layout.value ? "text-blue-100" : "text-text-muted"}`}
              >
                {layout.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Preview Info */}
      <div className="bg-primary-light border border-primary-border rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Perubahan layout akan langsung terlihat
          setelah disimpan. Semua content blocks akan tetap sama, hanya cara
          tampilannya yang berubah.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-border-dim">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-6 py-3 bg-border-dim text-text-body rounded-xl font-bold hover:bg-border-dim transition-all"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            "Menyimpan..."
          ) : (
            <>
              <FiSave className="inline mr-2" />
              Simpan Layout
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default LayoutSettingsForm;
