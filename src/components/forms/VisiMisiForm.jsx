// src/components/forms/VisiMisiForm.jsx

import React from "react";
import FormInput from "../admin/FormInput.jsx";
import formStyles from "../admin/AdminForm.module.css";

const VisiMisiForm = ({ formData, onChange, onSubmit, onCancel, loading }) => {
  return (
    <form onSubmit={onSubmit}>
      <div className={formStyles["form-grid"]}>
        {/* Judul Section */}
        <FormInput
          label="Judul Seksi"
          name="judul"
          type="text"
          value={formData.judul || ""}
          onChange={onChange}
          required
          span="col-span-3"
          placeholder="Contoh: Misi, Nilai Kami, Sejarah"
        />

        {/* Urutan */}
        <FormInput
          label="Urutan Tampil"
          name="urutan"
          type="number"
          value={formData.urutan || 10}
          onChange={onChange}
          required
          span="col-span-1"
        />

        {/* ISI KONTEN (TEXTAREA PRO) */}
        <div
          className={formStyles["input-group"]}
          style={{ gridColumn: "span 4" }}
        >
          <label className={formStyles["input-label"]}>
            Isi Konten <span style={{ color: "#e53e3e" }}>*</span>
          </label>

          <textarea
            name="isi"
            value={formData.isi || ""}
            onChange={onChange}
            className={formStyles["input-field"]}
            placeholder="Tuliskan konten Anda di sini..."
            required
          />

          {/* Helper Text dengan Link Markdown */}
          <div
            className={formStyles["helper-text"]}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            <span>
              💡 <strong>Tips:</strong> Tekan <code>Enter</code> untuk baris
              baru.
            </span>

            <a
              href="https://www.markdownguide.org/basic-syntax/ "
              target="_blank"
              rel="noreferrer"
              style={{
                color: "#2b6cb0",
                textDecoration: "none",
                fontWeight: "700",
                fontSize: "0.75rem",
                borderBottom: "1px dotted #2b6cb0",
              }}
              title="Lihat panduan format teks"
            >
              Panduan Markdown 📝
            </a>
          </div>
        </div>
      </div>

      <div className={formStyles["form-footer"]}>
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
          {loading ? "Menyimpan..." : "Simpan Konten"}
        </button>
      </div>
    </form>
  );
};

export default VisiMisiForm;
