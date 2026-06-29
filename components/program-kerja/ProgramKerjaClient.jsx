"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/context/AuthContext";
import PageContainer from "@/components/ui/PageContainer";
import PageHeader from "@/components/ui/PageHeader";
import { ProgjaSkeletonGrid } from "@/components/ui/Skeletons";
import {
  FilterSearch,
  FilterToggle,
  FilterSelect,
} from "@/components/ui/FilterBar";
import ProgramKerjaCard from "@/components/cards/ProgramKerjaCard";
import { FiPlus, FiChevronLeft, FiChevronRight } from "react-icons/fi";

// Sort: pinned first, then dated (asc), then undated
const sortProgja = (list) =>
  [...list].sort((a, b) => {
    // Pinned items always first
    if (b.is_pinned !== a.is_pinned) return b.is_pinned ? 1 : -1;
    // Then items with a date before those without
    if (!a.tanggal && b.tanggal) return 1;
    if (a.tanggal && !b.tanggal) return -1;
    if (!a.tanggal && !b.tanggal) return 0;
    // Among dated items: descending order (newest first)
    return new Date(b.tanggal) - new Date(a.tanggal);
  });

export default function ProgramKerjaClient({
  initialDivisions,
  initialMembers,
  initialPeriods,
  initialProker,
  initialPeriodeId,
}) {
  const { session } = useAuth();
  const isAdmin = !!session;
  const supabase = createClient();

  const [progjaList, setProgjaList] = useState(initialProker);
  const [filteredProgja, setFilteredProgja] = useState(initialProker);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const [searchTerm, setSearchTerm] = useState("");
  const [filterPeriode, setFilterPeriode] = useState(initialPeriodeId);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterDivisi, setFilterDivisi] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterGender, setFilterGender] = useState("");

  const [divisiOptions] = useState(initialDivisions);
  const [periodeOptions] = useState(initialPeriods);

  const fetchProgja = useCallback(
    async (periodId) => {
      setLoading(true);
      try {
        let query = supabase
          .from("program_kerja")
          .select(
            `*, divisi:divisi_id (nama_divisi), pj:penanggung_jawab_id (nama)`,
          )
          .order("tanggal", { ascending: false });

        if (periodId) {
          query = query.eq("periode_id", periodId);
        }

        const { data, error } = await query;
        if (error) throw error;
        setProgjaList(sortProgja(data || []));
      } catch (err) {
        console.error("Fetch Proker Error:", err);
      } finally {
        setLoading(false);
      }
    },
    [supabase],
  );

  const handlePin = async (item) => {
    const newPinned = !item.is_pinned;
    // Optimistic update
    setProgjaList((prev) =>
      sortProgja(prev.map((p) => (p.id === item.id ? { ...p, is_pinned: newPinned } : p)))
    );
    try {
      const { error } = await supabase
        .from("program_kerja")
        .update({ is_pinned: newPinned })
        .eq("id", item.id);
      if (error) throw error;
    } catch (err) {
      // Revert on failure
      setProgjaList((prev) =>
        sortProgja(prev.map((p) => (p.id === item.id ? { ...p, is_pinned: !newPinned } : p)))
      );
      alert("Gagal mengubah status pin.");
    }
  };

  useEffect(() => {
    if (filterPeriode !== initialPeriodeId) {
      fetchProgja(filterPeriode);
    }
  }, [filterPeriode, fetchProgja, initialPeriodeId]);

  useEffect(() => {
    let result = progjaList;
    if (searchTerm) {
      result = result.filter((item) =>
        item.nama_acara.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    if (startDate) {
      result = result.filter(
        (item) => item.tanggal && item.tanggal >= startDate,
      );
    }
    if (endDate) {
      result = result.filter((item) => item.tanggal && item.tanggal <= endDate);
    }
    if (filterDivisi) {
      result = result.filter((item) => item.divisi_id == filterDivisi);
    }
    if (filterStatus) {
      result = result.filter((item) => item.status === filterStatus);
    }
    if (filterGender) {
      result = result.filter((item) => item.target_gender === filterGender);
    }
    // Apply smart sort: pinned first, then dated, then undated
    setFilteredProgja(sortProgja(result));
    setCurrentPage(1);
  }, [
    progjaList,
    searchTerm,
    startDate,
    endDate,
    filterDivisi,
    filterStatus,
    filterGender,
  ]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProgja.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProgja.length / itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    const showMax = 5;
    if (totalPages <= showMax + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <PageContainer>
      <PageHeader
        title="Program Kerja"
        subtitle="Agenda kegiatan dan proker organisasi."
        searchBar={
          <FilterSearch
            placeholder="Cari program kerja..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        }
        genderFilter={
          <FilterToggle
            value={filterGender}
            onChange={setFilterGender}
            options={[
              { value: "", label: "All" },
              { value: "Ikhwan", label: "L" },
              { value: "Akhwat", label: "P" },
              { value: "Umum", label: "Umum" },
            ]}
          />
        }
        filters={
          <div className="flex flex-wrap gap-4 w-full items-end">
            <div className="flex-1 min-w-[140px]">
              <FilterSelect
                label="Periode"
                value={filterPeriode}
                onChange={(e) => setFilterPeriode(e.target.value)}
              >
                <option value="">Semua Periode</option>
                {periodeOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama_kabinet} {p.is_active ? "(Aktif)" : ""}
                  </option>
                ))}
              </FilterSelect>
            </div>
            <div className="flex flex-col gap-1 flex-[2] min-w-[250px]">
              <label className="text-xs font-semibold text-text-muted">
                Rentang Tanggal
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-[38px] px-2.5 rounded-md border border-slate-300 bg-bg-card"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-[38px] px-2.5 rounded-md border border-slate-300 bg-bg-card"
                />
              </div>
            </div>
            <div className="flex-1 min-w-[140px]">
              <FilterSelect
                label="Divisi"
                value={filterDivisi}
                onChange={(e) => setFilterDivisi(e.target.value)}
              >
                <option value="">Semua Divisi</option>
                {divisiOptions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nama_divisi}
                  </option>
                ))}
              </FilterSelect>
            </div>
            <div className="flex-1 min-w-[140px]">
              <FilterSelect
                label="Status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Semua Status</option>
                <option value="Rencana">Rencana</option>
                <option value="Selesai">Selesai</option>
              </FilterSelect>
            </div>
          </div>
        }
        actions={
          isAdmin && (
            <button
              className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold flex items-center gap-2"
              onClick={() => alert("Add Proker placeholder")}
            >
              <FiPlus /> Tambah
            </button>
          )
        }
      />

      {loading ? (
        <ProgjaSkeletonGrid />
      ) : filteredProgja.length === 0 ? (
        <div className="text-center py-20 bg-bg-page border-2 border-dashed border-border-dim rounded-3xl animate-fadeIn">
          <div className="text-6xl mb-4 grayscale opacity-30">📅</div>
          <h3 className="text-xl font-bold text-text-main m-0">
            Program tidak ditemukan
          </h3>
          <button
            onClick={() => {
              setSearchTerm("");
              setFilterStatus("");
              setFilterGender("");
              setFilterDivisi("");
              setStartDate("");
              setEndDate("");
            }}
            className="mt-6 text-primary font-semibold hover:underline bg-transparent border-none cursor-pointer"
          >
            Bersihkan Filter
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
            {currentItems.map((progja) => (
              <ProgramKerjaCard
                key={progja.id}
                data={progja}
                isAdmin={isAdmin}
                onEdit={() => alert("Edit Proker placeholder")}
                onDelete={() => alert("Delete Proker placeholder")}
                onPin={() => handlePin(progja)}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-1.5 md:gap-2 mt-10 mb-8 overflow-x-auto py-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-border-dim bg-bg-card hover:bg-bg-page disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Halaman Sebelumnya"
              >
                <FiChevronLeft size={18} />
              </button>

              {getPageNumbers().map((p, idx) => (
                <React.Fragment key={idx}>
                  {p === "..." ? (
                    <span className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-text-muted font-bold select-none">
                      {p}
                    </span>
                  ) : (
                    <button
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 md:w-9 md:h-9 rounded-lg font-bold text-sm transition-all shadow-sm ${
                        currentPage === p
                          ? "bg-primary text-white shadow-blue-200"
                          : "bg-bg-card border border-border-dim text-text-body hover:border-blue-400 hover:text-primary"
                      }`}
                    >
                      {p}
                    </button>
                  )}
                </React.Fragment>
              ))}

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-border-dim bg-bg-card hover:bg-bg-page disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Halaman Selanjutnya"
              >
                <FiChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
}
