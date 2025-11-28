// src/components/admin/FormInput.jsx
import React from "react";
import styles from "./AdminForm.module.css";

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
  ...props
}) => {
  // Mapping span angka ke class CSS
  const colClass = styles[`colSpan${span}`] || styles.colSpan12;

  return (
    <div className={`${styles.formGroup} ${colClass}`}>
      {label && (
        <label className={styles.formLabel} htmlFor={name}>
          {label} {required && <span className={styles.requiredMark}>*</span>}
        </label>
      )}

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
      ) : type === "select" ? (
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
      ) : type === "file" ? (
        // Input file biasanya dihandle parent, tapi ini fallback
        <input
          id={name}
          name={name}
          type="file"
          onChange={onChange}
          className={styles.formInput}
          {...props}
        />
      ) : (
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

      {helper && <div className={styles.helperText}>{helper}</div>}
    </div>
  );
};

export default FormInput;
