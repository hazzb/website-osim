import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useAdminTable } from "../hooks/useAdminTable";

// Components
import PageContainer from "../components/ui/PageContainer.jsx";
import PageHeader from "../components/ui/PageHeader.jsx"; // <--- IMPORT
import Modal from "../components/Modal.jsx";
import FormInput from "../components/admin/FormInput.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";

// Styles
import tableStyles from "../components/admin/AdminTable.module.css";
import formStyles from "../components/admin/AdminForm.module.css";
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiTag } from "react-icons/fi";

function KelolaJabatan() {
  // --- 1. SETUP TABLE HOOK ---
  const {
    data: jabatanList,
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
    tableName: "master_jabatan",
    searchColumn: "nama_jabatan",
    defaultOrder: { column: "tipe_jabatan", ascending: true },
  });

  // --- 2. STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nama_jabatan: "", tipe_jabatan: "Divisi" });

  // --- HANDLERS ---
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
      if (editingId) await supabase.from("master_jabatan").update(formData).eq("id", editingId);
      else await supabase.from("master_jabatan").insert(formData);
      
      setIsModalOpen(false);
      refreshData();
      alert("Berhasil disimpan!");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // --- RENDER ---
  return (
    <PageContainer breadcrumbText="Kelola Jabatan">
      
      {/* HEADER STANDAR */}
      <PageHeader
        title="Kelola Jabatan"
        subtitle="Master data jabatan (Struktural & Inti)."
        
        actions={
          <button
            onClick={() => openModal()}
            className="button button-primary"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <FiPlus /> Tambah Jabatan
          </button>
        }

        searchBar={
          <div style={{ position: "relative", width: "100%" }}>
            <FiSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              type="text"
              placeholder="Cari jabatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", padding: "0.6rem 1rem 0.6rem 2.5rem", border: "1px solid #cbd5e0", borderRadius: "8px", fontSize: "0.9rem", height: "38px" }}
            />
          </div>
        }
      />

      {/* TABLE */}
      {loading ? (
        <LoadingState message="Memuat data..." />
      ) : (
        <div className={tableStyles.tableContainer}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Nama Jabatan</th>
                <th>Tipe</th>
                <th style={{ textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {jabatanList.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.nama_jabatan}</strong></td>
                  <td>
                    {item.tipe_jabatan === "Inti" ? (
                      <span className={`${tableStyles.badge} ${tableStyles.badgeSuccess}`}>Inti (BPH)</span>
                    ) : (
                      <span className={`${tableStyles.badge} ${tableStyles.badgeGray}`}>Divisi</span>
                    )}
                  </td>
                  <td>
                    <div className={tableStyles.actionCell}>
                      <button onClick={() => openModal(item)} className={`${tableStyles.btnAction} ${tableStyles.btnEdit}`}><FiEdit /></button>
                      <button onClick={() => handleDelete(item.id)} className={`${tableStyles.btnAction} ${tableStyles.btnDelete}`}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION (Jika ada) */}
      
      {/* MODAL FORM */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Jabatan" : "Tambah Jabatan"}
      >
        <form onSubmit={handleSubmit} className={formStyles.form}>
          <div className={formStyles.formGrid}>
            <FormInput
              label="Nama Jabatan"
              name="nama_jabatan"
              value={formData.nama_jabatan || ""}
              onChange={handleFormChange}
              required
              span={12}
            />
            <FormInput
              label="Tipe Jabatan"
              name="tipe_jabatan"
              type="select"
              value={formData.tipe_jabatan || "Divisi"}
              onChange={handleFormChange}
              span={12}
            >
              <option value="Inti">Pengurus Inti (BPH)</option>
              <option value="Divisi">Pengurus Divisi</option>
            </FormInput>
          </div>
          <div className={formStyles.formFooter}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="button button-secondary">Batal</button>
            <button type="submit" className="button button-primary" disabled={modalLoading}>Simpan</button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
}

export default KelolaJabatan;