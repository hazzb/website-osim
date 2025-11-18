// src/components/admin/FormInput.jsx
// --- VERSI COMPACT & INFORMATIF ---

import React from 'react';
// Pastikan path import CSS ini benar sesuai struktur folder Anda
import styles from './AdminForm.module.css';

function FormInput({ 
  label, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  required = false, 
  disabled = false, 
  error = null, 
  children, 
  span = 'col-span-1', // Default 1 kolom
  helper = null, // Prop baru untuk teks bantuan
  placeholder = '',
  ...props 
}) {
  
  // Tentukan class grid span
  const spanClass = styles[span] || styles['col-span-1'];
  
  // Tentukan class input (tambah border merah jika error)
  const inputClass = `${type === 'select' ? styles['form-select'] : type === 'textarea' ? styles['form-textarea'] : styles['form-input']} ${error ? styles['input-error'] : ''}`;

  return (
    <div className={`${styles['form-group']} ${spanClass}`}>
      
      {/* Label dengan tanda bintang jika required */}
      <label htmlFor={name} className={styles['form-label']}>
        {label} {required && <span style={{color: '#e53e3e'}}>*</span>}
      </label>

      {/* Render Input Berdasarkan Type */}
      {type === 'select' ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={inputClass}
          disabled={disabled}
          {...props}
        >
          {children}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={inputClass}
          disabled={disabled}
          placeholder={placeholder}
          {...props}
        />
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          value={type !== 'file' ? value : undefined}
          onChange={onChange}
          className={inputClass}
          disabled={disabled}
          placeholder={placeholder}
          {...props}
        />
      )}

      {/* Helper Text (Abu-abu) */}
      {helper && !error && <p className={styles['form-helper']}>{helper}</p>}

      {/* Error Text (Merah) */}
      {error && <p className={styles['form-error-msg']}>{error}</p>}
    </div>
  );
}

export default FormInput;