import React from "react";
import { FiEdit, FiTrash2, FiInstagram, FiMapPin } from "react-icons/fi";
import { useLightbox } from "../../context/LightboxContext";

const AnggotaCard = ({
  data,
  layout = "aesthetic",
  isAdmin,
  onEdit,
  onDelete,
}) => {
  const { openLightbox } = useLightbox();
  // Tentukan styling berdasarkan gender & layout
  const genderBgClass =
    data.jenis_kelamin === "Akhwat"
      ? "bg-pink-50 border-pink-400"
      : "bg-blue-50 border-blue-400";

  const genderAccent =
    data.jenis_kelamin === "Akhwat" ? "text-pink-600" : "text-blue-600";

  const isCompact = layout === "compact";

  // Use the same logic as the display label for the lightbox caption
  const jabatanLabel =
    data.jabatan_di_divisi || data.master_jabatan?.nama_jabatan || "Anggota";

  return (
    <div
      className={`relative rounded-xl border-2 overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg ${genderBgClass} ${
        isCompact ? "flex flex-row gap-4 p-4" : "flex flex-col"
      }`}
    >
      {/* ACTION BUTTONS (ADMIN ONLY) */}
      {isAdmin && !isCompact && (
        <div className="absolute top-3 right-3 z-10 flex gap-2">
          <button
            className="w-8 h-8 flex items-center justify-center rounded-md bg-white border border-slate-300 text-slate-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all shadow-sm"
            onClick={() => onEdit(data)}
            title="Edit Anggota"
          >
            <FiEdit size={14} />
          </button>

          {onDelete && (
            <button
              className="w-8 h-8 flex items-center justify-center rounded-md bg-white border border-red-300 text-danger hover:text-red-600 hover:border-red-400 hover:bg-red-50 transition-all shadow-sm"
              onClick={() => onDelete(data.id)}
              title="Hapus Anggota"
            >
              <FiTrash2 size={14} />
            </button>
          )}
        </div>
      )}

      {/* IMAGE & ACTIONS COLUMN (Compact) */}
      <div className={`${isCompact ? "flex flex-col gap-2 shrink-0" : ""}`}>
        {/* IMAGE SECTION */}
        <div
          className={`${
            isCompact
              ? "w-20 h-20 sm:w-24 sm:h-24 rounded-lg"
              : "w-full aspect-square"
          } overflow-hidden bg-white/50 relative group cursor-pointer border border-black/5`}
          onClick={() => {
            if (data.foto_url) {
              openLightbox(
                data.foto_url,
                data.nama,
                `${jabatanLabel}: ${data.nama}`,
              );
            }
          }}
          title="Klik untuk memperbesar"
        >
          {data.foto_url ? (
            <img
              src={data.foto_url}
              alt={data.nama}
              className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-200">
              <span className="text-3xl font-bold text-slate-400">
                {data.nama ? data.nama.charAt(0).toUpperCase() : "?"}
              </span>
            </div>
          )}
        </div>

        {/* ADMIN ACTIONS (Compact ONLY: Below Photo) */}
        {isAdmin && isCompact && (
          <div className="flex gap-1.5 justify-center">
            <button
              className="flex-1 h-7 flex items-center justify-center rounded-md bg-white border border-slate-200 text-slate-500 hover:text-blue-600 transition-all shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(data);
              }}
              title="Edit"
            >
              <FiEdit size={12} />
            </button>
            <button
              className="flex-1 h-7 flex items-center justify-center rounded-md bg-white border border-red-100 text-red-400 hover:text-red-600 transition-all shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(data.id);
              }}
              title="Hapus"
            >
              <FiTrash2 size={12} />
            </button>
          </div>
        )}
      </div>

      {/* INFO SECTION */}
      <div
        className={`${isCompact ? "flex-1 min-w-0 flex flex-col justify-center" : "p-5 flex flex-col gap-2"}`}
      >
        <div>
          {/* Header Row: Name */}
          <div className="flex gap-2 mb-1">
            <h3
              className={`font-extrabold text-slate-800 m-0 leading-tight line-clamp-2 ${isCompact ? "text-sm sm:text-base" : "text-lg"}`}
            >
              {data.nama}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <span
              className={`text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded bg-white/70 border border-black/5 ${genderAccent}`}
            >
              {jabatanLabel}
            </span>
            {data.divisi?.nama_divisi && (
              <span className="text-[10px] sm:text-xs font-medium text-slate-500 px-1.5 py-0.5 rounded bg-white/50 border border-black/5">
                {data.divisi.nama_divisi}
              </span>
            )}
          </div>

          {data.motto && (
            <p className="text-xs italic text-slate-600 m-0 line-clamp-2">
              &ldquo;{data.motto}&rdquo;
            </p>
          )}
        </div>

        {/* META INFO (IG & ALAMAT) */}
        <div
          className={`flex flex-col gap-1 text-[10px] sm:text-xs text-slate-500 ${isCompact ? "mt-1" : "mt-auto"}`}
        >
          {data.instagram_username && (
            <a
              href={`https://instagram.com/${data.instagram_username.replace(
                "@",
                "",
              )}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-slate-500 hover:text-pink-600 transition-colors no-underline"
              onClick={(e) => e.stopPropagation()}
            >
              <FiInstagram size={12} className="shrink-0" />{" "}
              <span className="truncate">{data.instagram_username}</span>
            </a>
          )}

          {data.alamat && (
            <div className="flex items-center gap-1 text-slate-500">
              <FiMapPin size={12} className="shrink-0" />{" "}
              <span className="truncate">{data.alamat}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(AnggotaCard);
