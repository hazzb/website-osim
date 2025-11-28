import React, { useMemo } from "react";
import FormInput from "../admin/FormInput.jsx";
import formStyles from "../admin/AdminForm.module.css";
import { FiUser, FiCamera } from "react-icons/fi";

const AnggotaForm = ({
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
  jabatanLinks = [],
}) => {
  const filteredJabatan = useMemo(() => {
    if (!formData.divisi_id) return [];
    const links = jabatanLinks.filter(
      (l) => l.divisi_id === parseInt(formData.divisi_id)
    );
    if (links.length > 0) {
      const allowedIds = links.map((l) => l.jabatan_id);
      return jabatanList.filter((jab) => allowedIds.includes(jab.id));
    }
    return jabatanList;
  }, [formData.divisi_id, jabatanList, jabatanLinks]);

  return (
    <form onSubmit={onSubmit}>
      <div className={formStyles.formGrid}>
        {/* Foto Profil Bulat */}
        <div className={formStyles.colSpan12}>
          <div className={formStyles.uploadRow}>
            <div
              className={`${formStyles.previewBox} ${formStyles.previewCircle}`}
            >
              {preview ? (
                <img src={preview} alt="Preview" />
              ) : (
                <FiUser size={24} />
              )}
            </div>
            <div>
              <label className={formStyles.uploadBtn}>
                <FiCamera /> Ganti Foto
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  hidden
                />
              </label>
            </div>
          </div>
        </div>

        <FormInput
          label="Nama Lengkap"
          name="nama"
          value={formData.nama || ""}
          onChange={onChange}
          required
          span={8}
        />

        <FormInput
          label="Gender"
          name="jenis_kelamin"
          type="select"
          value={formData.jenis_kelamin || "Ikhwan"}
          onChange={onChange}
          required
          span={4}
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
          span={4}
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
          span={4}
        >
          <option value="">Pilih Divisi</option>
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
          span={4}
          disabled={!formData.divisi_id}
        >
          <option value="">{formData.divisi_id ? "Pilih Jabatan" : "-"}</option>
          {filteredJabatan.map((j) => (
            <option key={j.id} value={j.nama_jabatan}>
              {j.nama_jabatan}
            </option>
          ))}
        </FormInput>

        <FormInput
          label="Instagram (Username)"
          name="instagram_username"
          value={formData.instagram_username || ""}
          onChange={onChange}
          span={6}
          placeholder="username"
        />

        <FormInput
          label="Motto Hidup"
          name="motto"
          value={formData.motto || ""}
          onChange={onChange}
          span={6}
        />

        <FormInput
          label="Alamat Domisili"
          name="alamat"
          type="textarea"
          value={formData.alamat || ""}
          onChange={onChange}
          span={12}
          placeholder="Alamat lengkap..."
          rows={2}
        />
      </div>

      {/* TOMBOL PASTI DI KANAN */}
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
};

export default AnggotaForm;
