"use client";

import React from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/components/context/AuthContext";
import { FiCalendar, FiUser, FiArrowLeft, FiTag, FiEdit } from "react-icons/fi";

export default function BeritaDetail({ berita }) {
  const { session } = useAuth();
  const isAdmin = !!session;

  const dateObj = new Date(berita.tanggal);
  const formattedDate = dateObj.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12 animate-fade-in">
      {/* Navigation & Admin Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <Link
          href="/berita"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary transition-colors bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm hover:shadow-md"
        >
          <FiArrowLeft /> Kembali ke Daftar Berita
        </Link>

        {isAdmin && (
          <Link
            href="/admin/berita"
            className="inline-flex items-center gap-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded-lg shadow-sm hover:shadow-md active:scale-95"
          >
            <FiEdit /> Edit Berita
          </Link>
        )}
      </div>

      {/* Header Section */}
      <header className="mb-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="bg-primary-light text-primary font-bold text-xs uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <FiTag size={12} /> {berita.kategori}
          </span>
        </div>
        
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-text-main mb-6 leading-tight tracking-tight">
          {berita.judul}
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-text-muted">
          <span className="flex items-center gap-1.5">
            <FiCalendar className="text-primary" size={16} />
            {formattedDate}
          </span>
          <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
          <span className="flex items-center gap-1.5">
            <FiUser className="text-primary" size={16} />
            {berita.penulis}
          </span>
        </div>
      </header>

      {/* Cover Image */}
      {berita.image_url && (
        <figure className="mb-12 rounded-2xl overflow-hidden shadow-lg border border-slate-200">
          <img
            src={berita.image_url}
            alt={berita.judul}
            className="w-full h-auto max-h-[500px] object-cover"
          />
        </figure>
      )}

      {/* Markdown Content */}
      <div className="bg-white card p-6 md:p-10 lg:p-12 shadow-sm-custom">
        <div className="prose prose-slate prose-lg md:prose-xl max-w-none prose-headings:text-text-main prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary-hover prose-img:rounded-xl prose-img:shadow-md">
          <ReactMarkdown>{berita.konten}</ReactMarkdown>
        </div>
      </div>
    </article>
  );
}
