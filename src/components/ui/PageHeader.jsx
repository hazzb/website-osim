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
  const [showFilters, setShowFilters] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className={styles.headerContainer}>
      {/* --- BARIS 1: JUDUL & AKSI --- */}
      <div className={styles.topRow}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>

        {/* PERUBAHAN: Hanya render tombol burger jika ada 'actions' */}
        {actions && (
          <button
            className={`${styles.mobileMenuBtn} ${
              isMobileMenuOpen ? styles.active : ""
            }`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <FiX size={20} />
            ) : (
              <FiMoreVertical size={20} />
            )}
          </button>
        )}

        {/* Desktop Actions (Akan disembunyikan di mobile via CSS) */}
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>

      {/* PERUBAHAN: Hanya render menu mobile jika ada 'actions' */}
      {actions && (
        <div
          className={`${styles.mobileActionMenu} ${
            isMobileMenuOpen ? styles.show : ""
          }`}
        >
          {actions}
        </div>
      )}

      {/* --- BARIS 2: KONTROL (SEARCH, FILTER, OPSI) --- */}
      {/* Hanya render baris ini jika ada searchBar, filters, atau options */}
      {(searchBar || filters || options) && (
        <div className={styles.controlRow}>
          {/* Search Bar & Persistent Controls */}
          <div className={styles.persistentControls}>
            {searchBar && (
              <div className={styles.searchWrapper}>{searchBar}</div>
            )}
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
                  setShowOptions(false);
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
                  setShowFilters(false);
                }}
              >
                <FiSettings size={16} />
                <span>Opsi</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* --- AREA EXPANDABLE --- */}
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
