import React from "react";
import formStyles from "../admin/AdminForm.module.css";
import FormInput from "../admin/FormInput.jsx";

function AnggotaForm({
  formData,
  onChange,
  onFileChange,
  onSubmit,
  onCancel,
  loading,
  periodeList,
  divisiList,
  jabatanList,
  preview,
}) {
  return (
    <form onSubmit={onSubmit}>
      <div className={formStyles["form-grid"]}>
        <FormInput
          label="Nama Lengkap"
          name="nama"
          type="text"
          value={formData.nama || ""}
          onChange={onChange}
          required
          span="col-span-3"
        />

        <FormInput
          label="Gender"
          name="jenis_kelamin"
          type="select"
          value={formData.jenis_kelamin || "Ikhwan"}
          onChange={onChange}
          span="col-span-1"
        >
          <option value="Ikhwan">Ikhwan</option>
          <option value="Akhwat">Akhwat</option>
        </FormInput>

        <FormInput
          label="Periode"
          name="periode_id"
          type="select"
          value={formData.periode_id || ""}
          onChange={onChange}
          required
          span="col-span-2"
        >
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
          disabled={!formData.periode_id}
          span="col-span-3"
        >
          <option value="">-- Pilih Divisi --</option>
          {divisiList.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nama_divisi}
            </option>
          ))}
        </FormInput>

        <FormInput
          label="Jabatan"
          name="jabatan_di_divisi"
          type="select"
          value={formData.jabatan_di_divisi || ""}
          onChange={onChange}
          required
          disabled={!formData.divisi_id || jabatanList.length === 0}
          span="col-span-3"
        >
          <option value="">-- Pilih Jabatan --</option>
          {jabatanList.map((j) => (
            <option key={j.id} value={j.nama_jabatan}>
              {j.nama_jabatan}
            </option>
          ))}
        </FormInput>

        <FormInput
          label="Foto"
          name="foto"
          type="file"
          onChange={onFileChange}
          span="col-span-3"
        />

        {preview && (
          <div
            className={`${formStyles["form-group"]} ${formStyles["col-span-3"]}`}
            style={{ textAlign: "center" }}
          >
            <img
              src={preview}
              alt="Preview"
              className={formStyles["form-image-preview"]}
            />
          </div>
        )}

        <FormInput
          label="Instagram"
          name="instagram_username"
          type="text"
          value={formData.instagram_username || ""}
          onChange={onChange}
          span="col-span-3"
        />
        <FormInput
          label="Motto"
          name="motto"
          type="textarea"
          value={formData.motto || ""}
          onChange={onChange}
          span="col-span-3"
        />

        <FormInput
          label="Foto"
          name="foto"
          type="file"
          onChange={handleFileChange}
          span="col-span-3"
          helper="Format: JPG/PNG. Max 200KB." // <-- Tambahkan ini
        />

        <FormInput
          label="Instagram"
          name="instagram_username"
          type="text"
          value={formData.instagram_username || ""}
          onChange={onChange}
          span="col-span-3"
          placeholder="username"
          helper="Masukkan username tanpa awalan @" // <-- INI BARU
        />
      </div>

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

export default AnggotaForm;
