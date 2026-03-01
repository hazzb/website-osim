"use client";

import React from "react";
import FormInput from "../admin/FormInput.jsx";
import formStyles from "../admin/AdminForm.module.css";

const PeriodeForm = ({ formData, onChange, onSubmit, onCancel, loading }) => {
  return (
    <form onSubmit={onSubmit} className="p-2">
      <div className={formStyles.formGrid}>
        <FormInput
          label="Nama Kabinet"
          name="nama_kabinet"
          value={formData.nama_kabinet || ""}
          onChange={onChange}
          required
          span={12}
          placeholder="Contoh: Kabinet Pembaharu"
        />

        <div className="col-span-6">
          <FormInput
            label="Tahun Mulai"
            name="tahun_mulai"
            type="number"
            value={formData.tahun_mulai || ""}
            onChange={onChange}
            required
            placeholder="YYYY"
          />
        </div>
        <div className="col-span-6">
          <FormInput
            label="Tahun Selesai"
            name="tahun_selesai"
            type="number"
            value={formData.tahun_selesai || ""}
            onChange={onChange}
            required
            placeholder="YYYY"
          />
        </div>

        <div className="col-span-12">
          <FormInput
            label="Status Periode"
            name="is_active"
            type="select"
            value={formData.is_active}
            onChange={onChange}
          >
            <option value={false}>Arsip (Tidak Aktif)</option>
            <option value={true}>Aktif (Sedang Berjalan)</option>
          </FormInput>
        </div>

        <FormInput
          label="Motto / Slogan"
          name="motto_kabinet"
          type="textarea"
          value={formData.motto_kabinet || ""}
          onChange={onChange}
          span={12}
          rows={2}
          placeholder="Visi singkat atau slogan kabinet..."
        />
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all border border-slate-200"
        >
          Batal
        </button>
        <button
          type="submit"
          className="px-8 py-2.5 rounded-xl text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 transform active:scale-95"
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Simpan Periode"}
        </button>
      </div>
    </form>
  );
};

export default PeriodeForm;
