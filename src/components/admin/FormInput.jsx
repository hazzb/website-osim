// src/components/admin/FormInput.jsx
// --- Komponen Reusable untuk Form ---

import React from 'react';
import styles from './FormInput.module.css'; // Kita akan buat file ini

/**
 * Komponen Form serbaguna.
 * Bisa merender <input>, <select>, atau <textarea>
 *
 * Props:
 * - type: "text", "file", "select", "textarea"
 * - label: Teks untuk <label>
 * - name: (diteruskan ke input)
 * - value: (diteruskan ke input)
 * - onChange: (diteruskan ke input)
 * - disabled: (diteruskan ke input)
 * - required: (diteruskan ke input)
 * - children: (untuk <option> di dalam <select>)
 * - span: "col-span-2" (opsional)
 */
function FormInput({ type, label, name, span, children, ...props }) {
  
  // Tentukan elemen apa yang akan dirender
  let InputComponent;
  if (type === 'select') {
    InputComponent = (
      <select id={name} name={name} className={styles['form-select']} {...props}>
        {children}
      </select>
    );
  } else if (type === 'textarea') {
    InputComponent = (
      <textarea id={name} name={name} className={styles['form-textarea']} {...props} />
    );
  } else {
    // Default ke <input> (untuk text, file, dll)
    InputComponent = (
      <input type={type} id={name} name={name} className={styles['form-input']} {...props} />
    );
  }

  // Tentukan class wrapper
  const wrapperClass = `${styles['form-group']} ${span ? styles[span] : ''}`;

  return (
    <div className={wrapperClass}>
      <label htmlFor={name} className={styles['form-label']}>
        {label}
      </label>
      {InputComponent}
      {/* Menampilkan pesan error kecil (jika ada) */}
      {props.error && <small className={styles['form-error']}>{props.error}</small>}
    </div>
  );
}

export default FormInput;