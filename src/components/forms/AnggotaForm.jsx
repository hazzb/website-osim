import React, { useMemo, useEffect } from "react";
import FormInput from "../admin/FormInput.jsx";
import formStyles from "../admin/AdminForm.module.css";
import { FiUser, FiImage } from "react-icons/fi";

const AnggotaForm = ({
  formData,
  onChange,
  onFileChange,
  onSubmit,
  onCancel,
  loading,
  periodeList = [],
  divisiList = [],
  jabatanList = [],
  jabatanLinks = [], // Data relasi Divisi <-> Jabatan
  preview,
}) => {
  // --- LOGIC FILTER JABATAN ---
  const filteredJabatanList = useMemo(() => {
    // 1. Jika Divisi Belum Dipilih -> Jangan tampilkan jabatan apapun (atau tampilkan semua, tergantung preferensi)
    if (!formData.divisi_id) return [];

    // 2. Cari ID Jabatan yang boleh muncul untuk Divisi ini
    const allowedJabatanIds = jabatanLinks
      .filter((link) => String(link.divisi_id) === String(formData.divisi_id))
      .map((link) => link.jabatan_id);

    // 3. Jika tidak ada link khusus (divisi bebas), mungkin tampilkan semua jabatan 'Divisi' & 'Umum'
    // Tapi karena kita ingin strict, kita kosongkan saja jika belum diatur relasinya.
    if (allowedJabatanIds.length === 0) {
      // OPSI: Kembalikan jabatan bertipe 'Divisi' & 'Umum' sebagai fallback jika lupa setting relasi
      return jabatanList.filter((j) => j.tipe_jabatan !== "Inti");
    }

    // 4. Filter Master Jabatan berdasarkan ID yang diizinkan
    return jabatanList.filter((jabatan) =>
      allowedJabatanIds.includes(jabatan.id)
    );
  }, [formData.divisi_id, jabatanLinks, jabatanList]);

  // --- LOGIC OTOMATIS GANTI JABATAN ---
  // Jika user ganti divisi, dan jabatan yang lama tidak valid lagi, reset jabatannya
  useEffect(() => {
    const isJabatanValid = filteredJabatanList.some(
      (j) => String(j.id) === String(formData.jabatan_id)
    );

    // Jika jabatan terisi tapi tidak ada di list baru, reset ke kosong
    if (formData.jabatan_id && !isJabatanValid) {
      // Kita perlu memanggil onChange secara manual untuk mereset
      // Simulasi event object
      onChange({ target: { name: "jabatan_id", value: "" } });
    }
  }, [formData.divisi_id]); // Trigger setiap divisi berubah

  return (
    <form onSubmit={onSubmit}>
      <div className={formStyles.formGrid}>
        {/* Nama Lengkap */}
        <FormInput
          label="Nama Lengkap"
          name="nama"
          value={formData.nama || ""}
          onChange={onChange}
          required
          span={8}
          placeholder="Nama sesuai KTP/Kartu Pelajar"
        />

        {/* Gender */}
        <div className={formStyles.colSpan4}>
          <FormInput
            label="Jenis Kelamin"
            name="jenis_kelamin"
            type="select"
            value={formData.jenis_kelamin || "Ikhwan"}
            onChange={onChange}
          >
            <option value="Ikhwan">Ikhwan</option>
            <option value="Akhwat">Akhwat</option>
          </FormInput>
        </div>

        {/* Instagram */}
        <div className={formStyles.colSpan6}>
          <FormInput
            label="Instagram (Username)"
            name="instagram_username"
            value={formData.instagram_username || ""}
            onChange={onChange}
            placeholder="tanpa @"
          />
        </div>

        {/* Alamat */}
        <div className={formStyles.colSpan6}>
          <FormInput
            label="Alamat Singkat"
            name="alamat"
            value={formData.alamat || ""}
            onChange={onChange}
            placeholder="Contoh: Jl. Mawar No. 10"
          />
        </div>

        <div
          className={formStyles.colSpan12}
          style={{ borderTop: "1px dashed #e2e8f0", margin: "0.5rem 0" }}
        ></div>

        {/* Periode */}
        <div className={formStyles.colSpan4}>
          <FormInput
            label="Periode"
            name="periode_id"
            type="select"
            value={formData.periode_id || ""}
            onChange={onChange}
            required
          >
            <option value="">-- Pilih Periode --</option>
            {periodeList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama_kabinet}
              </option>
            ))}
          </FormInput>
        </div>

        {/* Divisi */}
        <div className={formStyles.colSpan4}>
          <FormInput
            label="Divisi"
            name="divisi_id"
            type="select"
            value={formData.divisi_id || ""}
            onChange={onChange}
            required
            disabled={!formData.periode_id}
          >
            <option value="">-- Pilih Divisi --</option>
            {divisiList.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nama_divisi}
              </option>
            ))}
          </FormInput>
        </div>

        {/* Jabatan (FILTERED) */}
        <div className={formStyles.colSpan4}>
          <FormInput
            label="Jabatan"
            name="jabatan_id" // Pastikan namanya jabatan_id, bukan jabatan_di_divisi (sesuaikan DB)
            type="select"
            value={formData.jabatan_id || ""}
            onChange={onChange}
            required
            disabled={!formData.divisi_id}
            helper={
              formData.divisi_id && filteredJabatanList.length === 0
                ? "Belum ada jabatan yg diatur utk divisi ini."
                : ""
            }
          >
            <option value="">-- Pilih Jabatan --</option>
            {filteredJabatanList.map((j) => (
              <option key={j.id} value={j.id}>
                {j.nama_jabatan}
              </option>
            ))}
          </FormInput>
        </div>

        {/* Motto */}
        <FormInput
          label="Motto Hidup"
          name="motto"
          type="textarea"
          value={formData.motto || ""}
          onChange={onChange}
          span={12}
          rows={2}
          placeholder="Kata-kata motivasi..."
        />

        {/* Upload Foto */}
        <div className={formStyles.colSpan12}>
          <label className={formStyles.formLabel}>Foto Profil</label>
          <div className={formStyles.uploadRow}>
            <div
              className={formStyles.previewBox}
              style={{ borderRadius: "50%", width: "60px", height: "60px" }}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <FiUser size={24} color="#cbd5e0" />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <label
                className={formStyles.uploadBtn}
                style={{ width: "fit-content" }}
              >
                Pilih Foto
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  hidden
                />
              </label>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  marginLeft: "0.5rem",
                }}
              >
                Max 500KB (Wajah)
              </span>
            </div>
          </div>
        </div>
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
};

export default AnggotaForm;
