import React from "react";
import Link from "next/link";
import { FiCalendar, FiUser, FiEdit2, FiTrash2 } from "react-icons/fi";

const KATEGORI_WARNA = {
  Internal: "bg-primary-light text-primary border-primary-border",
  Event: "bg-purple-50 text-purple-600 border-purple-100",
  Edukasi: "bg-emerald-50 text-emerald-600 border-emerald-100",
  Sosial: "bg-orange-50 text-orange-600 border-orange-100",
  Prestasi: "bg-amber-50 text-amber-600 border-amber-100",
  Lainnya: "bg-bg-page text-text-body border-border-dim",
};

const BeritaCard = ({ berita, isAdmin, onEdit, onDelete }) => {
  const dateObj = new Date(berita.tanggal);
  const formattedDate = dateObj.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) onEdit(berita);
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) onDelete(berita.id);
  };

  return (
    <Link href={`/berita/${berita.slug}`} className="group h-full block relative">
      <div className="card card-hover h-full flex flex-col p-0 overflow-hidden relative">
        {/* Thumbnail Image */}
        <div className="relative h-48 w-full bg-border-dim overflow-hidden">
          {berita.image_url ? (
            <img
              src={berita.image_url}
              alt={berita.judul}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              No Image
            </div>
          )}
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <span className={`text-[9px] uppercase font-black tracking-wider px-2.5 py-1 rounded-full border ${
              KATEGORI_WARNA[berita.kategori] ?? "bg-bg-page text-text-muted border-border-dim"
            }`}>
              {berita.kategori}
            </span>
          </div>

          {/* Admin Shortcuts on Card */}
          {isAdmin && (
            <div className="absolute top-4 right-4 flex gap-1.5 z-10">
              <button
                onClick={handleEditClick}
                className="w-8 h-8 rounded-full bg-bg-card/90 backdrop-blur-sm text-text-main flex items-center justify-center shadow-md hover:bg-primary hover:text-white transition-all scale-90 hover:scale-100"
                title="Edit Berita"
              >
                <FiEdit2 size={13} />
              </button>
              <button
                onClick={handleDeleteClick}
                className="w-8 h-8 rounded-full bg-bg-card/90 backdrop-blur-sm text-red-600 flex items-center justify-center shadow-md hover:bg-red-600 hover:text-white transition-all scale-90 hover:scale-100"
                title="Hapus Berita"
              >
                <FiTrash2 size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          {/* Meta info */}
          <div className="flex items-center gap-3 text-[11px] text-text-muted mb-3 font-medium">
            <span className="flex items-center gap-1.5">
              <FiCalendar size={12} />
              {formattedDate}
            </span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span className="flex items-center gap-1.5">
              <FiUser size={12} />
              {berita.penulis}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-text-main mb-2 leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {berita.judul}
          </h3>

          {/* Excerpt */}
          <p className="text-sm text-text-body line-clamp-3 mb-4 flex-grow">
            {berita.excerpt}
          </p>

          {/* Read more indicator */}
          <div className="mt-auto pt-4 border-t border-border-dim text-sm font-semibold text-primary flex items-center gap-1">
            Baca selengkapnya <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BeritaCard;
