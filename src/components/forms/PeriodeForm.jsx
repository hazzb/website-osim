import React from "react";
import FormInput from "../admin/FormInput.jsx";
import formStyles from "../admin/AdminForm.module.css";

const PeriodeForm = ({ formData, onChange, onSubmit, onCancel, loading }) => {
  return (
    <form onSubmit={onSubmit}>
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

        {/* --- BAGIAN INI DIUBAH (HAPUS DEFAULT DATE) --- */}
        <div className={formStyles.colSpan6}>
          <FormInput
            label="Tahun Mulai"
            name="tahun_mulai"
            type="number"
            // Ganti ini: value={formData.tahun_mulai || new Date().getFullYear()}
            // Menjadi ini:
            value={formData.tahun_mulai || ""}
            onChange={onChange}
            required
            placeholder="YYYY"
          />
        </div>
        <div className={formStyles.colSpan6}>
          <FormInput
            label="Tahun Selesai"
            name="tahun_selesai"
            type="number"
            // Ganti ini: value={formData.tahun_selesai || new Date().getFullYear() + 1}
            // Menjadi ini:
            value={formData.tahun_selesai || ""}
            onChange={onChange}
            required
            placeholder="YYYY"
          />
        </div>
        {/* --------------------------------------------- */}

        <div className={formStyles.colSpan12}>
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
          {loading ? "Menyimpan..." : "Simpan Periode"}
        </button>
      </div>
    </form>
  );
};

export default PeriodeForm;
