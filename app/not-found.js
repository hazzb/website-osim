import React from "react";
import Link from "next/link";
import PageContainer from "@/components/ui/PageContainer";
import { FiHome, FiAlertCircle } from "react-icons/fi";

export const metadata = {
  title: "Halaman Tidak Ditemukan",
};

export default function NotFound() {
  return (
    <PageContainer className="flex items-center justify-center min-h-[70vh]">
      <div className="text-center max-w-lg mx-auto py-16">
        <div className="flex justify-center mb-6 text-slate-300">
          <FiAlertCircle size={80} />
        </div>
        <h1 className="text-6xl font-black text-text-main mb-4 tracking-tighter">
          404
        </h1>
        <h2 className="text-2xl font-bold text-text-body mb-6">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-lg text-text-muted mb-10">
          Maaf, halaman yang Anda cari mungkin telah dihapus, namanya diubah, atau tidak tersedia untuk sementara waktu.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover hover:-translate-y-1 hover:shadow-lg transition-all"
        >
          <FiHome size={18} />
          Kembali ke Beranda
        </Link>
      </div>
    </PageContainer>
  );
}
