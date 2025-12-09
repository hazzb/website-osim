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
  FiClock,
  FiCheckCircle,
  FiArchive,
} from "react-icons/fi";

function KelolaPeriode() {
  // --- 1. SETUP TABLE HOOK ---
  const {
    data: periodeList,
    loading,
    error,
    currentPage,
    setCurrentPage,
    totalPages,
    searchTerm,
    setSearchTerm,
    refreshData,
  } = useAdminTable({
    tableName: "periode_jabatan",
    searchColumn: "nama_kabinet",
    defaultOrder: { column: "tahun_mulai", ascending: false },
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
      const currentYear = new Date().getFullYear();
      setFormData({
        nama_kabinet: "",
        tahun_mulai: currentYear,
        tahun_selesai: currentYear + 1,
        is_active: false,
        motto_kabinet: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- DEBUGGING SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);

    console.log("--- MULAI SUBMIT ---");
    console.log("Data Mentah Form:", formData);

    try {
      // 1. Validasi & Konversi
      const isActive =
        formData.is_active === "true" || formData.is_active === true;
      const tMulai = parseInt(formData.tahun_mulai);
      const tSelesai = parseInt(formData.tahun_selesai);

      const payload = {
        nama_kabinet: formData.nama_kabinet,
        tahun_mulai: tMulai,
        tahun_selesai: tSelesai,
        motto_kabinet: formData.motto_kabinet,
        is_active: isActive,
      };

      console.log("Payload Siap Kirim:", payload);

      // 2. Logic Update Status Aktif (Jika perlu)
      if (isActive) {
        console.log(">> Mencoba menonaktifkan periode lain...");
        const { error: errReset } = await supabase
          .from("periode_jabatan")
          .update({ is_active: false })
          .neq("id", 0); // Hack update all

        if (errReset) {
          console.error("GAGAL RESET PERIODE LAIN:", errReset);
          throw new Error(`Gagal Reset: ${errReset.message} (Cek RLS!)`);
        }
        console.log(">> Sukses menonaktifkan periode lain.");
      }

      // 3. Eksekusi Simpan Utama
      let result;
      if (editingId) {
        console.log(`>> Mencoba UPDATE ID: ${editingId}`);
        result = await supabase
          .from("periode_jabatan")
          .update(payload)
          .eq("id", editingId)
          .select();
      } else {
        console.log(">> Mencoba INSERT Baru");
        result = await supabase
          .from("periode_jabatan")
          .insert(payload)
          .select();
      }

      // 4. Cek Error Balikan Supabase
      const { data, error } = result;

      if (error) {
        console.error("FATAL ERROR SUPABASE:", error);
        // Tampilkan pesan error spesifik RLS
        if (error.code === "42501") {
          throw new Error(
            "Izin Ditolak (RLS Policy). Anda tidak punya hak tulis di tabel ini."
          );
        }
        throw error;
      }

      if (!data || data.length === 0) {
        console.warn(
          "Warning: Tidak ada data yang dikembalikan. Mungkin RLS 'select' policy memblokir hasil balikan."
        );
      }

      console.log("SUKSES! Data tersimpan:", data);
      alert("Berhasil disimpan!");
      setIsModalOpen(false);
      refreshData();
    } catch (err) {
      console.error("CATCH BLOCK ERROR:", err);
      alert("TERJADI ERROR: " + (err.message || JSON.stringify(err)));
    } finally {
      setModalLoading(false);
      console.log("--- SELESAI SUBMIT ---");
    }
  };

  // --- DEBUGGING DELETE ---
  const handleDelete = async (id) => {
    if (!window.confirm("Hapus periode ini?")) return;

    console.log(`--- MULAI DELETE ID: ${id} ---`);
    try {
      const { error } = await supabase
        .from("periode_jabatan")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("DELETE ERROR:", error);
        if (error.code === "42501") {
          throw new Error("Izin Hapus Ditolak (RLS Policy).");
        }
        throw error;
      }

      console.log("Delete Sukses");
      alert("Berhasil dihapus");
      refreshData();
    } catch (err) {
      alert("Gagal hapus: " + err.message);
    }
  };

  if (loading)
    return (
      <PageContainer breadcrumbText="Memuat...">
        <LoadingState message="Memuat data periode..." />
      </PageContainer>
    );

  return (
    <PageContainer breadcrumbText="Kelola Periode">
      {/* HEADER */}
      <div className={tableStyles.adminPageHeader}>
        <div>
          <h1 className="page-title">Kelola Periode</h1>
          <p style={{ color: "var(--text-muted)" }}>
            Atur masa jabatan kepengurusan.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="button button-primary"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <FiPlus /> Tambah Periode
        </button>
      </div>

      {/* FILTER */}
      <div className={tableStyles.tableFilterContainer}>
        <div className={tableStyles.searchInputGroup}>
          <FiSearch style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Cari nama kabinet..."
            className={tableStyles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
      )}

      {/* TABLE */}
      <div className={tableStyles.tableContainer}>
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th style={{ width: "50px" }}>No</th>
              <th>Nama Kabinet</th>
              <th>Masa Bakti</th>
              <th>Status</th>
              <th style={{ textAlign: "right", width: "150px" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {periodeList.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "var(--text-muted)",
                  }}
                >
                  Belum ada data periode.
                </td>
              </tr>
            ) : (
              periodeList.map((item, index) => (
                <tr
                  key={item.id}
                  style={item.is_active ? { backgroundColor: "#f0fdf4" } : {}}
                >
                  <td>{(currentPage - 1) * 10 + index + 1}</td>
                  <td>
                    <span
                      style={{ fontWeight: "600", color: "var(--text-main)" }}
                    >
                      {item.nama_kabinet}
                    </span>
                    {item.motto_kabinet && (
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-muted)",
                          fontStyle: "italic",
                        }}
                      >
                        "{item.motto_kabinet}"
                      </div>
                    )}
                  </td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "0.9rem",
                      }}
                    >
                      <FiClock size={14} color="#64748b" /> {item.tahun_mulai} -{" "}
                      {item.tahun_selesai}
                    </div>
                  </td>
                  <td>
                    {item.is_active ? (
                      <span
                        className={`${tableStyles.badge} ${tableStyles.badgeGreen}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <FiCheckCircle size={12} /> AKTIF
                      </span>
                    ) : (
                      <span
                        className={`${tableStyles.badge} ${tableStyles.badgeGray}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <FiArchive size={12} /> Arsip
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

      {/* MODAL FORM */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Periode" : "Tambah Periode Baru"}
      >
        <form onSubmit={handleSubmit}>
          <div className={formStyles.formGrid}>
            <FormInput
              label="Nama Kabinet"
              name="nama_kabinet"
              value={formData.nama_kabinet || ""}
              onChange={handleFormChange}
              required
              span={12}
              placeholder="Contoh: Kabinet Pembaharu"
            />
            <div className={formStyles.colSpan4}>
              <FormInput
                label="Tahun Mulai"
                name="tahun_mulai"
                type="number"
                value={formData.tahun_mulai || ""}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className={formStyles.colSpan4}>
              <FormInput
                label="Tahun Selesai"
                name="tahun_selesai"
                type="number"
                value={formData.tahun_selesai || ""}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className={formStyles.colSpan4}>
              <FormInput
                label="Status"
                name="is_active"
                type="select"
                value={formData.is_active}
                onChange={handleFormChange}
              >
                <option value={false}>Arsip</option>
                <option value={true}>Aktif</option>
              </FormInput>
            </div>
            <FormInput
              label="Motto Kabinet"
              name="motto_kabinet"
              type="textarea"
              value={formData.motto_kabinet || ""}
              onChange={handleFormChange}
              span={12}
              rows={2}
              placeholder="Slogan atau visi singkat..."
            />
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

export default KelolaPeriode;
