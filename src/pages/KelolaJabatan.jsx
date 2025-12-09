import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useAdminTable } from "../hooks/useAdminTable";

// Components
import PageContainer from "../components/ui/PageContainer.jsx";
import Modal from "../components/Modal.jsx";
import FormInput from "../components/admin/FormInput.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";

// Styles
import tableStyles from "../components/admin/AdminTable.module.css";
import formStyles from "../components/admin/AdminForm.module.css";

// Icons
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiTag,
  FiBriefcase,
} from "react-icons/fi";

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
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [modalLoading, setModalLoading] = useState(false);

  // --- 3. HANDLERS ---
  const openModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData(item);
    } else {
      setEditingId(null);
      setFormData({
        nama_jabatan: "",
        tipe_jabatan: "Divisi",
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
      const payload = {
        nama_jabatan: formData.nama_jabatan,
        tipe_jabatan: formData.tipe_jabatan,
      };

      if (editingId) {
        await supabase
          .from("master_jabatan")
          .update(payload)
          .eq("id", editingId);
      } else {
        await supabase.from("master_jabatan").insert(payload);
      }

      alert("Berhasil disimpan!");
      setIsModalOpen(false);
      refreshData();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // --- 4. RENDER HELPER (BADGE WARNA) ---
  const getBadgeColor = (tipe) => {
    switch (tipe) {
      case "Inti":
        return { bg: "#e0f2fe", text: "#0284c7" }; // Biru
      case "Divisi":
        return { bg: "#f0fdf4", text: "#16a34a" }; // Hijau
      default:
        return { bg: "#f1f5f9", text: "#64748b" }; // Abu
    }
  };

  // --- 5. RENDER UTAMA ---
  if (loading)
    return (
      <PageContainer breadcrumbText="Memuat...">
        <LoadingState message="Memuat data jabatan..." />
      </PageContainer>
    );

  return (
    <PageContainer breadcrumbText="Kelola Jabatan">
      {/* HEADER & SEARCH (Gunakan tableStyles.adminPageHeader) */}
      <div className={tableStyles.adminPageHeader}>
        <div>
          <h1 className="page-title">Kelola Jabatan</h1>
          <p style={{ color: "var(--text-muted)" }}>
            Master data untuk struktur organisasi.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="button button-primary"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <FiPlus /> Tambah Jabatan
        </button>
      </div>

      {/* FILTER CONTAINER */}
      <div className={tableStyles.tableFilterContainer}>
        <div className={tableStyles.searchInputGroup}>
          <FiSearch style={{ color: "#94a3b8" }} />
          <input
            type="text"
            placeholder="Cari nama jabatan..."
            className={tableStyles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
      )}

      {/* TABLE CONTAINER */}
      <div className={tableStyles.tableContainer}>
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th style={{ width: "50px" }}>No</th>
              <th>Nama Jabatan</th>
              <th>Tipe / Kategori</th>
              <th style={{ textAlign: "right", width: "150px" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {jabatanList.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "#94a3b8",
                  }}
                >
                  Data tidak ditemukan.
                </td>
              </tr>
            ) : (
              jabatanList.map((item, index) => {
                const badge = getBadgeColor(item.tipe_jabatan);
                return (
                  <tr key={item.id}>
                    <td>{(currentPage - 1) * 10 + index + 1}</td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <FiBriefcase size={14} color="#94a3b8" />
                        <span
                          style={{
                            fontWeight: "600",
                            color: "var(--text-main)",
                          }}
                        >
                          {item.nama_jabatan}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          background: badge.bg,
                          color: badge.text,
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <FiTag size={12} /> {item.tipe_jabatan || "-"}
                      </span>
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
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className={tableStyles.paginationContainer}>
          <span className={tableStyles.paginationInfo}>
            Halaman {currentPage} dari {totalPages}
          </span>
          <div className={tableStyles.paginationButtons}>
            <button
              className={tableStyles.paginationButton}
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <button
              className={tableStyles.paginationButton}
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* MODAL FORM */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Jabatan" : "Tambah Jabatan Baru"}
      >
        <form onSubmit={handleSubmit}>
          <div className={formStyles.formGrid}>
            <FormInput
              label="Nama Jabatan"
              name="nama_jabatan"
              value={formData.nama_jabatan || ""}
              onChange={handleFormChange}
              required
              span={12}
              placeholder="Contoh: Ketua, Sekretaris, Staff"
            />

            <FormInput
              label="Tipe Jabatan"
              name="tipe_jabatan"
              type="select"
              value={formData.tipe_jabatan || "Divisi"}
              onChange={handleFormChange}
              span={12}
              helper="Pilih 'Inti' untuk BPH, 'Divisi' untuk pengurus biasa."
            >
              <option value="Inti">Pengurus Inti (BPH)</option>
              <option value="Divisi">Pengurus Divisi</option>
              <option value="Umum">Anggota Umum</option>
            </FormInput>
          </div>

          <div className={formStyles.formFooter}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="button button-secondary"
            >
              Batal
            </button>
            <button
              type="submit"
              className="button button-primary"
              disabled={modalLoading}
            >
              {modalLoading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
}

export default KelolaJabatan;
