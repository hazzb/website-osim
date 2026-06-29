"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  FiCalendar,
  FiUser,
  FiExternalLink,
  FiEdit,
  FiTrash2,
  FiUsers,
  FiArrowRight,
  FiMapPin,
} from "react-icons/fi";
import DOMPurify from "dompurify";

const ProgramKerjaCard = ({ data, isAdmin, onEdit, onDelete, onPin }) => {
  const gender = data.target_gender || "Semua";

  // Dynamic styling based on gender
  const getBgClass = () => {
    switch (gender) {
      case "Ikhwan":
        return "bg-primary-light border-blue-400";
      case "Akhwat":
        return "bg-pink-50 border-pink-400";
      default:
        return "bg-bg-card border-slate-400";
    }
  };

  const getTextClass = () => {
    switch (gender) {
      case "Ikhwan":
        return "text-primary";
      case "Akhwat":
        return "text-pink-600";
      default:
        return "text-text-body";
    }
  };

  const getHoverShadow = () => {
    switch (gender) {
      case "Ikhwan":
        return "hover:shadow-blue-400/30";
      case "Akhwat":
        return "hover:shadow-pink-400/30";
      default:
        return "hover:shadow-slate-400/30";
    }
  };

  const formattedDate = data.tanggal ? (
    new Date(data.tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  ) : (
    <i>Waktu Tidak ditentukan</i>
  );

  const isSelesai = data.status === "Selesai";

  useEffect(() => {
    if (data.embed_html && data.embed_html.includes("instagram")) {
      if (!window.instgrm) {
        const script = document.createElement("script");
        script.src = "//www.instagram.com/embed.js";
        script.async = true;
        document.body.appendChild(script);
      } else if (window.instgrm.Embeds) {
        window.instgrm.Embeds.process();
      }
    }
  }, [data.embed_html]);

  return (
    <div
      className={`rounded-xl border flex flex-col gap-0 overflow-hidden shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${getBgClass()} ${getHoverShadow()} h-full relative`}
    >
      {/* Pin Badge */}
      {data.is_pinned && (
        <div className="absolute top-0 right-0 z-10 bg-amber-400 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-bl-lg flex items-center gap-1">
          <FiMapPin size={9} /> Dipin
        </div>
      )}
      {/* Embed (Video/IG) */}
      {data.embed_html && (
        <div className="w-full bg-black/5 border-b border-black/5 overflow-hidden">
          <div
            className="w-full overflow-x-auto max-h-[300px] flex justify-center items-center p-2"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(data.embed_html, {
                ADD_TAGS: ["iframe", "blockquote", "script"],
                ADD_ATTR: [
                  "allow",
                  "allowfullscreen",
                  "frameborder",
                  "scrolling",
                  "src",
                  "width",
                  "height",
                  "class",
                  "data-instgrm-permalink",
                  "data-instgrm-version",
                ],
              }),
            }}
          />
        </div>
      )}

      {/* Konten Utama */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Header */}
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-lg font-extrabold text-text-main m-0 leading-snug line-clamp-2">
            {data.nama_acara}
          </h3>
          <span
            className={`text-[0.7rem] px-2 py-0.5 rounded-md font-bold uppercase bg-bg-card border shadow-sm whitespace-nowrap ${
              isSelesai ? "text-green-600 border-green-200" : "text-text-body"
            }`}
          >
            {data.status}
          </span>
        </div>

        {/* Info Meta */}
        <div className="flex flex-col gap-2 text-sm text-text-body">
          <div className="flex items-center flex-wrap gap-2">
            <span
              className={`text-xs px-2 py-0.5 rounded font-semibold flex items-center gap-1 bg-bg-card/70 border border-black/5 ${getTextClass()}`}
            >
              <FiUsers size={12} /> {gender}
            </span>
            {data.divisi?.nama_divisi && (
              <>
                <span className="text-text-muted font-bold">•</span>
                <span className="font-semibold">
                  {data.divisi?.nama_divisi}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <FiCalendar size={14} className={getTextClass()} />
            <span>{formattedDate}</span>
          </div>

          <div className="flex items-center gap-2">
            <FiUser size={14} className={getTextClass()} />
            <span>{data.pj?.nama || "PJ Tidak Ada"}</span>
          </div>
        </div>

        {data.deskripsi && (
          <p className="m-0 text-sm text-text-body line-clamp-3 leading-relaxed">
            {data.deskripsi}
          </p>
        )}

        {/* FOOTER: Gabungan Admin Actions & Public Links */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-black/10">
          {/* KIRI: Admin Actions (Edit/Delete) */}
          <div className="flex items-center gap-1">
            {isAdmin ? (
              <>
                <button
                  onClick={onPin}
                  className={`w-8 h-8 flex items-center justify-center border rounded-md cursor-pointer bg-bg-card transition-all ${
                    data.is_pinned
                      ? "text-amber-500 border-amber-300 bg-amber-50 hover:bg-amber-100"
                      : "text-text-muted border-border-dim hover:text-amber-500 hover:border-amber-300 hover:bg-amber-50"
                  }`}
                  title={data.is_pinned ? "Unpin" : "Pin ke Atas"}
                >
                  <FiMapPin size={14} />
                </button>
                <button
                  onClick={onEdit}
                  className="w-8 h-8 flex items-center justify-center border border-border-dim rounded-md cursor-pointer bg-bg-card transition-all text-text-muted hover:text-primary hover:border-blue-200 hover:bg-primary-light"
                  title="Edit"
                >
                  <FiEdit size={14} />
                </button>
                <button
                  onClick={onDelete}
                  className="w-8 h-8 flex items-center justify-center border border-red-200 rounded-md cursor-pointer bg-bg-card transition-all text-danger hover:text-red-600 hover:border-red-300 hover:bg-red-50"
                  title="Hapus"
                >
                  <FiTrash2 size={14} />
                </button>
              </>
            ) : (
              <div />
            )}
          </div>

          {/* KANAN: Public Links (Link/Detail) */}
          <div className="flex items-center gap-2">
            {data.link_dokumentasi && (
              <a
                href={data.link_dokumentasi}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-8 h-8 rounded-md text-text-muted bg-bg-card/50 transition-all hover:bg-bg-card hover:text-primary no-underline"
                title="Lihat Dokumentasi"
              >
                <FiExternalLink size={16} />
              </a>
            )}

            <Link
              href={`/program-kerja/${data.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold no-underline cursor-pointer bg-bg-card border border-black/10 text-text-body transition-all hover:bg-bg-page hover:text-text-main hover:border-slate-300"
            >
              Detail <FiArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramKerjaCard;
