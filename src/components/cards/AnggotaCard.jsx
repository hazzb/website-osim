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
      {isAdmin && (
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

      {/* IMAGE SECTION */}
      <div
        className={`${
          isCompact ? "w-20 h-20 shrink-0" : "w-full aspect-square"
        } overflow-hidden bg-white/50 relative group cursor-pointer`}
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
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-200">
            <span className="text-4xl font-bold text-slate-400">
              {data.nama ? data.nama.charAt(0).toUpperCase() : "?"}
            </span>
          </div>
        )}
      </div>

      {/* INFO SECTION */}
      <div className={`${isCompact ? "flex-1" : "p-5"} flex flex-col gap-2`}>
        <div>
          <h3 className="text-lg font-extrabold text-slate-800 m-0 leading-tight mb-1">
            {data.nama}
          </h3>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-md bg-white/70 border ${genderAccent}`}
            >
              {jabatanLabel}
            </span>
            {data.divisi?.nama_divisi && (
              <span className="text-xs font-medium text-slate-600 px-2 py-0.5 rounded-md bg-white/50">
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
        <div className="flex flex-col gap-1.5 text-xs text-slate-600 mt-auto">
          {data.instagram_username && (
            <a
              href={`https://instagram.com/${data.instagram_username.replace(
                "@",
                "",
              )}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-slate-600 hover:text-pink-600 transition-colors no-underline"
              onClick={(e) => e.stopPropagation()}
            >
              <FiInstagram size={14} /> {data.instagram_username}
            </a>
          )}

          {data.alamat && (
            <div className="flex items-center gap-1.5 text-slate-600">
              <FiMapPin size={14} />{" "}
              <span className="line-clamp-1">{data.alamat}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnggotaCard;
