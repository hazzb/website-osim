// src/components/forms/ProgramKerjaForm.jsx
import React from "react";
import formStyles from "../admin/AdminForm.module.css";
import FormInput from "../admin/FormInput.jsx";

function ProgramKerjaForm({
  formData,
  onChange,
  onSubmit,
  onCancel,
  loading,
  periodeList = [],
  divisiList = [],
  anggotaList = [],
}) {
  return (
    <form onSubmit={onSubmit}>
      <div className={formStyles["form-grid"]}>
        {/* Nama Acara */}
        <FormInput
          label="Nama Acara"
          name="nama_acara"
          type="text"
          value={formData.nama_acara || ""}
          onChange={onChange}
          required
          span="col-span-3"
        />

        {/* Status */}
        <FormInput
          label="Status"
          name="status"
          type="select"
          value={formData.status || "Rencana"}
          onChange={onChange}
          span="col-span-1"
        >
          <option value="Rencana">Rencana</option>
          <option value="Akan Datang">Akan Datang</option>
          <option value="Selesai">Selesai</option>
        </FormInput>

        {/* Periode */}
        <FormInput
          label="Periode"
          name="periode_id"
          type="select"
          value={formData.periode_id || ""}
          onChange={onChange}
          required
          span="col-span-1"
        >
          <option value="">-- Pilih Periode --</option>
          {periodeList.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nama_kabinet}
            </option>
          ))}
        </FormInput>

        {/* Tanggal */}
        <FormInput
          label="Tanggal"
          name="tanggal"
          type="date"
          value={formData.tanggal || ""}
          onChange={onChange}
          required
          span="col-span-1"
        />

        {/* Divisi */}
        <FormInput
          label="Divisi"
          name="divisi_id"
          type="select"
          value={formData.divisi_id || ""}
          onChange={onChange}
          required
          span="col-span-1"
        >
          <option value="">-- Pilih Divisi --</option>
          {divisiList.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nama_divisi}
            </option>
          ))}
        </FormInput>

        {/* Penanggung Jawab (Relasi ke Anggota) */}
        <FormInput
          label="Penanggung Jawab"
          name="penanggung_jawab_id"
          type="select"
          value={formData.penanggung_jawab_id || ""}
          onChange={onChange}
          required
          span="col-span-2"
        >
          <option value="">-- Pilih Anggota --</option>
          {anggotaList.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nama}
            </option>
          ))}
        </FormInput>

        {/* Embed Video */}
        <FormInput
          label="Embed HTML (Youtube)"
          name="embed_html"
          type="text"
          value={formData.embed_html || ""}
          onChange={onChange}
          span="col-span-3"
          placeholder='<iframe src="..."></iframe>'
        />

        {/* Link Dokumen */}
        <FormInput
          label="Link Dokumen"
          name="link_dokumentasi"
          type="text"
          value={formData.link_dokumentasi || ""}
          onChange={onChange}
          span="col-span-3"
        />

        {/* Deskripsi (Hanya satu kolom 'deskripsi' di DB Anda) */}
        <FormInput
          label="Deskripsi Program"
          name="deskripsi"
          type="textarea"
          value={formData.deskripsi || ""}
          onChange={onChange}
          span="col-span-3"
          style={{ height: "150px" }}
        />
      </div>

      <div className={formStyles["form-footer"]}>
        <button
          type="button"
          onClick={onCancel}
          className="button button-secondary"
        >
          Batal
        </button>
        <button
          type="submit"
          className="button button-primary"
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </form>
  );
}

export default ProgramKerjaForm;
