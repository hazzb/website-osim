import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAdminTable } from "../hooks/useAdminTable";

// Components
import PageContainer from "../components/ui/PageContainer.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import Modal from "../components/Modal.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import ProgramKerjaForm from "../components/forms/ProgramKerjaForm.jsx";
import { FilterSelect, FilterSearch } from "../components/ui/FilterBar.jsx";

// Icons
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiCheckCircle,
  FiClock,
  FiActivity,
} from "react-icons/fi";

function KelolaProgramKerja() {
  // --- STATE FILTER ---
  const [selectedPeriodeId, setSelectedPeriodeId] = useState("");

  // --- 1. SETUP TABLE HOOK ---
  const {
    data: progjaList,
    loading,
    error,
    currentPage,
    setCurrentPage,
    totalPages,
    searchTerm,
    setSearchTerm,
    handleDelete,
    refreshData,
  } = useAdminTable({
    tableName: "program_kerja",
    searchColumn: "nama_acara",
    select: "*, divisi(nama_divisi), periode_jabatan(nama_kabinet)",
    defaultOrder: { column: "tanggal", ascending: false },
    filters: selectedPeriodeId ? { periode_id: selectedPeriodeId } : {},
  });

  // --- 2. STATE FORM ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});

  // Dropdown Data
  const [periodeList, setPeriodeList] = useState([]);
  const [divisiList, setDivisiList] = useState([]);
  const [anggotaList, setAnggotaList] = useState([]);

  // Fetch Dropdowns
  useEffect(() => {
    const fetchDropdowns = async () => {
      const { data: p } = await supabase
        .from("periode_jabatan")
        .select("id, nama_kabinet")
        .order("tahun_mulai", { ascending: false });
      setPeriodeList(p || []);
      const { data: d } = await supabase
        .from("divisi")
        .select("id, nama_divisi")
        .order("nama_divisi");
      setDivisiList(d || []);
      const { data: a } = await supabase
        .from("anggota")
        .select("id, nama")
        .order("nama");
      setAnggotaList(a || []);
    };
    fetchDropdowns();
  }, []);

  // --- HANDLERS ---
  const openModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData(item);
    } else {
      setEditingId(null);
      setFormData({
        nama_acara: "",
        status: "Rencana",
        tanggal: "",
        periode_id: selectedPeriodeId || "",
        divisi_id: "",
        penanggung_jawab_id: "",
        deskripsi: "",
        link_dokumentasi: "",
        embed_html: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      if (editingId)
        await supabase
          .from("program_kerja")
          .update(formData)
          .eq("id", editingId);
      else await supabase.from("program_kerja").insert(formData);

      setIsModalOpen(false);
      refreshData();
      alert("Berhasil disimpan!");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // Helper for Status Badge
  const getStatusBadge = (status) => {
    let classes = "bg-slate-100 text-slate-600";
    let icon = <FiClock />;

    if (status === "Selesai") {
      classes = "bg-green-100 text-green-700";
      icon = <FiCheckCircle />;
    } else if (status === "Berjalan") {
      classes = "bg-blue-100 text-blue-700";
      icon = <FiActivity />;
    }

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${classes}`}
      >
        {icon} {status}
      </span>
    );
  };

  // --- RENDER ---
  return (
    <PageContainer breadcrumbText="Kelola Program Kerja">
      <PageHeader
        title="Kelola Program Kerja"
        subtitle="Database seluruh kegiatan organisasi."
        actions={
          <button
            onClick={() => openModal()}
            className="button button-primary"
            title="Tambah Program Kerja"
          >
            <FiPlus /> <span>Tambah Progja</span>
          </button>
        }
        searchBar={
          <FilterSearch
            placeholder="Cari nama acara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        }
        filters={
          <div className="flex-1 min-w-[200px]">
            <FilterSelect
              label="Filter Periode"
              value={selectedPeriodeId}
              onChange={(e) => setSelectedPeriodeId(e.target.value)}
            >
              <option value="">Semua Periode</option>
              {periodeList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama_kabinet}
                </option>
              ))}
            </FilterSelect>
          </div>
        }
      />

      {error && (
        <div className="text-red-500 my-4 bg-red-50 p-3 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* TABLE CONTENT */}
      {loading ? (
        <LoadingState message="Memuat data..." />
      ) : (
        <div className="w-full overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-sm">
          <table className="w-full border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Nama Acara
                </th>
                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Divisi
                </th>
                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Periode
                </th>
                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  Tanggal
                </th>
                <th className="p-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {progjaList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-12 text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <FiSearch size={32} className="opacity-30" />
                      <div className="text-slate-500 font-medium">
                        {searchTerm
                          ? `Tidak ada program kerja yang cocok dengan "${searchTerm}"`
                          : "Tidak ada data program kerja."}
                      </div>
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm("")}
                          className="text-blue-600 font-semibold hover:underline bg-transparent border-none cursor-pointer text-sm"
                        >
                          Reset Pencarian
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                progjaList.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-0"
                  >
                    <td className="p-4 align-middle text-sm text-slate-800 font-semibold">
                      {item.nama_acara}
                    </td>
                    <td className="p-4 align-middle text-sm text-slate-600">
                      {item.divisi?.nama_divisi || "-"}
                    </td>
                    <td className="p-4 align-middle text-sm text-slate-600">
                      {item.periode_jabatan?.nama_kabinet || "-"}
                    </td>
                    <td className="p-4 align-middle">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="p-4 align-middle text-sm text-slate-600">
                      {new Date(item.tanggal).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => openModal(item)}
                          className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                          title="Edit"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                          title="Hapus"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 px-2">
          <span className="text-sm text-slate-500">
            Halaman {currentPage} dari {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              className="px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <button
              className="px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* MODAL FORM */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingId ? "Edit Program Kerja" : "Tambah Program Kerja"}
          maxWidth="800px"
        >
          <ProgramKerjaForm
            formData={formData}
            onChange={handleFormChange}
            onSubmit={handleSubmit}
            onCancel={() => setIsModalOpen(false)}
            loading={modalLoading}
            periodeList={periodeList}
            divisiList={divisiList}
            anggotaList={anggotaList}
          />
        </Modal>
      )}
    </PageContainer>
  );
}

export default KelolaProgramKerja;
