import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
// import styles from "./ProgramKerja.module.css"; // REMOVED
import { ProgjaSkeletonGrid } from "../components/ui/Skeletons.jsx";

import {
  FiPlus,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import PageContainer from "../components/ui/PageContainer.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import ProgramKerjaCard from "../components/cards/ProgramKerjaCard.jsx";
import Modal from "../components/Modal.jsx";
import ProgramKerjaForm from "../components/forms/ProgramKerjaForm.jsx";

function ProgramKerja() {
  const { session } = useAuth();
  const isAdmin = !!session;

  // --- STATE ---
  const [progjaList, setProgjaList] = useState([]);
  const [filteredProgja, setFilteredProgja] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPeriode, setFilterPeriode] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterDivisi, setFilterDivisi] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterGender, setFilterGender] = useState("");

  // Options Data
  const [divisiOptions, setDivisiOptions] = useState([]);
  const [anggotaOptions, setAnggotaOptions] = useState([]);
  const [periodeOptions, setPeriodeOptions] = useState([]);

  // Modal & Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const initialFormState = {
    nama_acara: "",
    tanggal: "",
    status: "Rencana",
    target_gender: "Umum",
    deskripsi: "",
    link_dokumentasi: "",
    divisi_id: "",
    penanggung_jawab_id: "",
    periode_id: "",
    embed_html: "",
  };
  const [formData, setFormData] = useState(initialFormState);
  const [formLoading, setFormLoading] = useState(false);

  // --- FETCH DATA ---
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 1. Options
      const [divRes, aggRes, perRes] = await Promise.all([
        supabase.from("divisi").select("id, nama_divisi").order("nama_divisi"),
        supabase.from("anggota").select("id, nama").order("nama"),
        supabase
          .from("periode_jabatan")
          .select("id, nama_kabinet, is_active, tahun_mulai")
          .order("tahun_mulai", { ascending: false }),
      ]);

      setDivisiOptions(divRes.data || []);
      setAnggotaOptions(aggRes.data || []);
      setPeriodeOptions(perRes.data || []);

      const activePeriode = perRes.data?.find((p) => p.is_active);
      if (activePeriode) {
        setFilterPeriode(activePeriode.id);
        setFormData((prev) => ({ ...prev, periode_id: activePeriode.id }));
      } else if (perRes.data?.length > 0) {
        setFilterPeriode(perRes.data[0].id);
      }

      // 2. Program Kerja
      const { data: progjaData, error } = await supabase
        .from("program_kerja")
        .select(
          `
          *,
          divisi:divisi_id (nama_divisi),
          pj:penanggung_jawab_id (nama)
        `,
        )
        .order("tanggal", { ascending: false });

      if (error) throw error;
      setProgjaList(progjaData || []);
      setFilteredProgja(progjaData || []);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // --- FILTERING ---
  useEffect(() => {
    let result = progjaList;

    if (filterPeriode)
      result = result.filter((item) => item.periode_id == filterPeriode);
    if (searchTerm)
      result = result.filter((item) =>
        item.nama_acara.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    if (startDate)
      result = result.filter(
        (item) => item.tanggal && item.tanggal >= startDate,
      );
    if (endDate)
      result = result.filter((item) => item.tanggal && item.tanggal <= endDate);
    if (filterDivisi)
      result = result.filter((item) => item.divisi_id == filterDivisi);
    if (filterStatus)
      result = result.filter((item) => item.status === filterStatus);
    if (filterGender)
      result = result.filter((item) => item.target_gender === filterGender);

    setFilteredProgja(result);
  }, [
    progjaList,
    filterPeriode,
    searchTerm,
    startDate,
    endDate,
    filterDivisi,
    filterStatus,
    filterGender,
  ]);

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredProgja]);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProgja.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProgja.length / itemsPerPage);

  // --- HANDLERS ---
  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      setFormData({ ...item });
    } else {
      setFormData({
        ...initialFormState,
        periode_id: filterPeriode || "",
      });
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = { ...formData };
      delete payload.divisi;
      delete payload.pj;
      delete payload.id;
      delete payload.created_at;

      if (payload.tanggal === "" || payload.tanggal === undefined)
        payload.tanggal = null;
      if (!payload.target_gender) payload.target_gender = "Umum";

      if (editingItem) {
        const { error } = await supabase
          .from("program_kerja")
          .update(payload)
          .eq("id", editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("program_kerja")
          .insert([payload]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchAllData();
    } catch (err) {
      alert("Gagal menyimpan: " + err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus program kerja ini?")) return;
    try {
      await supabase.from("program_kerja").delete().eq("id", id);
      fetchAllData();
    } catch (err) {
      alert("Gagal menghapus.");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Program Kerja"
        subtitle="Agenda kegiatan dan proker organisasi."
        // 1. SEARCH BAR (PALING ATAS)
        searchBar={
          <div className="relative w-full">
            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              placeholder="Cari program kerja..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 placeholder:text-slate-400"
            />
          </div>
        }
        // 2. FILTERS (SEMUA DIPERLIHATKAN)
        filters={
          <div className="flex flex-wrap gap-4 w-full items-end">
            {/* Periode */}
            <div className="flex flex-col gap-1 flex-1 min-w-[140px] sm:flex-basis-[48%]">
              <label className="text-xs font-semibold text-slate-500 ml-0.5">
                Periode
              </label>
              <select
                value={filterPeriode}
                onChange={(e) => setFilterPeriode(e.target.value)}
                className="w-full h-[38px] px-2.5 rounded-md border border-slate-300 bg-white text-slate-700 text-xs transition-colors focus:outline-none focus:border-blue-500"
              >
                {periodeOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama_kabinet} {p.is_active ? "(Aktif)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Rentang Tanggal (Lebih Lebar) */}
            <div className="flex flex-col gap-1 flex-[2] min-w-[250px] w-full sm:flex-basis-full">
              <label className="text-xs font-semibold text-slate-500 ml-0.5">
                Rentang Tanggal
              </label>
              <div className="flex items-center gap-2 w-full">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-[38px] px-2.5 rounded-md border border-slate-300 bg-white text-slate-700 text-xs transition-colors focus:outline-none focus:border-blue-500"
                />
                <span className="text-slate-400 text-sm">-</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-[38px] px-2.5 rounded-md border border-slate-300 bg-white text-slate-700 text-xs transition-colors focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Divisi */}
            <div className="flex flex-col gap-1 flex-1 min-w-[140px] sm:flex-basis-[48%]">
              <label className="text-xs font-semibold text-slate-500 ml-0.5">
                Divisi
              </label>
              <select
                value={filterDivisi}
                onChange={(e) => setFilterDivisi(e.target.value)}
                className="w-full h-[38px] px-2.5 rounded-md border border-slate-300 bg-white text-slate-700 text-xs transition-colors focus:outline-none focus:border-blue-500"
              >
                <option value="">Semua Divisi</option>
                {divisiOptions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nama_divisi}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1 flex-1 min-w-[140px] sm:flex-basis-[48%]">
              <label className="text-xs font-semibold text-slate-500 ml-0.5">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full h-[38px] px-2.5 rounded-md border border-slate-300 bg-white text-slate-700 text-xs transition-colors focus:outline-none focus:border-blue-500"
              >
                <option value="">Semua Status</option>
                <option value="Rencana">Rencana</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>

            {/* Target */}
            <div className="flex flex-col gap-1 flex-1 min-w-[140px] sm:flex-basis-[48%]">
              <label className="text-xs font-semibold text-slate-500 ml-0.5">
                Target
              </label>
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="w-full h-[38px] px-2.5 rounded-md border border-slate-300 bg-white text-slate-700 text-xs transition-colors focus:outline-none focus:border-blue-500"
              >
                <option value="">Semua Target</option>
                <option value="Ikhwan">Ikhwan</option>
                <option value="Akhwat">Akhwat</option>
                <option value="Umum">Umum</option>
              </select>
            </div>
          </div>
        }
        // 3. ACTION ADD
        actions={
          isAdmin && (
            <button
              className="px-5 py-2.5 bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-600 hover:-translate-y-0.5 transition-all text-sm font-semibold flex items-center gap-2"
              onClick={() => handleOpenModal()}
            >
              <FiPlus size={18} /> Tambah
            </button>
          )
        }
      />

      {loading ? (
        <ProgjaSkeletonGrid />
      ) : (
        <>
          <div className="w-full columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {currentItems.map((progja) => (
              <div key={progja.id} className="break-inside-avoid">
                <ProgramKerjaCard
                  data={{
                    ...progja,
                    nama_divisi: progja.divisi?.nama_divisi,
                    pj: progja.pj,
                  }}
                  isAdmin={isAdmin}
                  onEdit={() => handleOpenModal(progja)}
                  onDelete={() => handleDelete(progja.id)}
                />
              </div>
            ))}
            {filteredProgja.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 italic">
                <p>Tidak ada program kerja yang ditemukan.</p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Sebelumnya"
              >
                <FiChevronLeft size={18} />
              </button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-md text-sm font-medium transition-colors ${
                        currentPage === page
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Selanjutnya"
              >
                <FiChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Program Kerja" : "Tambah Program Kerja"}
      >
        <ProgramKerjaForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
          loading={formLoading}
          divisiOptions={divisiOptions}
          anggotaOptions={anggotaOptions}
          periodeOptions={periodeOptions}
        />
      </Modal>
    </PageContainer>
  );
}

export default ProgramKerja;
