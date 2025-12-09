import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAdminTable } from "../hooks/useAdminTable";

// Components
import PageContainer from "../components/ui/PageContainer.jsx";
import Modal from "../components/Modal.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";

// PENTING: Import Form yang sudah ada di folder components
import ProgramKerjaForm from "../components/forms/ProgramKerjaForm.jsx";

// Styles
import tableStyles from "../components/admin/AdminTable.module.css";

// Icons
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiActivity,
} from "react-icons/fi";

function KelolaProgramKerja() {
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
  });

  // --- 2. STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [modalLoading, setModalLoading] = useState(false);

  // Dropdown Data (Untuk dilempar ke Form)
  const [divisiList, setDivisiList] = useState([]);
  const [periodeList, setPeriodeList] = useState([]);
  const [anggotaList, setAnggotaList] = useState([]); // Tambahan jika form butuh PJ

  // --- 3. FETCH DROPDOWN ---
  useEffect(() => {
    const fetchHelpers = async () => {
      // Ambil Divisi
      const { data: divData } = await supabase
        .from("divisi")
        .select("id, nama_divisi")
        .order("nama_divisi");
      setDivisiList(divData || []);

      // Ambil Periode
      const { data: perData } = await supabase
        .from("periode_jabatan")
        .select("id, nama_kabinet")
        .order("tahun_mulai", { ascending: false });
      setPeriodeList(perData || []);

      // Ambil Anggota (Untuk PJ)
      const { data: angData } = await supabase
        .from("anggota")
        .select("id, nama")
        .order("nama");
      setAnggotaList(angData || []);
    };
    fetchHelpers();
  }, []);

  // --- 4. HANDLERS ---
  const openModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData(item);
    } else {
      setEditingId(null);
      const today = new Date().toISOString().split("T")[0];
      setFormData({
        nama_acara: "",
        status: "Rencana",
        tanggal: today,
        divisi_id: divisiList[0]?.id || "",
        periode_id: periodeList[0]?.id || "",
        penanggung_jawab_id: "", // Jika ada relasi PJ
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
      const payload = { ...formData }; // Kirim semua data form

      if (editingId) {
        await supabase
          .from("program_kerja")
          .update(payload)
          .eq("id", editingId);
      } else {
        await supabase.from("program_kerja").insert(payload);
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

  const getStatusBadge = (status) => {
    const styleBase = {
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      fontSize: "0.8rem",
      fontWeight: "600",
      padding: "4px 10px",
      borderRadius: "6px",
    };
    if (status === "Selesai")
      return (
        <span style={{ ...styleBase, background: "#dcfce7", color: "#166534" }}>
          <FiCheckCircle size={12} /> Selesai
        </span>
      );
    if (status === "Akan Datang")
      return (
        <span style={{ ...styleBase, background: "#fef3c7", color: "#b45309" }}>
          <FiClock size={12} /> Akan Datang
        </span>
      );
    return (
      <span style={{ ...styleBase, background: "#f1f5f9", color: "#64748b" }}>
        <FiActivity size={12} /> Rencana
      </span>
    );
  };

  if (loading)
    return (
      <PageContainer breadcrumbText="Memuat...">
        <LoadingState message="Memuat program kerja..." />
      </PageContainer>
    );

  return (
    <PageContainer breadcrumbText="Program Kerja">
      {/* HEADER PAGE */}
      <div className={tableStyles.adminPageHeader}>
        <div>
          <h1 className="page-title">Kelola Program Kerja</h1>
          <p style={{ color: "var(--text-muted)" }}>
            Daftar kegiatan dan acara organisasi.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="button button-primary"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <FiPlus /> Tambah Progja
        </button>
      </div>

      {/* FILTER SEARCH */}
      <div className={tableStyles.tableFilterContainer}>
        <div className={tableStyles.searchInputGroup}>
          <FiSearch style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Cari nama acara..."
            className={tableStyles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      {/* TABLE (Menggunakan class tableWide agar kolom lega) */}
      <div className={tableStyles.tableContainer}>
        <table className={`${tableStyles.table} ${tableStyles.tableWide}`}>
          <thead>
            <tr>
              <th style={{ width: "50px" }}>No</th>
              <th style={{ minWidth: "250px" }}>Nama Acara</th>
              <th style={{ width: "150px" }}>Tanggal</th>
              <th style={{ width: "180px" }}>Pelaksana</th>
              <th style={{ width: "120px", textAlign: "center" }}>Status</th>
              <th style={{ width: "100px", textAlign: "right" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {progjaList.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="info-text"
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  Belum ada data program kerja.
                </td>
              </tr>
            ) : (
              progjaList.map((item, index) => (
                <tr key={item.id}>
                  <td style={{ textAlign: "center" }}>
                    {(currentPage - 1) * 10 + index + 1}
                  </td>
                  <td>
                    <span
                      style={{ fontWeight: "600", color: "var(--text-main)" }}
                    >
                      {item.nama_acara}
                    </span>
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
                      <FiCalendar size={14} color="#64748b" />
                      {new Date(item.tanggal).toLocaleDateString("id-ID")}
                    </div>
                  </td>
                  <td>
                    <span
                      style={{ fontSize: "0.9rem", color: "var(--text-body)" }}
                    >
                      {item.divisi?.nama_divisi || "Semua Divisi"}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {getStatusBadge(item.status)}
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

      {/* MODAL FORM REUSABLE */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingId ? "Edit Program Kerja" : "Tambah Program Kerja"}
          maxWidth="800px" // Agar form terlihat lega
        >
          {/* GUNAKAN KOMPONEN FORM YANG SUDAH ADA */}
          <ProgramKerjaForm
            formData={formData}
            onChange={handleFormChange}
            onSubmit={handleSubmit}
            onCancel={() => setIsModalOpen(false)}
            loading={modalLoading}
            periodeList={periodeList}
            divisiList={divisiList}
            anggotaList={anggotaList} // Jika butuh list anggota untuk PJ
          />
        </Modal>
      )}
    </PageContainer>
  );
}

export default KelolaProgramKerja;
