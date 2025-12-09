import React from "react";
import styles from "./AdminForm.module.css";
import { FiImage, FiUpload } from "react-icons/fi"; // Pastikan install react-icons

const FormInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  required,
  span = 12,
  placeholder,
  helper,
  children,
  isMarkdown,
  disabled,
  preview, // PROPS BARU: Untuk menampilkan preview gambar
  accept, // PROPS BARU: Untuk membatasi tipe file (image/*)
  ...props
}) => {
  // Mapping span angka ke class CSS
  const colClass = styles[`colSpan${span}`] || styles.colSpan12;

  return (
    <div className={`${styles.formGroup} ${colClass}`}>
      {/* Label (Kecuali untuk file, karena layoutnya beda) */}
      {label && type !== "file" && (
        <label className={styles.formLabel} htmlFor={name}>
          {label} {required && <span className={styles.requiredMark}>*</span>}
        </label>
      )}

      {/* --- 1. TEXTAREA --- */}
      {type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={`${styles.formTextarea} ${
            isMarkdown ? styles.markdownEditor : ""
          }`}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={isMarkdown ? 6 : 3}
          {...props}
        />
      ) : /* --- 2. SELECT / DROPDOWN --- */
      type === "select" ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={styles.formSelect}
          required={required}
          disabled={disabled}
          {...props}
        >
          {children}
        </select>
      ) : /* --- 3. INPUT FILE (CUSTOM UI) --- */
      type === "file" ? (
        <div className={styles.colSpan12}>
          {label && (
            <label className={styles.formLabel}>
              {label}{" "}
              {required && <span className={styles.requiredMark}>*</span>}
            </label>
          )}
          <div className={styles.uploadRow}>
            {/* Preview Box */}
            <div
              className={styles.previewBox}
              style={{ width: 60, height: 60 }}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <FiImage size={24} color="#cbd5e0" />
              )}
            </div>

            {/* Tombol Upload & Helper */}
            <div style={{ flex: 1 }}>
              <label
                className={`${styles.uploadBtn} ${
                  disabled ? styles.disabled : ""
                }`}
                style={{ width: "fit-content" }}
              >
                {disabled ? "Loading..." : "Pilih File"}
                <input
                  id={name}
                  name={name}
                  type="file"
                  accept={accept} // Terima prop accept (misal: image/*)
                  onChange={onChange}
                  disabled={disabled}
                  hidden // Sembunyikan input asli
                  {...props}
                />
              </label>
              {helper && (
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    marginLeft: "0.5rem",
                  }}
                >
                  {helper}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* --- 4. INPUT STANDARD (Text, Number, Date, etc) --- */
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          className={styles.formInput}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          {...props}
        />
      )}

      {/* Helper Text untuk input non-file */}
      {helper && type !== "file" && (
        <div className={styles.helperText}>{helper}</div>
      )}
    </div>
  );
};

export default FormInput;
