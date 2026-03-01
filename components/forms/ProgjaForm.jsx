import React, { useMemo, useEffect } from "react";
import FormInput from "../admin/FormInput.jsx";
import formStyles from "../admin/AdminForm.module.css";
import { FiCalendar, FiUserCheck } from "react-icons/fi";

const ProgjaForm = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  loading,
  periodeList = [],
  divisiList = [],
  anggotaList = [] // Kita butuh data anggota untuk memilih PJ (Penanggung Jawab)
}) => {

  // Filter Anggota berdasarkan Divisi yang dipilih
  const filteredAnggota = useMemo(() => {
    if (!formData.divisi_id) return [];
    return anggotaList.filter(a => String(a.divisi_id) === String(formData.divisi_id));
  }, [formData.divisi_id, anggotaList]);

  return (
    <form onSubmit={onSubmit} className={formStyles.form}>
      <div className={formStyles.formGrid} style={{ gap: "0.8rem" }}>
        
        {/* BARIS 1: Periode & Divisi */}
        <div className={formStyles.colSpan6}>
          <FormInput
            label="Periode"
            name="periode_id"
            type="select"
            value={formData.periode_id || ""}
            onChange={onChange}
            required
          >
            <option value="" disabled>-- Pilih --</option>
            {periodeList.map((p) => (
              <option key={p.id} value={p.id}>{p.nama_kabinet}</option>
            ))}
          </FormInput>
        </div>

        <div className={formStyles.colSpan6}>
          <FormInput
            label="Divisi Pelaksana"
            name="divisi_id"
            type="select"
            value={formData.divisi_id || ""}
            onChange={onChange}
            required
            disabled={!formData.periode_id}
          >
            <option value="" disabled>-- Pilih Divisi --</option>
            {divisiList.map((d) => (
              <option key={d.id} value={d.id}>{d.nama_divisi}</option>
            ))}
          </FormInput>
        </div>

        {/* BARIS 2: Nama Program */}
        <FormInput
          label="Nama Program Kerja"
          name="nama_acara"
          value={formData.nama_acara || ""}
          onChange={onChange}
          required
          span={12}
          placeholder="Contoh: Lomba Kebersihan Kelas"
        />

        {/* BARIS 3: Tanggal & Status */}
        <div className={formStyles.colSpan6}>
           <FormInput
            label="Tanggal Pelaksanaan"
            name="tanggal"
            type="date"
            value={formData.tanggal || ""}
            onChange={onChange}
            required
          />
        </div>

        <div className={formStyles.colSpan6}>
          <FormInput
            label="Status Saat Ini"
            name="status"
            type="select"
            value={formData.status || "Rencana"}
            onChange={onChange}
            required
          >
            <option value="Rencana">🟡 Rencana</option>
            <option value="Berjalan">🔵 Sedang Berjalan</option>
            <option value="Selesai">🟢 Selesai / Terlaksana</option>
            <option value="Tunda">🔴 Ditunda / Batal</option>
          </FormInput>
        </div>

        {/* BARIS 4: Penanggung Jawab (PJ) */}
        <div className={formStyles.colSpan12}>
          <FormInput
            label="Penanggung Jawab (PIC)"
            name="penanggung_jawab_id"
            type="select"
            value={formData.penanggung_jawab_id || ""}
            onChange={onChange}
            disabled={!formData.divisi_id}
            helper={formData.divisi_id && filteredAnggota.length === 0 ? "Tidak ada anggota di divisi ini." : "Pilih anggota divisi."}
          >
            <option value="">-- Pilih PJ --</option>
            {filteredAnggota.map((a) => (
              <option key={a.id} value={a.id}>{a.nama}</option>
            ))}
          </FormInput>
        </div>

        {/* BARIS 5: Deskripsi */}
        <FormInput
          label="Deskripsi Kegiatan"
          name="deskripsi"
          type="textarea"
          value={formData.deskripsi || ""}
          onChange={onChange}
          span={12}
          rows={3}
          placeholder="Jelaskan tujuan dan detail singkat kegiatan..."
        />

      </div>

      <div className={formStyles.formFooter} style={{ marginTop: "1rem" }}>
        <button type="button" onClick={onCancel} className="button button-secondary">Batal</button>
        <button type="submit" className="button button-primary" disabled={loading}>
          {loading ? "Simpan..." : "Simpan Progja"}
        </button>
      </div>
    </form>
  );
};

export default ProgjaForm;