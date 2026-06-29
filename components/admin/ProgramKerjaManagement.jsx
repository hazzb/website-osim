"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import PageContainer from "@/components/ui/PageContainer";
import PageHeader from "@/components/ui/PageHeader";
import LoadingState from "@/components/ui/LoadingState";
import Modal from "@/components/Modal";
import ProgramKerjaForm from "@/components/forms/ProgramKerjaForm";
import tableStyles from "@/components/admin/AdminTable.module.css";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiClock,
  FiCheckCircle,
  FiActivity,
  FiSearch,
} from "react-icons/fi";
import { FilterSelect, FilterSearch } from "@/components/ui/FilterBar";

export default function ProgramKerjaManagement({
  initialPeriode,
  initialDivisi,
  initialAnggota,
}) {
  const supabase = createClient();

  const [progjaList, setProgjaList] = useState([]);
  const [loadingTable, setLoadingTable] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  const [selectedPeriodeId, setSelectedPeriodeId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (initialPeriode.length > 0 && !selectedPeriodeId) {
      const active =
        initialPeriode.find((p) => p.is_active) || initialPeriode[0];
      setSelectedPeriodeId(active.id);
    }
  }, [initialPeriode, selectedPeriodeId]);

  const fetchProgja = async () => {
    setLoadingTable(true);
    try {
      let query = supabase
        .from("program_kerja")
        .select(`*, divisi (nama_divisi), periode_jabatan (nama_kabinet)`, {
          count: "exact",
        });

      if (selectedPeriodeId) query = query.eq("periode_id", selectedPeriodeId);
      if (searchTerm) query = query.ilike("nama_acara", `%${searchTerm}%`);

      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to).order("tanggal", { ascending: false });

      const { data, count, error } = await query;
      if (error) throw error;

      setProgjaList(data || []);
      if (count !== null) {
        setTotalItems(count);
        setTotalPages(Math.ceil(count / itemsPerPage));
      }
    } catch (err) {
      console.error("Error fetching progja:", err);
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    fetchProgja();
  }, [selectedPeriodeId, searchTerm, currentPage]);

  const openModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData(item);
    } else {
      setEditingId(null);
      setFormData({
        nama_acara: "",
        status: "Rencana",
        target_gender: "Umum",
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
      const payload = { ...formData };
      delete payload.divisi;
      delete payload.periode_jabatan;

      if (editingId) {
        await supabase
          .from("program_kerja")
          .update(payload)
          .eq("id", editingId);
      } else {
        await supabase.from("program_kerja").insert(payload);
      }

      setIsModalOpen(false);
      fetchProgja();
      alert("Berhasil disimpan!");
    } catch (err) {
      alert("Gagal: " + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus program kerja ini?")) return;
    try {
      await supabase.from("program_kerja").delete().eq("id", id);
      fetchProgja();
    } catch (err) {
      alert(err.message);
    }
  };

  const getStatusBadge = (status) => {
    let classes = "bg-border-dim text-text-muted border-border-dim";
    let icon = <FiClock />;

    if (status === "Selesai") {
      classes = "bg-emerald-50 text-emerald-600 border-emerald-100";
      icon = <FiCheckCircle />;
    } else if (status === "Berjalan") {
      classes = "bg-primary-light text-primary border-primary-border";
      icon = <FiActivity />;
    }

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight border ${classes}`}
      >
        {icon} {status}
      </span>
    );
  };

  return (
    <PageContainer breadcrumbText="Kelola Program Kerja">
      <PageHeader
        title="Program Kerja"
        subtitle="Daftar seluruh kegiatan organisasi lintas periode."
        actions={
          <button
            onClick={() => openModal()}
            className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-tight flex items-center gap-2 hover:bg-primary-hover transition-all shadow-lg shadow-blue-100 active:scale-95"
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
              {initialPeriode.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama_kabinet}
                </option>
              ))}
            </FilterSelect>
          </div>
        }
      />

      {loadingTable ? (
        <LoadingState message="Memuat data kegiatan..." />
      ) : (
        <div className={tableStyles.wrapper}>
          <div className={tableStyles.tableContainer}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>Nama Acara</th>
                  <th>Divisi</th>
                  <th>Periode</th>
                  <th>Status</th>
                  <th>Tanggal</th>
                  <th style={{ textAlign: "right" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {progjaList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-20 text-center">
                      <div className="flex flex-col items-center opacity-30">
                        <FiSearch size={40} className="mb-2" />
                        <p className="text-sm font-bold">
                          Tidak ada program kerja ditemukan.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  progjaList.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="font-bold text-text-main">
                          {item.nama_acara}
                        </div>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded mt-1 inline-block ${
                            item.target_gender === "Akhwat"
                              ? "bg-fuchsia-50 text-fuchsia-500"
                              : item.target_gender === "Ikhwan"
                                ? "bg-primary-light text-primary"
                                : "bg-border-dim text-text-muted"
                          }`}
                        >
                          TARGET: {item.target_gender}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs font-semibold text-text-body">
                          {item.divisi?.nama_divisi || "-"}
                        </span>
                      </td>
                      <td>
                        <span className="text-[10px] bg-border-dim text-text-muted px-2 py-0.5 rounded font-bold">
                          {item.periode_jabatan?.nama_kabinet || "-"}
                        </span>
                      </td>
                      <td>{getStatusBadge(item.status)}</td>
                      <td className="text-xs text-text-muted font-medium">
                        {item.tanggal
                          ? new Date(item.tanggal).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </td>
                      <td>
                        <div className={tableStyles.actionCell}>
                          <button
                            onClick={() => openModal(item)}
                            className={`${tableStyles.btnAction} ${tableStyles.btnEdit}`}
                            title="Edit"
                          >
                            <FiEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className={`${tableStyles.btnAction} ${tableStyles.btnDelete}`}
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

          {totalPages > 1 && (
            <div className={tableStyles.paginationContainer}>
              <div className="text-xs text-text-muted font-bold">
                Hal. <strong>{currentPage}</strong> dari{" "}
                <strong>{totalPages}</strong>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 bg-bg-card border border-border-dim rounded-xl text-xs font-black text-text-muted hover:bg-bg-page disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Prev
                </button>
                <button
                  className="px-4 py-2 bg-bg-card border border-border-dim rounded-xl text-xs font-black text-text-muted hover:bg-bg-page disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

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
          periodeList={initialPeriode}
          divisiList={initialDivisi}
          anggotaList={initialAnggota}
        />
      </Modal>
    </PageContainer>
  );
}
