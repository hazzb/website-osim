// src/pages/KelolaProgramKerja.jsx
// --- VERSI 12.0 (Schema Strict & Auto-Open Modal) ---

import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useAdminTable } from "../hooks/useAdminTable";
import { useLocation } from "react-router-dom"; // Penting untuk menangkap state navigasi

// Components
import styles from "../components/admin/AdminTable.module.css";
import formStyles from "../components/admin/AdminForm.module.css";
import FormInput from "../components/admin/FormInput.jsx";
import Modal from "../components/Modal.jsx";

function KelolaProgramKerja() {
  const { user } = useAuth();
  const location = useLocation(); // Untuk cek apakah ada request edit dari halaman detail

  // 1. SETUP HOOK TABEL (Sesuaikan select dengan relasi baru)
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
    // Select join: divisi, periode, dan anggota (untuk nama PJ)
    select: `
      *, 
      divisi (id, nama_divisi), 
      periode_jabatan (id, nama_kabinet),
      anggota (id, nama) 
    `,
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
  const [anggotaList, setAnggotaList] = useState([]); // List Anggota untuk PJ

  // Fetch Dropdown Data
  useEffect(() => {
    const fetchDropdowns = async () => {
      // Periode
      const { data: pData } = await supabase
        .from("periode_jabatan")
        .select("id, nama_kabinet")
        .order("tahun_mulai", { ascending: false });
      setPeriodeList(pData || []);

      // Divisi
      const { data: dData } = await supabase
        .from("divisi")
        .select("id, nama_divisi")
        .order("nama_divisi");
      setDivisiList(dData || []);

      // Anggota (Untuk Penanggung Jawab)
      const { data: aData } = await supabase
        .from("anggota")
        .select("id, nama")
        .order("nama");
      setAnggotaList(aData || []);
    };
    fetchDropdowns();
  }, []);

  // --- 3. AUTO OPEN MODAL LOGIC ---
  // Jika Admin datang dari halaman Detail membawa "editId", otomatis buka modal
  useEffect(() => {
    if (location.state?.editId && progjaList.length > 0 && !isModalOpen) {
      const targetId = parseInt(location.state.editId) || location.state.editId; // Handle string/int
      const itemToEdit = progjaList.find((p) => p.id === targetId);

      if (itemToEdit) {
        openModal(itemToEdit);
        // Bersihkan state agar tidak terbuka lagi saat refresh
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, progjaList]); // Jalankan saat data tabel selesai dimuat

  // 4. HANDLERS
  const openModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      // Mapping data tabel ke form (sesuai nama kolom DB)
      setFormData({
        nama_acara: item.nama_acara,
        tanggal: item.tanggal,
        status: item.status,
        deskripsi: item.deskripsi || "",
        link_dokumentasi: item.link_dokumentasi || "",
        divisi_id: item.divisi_id,
        penanggung_jawab_id: item.penanggung_jawab_id, // UUID
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
      // Payload Sesuai Schema SQL Anda
      const payload = {
        nama_acara: formData.nama_acara,
        tanggal: formData.tanggal,
        status: formData.status,
        deskripsi: formData.deskripsi,
        link_dokumentasi: formData.link_dokumentasi,
        divisi_id: formData.divisi_id,
        penanggung_jawab_id: formData.penanggung_jawab_id, // Harus UUID Anggota
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
                  <td>{item.anggota?.nama || "-"}</td>{" "}
                  {/* Menampilkan Nama Anggota dari Relasi */}
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

      {/* MODAL FORM (Strict Sesuai Schema DB) */}
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
              span="col-span-3"
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
              label="Periode"
              name="periode_id"
              type="select"
              value={formData.periode_id || ""}
              onChange={handleFormChange}
              required
              span="col-span-1"
            >
              {periodeList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama_kabinet}
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

            {/* DROPDOWN PJ (Relasi ke Anggota) */}
            <FormInput
              label="Penanggung Jawab"
              name="penanggung_jawab_id"
              type="select"
              value={formData.penanggung_jawab_id || ""}
              onChange={handleFormChange}
              required
              span="col-span-2"
            >
              <option value="">-- Pilih Anggota --</option>
              {anggotaList.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nama}
                </option>
              ))}
            </FormInput>

            <FormInput
              label="Deskripsi (Keterangan)"
              name="deskripsi"
              type="textarea"
              value={formData.deskripsi || ""}
              onChange={handleFormChange}
              span="col-span-3"
              style={{ height: "100px" }}
            />

            <FormInput
              label="Embed HTML (Video YouTube)"
              name="embed_html"
              type="text"
              value={formData.embed_html || ""}
              onChange={handleFormChange}
              span="col-span-3"
              placeholder='<iframe src="..."></iframe>'
            />

            <FormInput
              label="Link Dokumentasi (Drive/PDF)"
              name="link_dokumentasi"
              type="text"
              value={formData.link_dokumentasi || ""}
              onChange={handleFormChange}
              span="col-span-3"
            />
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
