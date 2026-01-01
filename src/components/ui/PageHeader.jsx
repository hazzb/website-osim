import React, { useState } from "react";
import styles from "./PageHeader.module.css";
import { FiFilter, FiX, FiGrid, FiMoreHorizontal } from "react-icons/fi";

const PageHeader = ({
  title,
  subtitle,
  actions,
  searchBar,
  filters,
  options,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  // STATE BARU: Untuk toggle menu aksi di mobile
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
    if (!isFilterOpen) setIsOptionsOpen(false);
  };

  const toggleOptions = () => {
    setIsOptionsOpen(!isOptionsOpen);
    if (!isOptionsOpen) setIsFilterOpen(false);
  };

  const toggleActions = () => {
    setIsActionsOpen(!isActionsOpen);
  };

  return (
    <div className={styles.headerContainer}>
      {/* 1. TOP ROW: Judul & Tombol Menu Mobile */}
      <div className={styles.topRow}>
        <div className={styles.titleGroup}>
          <div className={styles.title}>{title}</div>
          {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
        </div>

        {/* Tombol Toggle Aksi (Hanya muncul di Mobile lewat CSS) */}
        {actions && (
          <button
            className={`${styles.mobileMenuBtn} ${
              isActionsOpen ? styles.active : ""
            }`}
            onClick={toggleActions}
            title="Menu Aksi"
          >
            {isActionsOpen ? <FiX size={20} /> : <FiMoreHorizontal size={20} />}
          </button>
        )}

        {/* Desktop Actions (Langsung tampil di kanan judul) */}
        {/* Mobile Actions (Disembunyikan/Ditampilkan lewat CSS class actionsOpen) */}
        {actions && (
          <div
            className={`${styles.actions} ${
              isActionsOpen ? styles.actionsOpen : ""
            }`}
          >
            {actions}
          </div>
        )}
      </div>

      {/* 2. CONTROL ROW */}
      {(searchBar || filters || options) && (
        <div className={styles.controlRow}>
          {searchBar && <div className={styles.searchWrapper}>{searchBar}</div>}

          {filters && (
            <button
              onClick={toggleFilter}
              className={`${styles.filterToggleBtn} ${
                isFilterOpen ? styles.active : ""
              }`}
              title="Filter"
            >
              {isFilterOpen ? <FiX size={18} /> : <FiFilter size={18} />}
              <span>Filter</span>
            </button>
          )}

          {options && (
            <button
              onClick={toggleOptions}
              className={`${styles.optionToggleBtn} ${
                isOptionsOpen ? styles.active : ""
              }`}
              title="Opsi"
            >
              {isOptionsOpen ? <FiX size={18} /> : <FiGrid size={18} />}
              <span>Opsi</span>
            </button>
          )}
        </div>
      )}

      {/* 3. PANELS */}
      {isFilterOpen && filters && (
        <div className={styles.filterArea}>{filters}</div>
      )}
      {isOptionsOpen && options && (
        <div className={styles.optionsArea}>{options}</div>
      )}
    </div>
  );
};

export default PageHeader;
