"use client";

import React, { useMemo, useEffect } from "react";
import FormInput from "../admin/FormInput.jsx";
import formStyles from "../admin/AdminForm.module.css";
import { FiUser, FiUpload, FiBriefcase, FiInfo } from "react-icons/fi";

const AnggotaForm = ({
  formData,
  onChange,
  onFileChange,
  onSubmit,
  onCancel,
  loading,
  periodeList = [],
  divisiList = [],
  jabatanList = [],
  preview,
}) => {
  const filteredDivisiList = useMemo(() => {
    if (!formData.periode_id) return [];
    return divisiList.filter(
      (d) => String(d.periode_id) === String(formData.periode_id),
    );
  }, [formData.periode_id, divisiList]);

  useEffect(() => {
    if (!formData.divisi_id) return;
    const isDivisiValid = filteredDivisiList.some(
      (d) => String(d.id) === String(formData.divisi_id),
    );
    if (formData.divisi_id && !isDivisiValid) {
      onChange({ target: { name: "divisi_id", value: "" } });
    }
  }, [formData.periode_id, filteredDivisiList, formData.divisi_id, onChange]);

  const mottoLength = (formData.motto || "").length;
  const maxMotto = 250;

  const sectionHeaderStyle =
    "flex items-center gap-2 text-[10px] font-extrabold text-text-muted uppercase tracking-widest mb-6 mt-2 border-b border-border-dim pb-3";

  return (
    <form onSubmit={onSubmit} className="p-2">
      {/* PHOTO SECTION */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-28 h-28 rounded-3xl overflow-hidden border-[6px] border-white shadow-xl bg-border-dim flex items-center justify-center mb-4 ring-1 ring-slate-200">
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <FiUser size={40} className="text-slate-300" />
          )}
        </div>

        <label className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-all hover:bg-slate-700 hover:scale-105 active:scale-95 shadow-lg shadow-slate-200">
          <FiUpload size={14} />
          {preview ? "Ganti Foto" : "Upload Foto"}
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
          />
        </label>
        <span className="text-[10px] text-text-muted mt-2 font-medium">
          Maks. 2MB (JPG/PNG)
        </span>
      </div>

      {/* POSISI & JABATAN */}
      <div className={sectionHeaderStyle}>
        <FiBriefcase /> Posisi & Jabatan
      </div>
      <div className={formStyles.formGrid}>
        <FormInput
          label="Periode Kabinet"
          name="periode_id"
          type="select"
          value={formData.periode_id || ""}
          onChange={onChange}
          required
          span={6}
        >
          <option value="">-- Pilih Periode --</option>
          {periodeList.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nama_kabinet}
            </option>
          ))}
        </FormInput>

        <FormInput
          label="Divisi"
          name="divisi_id"
          type="select"
          value={formData.divisi_id || ""}
          onChange={onChange}
          required
          span={6}
          disabled={!formData.periode_id}
        >
          <option value="">
            {formData.periode_id ? "-- Pilih Divisi --" : "Pilih Periode Dulu"}
          </option>
          {filteredDivisiList.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nama_divisi}
            </option>
          ))}
        </FormInput>

        <div className={formStyles.colSpan12}>
          <FormInput
            label="Jabatan Struktural"
            name="jabatan_id"
            type="select"
            value={formData.jabatan_id || ""}
            onChange={onChange}
            required
          >
            <option value="">-- Pilih Jabatan --</option>
            {jabatanList.map((j) => (
              <option key={j.id} value={j.id}>
                {j.nama_jabatan}
              </option>
            ))}
          </FormInput>
        </div>
      </div>

      {/* DATA PRIBADI */}
      <div className={`${sectionHeaderStyle} mt-10`}>
        <FiInfo /> Data Pribadi
      </div>
      <div className={formStyles.formGrid}>
        <FormInput
          label="Nama Lengkap"
          name="nama"
          value={formData.nama || ""}
          onChange={onChange}
          required
          span={12}
          placeholder="Nama lengkap anggota"
        />

        <FormInput
          label="Jenis Kelamin"
          name="jenis_kelamin"
          type="select"
          value={formData.jenis_kelamin || "Ikhwan"}
          onChange={onChange}
          span={6}
        >
          <option value="Ikhwan">Ikhwan (Laki-laki)</option>
          <option value="Akhwat">Akhwat (Perempuan)</option>
        </FormInput>

        <FormInput
          label="Instagram"
          name="instagram_username"
          value={formData.instagram_username || ""}
          onChange={onChange}
          span={6}
          placeholder="username tanpa @"
        />

        <FormInput
          label="Alamat"
          name="alamat"
          type="textarea"
          value={formData.alamat || ""}
          onChange={onChange}
          span={12}
          rows={2}
          placeholder="Alamat domisili singkat"
        />

        <div className={formStyles.colSpan12}>
          <FormInput
            label="Motto Hidup"
            name="motto"
            value={formData.motto || ""}
            onChange={onChange}
            maxLength={maxMotto}
            placeholder="Kutip motto singkat..."
          />
          <div
            className={`text-[10px] text-right mt-1 font-bold ${mottoLength >= maxMotto ? "text-red-500" : "text-text-muted"}`}
          >
            {mottoLength}/{maxMotto} Karakter
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="mt-10 pt-6 border-t border-border-dim flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl text-xs font-bold text-text-muted hover:bg-bg-page transition-all border border-border-dim"
          disabled={loading}
        >
          Batal
        </button>
        <button
          type="submit"
          className="px-8 py-2.5 rounded-xl text-xs font-extrabold text-white bg-primary hover:bg-primary-hover transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:transform-none transform active:scale-95"
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Simpan Data"}
        </button>
      </div>
    </form>
  );
};

export default AnggotaForm;
