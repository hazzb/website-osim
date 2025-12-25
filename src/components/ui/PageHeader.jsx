import React, { useState } from "react";
import styles from "./PageHeader.module.css";
import { FiFilter, FiX, FiGrid } from "react-icons/fi";

const PageHeader = ({ title, subtitle, actions, searchBar, filters, options }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
    if (!isFilterOpen) setIsOptionsOpen(false);
  };

  const toggleOptions = () => {
    setIsOptionsOpen(!isOptionsOpen);
    if (!isOptionsOpen) setIsFilterOpen(false);
  };

  return (
    // Container Utama (Sticky)
    <div className={styles.headerContainer}>
      
      {/* 1. Baris Judul */}
      <div className={styles.topRow}>
        <div className={styles.titleGroup}>
          <h2 className={styles.title}>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>

      {/* 2. Baris Kontrol (Search & Filter) */}
      <div className={styles.controlRow}>
        
        {/* Search Bar */}
        {searchBar && (
          <div className={styles.searchWrapper}>
            {searchBar}
          </div>
        )}

        {/* Tombol Filter */}
        {filters && (
          <button
            onClick={toggleFilter}
            className={`${styles.filterToggleBtn} ${isFilterOpen ? styles.active : ""}`}
            title="Filter Data"
          >
            {isFilterOpen ? <FiX /> : <FiFilter />}
            <span style={{ marginLeft: "4px" }}>Filter</span>
          </button>
        )}

        {/* Tombol Opsi */}
        {options && (
          <button
            onClick={toggleOptions}
            className={`${styles.optionToggleBtn} ${isOptionsOpen ? styles.active : ""}`}
            title="Menu Opsi"
          >
            {isOptionsOpen ? <FiX /> : <FiGrid />}
            <span style={{ marginLeft: "4px" }}>Opsi</span>
          </button>
        )}
      </div>

      {/* 3. Area Dropdown */}
      {isFilterOpen && filters && (
        <div className={styles.filterArea}>
          {filters}
        </div>
      )}

      {isOptionsOpen && options && (
        <div className={styles.optionsArea}>
          {options}
        </div>
      )}

    </div>
  );
};

export default PageHeader;