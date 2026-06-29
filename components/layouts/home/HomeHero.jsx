"use client";

import React from "react";
import Link from "next/link";
import { FiEdit } from "react-icons/fi";

const HomeHero = ({ data, isAdmin, onEdit }) => {
  if (!data) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16 relative">
      {/* KIRI: TEKS */}
      <div className="text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-text-main mb-6">
          {data.judul}
        </h1>
        <p className="text-lg leading-relaxed text-text-body mb-8 whitespace-pre-line">
          {data.isi}
        </p>

        {data.button_text && (
          <Link
            href={data.button_link || "#"}
            className="button button-primary !px-8 !py-3.5 !text-base"
          >
            {data.button_text}
          </Link>
        )}
      </div>

      {/* KANAN: GAMBAR */}
      <div className="relative">
        {data.image_url ? (
          <img
            src={data.image_url}
            alt="Hero"
            width={600}
            height={400}
            fetchPriority="high"
            className="w-full rounded-[20px] shadow-lg md:max-w-none max-w-[80%] mx-auto"
          />
        ) : (
          <div className="w-full h-[300px] bg-border-dim rounded-[20px] flex items-center justify-center text-text-muted md:max-w-none max-w-[80%] mx-auto">
            No Image
          </div>
        )}
      </div>

      {/* ADMIN EDIT */}
      {isAdmin && (
        <button
          onClick={() => onEdit(data)}
          className="absolute top-0 right-0 bg-bg-card border border-border-dim p-2 rounded-lg cursor-pointer flex items-center gap-2 hover:bg-bg-page hover:text-primary transition-all text-sm font-semibold shadow-sm"
        >
          <FiEdit /> Edit Hero
        </button>
      )}
    </div>
  );
};

export default HomeHero;
