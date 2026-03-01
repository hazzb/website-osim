"use client";

import React from "react";
import { FaSearch } from "react-icons/fa";

// 1. Container Utama (Wrapper)
export const FilterBar = ({ children, className = "" }) => {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {children}
    </div>
  );
};

// 2. Dropdown Select (Label + Select)
export const FilterSelect = ({
  label,
  value,
  onChange,
  options = [],
  children,
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className="w-full px-3 py-2 pr-8 text-sm border border-slate-300 rounded-lg bg-white text-slate-700 font-medium focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all appearance-none"
          value={value}
          onChange={onChange}
        >
          {children
            ? children
            : options.map((opt, idx) => (
                <option key={idx} value={opt.value}>
                  {opt.label}
                </option>
              ))}
        </select>
      </div>
    </div>
  );
};

// 3. Pill Button (Tombol Kategori/Status)
export const FilterPill = ({ label, active, onClick }) => {
  return (
    <button
      className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${
        active
          ? "bg-primary text-white border-primary shadow-md"
          : "bg-white text-slate-600 border-slate-300 hover:border-primary hover:text-primary"
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

// 4. Search Input (Compact version)
export const FilterSearch = ({
  value,
  onChange,
  placeholder = "Cari...",
  className = "",
}) => {
  return (
    <div className={`relative ${className}`}>
      <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
      <input
        type="text"
        className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

// 5. Toggle Button (Compact: Untuk Filter L/P)
export const FilterToggle = ({ options = [], value, onChange }) => {
  return (
    <div className="flex bg-slate-100/80 p-0.5 rounded-md border border-slate-200 gap-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
            value === opt.value
              ? "bg-white text-primary shadow-sm"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          }`}
          title={opt.label}
        >
          {opt.icon && <span className="mr-1">{opt.icon}</span>}
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  );
};

// 6. Icon Button (Tombol Aksi Simpel: Print, Export, Add)
export const FilterIconButton = ({ icon, onClick, active, title }) => {
  return (
    <button
      onClick={onClick}
      className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-all ${
        active
          ? "bg-primary text-white border-primary shadow-md"
          : "bg-white text-slate-600 border-slate-300 hover:border-primary hover:text-primary active:bg-slate-50"
      }`}
      title={title}
    >
      {icon}
    </button>
  );
};
