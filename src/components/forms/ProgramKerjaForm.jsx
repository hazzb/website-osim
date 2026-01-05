import React from "react";

const ProgramKerjaForm = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  loading,
  divisiOptions,
  anggotaOptions,
  periodeOptions,
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form
      onSubmit={onSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        padding: "1rem",
      }}
    >
      {/* NAMA ACARA */}
      <div>
        <label
          style={{
            display: "block",
            marginBottom: "4px",
            fontWeight: 600,
            color: "#334155",
          }}
        >
          Nama Acara
        </label>
        <input
          name="nama_acara"
          value={formData.nama_acara}
          onChange={handleChange}
          required
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #cbd5e1",
          }}
        />
      </div>

      {/* TANGGAL & STATUS */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
      >
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "4px",
              fontWeight: 600,
              color: "#334155",
            }}
          >
            Tanggal (Opsional)
          </label>
          {/* HAPUS 'required' DI SINI */}
          <input
            type="date"
            name="tanggal"
            value={formData.tanggal || ""} // Handle jika null
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
            }}
          />
        </div>
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "4px",
              fontWeight: 600,
              color: "#334155",
            }}
          >
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
            }}
          >
            <option value="Rencana">Rencana</option>
            <option value="Selesai">Selesai</option>
          </select>
        </div>
      </div>

      {/* ... (SISA KODE SAMA SEPERTI SEBELUMNYA) ... */}

      {/* TARGET GENDER */}
      <div>
        <label
          style={{
            display: "block",
            marginBottom: "4px",
            fontWeight: 600,
            color: "#334155",
          }}
        >
          Target Peserta
        </label>
        <div style={{ display: "flex", gap: "1rem" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="target_gender"
              value="Umum"
              checked={formData.target_gender === "Umum"}
              onChange={handleChange}
            />{" "}
            Umum
          </label>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="target_gender"
              value="Ikhwan"
              checked={formData.target_gender === "Ikhwan"}
              onChange={handleChange}
            />{" "}
            <span style={{ color: "#2563eb" }}>Ikhwan Only</span>
          </label>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="target_gender"
              value="Akhwat"
              checked={formData.target_gender === "Akhwat"}
              onChange={handleChange}
            />{" "}
            <span style={{ color: "#db2777" }}>Akhwat Only</span>
          </label>
        </div>
      </div>

      {/* DIVISI & PJ */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
      >
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "4px",
              fontWeight: 600,
              color: "#334155",
            }}
          >
            Divisi
          </label>
          <select
            name="divisi_id"
            value={formData.divisi_id}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
            }}
          >
            <option value="">- Pilih Divisi -</option>
            {divisiOptions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nama_divisi}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "4px",
              fontWeight: 600,
              color: "#334155",
            }}
          >
            Penanggung Jawab
          </label>
          <select
            name="penanggung_jawab_id"
            value={formData.penanggung_jawab_id}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
            }}
          >
            <option value="">- Pilih Anggota -</option>
            {anggotaOptions.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nama}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* PERIODE */}
      <div>
        <label
          style={{
            display: "block",
            marginBottom: "4px",
            fontWeight: 600,
            color: "#334155",
          }}
        >
          Periode
        </label>
        <select
          name="periode_id"
          value={formData.periode_id}
          onChange={handleChange}
          required
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #cbd5e1",
          }}
        >
          {periodeOptions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nama_kabinet} {p.is_active ? "(Aktif)" : ""}
            </option>
          ))}
        </select>
      </div>

      {/* DESKRIPSI */}
      <div>
        <label
          style={{
            display: "block",
            marginBottom: "4px",
            fontWeight: 600,
            color: "#334155",
          }}
        >
          Deskripsi
        </label>
        <textarea
          name="deskripsi"
          value={formData.deskripsi}
          onChange={handleChange}
          rows={3}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #cbd5e1",
          }}
        />
      </div>

      {/* LINK DOKUMENTASI */}
      <div>
        <label
          style={{
            display: "block",
            marginBottom: "4px",
            fontWeight: 600,
            color: "#334155",
          }}
        >
          Link Dokumentasi
        </label>
        <input
          name="link_dokumentasi"
          value={formData.link_dokumentasi}
          onChange={handleChange}
          placeholder="https://..."
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #cbd5e1",
          }}
        />
      </div>

      {/* EMBED HTML */}
      <div>
        <label
          style={{
            display: "block",
            marginBottom: "4px",
            fontWeight: 600,
            color: "#334155",
          }}
        >
          Embed HTML
        </label>
        <textarea
          name="embed_html"
          value={formData.embed_html}
          onChange={handleChange}
          rows={2}
          placeholder="<iframe ... ></iframe>"
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #cbd5e1",
            fontFamily: "monospace",
            fontSize: "0.8rem",
          }}
        />
      </div>

      {/* ACTIONS */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
          marginTop: "1rem",
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          className="button button-secondary"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="button button-primary"
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </form>
  );
};

export default ProgramKerjaForm;
