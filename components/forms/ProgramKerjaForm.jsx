"use client";

import React from "react";
import FormInput from "../admin/FormInput.jsx";
import formStyles from "../admin/AdminForm.module.css";
import {
  FiCalendar,
  FiActivity,
  FiTag,
  FiUsers,
  FiInfo,
  FiLink,
  FiCode,
} from "react-icons/fi";

const ProgramKerjaForm = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  loading,
  divisiList = [],
  anggotaList = [],
  periodeList = [],
}) => {
  return (
    <form onSubmit={onSubmit} className="p-2">
      <div className={formStyles.formGrid}>
        {/* NAMA ACARA */}
        <FormInput
          label="Nama Acara"
          name="nama_acara"
          value={formData.nama_acara || ""}
          onChange={onChange}
          required
          span={12}
          placeholder="Contoh: Latihan Dasar Kepemimpinan"
        />

        {/* TANGGAL & STATUS */}
        <FormInput
          label="Tanggal Pelaksanaan"
          name="tanggal"
          type="date"
          value={formData.tanggal || ""}
          onChange={onChange}
          span={6}
        />

        <FormInput
          label="Status"
          name="status"
          type="select"
          value={formData.status || "Rencana"}
          onChange={onChange}
          required
          span={6}
        >
          <option value="Rencana">Rencana</option>
          <option value="Berjalan">Berjalan</option>
          <option value="Selesai">Selesai</option>
        </FormInput>

        {/* TARGET GENDER */}
        <div className="col-span-12">
          <label className="block text-[10px] font-extrabold text-text-muted uppercase tracking-widest mb-3 px-1">
            Target Peserta
          </label>
          <div className="flex gap-3 bg-bg-page p-2 rounded-2xl border border-border-dim ring-1 ring-slate-100/50">
            {["Umum", "Ikhwan", "Akhwat"].map((g) => (
              <label
                key={g}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tight cursor-pointer transition-all border-2 ${
                  formData.target_gender === g
                    ? "bg-bg-card border-blue-500 text-primary shadow-sm"
                    : "bg-transparent border-transparent text-text-muted hover:text-text-body"
                }`}
              >
                <input
                  type="radio"
                  name="target_gender"
                  value={g}
                  checked={formData.target_gender === g}
                  onChange={onChange}
                  className="hidden"
                />
                {g}
              </label>
            ))}
          </div>
        </div>

        {/* DIVISI & PJ */}
        <FormInput
          label="Divisi Penyelenggara"
          name="divisi_id"
          type="select"
          value={formData.divisi_id || ""}
          onChange={onChange}
          required
          span={6}
        >
          <option value="">- Pilih Divisi -</option>
          {divisiList.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nama_divisi}
            </option>
          ))}
        </FormInput>

        <FormInput
          label="Penanggung Jawab"
          name="penanggung_jawab_id"
          type="select"
          value={formData.penanggung_jawab_id || ""}
          onChange={onChange}
          required
          span={6}
        >
          <option value="">- Pilih Anggota -</option>
          {anggotaList.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nama}
            </option>
          ))}
        </FormInput>

        {/* PERIODE */}
        <FormInput
          label="Periode Kabinet"
          name="periode_id"
          type="select"
          value={formData.periode_id || ""}
          onChange={onChange}
          required
          span={12}
        >
          <option value="">- Pilih Periode -</option>
          {periodeList.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nama_kabinet} {p.is_active ? "(AKTIF)" : ""}
            </option>
          ))}
        </FormInput>

        {/* DESKRIPSI */}
        <FormInput
          label="Deskripsi Kegiatan"
          name="deskripsi"
          type="textarea"
          value={formData.deskripsi || ""}
          onChange={onChange}
          span={12}
          rows={3}
          placeholder="Jelaskan tujuan dan gambaran singkat acara..."
        />

        {/* LINKS */}
        <FormInput
          label="Link Dokumentasi (Drive/Photo)"
          name="link_dokumentasi"
          value={formData.link_dokumentasi || ""}
          onChange={onChange}
          span={12}
          placeholder="https://..."
        />

        <FormInput
          label="Embed HTML (YouTube/Map/dll)"
          name="embed_html"
          type="textarea"
          value={formData.embed_html || ""}
          onChange={onChange}
          span={12}
          rows={2}
          placeholder="<iframe ... ></iframe>"
        />
      </div>

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
          className="px-8 py-2.5 rounded-xl text-xs font-extrabold text-white bg-primary hover:bg-primary-hover transition-all shadow-lg shadow-blue-200 disabled:opacity-50 transform active:scale-95"
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Simpan Data"}
        </button>
      </div>
    </form>
  );
};

export default ProgramKerjaForm;
