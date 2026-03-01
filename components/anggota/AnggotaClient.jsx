"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/context/AuthContext";
import PageContainer from "@/components/ui/PageContainer";
import PageHeader from "@/components/ui/PageHeader";
import { AnggotaSkeletonGrid } from "@/components/ui/Skeletons";
import {
  FilterSelect,
  FilterSearch,
  FilterToggle,
} from "@/components/ui/FilterBar";
import AnggotaCard from "@/components/cards/AnggotaCard";

import {
  FiPlus,
  FiEdit,
  FiBriefcase,
  FiList,
  FiZap,
  FiDatabase,
  FiLayout,
  FiGrid,
  FiArrowRight,
} from "react-icons/fi";
import { FaSearch } from "react-icons/fa";

export default function AnggotaClient({
  initialPeriodes,
  initialAllDivisi,
  initialMasterJabatans,
  initialAnggota,
  initialPeriodeId,
}) {
  const { session } = useAuth();
  const isAdmin = !!session;
  const router = useRouter();
  const supabase = createClient();

  const [periodeList] = useState(initialPeriodes);
  const [activeTab, setActiveTab] = useState(initialPeriodeId);
  const [viewMode, setViewMode] = useState("aesthetic");
  const [allDivisi] = useState(initialAllDivisi);
  const [divisiPerPeriode, setDivisiPerPeriode] = useState([]);
  const [anggotaList, setAnggotaList] = useState(initialAnggota);

  const [selectedDivisi, setSelectedDivisi] = useState("semua");
  const [selectedGender, setSelectedGender] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const observerTarget = useRef(null);

  const activePeriodeData = periodeList.find(
    (p) => String(p.id) === String(activeTab),
  );

  const fetchAnggota = useCallback(
    async (periodeId) => {
      if (!periodeId) return;
      setLoading(true);
      try {
        let relevantDivisi = [];
        if (periodeId === "semua") {
          relevantDivisi = allDivisi;
        } else {
          relevantDivisi = allDivisi.filter(
            (d) => String(d.periode_id) === String(periodeId),
          );
        }
        setDivisiPerPeriode(relevantDivisi);

        let query = supabase
          .from("anggota")
          .select(
            `*, divisi ( nama_divisi, urutan, logo_url, tipe ), master_jabatan ( nama_jabatan ), periode_jabatan ( nama_kabinet )`,
          );

        if (periodeId !== "semua") {
          query = query.eq("periode_id", periodeId);
        }

        const { data, error } = await query;
        if (error) throw error;
        setAnggotaList(data || []);
      } catch (err) {
        console.error("Fetch Anggota Error:", err);
      } finally {
        setLoading(false);
      }
    },
    [allDivisi, supabase],
  );

  useEffect(() => {
    // Skip if it's the initial fetch (handled by SSR)
    if (activeTab !== initialPeriodeId) {
      fetchAnggota(activeTab);
      setVisibleCount(12);
    } else {
      // Set initial divisions
      const relevantDivisi =
        initialPeriodeId === "semua"
          ? allDivisi
          : allDivisi.filter(
              (d) => String(d.periode_id) === String(initialPeriodeId),
            );
      setDivisiPerPeriode(relevantDivisi);
    }
  }, [activeTab, fetchAnggota, initialPeriodeId, allDivisi]);

  // Infinite Scroll
  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setVisibleCount((prev) => prev + 12);
        }
      },
      { threshold: 1.0 },
    );

    observer.observe(target);
    return () => {
      if (target) observer.unobserve(target);
    };
  }, [loading]);

  const getJobRank = (jabatan) => {
    const j = jabatan?.toLowerCase() || "";
    if (j.includes("ketua") && !j.includes("wakil")) return 1;
    if (j.includes("wakil")) return 2;
    if (j.includes("sekretaris")) return 3;
    if (j.includes("bendahara")) return 4;
    if (j.includes("koordinator")) return 5;
    if (j.includes("staff ahli")) return 6;
    return 99;
  };

  const sortMembers = (members) => {
    return [...members].sort((a, b) => {
      const rankA = getJobRank(a.master_jabatan?.nama_jabatan);
      const rankB = getJobRank(b.master_jabatan?.nama_jabatan);
      if (rankA !== rankB) return rankA - rankB;
      return a.nama.localeCompare(b.nama);
    });
  };

  const filteredAnggota = anggotaList.filter((anggota) => {
    const matchDivisi =
      selectedDivisi === "semua" ||
      String(anggota.divisi_id) === String(selectedDivisi);
    const matchGender =
      selectedGender === "all" || anggota.jenis_kelamin === selectedGender;
    const matchSearch =
      searchTerm === "" ||
      anggota.nama.toLowerCase().includes(searchTerm.toLowerCase());
    return matchDivisi && matchGender && matchSearch;
  });

  const memberMap = {};
  filteredAnggota.forEach((member) => {
    const divId = member.divisi_id || "others";
    if (!memberMap[divId]) memberMap[divId] = [];
    memberMap[divId].push(member);
  });

  const sortedDivisiList = [...divisiPerPeriode].sort(
    (a, b) => (a.urutan || 99) - (b.urutan || 99),
  );

  return (
    <PageContainer breadcrumbText="Daftar Anggota">
      <PageHeader
        title="Daftar Anggota"
        subtitle={
          activeTab === "semua"
            ? "Menampilkan anggota dari semua periode"
            : activePeriodeData
              ? `Periode: ${activePeriodeData.nama_kabinet}`
              : "Manajemen personil, struktur divisi, dan jabatan"
        }
        actions={
          isAdmin && (
            <>
              <button
                onClick={() => router.push("/admin/kelola-anggota")}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-2"
              >
                <FiDatabase /> <span>Database</span>
              </button>
              <button
                onClick={() => alert("Admin modal to be implemented")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-2"
              >
                <FiPlus /> <span>Anggota</span>
              </button>
            </>
          )
        }
        searchBar={
          <FilterSearch
            placeholder="Cari anggota..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        }
        genderFilter={
          <FilterToggle
            value={selectedGender}
            onChange={setSelectedGender}
            options={[
              { value: "all", label: "All" },
              { value: "Ikhwan", label: "L" },
              { value: "Akhwat", label: "P" },
            ]}
          />
        }
        extraActions={
          <div className="flex bg-slate-100 p-1 rounded-lg shrink-0 gap-0.5 border border-slate-200">
            <button
              onClick={() => setViewMode("compact")}
              className={`p-1.5 rounded-md transition-all flex items-center justify-center ${
                viewMode === "compact"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              title="List View"
            >
              <FiLayout size={16} />
            </button>
            <button
              onClick={() => setViewMode("aesthetic")}
              className={`p-1.5 rounded-md transition-all flex items-center justify-center ${
                viewMode === "aesthetic"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              title="Grid View"
            >
              <FiGrid size={16} />
            </button>
          </div>
        }
        filters={
          <div className="flex flex-wrap gap-4 w-full">
            <div className="flex-1 min-w-[200px]">
              <FilterSelect
                label="Periode Jabatan"
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
              >
                <option value="semua">Semua Periode</option>
                {periodeList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama_kabinet} {p.is_active ? "(Aktif)" : ""}
                  </option>
                ))}
              </FilterSelect>
            </div>
            <div className="flex-1 min-w-[150px]">
              <FilterSelect
                label="Filter Divisi"
                value={selectedDivisi}
                onChange={(e) => setSelectedDivisi(e.target.value)}
              >
                <option value="semua">Semua Divisi</option>
                {divisiPerPeriode.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nama_divisi}
                  </option>
                ))}
              </FilterSelect>
            </div>
          </div>
        }
      />

      {loading ? (
        <AnggotaSkeletonGrid />
      ) : anggotaList.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <div className="text-5xl mb-4 grayscale opacity-50">📂</div>
          <p className="font-medium">Belum ada data anggota di periode ini.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8 pt-6 pb-20">
          {(() => {
            let renderedCount = 0;
            const limit = visibleCount;
            return (
              <>
                {filteredAnggota.length === 0 ? (
                  <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl animate-fadeIn">
                    <FaSearch className="text-6xl mb-4 grayscale opacity-30" />
                    <h3 className="text-xl font-bold text-slate-700 m-0">
                      Pencarian tidak ditemukan
                    </h3>
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedGender("all");
                        setSelectedDivisi("semua");
                      }}
                      className="mt-6 text-blue-600 font-semibold hover:underline bg-transparent border-none cursor-pointer"
                    >
                      Reset Filter
                    </button>
                  </div>
                ) : (
                  <>
                    {sortedDivisiList.map((divisi) => {
                      if (renderedCount >= limit) return null;
                      const rawMembers = memberMap[divisi.id] || [];
                      const members = sortMembers(rawMembers);
                      if (members.length === 0) return null;

                      const remainingQuota = limit - renderedCount;
                      if (remainingQuota <= 0) return null;

                      const membersToShow = members.slice(0, remainingQuota);
                      renderedCount += membersToShow.length;

                      return (
                        <section
                          key={divisi.id}
                          className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-3">
                              {divisi.logo_url ? (
                                <img
                                  src={divisi.logo_url}
                                  alt="logo"
                                  className="w-12 h-12 object-cover rounded-xl bg-slate-50 border border-slate-100"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400 text-xl border border-slate-200">
                                  {divisi.nama_divisi.charAt(0)}
                                </div>
                              )}
                              <div>
                                <h3 className="text-lg font-bold text-slate-800 m-0 leading-tight">
                                  {divisi.nama_divisi}
                                </h3>
                                {divisi.tipe === "Inti" && (
                                  <span className="bg-red-50 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-bold mt-1 inline-block border border-red-100">
                                    BPH / INTI
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/divisi/${divisi.id}`}
                                className="inline-flex items-center gap-1 text-blue-600 text-sm font-semibold hover:underline"
                              >
                                Detail <FiArrowRight />
                              </Link>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {membersToShow.map((anggota) => (
                              <AnggotaCard
                                key={anggota.id}
                                data={anggota}
                                isAdmin={isAdmin}
                                onEdit={(item) =>
                                  alert("Edit action placeholder")
                                }
                                onDelete={(id) =>
                                  alert("Delete action placeholder")
                                }
                                layout={viewMode}
                              />
                            ))}
                          </div>
                          {members.length > membersToShow.length && (
                            <div className="text-center text-xs text-slate-400 mt-4 italic">
                              +{members.length - membersToShow.length} anggota
                              lainnya (Load More untuk melihat)
                            </div>
                          )}
                        </section>
                      );
                    })}
                  </>
                )}

                {renderedCount < filteredAnggota.length && (
                  <div
                    ref={observerTarget}
                    className="flex flex-col items-center justify-center py-10 gap-3"
                  >
                    <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                    <span className="text-slate-400 text-sm font-medium">
                      Memuat lebih banyak...
                    </span>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}
    </PageContainer>
  );
}
