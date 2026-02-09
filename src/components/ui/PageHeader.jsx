import React, { useState } from "react";
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
    <div className="bg-white border-b border-slate-200 mb-6">
      {/* --- BARIS 1: JUDUL & AKSI --- */}
      <div className="flex justify-between items-start gap-4 px-6 pt-6 pb-4">
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold text-slate-800 mb-1 tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
          )}
        </div>

        {/* LOGIC FIX: Tombol Burger hanya muncul jika actions TIDAK NULL */}
        {actions && (
          <button
            className={`md:hidden w-10 h-10 flex items-center justify-center rounded-lg border transition-all ${
              isMobileMenuOpen
                ? "bg-primary text-white border-primary"
                : "bg-white text-slate-600 border-slate-300 hover:border-primary"
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
        {actions && (
          <div className="hidden md:flex items-center gap-2">{actions}</div>
        )}
      </div>

      {/* Mobile Menu Dropdown */}
      {actions && (
        <div
          className={`${
            isMobileMenuOpen ? "flex" : "hidden"
          } md:hidden flex-col gap-2 px-6 pb-4 border-t border-slate-100 pt-4 animate-slideDown`}
        >
          {actions}
        </div>
      )}

      {/* --- BARIS 2: KONTROL --- */}
      {(searchBar || filters || options) && (
        <div className="px-6 pb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            {searchBar && <div className="flex-1 max-w-md">{searchBar}</div>}
          </div>

          <div className="flex items-center gap-2">
            {filters && (
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                  showFilters
                    ? "bg-primary text-white border-primary shadow-md"
                    : "bg-white text-slate-600 border-slate-300 hover:border-primary hover:text-primary"
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
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                  showOptions
                    ? "bg-primary text-white border-primary shadow-md"
                    : "bg-white text-slate-600 border-slate-300 hover:border-primary hover:text-primary"
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
        <div className="px-6 pb-4 bg-slate-50 border-t border-slate-200 animate-slideDown">
          {filters}
        </div>
      )}
      {showOptions && options && (
        <div className="px-6 pb-4 bg-slate-50 border-t border-slate-200 animate-slideDown">
          {options}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
