import React, { useMemo, useEffect } from "react";
import FormInput from "../admin/FormInput.jsx";
import formStyles from "../admin/AdminForm.module.css";
import { FiUser, FiUpload, FiInstagram } from "react-icons/fi";

const AnggotaForm = ({
  formData,
  onChange,
  onFileChange,
  onSubmit,
  onCancel,
  loading,
  periodeList = [],
  divisiList = [], // Ini berisi SEMUA divisi dari semua periode
  jabatanList = [],
  preview,
}) => {

  // --- 1. LOGIC FILTER DIVISI BERDASARKAN PERIODE ---
  const filteredDivisiList = useMemo(() => {
    if (!formData.periode_id) return [];
    
    // Ambil divisi yang periode_id nya sama dengan yang dipilih di form
    return divisiList.filter(d => String(d.periode_id) === String(formData.periode_id));
  }, [formData.periode_id, divisiList]);

  // --- 2. LOGIC RESET DIVISI SAAT PERIODE BERUBAH ---
  useEffect(() => {
    // Cek apakah divisi yang sedang dipilih ada di daftar periode baru?
    const isDivisiValid = filteredDivisiList.some(
      (d) => String(d.id) === String(formData.divisi_id)
    );

    // Jika periode berubah dan divisi lama jadi tidak valid, reset divisi & jabatan
    if (formData.divisi_id && !isDivisiValid) {
      onChange({ target: { name: "divisi_id", value: "" } });
      onChange({ target: { name: "jabatan_id", value: "" } });
    }
  }, [formData.periode_id, filteredDivisiList]);

  // --- 3. LOGIC FILTER JABATAN CERDAS (INTI vs UMUM) ---
  const filteredJabatanList = useMemo(() => {
    if (!formData.divisi_id) return [];

    // Cari data divisi yang dipilih untuk tahu TIPE-nya
    const selectedDivisi = divisiList.find(d => String(d.id) === String(formData.divisi_id));
    
    if (!selectedDivisi) return [];

    // JIKA DIVISI INTI (BPH) -> Tampilkan Jabatan Inti
    if (selectedDivisi.tipe === 'Inti') {
       return jabatanList.filter(j => j.tipe_jabatan === 'Inti');
    } 
    // JIKA DIVISI UMUM -> Tampilkan Jabatan Struktural
    else {
       return jabatanList.filter(j => j.tipe_jabatan === 'Divisi');
    }
  }, [formData.divisi_id, divisiList, jabatanList]);

  // --- 4. LOGIC RESET JABATAN SAAT DIVISI BERUBAH ---
  useEffect(() => {
    const isJabatanValid = filteredJabatanList.some(
      (j) => String(j.id) === String(formData.jabatan_id)
    );
    if (formData.jabatan_id && !isJabatanValid) {
      onChange({ target: { name: "jabatan_id", value: "" } });
    }
  }, [formData.divisi_id, filteredJabatanList]);


  return (
    <form onSubmit={onSubmit}>
      <div className={formStyles.formGrid} style={{ gap: "0.75rem" }}>
        
        {/* BARIS 1: Nama (8) & Gender (4) */}
        <div className={formStyles.colSpan8}>
          <FormInput
            label="Nama Lengkap"
            name="nama"
            value={formData.nama || ""}
            onChange={onChange}
            required
            placeholder="Sesuai KTP"
          />
        </div>
        <div className={formStyles.colSpan4}>
          <FormInput
            label="Gender"
            name="jenis_kelamin"
            type="select"
            value={formData.jenis_kelamin || "Ikhwan"}
            onChange={onChange}
          >
            <option value="Ikhwan">Laki-laki</option>
            <option value="Akhwat">Perempuan</option>
          </FormInput>
        </div>

        {/* BARIS 2: IG (6) & Alamat (6) */}
        <div className={formStyles.colSpan6}>
          <FormInput
            label="Instagram"
            name="instagram_username"
            value={formData.instagram_username || ""}
            onChange={onChange}
            placeholder="username"
            helper={
              <span style={{ display: "flex", alignItems: "center", gap: "2px", fontSize: "0.7rem" }}>
                <FiInstagram /> Tanpa @
              </span>
            }
          />
        </div>
        <div className={formStyles.colSpan6}>
          <FormInput
            label="Alamat Singkat"
            name="alamat"
            value={formData.alamat || ""}
            onChange={onChange}
            placeholder="Kecamatan/Kota"
          />
        </div>

        {/* BARIS 3: Periode (4) - Divisi (4) - Jabatan (4) */}
        <div className={formStyles.colSpan4}>
          <FormInput
            label="Periode"
            name="periode_id"
            type="select"
            value={formData.periode_id || ""}
            onChange={onChange}
            required
          >
            <option value="">Pilih...</option>
            {periodeList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama_kabinet} ({p.tahun_mulai})
              </option>
            ))}
          </FormInput>
        </div>

        <div className={formStyles.colSpan4}>
          <FormInput
            label="Divisi"
            name="divisi_id"
            type="select"
            value={formData.divisi_id || ""}
            onChange={onChange}
            required
            disabled={!formData.periode_id} // Disable jika periode belum dipilih
            helper={!formData.periode_id ? "Pilih periode dulu" : ""}
          >
            <option value="">Pilih...</option>
            {/* Gunakan filteredDivisiList, bukan divisiList semua */}
            {filteredDivisiList.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nama_divisi} {d.tipe === 'Inti' ? '(Inti)' : ''}
              </option>
            ))}
          </FormInput>
        </div>

        <div className={formStyles.colSpan4}>
          <FormInput
            label="Jabatan"
            name="jabatan_id"
            type="select"
            value={formData.jabatan_id || ""}
            onChange={onChange}
            required
            disabled={!formData.divisi_id} // Disable jika divisi belum dipilih
            helper={formData.divisi_id && filteredJabatanList.length === 0 ? "Tidak ada jabatan sesuai." : ""}
          >
            <option value="">Pilih...</option>
            {filteredJabatanList.map((j) => (
              <option key={j.id} value={j.id}>
                {j.nama_jabatan}
              </option>
            ))}
          </FormInput>
        </div>

        {/* BARIS 4: Motto (12) */}
        <FormInput
          label="Motto"
          name="motto"
          type="textarea"
          value={formData.motto || ""}
          onChange={onChange}
          span={12}
          rows={1}
          placeholder="Kata motivasi singkat..."
        />

        {/* BARIS 5: Foto Profil Compact */}
        <div className={formStyles.colSpan12}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", padding: "0.5rem", border: "1px solid #e2e8f0", borderRadius: "6px", background: "#f8fafc" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", overflow: "hidden", background: "#fff", border: "1px solid #cbd5e0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {preview ? (
                <img src={preview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <FiUser size={20} color="#cbd5e0" />
              )}
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#334155" }}>Foto Profil</label>
                <p style={{ margin: 0, fontSize: "0.7rem", color: "#64748b" }}>Max 500KB</p>
              </div>
              <div>
                <input type="file" id="foto_anggota" name="foto_url" accept="image/*" onChange={onFileChange} style={{ display: "none" }} />
                <label htmlFor="foto_anggota" className="button button-secondary" style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "4px", cursor: "pointer", height: "auto" }}>
                  <FiUpload size={12} /> {preview ? "Ganti" : "Upload"}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={formStyles.formFooter} style={{ marginTop: "1rem" }}>
        <button type="button" onClick={onCancel} className="button button-secondary">Batal</button>
        <button type="submit" className="button button-primary" disabled={loading}>
          {loading ? "Simpan..." : "Simpan"}
        </button>
      </div>
    </form>
  );
};

export default AnggotaForm;