import React from "react";
import formStyles from "../admin/AdminForm.module.css";
import FormInput from "../admin/FormInput.jsx";

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
        />
        <FormInput
          label="Mulai"
          name="tahun_mulai"
          type="number"
          value={formData.tahun_mulai || ""}
          onChange={onChange}
          required
          span={4}
        />
        <FormInput
          label="Selesai"
          name="tahun_selesai"
          type="number"
          value={formData.tahun_selesai || ""}
          onChange={onChange}
          required
          span={4}
        />
        <FormInput
          label="Status"
          name="is_active"
          type="select"
          value={formData.is_active}
          onChange={onChange}
          span={4}
        >
          <option value={false}>Tidak Aktif</option>
          <option value={true}>Aktif</option>
        </FormInput>
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
          Simpan
        </button>
      </div>
    </form>
  );
};
export default PeriodeForm;
