"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/utils/uploadHelper";
import PageContainer from "@/components/ui/PageContainer";
import PageHeader from "@/components/ui/PageHeader";
import LoadingState from "@/components/ui/LoadingState";
import Modal from "@/components/Modal";
import DivisiForm from "@/components/forms/DivisiForm";
import DivisiReorderModal from "@/components/admin/DivisiReorderModal";
import tableStyles from "@/components/admin/AdminTable.module.css";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiCopy,
  FiInfo,
  FiImage,
  FiList,
} from "react-icons/fi";
import { FilterSelect, FilterSearch } from "@/components/ui/FilterBar";

export default function DivisiManagement({ initialPeriodes }) {
  const supabase = createClient();

  const [periodes] = useState(initialPeriodes);
  const [activeTab, setActiveTab] = useState("");
  const [divisions, setDivisions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [formFile, setFormFile] = useState(null);
  const [formPreview, setFormPreview] = useState(null);

  const [showReorderModal, setShowReorderModal] = useState(false);

  useEffect(() => {
    if (periodes.length > 0 && !activeTab) {
      const active = periodes.find((p) => p.is_active) || periodes[0];
      setActiveTab(active.id);
    }
  }, [periodes, activeTab]);

  useEffect(() => {
    if (activeTab) {
      fetchDivisi(activeTab);
    }
  }, [activeTab]);

  const fetchDivisi = async (periodeId) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("divisi")
        .select("*")
        .eq("periode_id", periodeId)
        .order("urutan", { ascending: true });

      if (error) throw error;
      setDivisions(data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Gagal memuat data divisi.");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item = null) => {
    setFormFile(null);
    setFormPreview(null);
    if (item) {
      setEditingId(item.id);
      setFormData(item);
      setFormPreview(item.logo_url);
    } else {
      setEditingId(null);
      setFormData({
        nama_divisi: "",
        deskripsi: "",
        urutan: 10,
        periode_id: activeTab,
        tipe: "Umum",
      });
    }
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormFile(file);
      setFormPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      let payload = {
        nama_divisi: formData.nama_divisi,
        deskripsi: formData.deskripsi,
        urutan: parseInt(formData.urutan || 10),
        periode_id: parseInt(activeTab),
        tipe: formData.tipe || "Umum",
      };

      if (formFile) {
        const url = await uploadImage(formFile, "divisi");
        payload.logo_url = url;
      }

      if (editingId) {
        await supabase.from("divisi").update(payload).eq("id", editingId);
      } else {
        await supabase.from("divisi").insert(payload);
      }

      alert("Berhasil disimpan!");
      setIsModalOpen(false);
      fetchDivisi(activeTab);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus divisi ini?")) return;
    try {
      const { error } = await supabase.from("divisi").delete().eq("id", id);
      if (error) throw error;
      fetchDivisi(activeTab);
    } catch (err) {
      alert("Gagal hapus: " + err.message);
    }
  };

  const handleImportDivisi = async () => {
    if (!confirm("Salin semua divisi dari periode sebelumnya?")) return;
    setLoading(true);
    try {
      const { data: lastPeriode } = await supabase
        .from("periode_jabatan")
        .select("id")
        .neq("id", activeTab)
        .order("tahun_mulai", { ascending: false })
        .limit(1)
        .single();

      if (!lastPeriode) throw new Error("Tidak ada data periode sebelumnya.");

      const { data: oldDivisions } = await supabase
        .from("divisi")
        .select("nama_divisi, deskripsi, logo_url, urutan, tipe")
        .eq("periode_id", lastPeriode.id);

      if (!oldDivisions?.length)
        throw new Error("Periode lalu tidak punya divisi.");

      const newDivisions = oldDivisions.map((div) => ({
        ...div,
        periode_id: parseInt(activeTab),
      }));

      const { error } = await supabase.from("divisi").insert(newDivisions);
      if (error) throw error;

      alert(`Sukses menyalin ${newDivisions.length} divisi!`);
      fetchDivisi(activeTab);
    } catch (err) {
      alert("Gagal import: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredDivisions = divisions.filter((d) =>
    d.nama_divisi.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <PageContainer breadcrumbText="Kelola Divisi">
      <PageHeader
        title="Kelola Divisi"
        subtitle="Atur daftar divisi untuk periode ini."
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => setShowReorderModal(true)}
              disabled={loading || divisions.length === 0}
              className="px-4 py-2 bg-border-dim text-text-main rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-border-dim transition-all"
            >
              <FiList /> <span>Urutkan</span>
            </button>
            <button
              onClick={() => openModal()}
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-primary-hover transition-all shadow-md shadow-blue-100"
            >
              <FiPlus /> <span>Tambah</span>
            </button>
          </div>
        }
        searchBar={
          <FilterSearch
            placeholder="Cari divisi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        }
        filters={
          <div className="flex-1 min-w-[250px]">
            <FilterSelect
              label="Periode Kabinet"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
            >
              {periodes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama_kabinet} ({p.tahun_mulai}) {p.is_active ? "✅" : ""}
                </option>
              ))}
            </FilterSelect>
          </div>
        }
      />

      {loading ? (
        <LoadingState message="Memuat data divisi..." />
      ) : (
        <div className={tableStyles.wrapper}>
          {divisions.length === 0 ? (
            <div className="text-center py-16 bg-bg-page border-2 border-dashed border-border-dim rounded-3xl mx-2">
              <FiInfo size={48} className="text-slate-200 mx-auto mb-4" />
              <p className="text-text-muted font-bold mb-6">
                Belum ada divisi di periode ini.
              </p>
              <button
                onClick={handleImportDivisi}
                className="px-6 py-2.5 bg-bg-card border border-border-dim text-text-main rounded-xl text-xs font-black flex items-center gap-2 mx-auto hover:bg-bg-page transition-all shadow-sm"
              >
                <FiCopy /> Salin Divisi dari Periode Lalu
              </button>
            </div>
          ) : (
            <div className={tableStyles.tableContainer}>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th style={{ width: "60px" }}>Logo</th>
                    <th>Nama Divisi</th>
                    <th>Deskripsi</th>
                    <th style={{ width: "100px" }}>Urutan</th>
                    <th style={{ textAlign: "right", width: "120px" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDivisions.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-20 text-center">
                        <div className="text-text-muted text-xs font-bold">
                          Tidak ada divisi yang cocok.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredDivisions.map((div) => (
                      <tr key={div.id}>
                        <td>
                          <div className="w-10 h-10 rounded-xl bg-bg-card border border-border-dim flex items-center justify-center overflow-hidden shadow-sm">
                            {div.logo_url ? (
                              <img
                                src={div.logo_url}
                                alt="logo"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FiImage className="text-slate-300" />
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="font-bold text-text-main">
                            {div.nama_divisi}
                          </div>
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full mt-1 inline-block ${
                              div.tipe === "Inti"
                                ? "bg-amber-50 text-amber-600 border border-amber-100"
                                : "bg-border-dim text-text-muted"
                            }`}
                          >
                            {div.tipe === "Inti"
                              ? "⭐ Pengurus Inti"
                              : "Divisi Umum"}
                          </span>
                        </td>
                        <td className="max-w-xs">
                          <p className="text-xs text-text-muted truncate">
                            {div.deskripsi || "-"}
                          </p>
                        </td>
                        <td>
                          <span className="text-[10px] font-black bg-border-dim text-text-muted px-2 py-0.5 rounded">
                            #{div.urutan}
                          </span>
                        </td>
                        <td>
                          <div className={tableStyles.actionCell}>
                            <button
                              onClick={() => openModal(div)}
                              className={`${tableStyles.btnAction} ${tableStyles.btnEdit}`}
                              title="Edit"
                            >
                              <FiEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(div.id)}
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
          )}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Divisi" : "Tambah Divisi"}
      >
        <DivisiForm
          formData={formData}
          onChange={handleFormChange}
          onFileChange={handleFileChange}
          preview={formPreview}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          loading={modalLoading}
          periodeList={periodes}
        />
      </Modal>

      <Modal
        isOpen={showReorderModal}
        onClose={() => setShowReorderModal(false)}
        title="Atur Urutan Divisi"
        maxWidth="450px"
      >
        <DivisiReorderModal
          isOpen={true}
          onClose={() => setShowReorderModal(false)}
          divisiList={divisions}
          onSuccess={() => fetchDivisi(activeTab)}
        />
      </Modal>
    </PageContainer>
  );
}
