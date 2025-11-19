// src/pages/KelolaProgramKerja.jsx
// --- VERSI 9.0 (Fix: Tanpa Poster/Gambar) ---

import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useAdminTable } from "../hooks/useAdminTable";

// Components
import styles from "../components/admin/AdminTable.module.css";
import formStyles from "../components/admin/AdminForm.module.css";
import FormInput from "../components/admin/FormInput.jsx";
import Modal from "../components/Modal.jsx";

function KelolaProgramKerja() {
  const { user } = useAuth();

  // 1. SETUP HOOK TABEL
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
    select: "*, divisi(nama_divisi), periode_jabatan(nama_kabinet)",
    searchColumn: "nama_acara",
    defaultOrder: { column: "tanggal", ascending: false },
  });

  // 2. STATE FORM
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [modalLoading, setModalLoading] = useState(false);

  // State Dropdown
  const [periodeList, setPeriodeList] = useState([]);
  const [divisiList, setDivisiList] = useState([]);

  // Fetch Dropdown Data
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
    };
    fetchDropdowns();
  }, []);

  // 3. HANDLERS
  const openModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData(item);
    } else {
      setEditingId(null);
      setFormData({
        status: "Rencana",
        tampilkan_di_publik: true,
        periode_id: periodeList[0]?.id, // Default periode terbaru
        nama_acara: "",
        deskripsi: "",
        deskripsi_lengkap: "",
        divisi_id: "",
        tanggal: "",
        waktu: "",
        tempat: "",
        nama_penanggung_jawab: "",
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
      // Payload data (Tanpa Poster URL)
      const payload = {
        nama_acara: formData.nama_acara,
        deskripsi: formData.deskripsi,
        deskripsi_lengkap: formData.deskripsi_lengkap,
        tanggal: formData.tanggal,
        waktu: formData.waktu,
        tempat: formData.tempat,
        status: formData.status,
        divisi_id: formData.divisi_id,
        periode_id: formData.periode_id,
        nama_penanggung_jawab: formData.nama_penanggung_jawab,
        link_dokumentasi: formData.link_dokumentasi,
        embed_html: formData.embed_html,
        tampilkan_di_publik: formData.tampilkan_di_publik,
      };

      if (editingId) {
        await supabase
          .from("program_kerja")
          .update(payload)
          .eq("id", editingId);
        alert("Program kerja diperbarui!");
      } else {
        await supabase.from("program_kerja").insert(payload);
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
              {/* Kolom Poster Dihapus */}
              <th>Nama Acara</th>
              <th>Divisi</th>
              <th>Tanggal</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="loading-text">
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
                    {/* handleDelete dipanggil tanpa parameter ke-2 (path gambar) */}
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

      {/* Pagination */}
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

      {/* MODAL FORM (Tanpa Input File) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Program Kerja" : "Tambah Program Kerja"}
      >
        <form onSubmit={handleSubmit}>
          <div className={formStyles["form-grid"]}>
            <FormInput
              label="Nama Acara"
              name="nama_acara"
              type="text"
              value={formData.nama_acara || ""}
              onChange={handleFormChange}
              required
              span="col-span-2"
            />
            <FormInput
              label="Status"
              name="status"
              type="select"
              value={formData.status || "Rencana"}
              onChange={handleFormChange}
              span="col-span-1"
            >
              <option value="Rencana">Rencana</option>
              <option value="Akan Datang">Akan Datang</option>
              <option value="Selesai">Selesai</option>
            </FormInput>

            <FormInput
              label="Divisi Pelaksana"
              name="divisi_id"
              type="select"
              value={formData.divisi_id || ""}
              onChange={handleFormChange}
              required
              span="col-span-1"
            >
              <option value="">-- Pilih Divisi --</option>
              {divisiList.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nama_divisi}
                </option>
              ))}
            </FormInput>

            <FormInput
              label="Tanggal"
              name="tanggal"
              type="date"
              value={formData.tanggal || ""}
              onChange={handleFormChange}
              required
              span="col-span-1"
            />
            <FormInput
              label="Waktu"
              name="waktu"
              type="time"
              value={formData.waktu || ""}
              onChange={handleFormChange}
              span="col-span-1"
            />

            <FormInput
              label="Tempat"
              name="tempat"
              type="text"
              value={formData.tempat || ""}
              onChange={handleFormChange}
              span="col-span-2"
            />
            <FormInput
              label="Penanggung Jawab"
              name="nama_penanggung_jawab"
              type="text"
              value={formData.nama_penanggung_jawab || ""}
              onChange={handleFormChange}
              span="col-span-1"
            />

            <FormInput
              label="Deskripsi Singkat"
              name="deskripsi"
              type="textarea"
              value={formData.deskripsi || ""}
              onChange={handleFormChange}
              span="col-span-3"
              style={{ height: "80px" }}
            />
            <FormInput
              label="Deskripsi Lengkap (Markdown)"
              name="deskripsi_lengkap"
              type="textarea"
              value={formData.deskripsi_lengkap || ""}
              onChange={handleFormChange}
              span="col-span-3"
              style={{ height: "150px" }}
            />

            <FormInput
              label="Embed HTML (Video)"
              name="embed_html"
              type="text"
              value={formData.embed_html || ""}
              onChange={handleFormChange}
              span="col-span-3"
              placeholder='<iframe src="..."></iframe>'
            />
            <FormInput
              label="Link Dokumen (Google Drive/PDF)"
              name="link_dokumentasi"
              type="text"
              value={formData.link_dokumentasi || ""}
              onChange={handleFormChange}
              span="col-span-3"
            />

            {/* Tampilkan Publik */}
            <FormInput
              label="Tampilkan di Web?"
              name="tampilkan_di_publik"
              type="select"
              value={formData.tampilkan_di_publik}
              onChange={handleFormChange}
              span="col-span-1"
            >
              <option value={true}>Ya, Tampilkan</option>
              <option value={false}>Tidak, Sembunyikan</option>
            </FormInput>
          </div>

          <div className={formStyles["form-footer"]}>
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
    </div>
  );
}

export default KelolaProgramKerja;
