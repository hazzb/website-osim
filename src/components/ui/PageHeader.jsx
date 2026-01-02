import React, { useState } from "react";
import styles from "./PageHeader.module.css";
import { FiFilter, FiSettings, FiMoreVertical, FiX } from "react-icons/fi";

const PageHeader = ({
  title,
  subtitle,
  actions,
  searchBar,
  filters,
  options,
}) => {
  // State untuk Toggle Area
  const [showFilters, setShowFilters] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // State khusus untuk Mobile Menu (Titik Tiga)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className={styles.headerContainer}>
      {/* --- BARIS 1: JUDUL & AKSI --- */}
      <div className={styles.topRow}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>

        {/* Tombol Menu Mobile (Hanya muncul di HP via CSS .mobileMenuBtn) */}
        <button
          className={`${styles.mobileMenuBtn} ${
            isMobileMenuOpen ? styles.active : ""
          }`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <FiX size={20} /> : <FiMoreVertical size={20} />}
        </button>

        {/* Area Actions */}
        {/* Di Desktop: Flex Row. Di Mobile: Floating Grid jika isMobileMenuOpen true */}
        <div
          className={`${styles.actions} ${
            isMobileMenuOpen ? styles.actionsOpen : ""
          }`}
        >
          {actions}
        </div>
      </div>

      {/* --- BARIS 2: KONTROL (SEARCH, FILTER, OPSI) --- */}
      <div className={styles.controlRow}>
        {/* Area Persistent (Search Bar, Dropdown Periode, dll) */}
        <div className={styles.persistentControls}>
          {searchBar && <div className={styles.searchWrapper}>{searchBar}</div>}
        </div>

        {/* Tombol Toggle Kanan */}
        <div className={styles.toggleGroup}>
          {filters && (
            <button
              className={`${styles.filterToggleBtn} ${
                showFilters ? styles.active : ""
              }`}
              onClick={() => {
                setShowFilters(!showFilters);
                setShowOptions(false); // Tutup opsi jika filter dibuka
              }}
            >
              <FiFilter size={16} />
              <span>Filter</span>
            </button>
          )}

          {options && (
            <button
              className={`${styles.optionToggleBtn} ${
                showOptions ? styles.active : ""
              }`}
              onClick={() => {
                setShowOptions(!showOptions);
                setShowFilters(false); // Tutup filter jika opsi dibuka
              }}
            >
              <FiSettings size={16} />
              <span>Opsi</span>
            </button>
          )}
        </div>
      </div>

      {/* --- AREA EXPANDABLE (FILTER & OPSI) --- */}
      {showFilters && filters && (
        <div className={styles.filterArea}>{filters}</div>
      )}

      {showOptions && options && (
        <div className={styles.optionsArea}>{options}</div>
      )}
    </div>
  );
};

export default PageHeader;
