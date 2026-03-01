"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";
import PageContainer from "@/components/ui/PageContainer";
import PageHeader from "@/components/ui/PageHeader";
import AnggotaCard from "@/components/cards/AnggotaCard";
import ProgramKerjaCard from "@/components/cards/ProgramKerjaCard";
import { FilterSearch } from "@/components/ui/FilterBar";
import ImageViewer from "@/components/ui/ImageViewer";
import {
  FiUsers,
  FiBriefcase,
  FiLayout,
  FiGrid,
  FiEdit,
  FiArrowRight,
} from "react-icons/fi";
import { FaSearch } from "react-icons/fa";

const getJabatanRank = (jabatan) => {
  if (!jabatan) return 99;
  const role = jabatan.toLowerCase();
  if (role.includes("ketua") || role.includes("kepala")) return 1;
  if (role.includes("wakil")) return 2;
  if (role.includes("sekretaris")) return 3;
  if (role.includes("bendahara")) return 4;
  if (role.includes("koordinator") || role.includes("co")) return 5;
  return 10;
};

export default function DivisiDetailClient({
  initialDivisi,
  initialMembers,
  initialPrograms,
  initialPeriods,
  initialMasterJabatans,
}) {
  const { session } = useAuth();
  const isAdmin = !!session;
  const router = useRouter();

  const [divisi] = useState(initialDivisi);
  const [members] = useState(initialMembers);
  const [programs] = useState(initialPrograms);

  const [viewMode, setViewMode] = useState("aesthetic");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLogoLightboxOpen, setIsLogoLightboxOpen] = useState(false);

  const sortedMembers = [...members].sort((a, b) => {
    const rankA = getJabatanRank(
      a.jabatan_di_divisi || a.master_jabatan?.nama_jabatan,
    );
    const rankB = getJabatanRank(
      b.jabatan_di_divisi || b.master_jabatan?.nama_jabatan,
    );
    return rankA !== rankB ? rankA - rankB : a.nama.localeCompare(b.nama);
  });

  const filteredMembers = sortedMembers.filter(
    (m) =>
      m.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.jabatan_di_divisi || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  return (
    <PageContainer breadcrumbText={divisi.nama_divisi}>
      <PageHeader
        title={divisi.nama_divisi}
        subtitle={divisi.deskripsi || "Informasi detail divisi."}
        onBack={() => router.back()}
        actions={
          isAdmin && (
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-2"
              onClick={() => alert("Edit Divisi placeholder")}
            >
              <FiEdit /> <span>Edit</span>
            </button>
          )
        }
        searchBar={
          <FilterSearch
            placeholder="Cari anggota divisi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        }
        extraActions={
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 gap-0.5">
            <button
              className={`p-1.5 rounded-md flex items-center justify-center transition-all ${
                viewMode === "aesthetic"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              onClick={() => setViewMode("aesthetic")}
              title="Grid View"
            >
              <FiGrid size={16} />
            </button>
            <button
              className={`p-1.5 rounded-md flex items-center justify-center transition-all ${
                viewMode === "compact"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              onClick={() => setViewMode("compact")}
              title="List View"
            >
              <FiLayout size={16} />
            </button>
          </div>
        }
      />

      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start text-center md:text-left mb-12 shadow-sm gap-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
        <div
          className="w-32 h-32 shrink-0 bg-slate-50 border border-slate-200 rounded-3xl flex items-center justify-center p-5 overflow-hidden shadow-inner group cursor-zoom-in"
          onClick={() => setIsLogoLightboxOpen(true)}
        >
          <img
            src={divisi.logo_url || "/placeholder.png"}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
            alt={divisi.nama_divisi}
          />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-extrabold text-slate-800 mb-4 tracking-tight">
            Tentang {divisi.nama_divisi}
          </h3>
          <p className="text-slate-600 leading-relaxed text-base md:text-lg">
            {divisi.deskripsi}
          </p>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3 border-b border-slate-200 pb-4">
          <FiUsers className="text-blue-500" /> Anggota (
          {filteredMembers.length})
        </h2>

        {filteredMembers.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
            <FaSearch className="text-5xl mb-4 grayscale opacity-30" />
            <p className="text-slate-500 font-medium">
              {searchTerm
                ? `Tidak ada anggota yang cocok dengan kunci "${searchTerm}".`
                : "Belum ada anggota."}
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === "aesthetic"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            }
          >
            {filteredMembers.map((m) => (
              <AnggotaCard
                key={m.id}
                data={m}
                layout={viewMode}
                isAdmin={isAdmin}
                onEdit={() => alert("Edit action")}
                onDelete={() => alert("Delete action")}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mb-20">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3 border-b border-slate-200 pb-4">
          <FiBriefcase className="text-indigo-500" /> Program Kerja (
          {programs.length})
        </h2>

        {programs.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400 italic">
            Belum ada program kerja.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((p) => (
              <ProgramKerjaCard
                key={p.id}
                data={p}
                isAdmin={isAdmin}
                onEdit={() => alert("Edit action")}
                onDelete={() => alert("Delete action")}
              />
            ))}
          </div>
        )}
      </div>

      <ImageViewer
        isOpen={isLogoLightboxOpen}
        onClose={() => setIsLogoLightboxOpen(false)}
        src={divisi.logo_url}
        alt={divisi.nama_divisi}
        caption={`${divisi.nama_divisi} Logo`}
      />
    </PageContainer>
  );
}
