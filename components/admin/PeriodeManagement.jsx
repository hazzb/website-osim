"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import PageContainer from "@/components/ui/PageContainer";
import PageHeader from "@/components/ui/PageHeader";
import LoadingState from "@/components/ui/LoadingState";
import Modal from "@/components/Modal";
import PeriodeForm from "@/components/forms/PeriodeForm";
import KabinetWizard from "@/components/admin/KabinetWizard";
import tableStyles from "@/components/admin/AdminTable.module.css";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiCheckCircle,
  FiArchive,
  FiZap,
} from "react-icons/fi";
import { FilterSearch } from "@/components/ui/FilterBar";

export default function PeriodeManagement() {
  const supabase = createClient();

  const [periodeList, setPeriodeList] = useState([]);
  const [loadingTable, setLoadingTable] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});

  const fetchPeriode = async () => {
    setLoadingTable(true);
    try {
      let query = supabase.from("periode_jabatan").select("*");
      if (searchTerm) query = query.ilike("nama_kabinet", `%${searchTerm}%`);

      const { data, error } = await query.order("tahun_mulai", {
        ascending: false,
      });
      if (error) throw error;
      setPeriodeList(data || []);
    } catch (err) {
      console.error("Error fetching periode:", err);
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    fetchPeriode();
  }, [searchTerm]);

  const openModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData(item);
    } else {
      setEditingId(null);
      setFormData({
        nama_kabinet: "",
        tahun_mulai: new Date().getFullYear(),
        tahun_selesai: new Date().getFullYear() + 1,
        is_active: false,
        motto_kabinet: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      if (editingId) {
        await supabase
          .from("periode_jabatan")
          .update(formData)
          .eq("id", editingId);
      } else {
        await supabase.from("periode_jabatan").insert(formData);
      }
      setIsModalOpen(false);
      fetchPeriode();
      alert("Berhasil disimpan!");
    } catch (err) {
      alert("Gagal: " + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !confirm(
        "Hapus periode ini? Tindakan ini mungkin berpengaruh pada data anggota dan divisi.",
      )
    )
      return;
    try {
      await supabase.from("periode_jabatan").delete().eq("id", id);
      fetchPeriode();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <PageContainer breadcrumbText="Kelola Periode">
      <PageHeader
        title="Periode Kabinet"
        subtitle="Manajemen tahun kepengurusan dan masa bakti organisasi."
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => setIsWizardOpen(true)}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-tight flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
            >
              <FiZap /> <span>Wizard</span>
            </button>
            <button
              onClick={() => openModal()}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-tight flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
            >
              <FiPlus /> <span>Tambah</span>
            </button>
          </div>
        }
        searchBar={
          <FilterSearch
            placeholder="Cari nama kabinet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        }
      />

      {loadingTable ? (
        <LoadingState message="Memuat tahun kepengurusan..." />
      ) : (
        <div className={tableStyles.wrapper}>
          <div className={tableStyles.tableContainer}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>Nama Kabinet</th>
                  <th>Masa Bakti</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {periodeList.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-20 text-center">
                      <div className="flex flex-col items-center opacity-30">
                        <FiSearch size={40} className="mb-2" />
                        <p className="text-sm font-bold">
                          Tidak ada periode ditemukan.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  periodeList.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="font-bold text-slate-800">
                          {item.nama_kabinet}
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium italic mt-1 leading-relaxed max-w-xs">
                          {item.motto_kabinet || "Tanpa motto kabinet"}
                        </p>
                      </td>
                      <td>
                        <span className="text-xs font-bold text-slate-600">
                          {item.tahun_mulai} — {item.tahun_selesai}
                        </span>
                      </td>
                      <td>
                        {item.is_active ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm">
                            <FiCheckCircle size={10} /> Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200/50">
                            <FiArchive size={10} /> Arsip
                          </span>
                        )}
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
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Periode" : "Tambah Periode Baru"}
      >
        <PeriodeForm
          formData={formData}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          loading={modalLoading}
        />
      </Modal>

      <Modal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        title="Wizard Setup Kabinet"
        maxWidth="700px"
      >
        <KabinetWizard
          isOpen={true}
          onClose={() => setIsWizardOpen(false)}
          onSuccess={fetchPeriode}
        />
      </Modal>
    </PageContainer>
  );
}
