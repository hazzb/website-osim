import React, { useState, useEffect } from "react";
import formStyles from "../admin/AdminForm.module.css";
import FormInput from "../admin/FormInput.jsx";
import { FiTrash2, FiPlus } from "react-icons/fi";

const BerandaForm = ({
  formData,
  onChange,
  onFileChange,
  onSubmit,
  onCancel,
  loading,
  preview,
}) => {
  const [contentType, setContentType] = useState("both");

  // STATE KHUSUS CAROUSEL (Array of Objects: { file, url, caption })
  const [carouselItems, setCarouselItems] = useState([]);

  // Deteksi Data Awal (Edit Mode)
  useEffect(() => {
    if (formData.id) {
      // Deteksi jika data yang diedit adalah carousel
      if (
        formData.gallery_urls &&
        Array.isArray(formData.gallery_urls) &&
        formData.gallery_urls.length > 0
      ) {
        setContentType("carousel");
        // Konversi data DB ke state form lokal
        const items = formData.gallery_urls.map((item) => ({
          url: typeof item === "string" ? item : item.url,
          caption: typeof item === "string" ? "" : item.caption,
          file: null, // Tidak ada file baru saat load
        }));
        setCarouselItems(items);
      } else if (formData.image_url && !formData.judul && !formData.isi) {
        setContentType("image");
      } else if (!formData.image_url && (formData.judul || formData.isi)) {
        setContentType("text");
      } else {
        setContentType("both");
      }
    }
  }, [formData]);

  // Handler: Tambah File Baru ke List Carousel
  const handleAddCarouselFiles = (e) => {
    const files = Array.from(e.target.files);
    const newItems = files.map((file) => ({
      file: file,
      url: URL.createObjectURL(file), // Preview lokal
      caption: "",
    }));
    setCarouselItems((prev) => [...prev, ...newItems]);

    // Trigger ke parent agar tahu ada perubahan (nama 'carousel_data')
    if (onChange)
      onChange({
        target: {
          name: "carousel_data",
          value: [...carouselItems, ...newItems],
        },
      });
  };

  // Handler: Ubah Caption per Item
  const handleCaptionChange = (index, text) => {
    const updated = [...carouselItems];
    updated[index].caption = text;
    setCarouselItems(updated);
    onChange({ target: { name: "carousel_data", value: updated } });
  };

  // Handler: Hapus Item
  const handleRemoveItem = (index) => {
    const updated = carouselItems.filter((_, i) => i !== index);
    setCarouselItems(updated);
    onChange({ target: { name: "carousel_data", value: updated } });
  };

  const showPreview = preview || formData.image_url;

  return (
    <form onSubmit={onSubmit}>
      <div className={formStyles["form-grid"]}>
        {/* 1. PILIH TIPE KONTEN */}
        <div
          className={formStyles["col-span-3"]}
          style={{ marginBottom: "1rem" }}
        >
          <label
            className={formStyles["form-label"]}
            style={{ marginBottom: "0.5rem", display: "block" }}
          >
            Pilih Tipe Tampilan
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "0.5rem",
            }}
          >
            {/* INI BAGIAN PENTING: Ada opsi 'carousel' di array map */}
            {["both", "text", "image", "carousel"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setContentType(type)}
                style={{
                  padding: "0.7rem 0.4rem",
                  borderRadius: "8px",
                  border:
                    contentType === type
                      ? "2px solid #3182ce"
                      : "1px solid #cbd5e0",
                  background: contentType === type ? "#ebf8ff" : "white",
                  color: contentType === type ? "#2b6cb0" : "#4a5568",
                  fontWeight: contentType === type ? "700" : "500",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                }}
              >
                {/* Label Tombol */}
                {type === "both"
                  ? "Teks+Gbr"
                  : type === "text"
                  ? "Teks"
                  : type === "image"
                  ? "Gambar"
                  : "Carousel"}
              </button>
            ))}
          </div>
        </div>

        {/* 2. INPUT CAROUSEL (Hanya muncul jika contentType === 'carousel') */}
        {contentType === "carousel" && (
          <div className={formStyles["col-span-3"]}>
            <label className={formStyles["form-label"]}>
              Daftar Slide (Gambar & Teks)
            </label>

            {/* List Item */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              {carouselItems.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    gap: "1rem",
                    alignItems: "center",
                    background: "#f8fafc",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  {/* Gambar Kecil */}
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "6px",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={item.url}
                      alt="Slide"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>

                  {/* Input Caption */}
                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      placeholder="Tulis caption gambar ini..."
                      value={item.caption}
                      onChange={(e) => handleCaptionChange(idx, e.target.value)}
                      className={formStyles["form-input"]}
                      style={{ fontSize: "0.9rem" }}
                    />
                  </div>

                  {/* Tombol Hapus */}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    style={{
                      color: "#e53e3e",
                      background: "white",
                      border: "1px solid #fed7d7",
                      borderRadius: "6px",
                      width: "32px",
                      height: "32px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>

            {/* Tombol Tambah Gambar */}
            <div
              style={{
                position: "relative",
                overflow: "hidden",
                display: "inline-block",
              }}
            >
              <button
                type="button"
                className="button button-secondary"
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <FiPlus /> Tambah Gambar
              </button>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleAddCarouselFiles}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  opacity: 0,
                  cursor: "pointer",
                }}
              />
            </div>
            <p className={formStyles["form-helper"]}>
              Klik tombol di atas. Tekan Ctrl/Shift untuk pilih banyak file.
            </p>
          </div>
        )}

        {/* 3. INPUT LAINNYA (TEKS/GAMBAR BIASA) */}
        {contentType !== "carousel" && (
          <>
            {(contentType === "both" || contentType === "text") && (
              <>
                <FormInput
                  label="Judul"
                  name="judul"
                  value={formData.judul || ""}
                  onChange={onChange}
                  required={contentType !== "image"}
                  span="col-span-3"
                />
                <div
                  className={`${formStyles["col-span-3"]} ${formStyles["form-group"]}`}
                >
                  <label className={formStyles["form-label"]}>Isi Konten</label>
                  <textarea
                    name="isi"
                    value={formData.isi || ""}
                    onChange={onChange}
                    className={formStyles["form-textarea"]}
                    rows="5"
                  />
                </div>
                <FormInput
                  label="Label Tombol"
                  name="button_text"
                  value={formData.button_text || ""}
                  onChange={onChange}
                  span="col-span-3"
                />
                <FormInput
                  label="Link Tombol"
                  name="button_link"
                  value={formData.button_link || ""}
                  onChange={onChange}
                  span="col-span-3"
                />
              </>
            )}

            {(contentType === "both" || contentType === "image") && (
              <div
                className={`${formStyles["col-span-3"]} ${formStyles["upload-section"]}`}
              >
                <label className={formStyles["form-label"]}>
                  Upload Gambar (Single)
                </label>
                <div
                  style={{ display: "flex", gap: "1rem", alignItems: "center" }}
                >
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      background: "#eee",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    {showPreview ? (
                      <img
                        src={showPreview}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        alt="P"
                      />
                    ) : (
                      "📷"
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onFileChange}
                    className={formStyles["form-input"]}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className={formStyles["form-footer"]}>
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
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </form>
  );
};

export default BerandaForm;
