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
      <div className={formStyles.formGrid}>
        <FormInput
          label="Nama Acara"
          name="nama_acara"
          value={formData.nama_acara || ""}
          onChange={onChange}
          required
          span={8}
          placeholder="Nama kegiatan..."
        />

        <FormInput
          label="Status"
          name="status"
          type="select"
          value={formData.status || "Rencana"}
          onChange={onChange}
          span={4}
        >
          <option value="Rencana">Rencana</option>
          <option value="Selesai">Selesai</option>
          <option value="Batal">Batal / Gagal</option>
        </FormInput>

        {/* ... (SISA INPUT LAIN TETAP SAMA SEPERTI SEBELUMNYA) ... */}
        {/* Pastikan input embed_html tetap ada: */}

        <FormInput
          label="Tanggal"
          name="tanggal"
          type="date"
          value={formData.tanggal || ""}
          onChange={onChange}
          required
          span={4}
        />

        <FormInput
          label="Periode"
          name="periode_id"
          type="select"
          value={formData.periode_id || ""}
          onChange={onChange}
          required
          span={4}
        >
          <option value="">-- Pilih --</option>
          {periodeList.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nama_kabinet}
            </option>
          ))}
        </FormInput>

        <FormInput
          label="Divisi Pelaksana"
          name="divisi_id"
          type="select"
          value={formData.divisi_id || ""}
          onChange={onChange}
          span={4}
        >
          <option value="">-- Pilih --</option>
          {divisiList.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nama_divisi}
            </option>
          ))}
        </FormInput>

        <FormInput
          label="Penanggung Jawab (PJ)"
          name="penanggung_jawab_id"
          type="select"
          value={formData.penanggung_jawab_id || ""}
          onChange={onChange}
          span={6}
          required
        >
          <option value="">-- Pilih Anggota --</option>
          {anggotaList.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nama}
            </option>
          ))}
        </FormInput>

        <FormInput
          label="Link Dokumen / LPJ"
          name="link_dokumentasi"
          value={formData.link_dokumentasi || ""}
          onChange={onChange}
          span={6}
          placeholder="Google Drive, dll..."
        />

        <FormInput
          label="Embed HTML"
          name="embed_html"
          value={formData.embed_html || ""}
          onChange={onChange}
          span={12}
          placeholder='<iframe src="..."></iframe>'
        />

        <FormInput
          label="Deskripsi Singkat"
          name="deskripsi"
          type="textarea"
          value={formData.deskripsi || ""}
          onChange={onChange}
          span={12}
          rows={3}
          isMarkdown={true}
          placeholder="Jelaskan tujuan kegiatan ini..."
        />
      </div>

      <div className={formStyles.formFooter}>
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
          {loading ? "Menyimpan..." : "Simpan Data"}
        </button>
      </div>
    </form>
  );
}

export default ProgramKerjaForm;
