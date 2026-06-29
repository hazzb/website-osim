"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FiEdit2, FiTrash2, FiPlus, FiImage } from "react-icons/fi";
import BerandaSlideForm from "@/components/forms/BerandaSlideForm";

const ManageSlidesModal = ({ slides, onSuccess, onClose }) => {
  const [editingSlide, setEditingSlide] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const supabase = createClient();

  const handleDelete = async (id) => {
    if (!confirm("Hapus slide ini?")) return;
    setLoadingId(id);
    try {
      const { error } = await supabase.from("beranda_slides").delete().eq("id", id);
      if (error) throw error;
      onSuccess(); // refresh data
    } catch (err) {
      alert("Gagal menghapus: " + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleFormSuccess = () => {
    setEditingSlide(null);
    setIsAdding(false);
    onSuccess();
  };

  if (isAdding || editingSlide) {
    return (
      <div className="animate-fadeIn">
        <div className="flex items-center gap-2 mb-4 px-6 pt-4 text-primary font-bold cursor-pointer hover:underline" onClick={() => { setIsAdding(false); setEditingSlide(null); }}>
          &larr; Kembali ke Daftar Slide
        </div>
        <BerandaSlideForm
          initialData={editingSlide}
          onSuccess={handleFormSuccess}
          onClose={() => {
            setIsAdding(false);
            setEditingSlide(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-4 animate-fadeIn">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-bold text-text-main m-0">Daftar Slide Aktif</h4>
        <button
          onClick={() => setIsAdding(true)}
          className="px-3 py-1.5 bg-primary-light text-primary rounded-lg font-bold text-xs flex items-center gap-1.5 hover:bg-blue-200 transition-colors"
        >
          <FiPlus /> Tambah Slide
        </button>
      </div>

      <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
        {slides.length > 0 ? (
          slides.map((slide) => (
            <div key={slide.id} className="flex items-center gap-4 p-3 bg-bg-card border border-border-dim rounded-xl hover:border-primary/50 transition-colors">
              <div className="w-20 h-14 bg-border-dim rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                {slide.image_url ? (
                  <img src={slide.image_url} alt="Thumbnail" className="w-full h-full object-cover" />
                ) : (
                  <FiImage className="text-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="font-bold text-sm text-text-main m-0 truncate">{slide.judul}</h5>
                <p className="text-xs text-text-muted m-0">Urutan: {slide.urutan} {slide.is_active ? "" : "• (Sembunyi)"}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setEditingSlide(slide)}
                  disabled={loadingId === slide.id}
                  className="w-8 h-8 rounded-lg bg-bg-page flex items-center justify-center text-text-body hover:text-primary hover:bg-primary-light transition-colors"
                  title="Edit Slide"
                >
                  <FiEdit2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(slide.id)}
                  disabled={loadingId === slide.id}
                  className="w-8 h-8 rounded-lg bg-bg-page flex items-center justify-center text-text-body hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Hapus Slide"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-text-muted text-sm border-2 border-dashed border-border-dim rounded-xl">
            Belum ada slide.
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageSlidesModal;
