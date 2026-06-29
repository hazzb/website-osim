"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/context/AuthContext";
import PageContainer from "@/components/ui/PageContainer";
import PageHeader from "@/components/ui/PageHeader";
import {
  FiCalendar,
  FiBriefcase,
  FiUser,
  FiUsers,
  FiExternalLink,
  FiEdit,
  FiTrash2,
} from "react-icons/fi";

export default function ProgramKerjaDetailClient({ initialData }) {
  const { session } = useAuth();
  const isAdmin = !!session;
  const router = useRouter();
  const supabase = createClient();

  const [progja, setProgja] = useState(initialData);

  useEffect(() => {
    if (progja.embed_html && progja.embed_html.includes("instagram")) {
      const processInstagram = () => {
        if (window.instgrm) {
          window.instgrm.Embeds.process();
        } else {
          const script = document.createElement("script");
          script.src = "//www.instagram.com/embed.js";
          script.async = true;
          script.onload = () => {
            if (window.instgrm) window.instgrm.Embeds.process();
          };
          document.body.appendChild(script);
        }
      };

      // Delay slightly to ensure DOM is ready
      const timer = setTimeout(processInstagram, 500);
      return () => clearTimeout(timer);
    }
  }, [progja.embed_html]);

  const formattedDate = progja.tanggal
    ? new Date(progja.tanggal).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Tidak Ditentukan";

  const getGenderColor = (g) => {
    if (g === "Ikhwan") return "#2563eb";
    if (g === "Akhwat") return "#db2777";
    return "#475569";
  };

  return (
    <PageContainer breadcrumbText={progja.nama_acara}>
      <PageHeader
        title="Detail Program Kerja"
        subtitle="Informasi lengkap kegiatan."
        onBack={() => router.back()}
        actions={
          isAdmin && (
            <div className="flex gap-2">
              <button
                className="flex items-center gap-2 px-3 py-2 bg-primary-light border border-blue-200 rounded-lg text-primary font-semibold text-xs hover:bg-blue-100 transition-all"
                onClick={() => alert("Edit action placeholder")}
              >
                <FiEdit /> <span>Edit</span>
              </button>
              <button
                className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 font-semibold text-xs hover:bg-red-100 transition-all"
                onClick={() => alert("Delete action placeholder")}
              >
                <FiTrash2 /> <span>Hapus</span>
              </button>
            </div>
          )
        }
      />

      <div className="bg-bg-card rounded-2xl border border-border-dim overflow-hidden shadow-sm mt-4">
        {progja.embed_html && (
          <div className="bg-black flex justify-center items-center p-4 md:p-8 min-h-[300px]">
            <div className="bg-bg-card rounded-lg overflow-hidden max-w-[500px] w-full shadow-2xl">
              <div
                className="instagram-embed-container"
                dangerouslySetInnerHTML={{ __html: progja.embed_html }}
              />
            </div>
          </div>
        )}

        <div className="p-6 md:p-10 bg-bg-page border-b border-border-dim">
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-main mb-6 leading-tight">
            {progja.nama_acara}
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-bg-card border border-border-dim flex items-center justify-center text-text-muted text-xl shadow-sm">
                <FiCalendar />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">
                  Waktu Pelaksanaan
                </span>
                <span className="block text-sm md:text-base font-semibold text-text-main">
                  {formattedDate}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-bg-card border border-border-dim flex items-center justify-center text-text-muted text-xl shadow-sm">
                <FiBriefcase />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">
                  Divisi Pelaksana
                </span>
                <span className="block text-sm md:text-base font-semibold text-primary underline">
                  {progja.divisi?.nama_divisi || "Umum"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-bg-card border border-border-dim flex items-center justify-center text-text-muted text-xl shadow-sm">
                <FiUser />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">
                  Penanggung Jawab
                </span>
                <span className="block text-sm md:text-base font-semibold text-text-main">
                  {progja.pj?.nama || "-"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-bg-card border border-border-dim flex items-center justify-center text-text-muted text-xl shadow-sm">
                <FiUsers />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">
                  Target Peserta
                </span>
                <span
                  className="block text-sm md:text-base font-semibold"
                  style={{ color: getGenderColor(progja.target_gender) }}
                >
                  {progja.target_gender || "Umum"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-10">
          <h3 className="text-lg font-bold text-text-main mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary rounded-full"></span>
            Deskripsi Kegiatan
          </h3>
          {progja.deskripsi ? (
            <div className="text-base leading-relaxed text-text-body space-y-4 max-w-none">
              {progja.deskripsi.split("\n").map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <p className="text-text-muted italic">Tidak ada deskripsi detail.</p>
          )}

          {progja.link_dokumentasi && (
            <div className="mt-10 pt-8 border-t border-border-dim flex justify-center md:justify-start">
              <a
                href={progja.link_dokumentasi}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover hover:shadow-lg hover:shadow-blue-200 transition-all no-underline"
              >
                <FiExternalLink /> Lihat Dokumentasi Lengkap
              </a>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
