"use client";

import React from "react";
import FormInput from "../admin/FormInput.jsx";
import formStyles from "../admin/AdminForm.module.css";
import { FiImage, FiUpload } from "react-icons/fi";

const DivisiForm = ({
  formData,
  onChange,
  onFileChange,
  preview,
  onSubmit,
  onCancel,
  loading,
  periodeList = [],
}) => {
  return (
    <form onSubmit={onSubmit} className="p-2">
      <div className={formStyles.formGrid}>
        <FormInput
          label="Periode Kabinet"
          name="periode_id"
          type="select"
          value={formData.periode_id || ""}
          onChange={onChange}
          required
          span={8}
        >
          <option value="" disabled>
            -- Pilih --
          </option>
          {periodeList.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nama_kabinet} ({p.tahun_mulai})
            </option>
          ))}
        </FormInput>

        <FormInput
          label="Urutan"
          name="urutan"
          type="number"
          value={formData.urutan || 10}
          onChange={onChange}
          placeholder="#"
          span={4}
          helper="1 = Atas"
        />

        <FormInput
          label="Kategori"
          name="tipe"
          type="select"
          value={formData.tipe || "Umum"}
          onChange={onChange}
          required
          span={6}
          helper={formData.tipe === "Inti" ? "⚠️ Khusus BPH" : "Divisi Biasa"}
        >
          <option value="Umum">Divisi Umum</option>
          <option value="Inti">Pengurus Inti</option>
        </FormInput>

        <FormInput
          label="Nama Divisi"
          name="nama_divisi"
          value={formData.nama_divisi || ""}
          onChange={onChange}
          required
          span={6}
          placeholder="Nama Divisi"
        />

        <div className="col-span-12">
          <label className="block text-[10px] font-extrabold text-text-muted uppercase tracking-widest mb-2 px-1">
            Logo Divisi
          </label>
          <div className="flex items-center gap-4 p-3 bg-bg-page border border-border-dim rounded-2xl ring-1 ring-slate-100">
            <div className="w-12 h-12 rounded-xl border border-border-dim bg-bg-card flex items-center justify-center overflow-hidden flex-shrink-0">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FiImage size={20} className="text-slate-300" />
              )}
            </div>
            <div className="flex-1 flex justify-between items-center pr-1">
              <span className="text-[10px] text-text-muted font-bold">
                MAX 1MB (JPG/PNG)
              </span>
              <div>
                <input
                  type="file"
                  id="small_file_logo"
                  name="file_logo"
                  accept="image/*"
                  onChange={onFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="small_file_logo"
                  className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-[10px] font-black uppercase tracking-tight cursor-pointer hover:bg-slate-700 transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <FiUpload size={12} /> {preview ? "Ganti" : "Upload"}
                </label>
              </div>
            </div>
          </div>
        </div>

        <FormInput
          label="Deskripsi Singkat"
          name="deskripsi"
          type="textarea"
          value={formData.deskripsi || ""}
          onChange={onChange}
          span={12}
          rows={2}
          placeholder="Tugas utama..."
        />
      </div>

      <div className="mt-8 pt-6 border-t border-border-dim flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl text-xs font-bold text-text-muted hover:bg-bg-page transition-all border border-border-dim"
        >
          Batal
        </button>
        <button
          type="submit"
          className="px-8 py-2.5 rounded-xl text-xs font-extrabold text-white bg-primary hover:bg-primary-hover transition-all shadow-lg shadow-blue-200 disabled:opacity-50 transform active:scale-95"
          disabled={loading}
        >
          {loading ? "Simpan..." : "Simpan"}
        </button>
      </div>
    </form>
  );
};

export default DivisiForm;
