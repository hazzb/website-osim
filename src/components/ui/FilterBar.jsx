// src/components/ui/FilterBar.jsx
import React from "react";
import styles from "./FilterBar.module.css";

// 1. Container Utama
export const FilterBar = ({ children, className = "" }) => {
  return <div className={`${styles.bar} ${className}`}>{children}</div>;
};

// 2. Dropdown Select (Label: Value)
export const FilterSelect = ({
  label,
  value,
  onChange,
  options = [],
  children,
}) => {
  return (
    <div className={styles.group}>
      <label className={styles.label}>{label}:</label>
      <select className={styles.select} value={value} onChange={onChange}>
        {children
          ? children
          : options.map((opt, idx) => (
              <option key={idx} value={opt.value}>
                {opt.label}
              </option>
            ))}
      </select>
    </div>
  );
};

// 3. Pill Button (Tombol On/Off atau Kategori)
export const FilterPill = ({ label, active, onClick }) => {
  return (
    <button
      className={`${styles.pill} ${active ? styles.active : ""}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

// 4. Search Input
export const FilterSearch = ({ value, onChange, placeholder = "Cari..." }) => {
  return (
    <div className={styles.searchWrapper}>
      <span className={styles.searchIcon}>🔍</span>
      <input
        type="text"
        className={styles.searchInput}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};
