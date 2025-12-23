import React, { useState } from "react";
import styles from "./PageHeader.module.css";
import { FiFilter, FiX, FiMenu, FiGrid } from "react-icons/fi";

const PageHeader = ({ title, subtitle, actions, searchBar, filters, options }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  // Fungsi toggle agar kalau satu dibuka, yang lain tertutup (opsional, biar rapi)
  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
    if (!isFilterOpen) setIsOptionsOpen(false);
  };

  const toggleOptions = () => {
    setIsOptionsOpen(!isOptionsOpen);
    if (!isOptionsOpen) setIsFilterOpen(false);
  };

  return (
    <div className={styles.headerContainer}>
      
      {/* BARIS 1: Judul & Actions Utama (Opsional, jika ada tombol yg mau tetap tampil) */}
      <div className={styles.topRow}>
        <div className={styles.titleGroup}>
          <h2 className={styles.title}>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>

      {/* BARIS 2: Control Row (Search | Filter | Opsi) */}
      <div className={styles.controlRow}>
        
        {/* 1. Search Bar (Selalu Ada & Melebar) */}
        {searchBar && (
          <div className={styles.searchWrapper}>
            {searchBar}
          </div>
        )}

        {/* 2. Tombol Toggle Filter */}
        {filters && (
          <button
            onClick={toggleFilter}
            className={`${styles.filterToggleBtn} ${isFilterOpen ? styles.active : ""}`}
            title="Filter Data"
          >
            {isFilterOpen ? <FiX /> : <FiFilter />}
            <span style={{display: 'none', sm: 'inline'}}>Filter</span> 
            {/* Teks bisa disembunyikan di layar sangat kecil jika mau, tapi CSS flex handle it */}
          </button>
        )}

        {/* 3. Tombol Toggle Opsi/Menu (BARU) */}
        {options && (
          <button
            onClick={toggleOptions}
            className={`${styles.optionToggleBtn} ${isOptionsOpen ? styles.active : ""}`}
            title="Menu Opsi"
          >
            {isOptionsOpen ? <FiX /> : <FiGrid />} {/* Icon Grid/Menu */}
            <span>Opsi</span>
          </button>
        )}
      </div>

      {/* BARIS 3: Area Konten Collapsible */}
      
      {/* Konten Filter */}
      {isFilterOpen && filters && (
        <div className={styles.filterArea}>
          {filters}
        </div>
      )}

      {/* Konten Opsi */}
      {isOptionsOpen && options && (
        <div className={styles.optionsArea}>
          {options}
        </div>
      )}

    </div>
  );
};

export default PageHeader;