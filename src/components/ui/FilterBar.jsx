import React from "react";

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

// 4. Search Input (Input Pencarian dengan Ikon)
export const FilterSearch = ({ value, onChange, placeholder = "Cari..." }) => {
  return (
    <div className="relative flex-1 min-w-[200px]">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        🔍
      </span>
      <input
        type="text"
        className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};
