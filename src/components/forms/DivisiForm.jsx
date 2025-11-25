import React from "react";
import formStyles from "../admin/AdminForm.module.css";
import FormInput from "../admin/FormInput.jsx";

function DivisiForm({
  formData,
  onChange,
  onFileChange,
  onSubmit,
  onCancel,
  loading,
  periodeList,
}) {
  // LOGIKA VALIDASI FILE (Max 200KB)
  const handleFileValidation = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 200KB = 200 * 1024 = 204800 bytes
      if (file.size > 204800) {
        alert("Ukuran file terlalu besar! Maksimal 200KB.");
        e.target.value = null; // Reset input
        return;
      }
    }
    // Jika aman, panggil handler asli
    if (onFileChange) onFileChange(e);
  };

  // Logic Preview
  const showPreview = formData.logo_url;

  return (
    <form onSubmit={onSubmit}>
      <div className={formStyles["form-grid"]}>
        {/* Nama Divisi */}
        <FormInput
          label="Nama Divisi"
          name="nama_divisi"
          type="text"
          value={formData.nama_divisi || ""}
          onChange={onChange}
          required
          span="col-span-3"
        />

        {/* Periode */}
        <FormInput
          label="Periode"
          name="periode_id"
          type="select"
          value={formData.periode_id || ""}
          onChange={onChange}
          required
          span="col-span-3"
        >
          <option value="">-- Pilih Periode --</option>
          {periodeList.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nama_kabinet}
            </option>
          ))}
        </FormInput>

        {/* Deskripsi (Textarea Manual pakai style Anda) */}
        <div
          className={`${formStyles["col-span-3"]} ${formStyles["form-group"]}`}
        >
          <label className={formStyles["form-label"]}>Deskripsi Divisi</label>
          <textarea
            name="deskripsi"
            value={formData.deskripsi || ""}
            onChange={onChange}
            // Menggunakan class .form-textarea dari CSS Anda
            className={formStyles["form-textarea"]}
            rows="4"
            placeholder="Jelaskan detail divisi ini..."
          />
        </div>

        {/* Upload Logo + Preview */}
        <div
          className={`${formStyles["col-span-3"]} ${formStyles["form-group"]}`}
        >
          {/* Kita pakai FormInput untuk file, tapi helper text disesuaikan */}
          <FormInput
            label="Ganti Logo"
            name="logo"
            type="file"
            onChange={handleFileValidation} // Pakai validasi lokal
            helper="Format: JPG/PNG. Maksimal 200KB."
            accept="image/png, image/jpeg, image/jpg"
          />

          {/* Tampilkan preview jika ada URL logo */}
          {showPreview && (
            <div style={{ marginTop: "0.5rem" }}>
              <label className={formStyles["form-label"]}>
                Preview Logo Saat Ini:
              </label>
              <div>
                <img
                  src={showPreview}
                  alt="Preview"
                  className={formStyles["form-image-preview"]}
                  onError={(e) => (e.target.style.display = "none")}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Buttons */}
      <div className={formStyles["form-footer"]}>
        <button
          type="button"
          className="button button-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Batal
        </button>
        <button
          type="submit"
          className="button button-primary"
          disabled={loading}
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </form>
  );
}

export default DivisiForm;
