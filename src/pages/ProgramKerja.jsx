import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { ProgjaSkeletonGrid } from "../components/ui/Skeletons.jsx";
import { FiPlus, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import PageContainer from "../components/ui/PageContainer.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import {
  FilterSearch,
  FilterToggle,
  FilterSelect,
} from "../components/ui/FilterBar.jsx";
import ProgramKerjaCard from "../components/cards/ProgramKerjaCard.jsx";
import Modal from "../components/Modal.jsx";
import ProgramKerjaForm from "../components/forms/ProgramKerjaForm.jsx";

function ProgramKerja() {
  const { session } = useAuth();
  const isAdmin = !!session;
  const [progjaList, setProgjaList] = useState([]);
  const [filteredProgja, setFilteredProgja] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPeriode, setFilterPeriode] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterDivisi, setFilterDivisi] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [divisiOptions, setDivisiOptions] = useState([]);
  const [anggotaOptions, setAnggotaOptions] = useState([]);
  const [periodeOptions, setPeriodeOptions] = useState([]);
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

  const fetchAllData = async () => {
    setLoading(true);
    try {
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
      const { data: progjaData, error } = await supabase
        .from("program_kerja")
        .select(
          `*, divisi:divisi_id (nama_divisi), pj:penanggung_jawab_id (nama)`,
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
    setCurrentPage(1);
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProgja.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProgja.length / itemsPerPage);

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      setFormData({ ...item });
    } else {
      setFormData({ ...initialFormState, periode_id: filterPeriode || "" });
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
                {periodeOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama_kabinet} {p.is_active ? "(Aktif)" : ""}
                  </option>
                ))}
              </FilterSelect>
            </div>
            <div className="flex flex-col gap-1 flex-[2] min-w-[250px]">
              <label className="text-xs font-semibold text-slate-500">
                Rentang Tanggal
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-[38px] px-2.5 rounded-md border border-slate-300 bg-white"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-[38px] px-2.5 rounded-md border border-slate-300 bg-white"
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
              className="button button-primary"
              onClick={() => handleOpenModal()}
            >
              <FiPlus /> Tambah
            </button>
          )
        }
      />
      {loading ? (
        <ProgjaSkeletonGrid />
      ) : filteredProgja.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl animate-fadeIn">
          <div className="text-6xl mb-4 grayscale opacity-30">📅</div>
          <h3 className="text-xl font-bold text-slate-700 m-0">
            Program tidak ditemukan
          </h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto px-4">
            {searchTerm
              ? `Tidak ada program kerja yang cocok dengan kata kunci "${searchTerm}".`
              : "Tidak ada program kerja yang sesuai dengan filter yang dipilih."}
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setFilterStatus("");
              setFilterGender("");
              setFilterDivisi("");
              setStartDate("");
              setEndDate("");
            }}
            className="mt-6 text-blue-600 font-semibold hover:underline bg-transparent border-none cursor-pointer"
          >
            Bersihkan Filter
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentItems.map((progja) => (
              <ProgramKerjaCard
                key={progja.id}
                data={{
                  ...progja,
                  nama_divisi: progja.divisi?.nama_divisi,
                  pj: progja.pj,
                }}
                isAdmin={isAdmin}
                onEdit={() => handleOpenModal(progja)}
                onDelete={() => handleDelete(progja.id)}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-md border border-slate-200 bg-white"
              >
                <FiChevronLeft />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-9 h-9 rounded-md ${currentPage === p ? "bg-blue-600 text-white" : "bg-white border"}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-md border border-slate-200 bg-white"
              >
                <FiChevronRight />
              </button>
            </div>
          )}
        </>
      )}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Proker" : "Tambah Proker"}
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
