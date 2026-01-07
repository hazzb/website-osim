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

        {/* LOGIC FIX: Tombol Burger hanya muncul jika actions TIDAK NULL */}
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

        {/* Desktop Actions */}
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>

      {/* Mobile Menu Dropdown */}
      {actions && (
        <div
          className={`${styles.mobileActionMenu} ${
            isMobileMenuOpen ? styles.show : ""
          }`}
        >
          {actions}
        </div>
      )}

      {/* --- BARIS 2: KONTROL --- */}
      {(searchBar || filters || options) && (
        <div className={styles.controlRow}>
          <div className={styles.persistentControls}>
            {searchBar && (
              <div className={styles.searchWrapper}>{searchBar}</div>
            )}
          </div>

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

      {/* Expandable Areas */}
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
