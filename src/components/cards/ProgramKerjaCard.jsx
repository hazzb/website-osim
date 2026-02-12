import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiCalendar,
  FiUser,
  FiExternalLink,
  FiEdit,
  FiTrash2,
  FiUsers,
  FiArrowRight,
} from "react-icons/fi";
import DOMPurify from "dompurify";

const ProgramKerjaCard = ({ data, isAdmin, onEdit, onDelete }) => {
  const gender = data.target_gender || "Semua";

  // Dynamic styling based on gender
  const getBgClass = () => {
    switch (gender) {
      case "Ikhwan":
        return "bg-blue-50 border-blue-400";
      case "Akhwat":
        return "bg-pink-50 border-pink-400";
      default:
        return "bg-white border-slate-400";
    }
  };

  const getTextClass = () => {
    switch (gender) {
      case "Ikhwan":
        return "text-blue-600";
      case "Akhwat":
        return "text-pink-600";
      default:
        return "text-slate-600";
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
      } else {
        window.instgrm.Embeds.process();
      }
    }
  }, [data.embed_html]);

  return (
    <div
      className={`rounded-xl border flex flex-col gap-0 overflow-hidden shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${getBgClass()} ${getHoverShadow()} h-full`}
    >
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
          <h3 className="text-lg font-extrabold text-slate-800 m-0 leading-snug line-clamp-2">
            {data.nama_acara}
          </h3>
          <span
            className={`text-[0.7rem] px-2 py-0.5 rounded-md font-bold uppercase bg-white border shadow-sm whitespace-nowrap ${
              isSelesai ? "text-green-600 border-green-200" : "text-slate-600"
            }`}
          >
            {data.status}
          </span>
        </div>

        {/* Info Meta */}
        <div className="flex flex-col gap-2 text-sm text-slate-600">
          <div className="flex items-center flex-wrap gap-2">
            <span
              className={`text-xs px-2 py-0.5 rounded font-semibold flex items-center gap-1 bg-white/70 border border-black/5 ${getTextClass()}`}
            >
              <FiUsers size={12} /> {gender}
            </span>
            {data.nama_divisi && (
              <>
                <span className="text-slate-400 font-bold">•</span>
                <span className="font-semibold">{data.nama_divisi}</span>
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
          <p className="m-0 text-sm text-slate-600 line-clamp-3 leading-relaxed">
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
                  onClick={onEdit}
                  className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-md cursor-pointer bg-white transition-all text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                  title="Edit"
                >
                  <FiEdit size={14} />
                </button>
                <button
                  onClick={onDelete}
                  className="w-8 h-8 flex items-center justify-center border border-red-200 rounded-md cursor-pointer bg-white transition-all text-danger hover:text-red-600 hover:border-red-300 hover:bg-red-50"
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
                className="inline-flex items-center justify-center w-8 h-8 rounded-md text-slate-500 bg-white/50 transition-all hover:bg-white hover:text-blue-600 no-underline"
                title="Lihat Dokumentasi"
              >
                <FiExternalLink size={16} />
              </a>
            )}

            <Link
              to={`/program-kerja/${data.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold no-underline cursor-pointer bg-white border border-black/10 text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
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
