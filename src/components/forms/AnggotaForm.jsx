import React, { useMemo, useEffect } from "react";
import FormInput from "../admin/FormInput.jsx";
import formStyles from "../admin/AdminForm.module.css";
import { FiUser, FiUpload, FiBriefcase, FiInfo } from "react-icons/fi";

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
  preview,
}) => {
  // --- LOGIC FILTER (TETAP DIPERTAHANKAN) ---
  const filteredDivisiList = useMemo(() => {
    if (!formData.periode_id) return [];
    return divisiList.filter(
      (d) => String(d.periode_id) === String(formData.periode_id)
    );
  }, [formData.periode_id, divisiList]);

  useEffect(() => {
    const isDivisiValid = filteredDivisiList.some(
      (d) => String(d.id) === String(formData.divisi_id)
    );
    if (formData.divisi_id && !isDivisiValid) {
      onChange({ target: { name: "divisi_id", value: "" } });
    }
  }, [formData.periode_id, filteredDivisiList, formData.divisi_id, onChange]);

  const mottoLength = (formData.motto || "").length;
  const maxMotto = 250;

  // Style Inline Sederhana untuk Section Header
  const sectionHeaderStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.85rem",
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "1rem",
    marginTop: "0.5rem",
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "0.5rem",
  };

  return (
    <form onSubmit={onSubmit} style={{ padding: "0.5rem" }}>
      {/* --- BAGIAN 1: FOTO PROFIL (Centered) --- */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            overflow: "hidden",
            border: "4px solid white",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            backgroundColor: "#f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1rem",
          }}
        >
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <FiUser size={48} color="#cbd5e1" />
          )}
        </div>

        <label
          className="button button-secondary"
          style={{
            fontSize: "0.8rem",
            padding: "0.4rem 1rem",
            cursor: "pointer",
          }}
        >
          <FiUpload size={14} style={{ marginRight: "6px" }} />
          {preview ? "Ganti Foto" : "Upload Foto"}
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            style={{ display: "none" }}
          />
        </label>
        <span
          style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "4px" }}
        >
          Maks. 2MB (JPG/PNG)
        </span>
      </div>

      {/* --- BAGIAN 2: INFORMASI JABATAN --- */}
      <div style={sectionHeaderStyle}>
        <FiBriefcase /> Posisi & Jabatan
      </div>

      <div className={formStyles.formGrid}>
        {/* PERIODE */}
        <FormInput
          label="Periode Kabinet"
          name="periode_id"
          type="select"
          value={formData.periode_id || ""}
          onChange={onChange}
          required
          span={6}
        >
          <option value="">-- Pilih Periode --</option>
          {periodeList.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nama_kabinet} ({p.tahun_mulai})
            </option>
          ))}
        </FormInput>

        {/* DIVISI */}
        <FormInput
          label="Divisi"
          name="divisi_id"
          type="select"
          value={formData.divisi_id || ""}
          onChange={onChange}
          required
          span={6}
          disabled={!formData.periode_id}
        >
          <option value="">
            {formData.periode_id ? "-- Pilih Divisi --" : "Pilih Periode Dulu"}
          </option>
          {filteredDivisiList.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nama_divisi}
            </option>
          ))}
        </FormInput>

        {/* JABATAN (FULL WIDTH AGAR JELAS) */}
        <div className={formStyles.colSpan12}>
          <FormInput
            label="Jabatan Struktural"
            name="jabatan_id"
            type="select"
            value={formData.jabatan_id || ""}
            onChange={onChange}
            required
          >
            <option value="">-- Pilih Jabatan --</option>
            {jabatanList.map((j) => (
              <option key={j.id} value={j.id}>
                {j.nama_jabatan}
              </option>
            ))}
          </FormInput>
        </div>
      </div>

      {/* --- BAGIAN 3: DATA PRIBADI --- */}
      <div style={{ ...sectionHeaderStyle, marginTop: "2rem" }}>
        <FiInfo /> Data Pribadi
      </div>

      <div className={formStyles.formGrid}>
        {/* NAMA */}
        <FormInput
          label="Nama Lengkap"
          name="nama"
          value={formData.nama || ""}
          onChange={onChange}
          required
          span={12}
          placeholder="Nama lengkap anggota"
        />

        {/* GENDER */}
        <FormInput
          label="Jenis Kelamin"
          name="jenis_kelamin"
          type="select"
          value={formData.jenis_kelamin || "Ikhwan"}
          onChange={onChange}
          span={6}
        >
          <option value="Ikhwan">Ikhwan (Laki-laki)</option>
          <option value="Akhwat">Akhwat (Perempuan)</option>
        </FormInput>

        {/* INSTAGRAM */}
        <FormInput
          label="Instagram"
          name="instagram_username"
          value={formData.instagram_username || ""}
          onChange={onChange}
          span={6}
          placeholder="username tanpa @"
        />

        {/* ALAMAT */}
        <FormInput
          label="Alamat"
          name="alamat"
          type="textarea"
          value={formData.alamat || ""}
          onChange={onChange}
          span={12}
          rows={2}
          placeholder="Alamat domisili singkat"
        />

        {/* MOTTO (DENGAN COUNTER) */}
        <div className={formStyles.colSpan12}>
          <FormInput
            label="Motto Hidup"
            name="motto"
            value={formData.motto || ""}
            onChange={onChange}
            maxLength={maxMotto}
            placeholder="Kutip motto singkat..."
          />
          <div
            style={{
              fontSize: "0.75rem",
              textAlign: "right",
              color: mottoLength >= maxMotto ? "#ef4444" : "#94a3b8",
              marginTop: "4px",
              fontWeight: 500,
            }}
          >
            {mottoLength}/{maxMotto} Karakter
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div
        style={{
          marginTop: "2rem",
          paddingTop: "1rem",
          borderTop: "1px solid #f1f5f9",
          display: "flex",
          justifyContent: "flex-end",
          gap: "1rem",
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          className="button button-secondary"
          disabled={loading}
        >
          Batal
        </button>
        <button
          type="submit"
          className="button button-primary"
          disabled={loading}
          style={{ minWidth: "120px" }}
        >
          {loading ? "Menyimpan..." : "Simpan Data"}
        </button>
      </div>
    </form>
  );
};

export default AnggotaForm;
