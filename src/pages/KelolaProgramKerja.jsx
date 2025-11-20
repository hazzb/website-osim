// src/pages/KelolaProgramKerja.jsx
// --- VERSI 12.1 (Form Refactored) ---

import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useLocation } from "react-router-dom";
import { useAdminTable } from "../hooks/useAdminTable";

// Components
import styles from "../components/admin/AdminTable.module.css";
import Modal from "../components/Modal.jsx";
// Gunakan komponen form yang sama dengan halaman Detail (REUSABLE)
import ProgramKerjaForm from "../components/forms/ProgramKerjaForm.jsx";

function KelolaProgramKerja() {
  const location = useLocation();

  // 1. TABLE HOOK
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
    // Select lengkap dengan join
    select: `
      *, 
      divisi (id, nama_divisi), 
      periode_jabatan (id, nama_kabinet),
      anggota (id, nama) 
    `,
    searchColumn: "nama_acara",
    defaultOrder: { column: "tanggal", ascending: false },
  });

  // 2. STATE
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [modalLoading, setModalLoading] = useState(false);

  // Dropdowns
  const [periodeList, setPeriodeList] = useState([]);
  const [divisiList, setDivisiList] = useState([]);
  const [anggotaList, setAnggotaList] = useState([]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      const { data: pData } = await supabase
        .from("periode_jabatan")
        .select("id, nama_kabinet")
        .order("tahun_mulai", { ascending: false });
      setPeriodeList(pData || []);
      const { data: dData } = await supabase
        .from("divisi")
        .select("id, nama_divisi")
        .order("nama_divisi");
      setDivisiList(dData || []);
      const { data: aData } = await supabase
        .from("anggota")
        .select("id, nama")
        .order("nama");
      setAnggotaList(aData || []);
    };
    fetchDropdowns();
  }, []);

  // Auto Open Modal dari Navigasi
  useEffect(() => {
    if (location.state?.editId && progjaList.length > 0 && !isModalOpen) {
      const targetId = parseInt(location.state.editId) || location.state.editId;
      const itemToEdit = progjaList.find((p) => p.id === targetId);
      if (itemToEdit) {
        openModal(itemToEdit);
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, progjaList]);

  // 3. HANDLERS
  const openModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        nama_acara: item.nama_acara,
        tanggal: item.tanggal,
        status: item.status,
        deskripsi: item.deskripsi || "",
        link_dokumentasi: item.link_dokumentasi || "",
        divisi_id: item.divisi_id,
        penanggung_jawab_id: item.penanggung_jawab_id,
        periode_id: item.periode_id,
        embed_html: item.embed_html || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        status: "Rencana",
        periode_id: periodeList[0]?.id,
        nama_acara: "",
        tanggal: "",
        deskripsi: "",
        link_dokumentasi: "",
        divisi_id: "",
        penanggung_jawab_id: "",
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
      // Payload bersih sesuai schema
      const payload = {
        nama_acara: formData.nama_acara,
        tanggal: formData.tanggal,
        status: formData.status,
        deskripsi: formData.deskripsi,
        link_dokumentasi: formData.link_dokumentasi,
        divisi_id: formData.divisi_id,
        penanggung_jawab_id: formData.penanggung_jawab_id,
        periode_id: formData.periode_id,
        embed_html: formData.embed_html,
      };

      if (editingId) {
        const { error } = await supabase
          .from("program_kerja")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
        alert("Program kerja diperbarui!");
      } else {
        const { error } = await supabase.from("program_kerja").insert(payload);
        if (error) throw error;
        alert("Program kerja ditambahkan!");
      }

      setIsModalOpen(false);
      refreshData();
    } catch (err) {
      alert("Gagal: " + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className={styles["admin-page-header"]}>
        <h1 className="page-title">Kelola Program Kerja</h1>
        <button onClick={() => openModal()} className="button button-primary">
          + Tambah Progja
        </button>
      </div>

      <div className={styles["table-filter-container"]}>
        <div className={styles["search-input-group"]}>
          <span>🔍</span>
          <input
            type="text"
            placeholder="Cari acara..."
            className={styles["search-input"]}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className={styles["table-container"]}>
        <table className={styles["admin-table"]}>
          <thead>
            <tr>
              <th>Nama Acara</th>
              <th>Divisi</th>
              <th>PJ</th>
              <th>Tanggal</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="loading-text">
                  Memuat...
                </td>
              </tr>
            ) : (
              progjaList.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.nama_acara}</strong>
                  </td>
                  <td>{item.divisi?.nama_divisi || "-"}</td>
                  <td>{item.anggota?.nama || "-"}</td>
                  <td>{new Date(item.tanggal).toLocaleDateString("id-ID")}</td>
                  <td>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "99px",
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                        backgroundColor:
                          item.status === "Selesai"
                            ? "#def7ec"
                            : item.status === "Akan Datang"
                            ? "#e1effe"
                            : "#fdf6b2",
                        color:
                          item.status === "Selesai"
                            ? "#03543f"
                            : item.status === "Akan Datang"
                            ? "#1e429f"
                            : "#723b13",
                      }}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className={styles["actions-cell"]}>
                    <button
                      onClick={() => openModal(item)}
                      className={`${styles["button-table"]} ${styles["button-edit"]}`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className={`${styles["button-table"]} ${styles["button-delete"]}`}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={styles["pagination-container"]}>
        <span className={styles["pagination-info"]}>
          Halaman {currentPage} dari {totalPages}
        </span>
        <div className={styles["pagination-buttons"]}>
          <button
            className={styles["pagination-button"]}
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <button
            className={styles["pagination-button"]}
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {/* MODAL MENGGUNAKAN KOMPONEN TERPISAH */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Program Kerja" : "Tambah Program Kerja"}
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
    </div>
  );
}

export default KelolaProgramKerja;
