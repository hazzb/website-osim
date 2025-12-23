import React from "react";
import FormInput from "../admin/FormInput.jsx";
import formStyles from "../admin/AdminForm.module.css";
import { FiImage, FiUpload } from "react-icons/fi";

const DivisiForm = ({
  formData,
  onChange,
  onFileChange,
  preview,
  onSubmit,
  onCancel,
  loading,
  periodeList = [],
}) => {
  return (
    <form onSubmit={onSubmit} className={formStyles.form}>
      <div className={formStyles.formGrid}>
        
        {/* BARIS 1: Periode (Lebar 8) & Urutan (Lebar 4) */}
        <FormInput
          label="Periode Kabinet"
          name="periode_id"
          type="select"
          value={formData.periode_id || ""}
          onChange={onChange}
          required
          span={8} // Gunakan prop span langsung
        >
          <option value="" disabled>-- Pilih --</option>
          {periodeList.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nama_kabinet} ({p.tahun_mulai})
            </option>
          ))}
        </FormInput>

        <FormInput
          label="Urutan"
          name="urutan"
          type="number"
          value={formData.urutan || 10}
          onChange={onChange}
          placeholder="#"
          span={4} // Gunakan prop span langsung
          helper="1 = Atas"
        />

        {/* BARIS 2: Kategori (Lebar 6) & Nama (Lebar 6) */}
        <FormInput
          label="Kategori"
          name="tipe"
          type="select"
          value={formData.tipe || "Umum"}
          onChange={onChange}
          required
          span={6}
          helper={formData.tipe === "Inti" ? "⚠️ Khusus BPH" : "Divisi Biasa"}
        >
          <option value="Umum">Divisi Umum</option>
          <option value="Inti">Pengurus Inti</option>
        </FormInput>

        <FormInput
          label="Nama Divisi"
          name="nama_divisi"
          value={formData.nama_divisi || ""}
          onChange={onChange}
          required
          span={6}
          placeholder="Nama Divisi"
        />

        {/* BARIS 3: Logo (Custom Component - Full Width) */}
        {/* Kita beri style gridColumn: "span 12" agar dia memanjang penuh */}
        <div style={{ gridColumn: "span 12" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", fontSize: "0.9rem", color: "#334155" }}>
            Logo Divisi
          </label>

          <div style={{ 
            display: "flex", alignItems: "center", gap: "1rem", 
            padding: "0.6rem", border: "1px solid #e2e8f0", 
            borderRadius: "6px", background: "#f8fafc" 
          }}>
            {/* Preview Image */}
            <div style={{ 
              width: "45px", height: "45px", borderRadius: "6px", 
              overflow: "hidden", background: "#fff", border: "1px solid #cbd5e0", 
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 
            }}>
              {preview ? (
                <img src={preview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <FiImage size={20} color="#94a3b8" />
              )}
            </div>

            {/* Upload Button */}
            <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Max 1MB</span>
              <div>
                <input type="file" id="small_file_logo" name="file_logo" accept="image/*" onChange={onFileChange} style={{ display: "none" }} />
                <label htmlFor="small_file_logo" className="button button-secondary" style={{ padding: "0.3rem 0.8rem", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer", height: "auto" }}>
                  <FiUpload size={12} /> {preview ? "Ganti" : "Upload"}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* BARIS 4: Deskripsi (Full Width) */}
        <FormInput
          label="Deskripsi Singkat"
          name="deskripsi"
          type="textarea"
          value={formData.deskripsi || ""}
          onChange={onChange}
          span={12}
          rows={2}
          placeholder="Tugas utama..."
        />
      </div>

      {/* FOOTER */}
      <div className={formStyles.formFooter} style={{ marginTop: "1rem" }}>
        <button type="button" onClick={onCancel} className="button button-secondary">
          Batal
        </button>
        <button type="submit" className="button button-primary" disabled={loading}>
          {loading ? "Simpan..." : "Simpan"}
        </button>
      </div>
    </form>
  );
};

export default DivisiForm;