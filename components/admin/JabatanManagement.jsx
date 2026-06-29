"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import PageContainer from "@/components/ui/PageContainer";
import PageHeader from "@/components/ui/PageHeader";
import LoadingState from "@/components/ui/LoadingState";
import Modal from "@/components/Modal";
import FormInput from "@/components/admin/FormInput";
import tableStyles from "@/components/admin/AdminTable.module.css";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiAward,
  FiStar,
  FiUsers,
} from "react-icons/fi";
import { FilterSearch } from "@/components/ui/FilterBar";

export default function JabatanManagement() {
  const supabase = createClient();

  const [jabatanList, setJabatanList] = useState([]);
  const [loadingTable, setLoadingTable] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nama_jabatan: "",
    tipe_jabatan: "Divisi",
  });

  const fetchJabatan = async () => {
    setLoadingTable(true);
    try {
      let query = supabase.from("master_jabatan").select("*");
      if (searchTerm) query = query.ilike("nama_jabatan", `%${searchTerm}%`);

      const { data, error } = await query
        .order("tipe_jabatan", { ascending: true })
        .order("nama_jabatan", { ascending: true });
      if (error) throw error;
      setJabatanList(data || []);
    } catch (err) {
      console.error("Error fetching jabatan:", err);
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    fetchJabatan();
  }, [searchTerm]);

  const openModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData(item);
    } else {
      setEditingId(null);
      setFormData({ nama_jabatan: "", tipe_jabatan: "Divisi" });
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
      if (editingId) {
        await supabase
          .from("master_jabatan")
          .update(formData)
          .eq("id", editingId);
      } else {
        await supabase.from("master_jabatan").insert(formData);
      }
      setIsModalOpen(false);
      fetchJabatan();
      alert("Jabatan berhasil disimpan!");
    } catch (err) {
      alert("Gagal: " + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !confirm(
        "Hapus jabatan ini? Anggota yang memiliki jabatan ini akan kehilangan data jabatannya.",
      )
    )
      return;
    try {
      await supabase.from("master_jabatan").delete().eq("id", id);
      fetchJabatan();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <PageContainer breadcrumbText="Kelola Jabatan">
      <PageHeader
        title="Daftar Jabatan"
        subtitle="Master data posisi struktural dan hierarki organisasi."
        actions={
          <button
            onClick={() => openModal()}
            className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-tight flex items-center gap-2 hover:bg-primary-hover transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            <FiPlus /> <span>Tambah Jabatan</span>
          </button>
        }
        searchBar={
          <FilterSearch
            placeholder="Cari nama jabatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        }
      />

      {loadingTable ? (
        <LoadingState message="Memuat data jabatan..." />
      ) : (
        <div className={tableStyles.wrapper}>
          <div className={tableStyles.tableContainer}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>Nama Jabatan</th>
                  <th>Tipe Jabatan</th>
                  <th>Status Hierarki</th>
                  <th style={{ textAlign: "right" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {jabatanList.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-20 text-center">
                      <div className="flex flex-col items-center opacity-30">
                        <FiSearch size={40} className="mb-2" />
                        <p className="text-sm font-bold">
                          Tidak ada jabatan ditemukan.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  jabatanList.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.tipe_jabatan === "Inti" ? "bg-amber-100 text-amber-600" : "bg-border-dim text-text-muted"}`}
                          >
                            {item.tipe_jabatan === "Inti" ? (
                              <FiAward />
                            ) : (
                              <FiUsers />
                            )}
                          </div>
                          <span className="font-bold text-text-main">
                            {item.nama_jabatan}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            item.tipe_jabatan === "Inti"
                              ? "bg-amber-50 text-amber-600 border-amber-100"
                              : "bg-bg-page text-text-muted border-border-dim"
                          }`}
                        >
                          {item.tipe_jabatan === "Inti" && <FiStar size={10} />}
                          {item.tipe_jabatan}
                        </span>
                      </td>
                      <td>
                        <p className="text-[10px] text-text-muted font-medium">
                          {item.tipe_jabatan === "Inti"
                            ? "Jabatan strategis tingkat pusat (BPH)."
                            : "Jabatan operasional tingkat divisi."}
                        </p>
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
        title={editingId ? "Edit Jabatan" : "Tambah Jabatan Baru"}
      >
        <form onSubmit={handleSubmit} className="p-2">
          <div className="grid grid-cols-12 gap-5">
            <FormInput
              label="Nama Jabatan"
              name="nama_jabatan"
              value={formData.nama_jabatan || ""}
              onChange={handleFormChange}
              required
              span={12}
              placeholder="Contoh: Ketua Umum, Sekretaris Divisi..."
            />

            <div className="col-span-12">
              <label className="block text-[10px] font-extrabold text-text-muted uppercase tracking-widest mb-3 px-1">
                Tipe Jabatan
              </label>
              <div className="flex gap-3 bg-bg-page p-2 rounded-2xl border border-border-dim">
                {["Inti", "Divisi"].map((t) => (
                  <label
                    key={t}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all border-2 cursor-pointer ${
                      formData.tipe_jabatan === t
                        ? "bg-bg-card border-blue-500 text-primary shadow-sm"
                        : "bg-transparent border-transparent text-text-muted hover:text-text-body"
                    }`}
                  >
                    <input
                      type="radio"
                      name="tipe_jabatan"
                      value={t}
                      checked={formData.tipe_jabatan === t}
                      onChange={handleFormChange}
                      className="hidden"
                    />
                    {t === "Inti" ? <FiAward /> : <FiUsers />}
                    {t}
                  </label>
                ))}
              </div>
              <p className="mt-3 px-1 text-[9px] text-text-muted font-medium italic">
                * Tipe 'Inti' biasanya digunakan untuk pengurus harian (BPH)
                agar urutan tampil lebih atas.
              </p>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-border-dim flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-text-muted hover:bg-bg-page transition-all border border-border-dim"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 rounded-xl text-xs font-extrabold text-white bg-primary hover:bg-primary-hover transition-all shadow-lg shadow-blue-200 disabled:opacity-50 transform active:scale-95"
              disabled={modalLoading}
            >
              {modalLoading ? "Menyimpan..." : "Simpan Jabatan"}
            </button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
}
