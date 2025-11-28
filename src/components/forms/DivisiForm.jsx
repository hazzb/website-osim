import React from "react";
import formStyles from "../admin/AdminForm.module.css";
import FormInput from "../admin/FormInput.jsx";
import { FiImage } from "react-icons/fi";

function DivisiForm({
  formData,
  onChange,
  onFileChange,
  onSubmit,
  onCancel,
  loading,
  periodeList,
}) {
  const showPreview = formData.logo_url;

  return (
    <form onSubmit={onSubmit}>
      <div className={formStyles.formGrid}>
        <FormInput
          label="Nama Divisi"
          name="nama_divisi"
          value={formData.nama_divisi || ""}
          onChange={onChange}
          required
          span={8}
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
          label="Deskripsi"
          name="deskripsi"
          type="textarea"
          value={formData.deskripsi || ""}
          onChange={onChange}
          span={12}
          rows={3}
        />

        {/* Upload Logo */}
        <div className={formStyles.colSpan12}>
          <label className={formStyles.formLabel}>Logo Divisi</label>
          <div className={formStyles.uploadRow}>
            <div className={formStyles.previewBox}>
              {showPreview ? (
                <img src={showPreview} alt="Logo" />
              ) : (
                <FiImage size={20} />
              )}
            </div>
            <label className={formStyles.uploadBtn}>
              Pilih File{" "}
              <input
                type="file"
                onChange={onFileChange}
                accept="image/*"
                hidden
              />
            </label>
          </div>
        </div>
      </div>

      <div className={formStyles.formFooter}>
        <button
          type="button"
          className="button button-secondary"
          onClick={onCancel}
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
}
export default DivisiForm;
