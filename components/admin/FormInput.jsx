import React from "react";
import { FiImage } from "react-icons/fi";

const FormInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  required,
  span = 12,
  placeholder,
  helper,
  children,
  isMarkdown,
  disabled,
  preview,
  accept,
  ...props
}) => {
  // Mapping span to Tailwind classes
  // We'll use a simple mapping. Default is col-span-12 (full width).
  // On medium screens (md), we use the specific span.
  const spanClasses = {
    1: "md:col-span-1",
    2: "md:col-span-2",
    3: "md:col-span-3",
    4: "md:col-span-4",
    5: "md:col-span-5",
    6: "md:col-span-6",
    7: "md:col-span-7",
    8: "md:col-span-8",
    9: "md:col-span-9",
    10: "md:col-span-10",
    11: "md:col-span-11",
    12: "md:col-span-12",
  };

  const colSpanClass = spanClasses[span] || "md:col-span-12";
  const containerClass = `flex flex-col w-full col-span-12 ${colSpanClass}`;

  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  // Standard input styles
  const baseInputClass =
    "w-full border border-slate-300 rounded-md text-sm text-slate-800 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500";
  const singleLineClass = "h-[38px] px-3";

  const textareaClass = `w-full min-h-[80px] px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-800 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 font-inherit resize-y ${isMarkdown ? "font-mono bg-slate-50 min-h-[120px] leading-relaxed" : ""}`;

  return (
    <div className={containerClass}>
      {/* Label (Except for file input which has custom layout) */}
      {label && type !== "file" && (
        <label className={labelClass} htmlFor={name}>
          {label} {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {/* --- 1. TEXTAREA --- */}
      {type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={textareaClass}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={isMarkdown ? 6 : 3}
          {...props}
        />
      ) : /* --- 2. SELECT / DROPDOWN --- */
      type === "select" ? (
        <div className="relative">
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className={`${baseInputClass} ${singleLineClass} appearance-none`}
            required={required}
            disabled={disabled}
            {...props}
          >
            {children}
          </select>
          {/* Custom Arrow */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
      ) : /* --- 3. INPUT FILE (CUSTOM UI) --- */
      type === "file" ? (
        <div className="w-full">
          {label && (
            <label className={labelClass}>
              {label}{" "}
              {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
          )}
          <div className="flex items-center gap-3 p-2 border border-dashed border-slate-300 rounded-md bg-slate-50/50">
            {/* Preview Box */}
            <div
              className={`w-[42px] h-[42px] rounded-md overflow-hidden border border-slate-200 flex items-center justify-center bg-slate-100 shrink-0`}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FiImage size={24} className="text-slate-300" />
              )}
            </div>

            {/* Tombol Upload & Helper */}
            <div className="flex-1 min-w-0">
              <label
                className={`inline-flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 cursor-pointer transition-colors ${
                  disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {disabled ? "Loading..." : "Pilih File"}
                <input
                  id={name}
                  name={name}
                  type="file"
                  accept={accept}
                  onChange={onChange}
                  disabled={disabled}
                  className="hidden"
                  {...props}
                />
              </label>
              {helper && (
                <span className="text-xs text-slate-500 ml-2 truncate">
                  {helper}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* --- 4. INPUT STANDARD (Text, Number, Date, etc) --- */
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          className={`${baseInputClass} ${singleLineClass}`}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          {...props}
        />
      )}

      {/* Helper Text */}
      {helper && type !== "file" && (
        <div className="text-xs text-slate-500 mt-1 flex justify-between">
          {helper}
        </div>
      )}
    </div>
  );
};

export default FormInput;
