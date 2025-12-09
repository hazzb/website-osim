import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

// Components
import PageContainer from "../components/ui/PageContainer.jsx";
import Modal from "../components/Modal.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import FormInput from "../components/admin/FormInput.jsx"; // IMPORT PENTING

// Styles (Pastikan path ini benar)
import tableStyles from "../components/admin/AdminTable.module.css";
import formStyles from "../components/admin/AdminForm.module.css";

// Icons
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiUsers,
  FiImage,
} from "react-icons/fi";

function KelolaDivisi() {
  const { session } = useAuth();

  // --- STATE (Sama seperti kode asli Anda) ---
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periodeList, setPeriodeList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [formFile, setFormFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // --- FETCH DATA ---
  useEffect(() => {
    fetchData();
    fetchPeriode();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("divisi")
        .select("*, periode_jabatan(nama_kabinet)")
        .order("urutan", { ascending: true });

      if (error) throw error;
      setDataList(data || []);
    } catch (err) {
      console.error("Error fetching divisi:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPeriode = async () => {
    const { data } = await supabase
      .from("periode_jabatan")
      .select("id, nama_kabinet")
      .order("tahun_mulai", { ascending: false });
    setPeriodeList(data || []);
  };

  // --- HANDLERS ---
  const openModal = (item = null) => {
    setFormFile(null);
    setPreview(null);

    if (item) {
      setEditingId(item.id);
      setFormData(item);
      setPreview(item.logo_url);
    } else {
      setEditingId(null);
      const lastOrder =
        dataList.length > 0 ? dataList[dataList.length - 1].urutan : 0;
      setFormData({
        nama_divisi: "",
        deskripsi: "",
        urutan: lastOrder + 10,
        periode_id: periodeList[0]?.id || "",
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
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      let finalLogoUrl = formData.logo_url;

      if (formFile) {
        const ext = formFile.name.split(".").pop();
        const fileName = `divisi_${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("logos")
          .upload(`divisi/${fileName}`, formFile);
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage
          .from("logos")
          .getPublicUrl(`divisi/${fileName}`);
        finalLogoUrl = urlData.publicUrl;
      }

      const payload = {
        nama_divisi: formData.nama_divisi,
        deskripsi: formData.deskripsi,
        urutan: formData.urutan,
        periode_id: formData.periode_id,
        logo_url: finalLogoUrl,
      };

      if (editingId) {
        await supabase.from("divisi").update(payload).eq("id", editingId);
      } else {
        await supabase.from("divisi").insert(payload);
      }

      alert("Berhasil disimpan!");
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert("Gagal: " + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus divisi ini?")) return;
    try {
      await supabase.from("divisi").delete().eq("id", id);
      setDataList((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      alert("Gagal hapus: " + err.message);
    }
  };

  const filteredData = dataList.filter((item) =>
    item.nama_divisi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return (
      <PageContainer breadcrumbText="Memuat...">
        <LoadingState message="Memuat data divisi..." />
      </PageContainer>
    );

  return (
    <PageContainer breadcrumbText="Kelola Divisi">
      {/* HEADER & FILTER (Menggunakan Class CSS CamelCase yang Benar) */}
      <div className={tableStyles.adminPageHeader}>
        <div>
          <h1 className="page-title">Kelola Divisi</h1>
          <p style={{ color: "var(--text-muted)" }}>
            Daftar unit kerja organisasi.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="button button-primary"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <FiPlus /> Tambah Divisi
        </button>
      </div>

      <div className={tableStyles.tableFilterContainer}>
        <div className={tableStyles.searchInputGroup}>
          <FiSearch style={{ color: "#94a3b8" }} />
          <input
            type="text"
            placeholder="Cari nama divisi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={tableStyles.searchInput}
          />
        </div>
      </div>

      {/* TABLE CONTAINER (Struktur Tabel Asli Anda, hanya ClassName disesuaikan) */}
      <div className={tableStyles.tableContainer}>
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th style={{ width: "50px" }}>No</th>
              <th style={{ width: "60px" }}>Logo</th>
              <th>Nama Divisi</th>
              <th>Periode</th>
              <th>Urutan</th>
              <th style={{ textAlign: "right", width: "150px" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
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
              filteredData.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: "1px solid #e2e8f0",
                        background: "#f8fafc",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {item.logo_url ? (
                        <img
                          src={item.logo_url}
                          alt="logo"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <FiUsers style={{ color: "#cbd5e0" }} />
                      )}
                    </div>
                  </td>
                  <td style={{ fontWeight: "600", color: "#1e293b" }}>
                    {item.nama_divisi}
                  </td>
                  <td>
                    <span
                      className={`${tableStyles.badge} ${tableStyles.badgeGray}`}
                    >
                      {item.periode_jabatan?.nama_kabinet || "-"}
                    </span>
                  </td>
                  <td>{item.urutan}</td>
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

      {/* --- FORM INI YANG DIPERBAIKI --- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Divisi" : "Tambah Divisi Baru"}
      >
        <form onSubmit={handleSubmit}>
          {/* Gunakan Grid System dari AdminForm.module.css */}
          <div className={formStyles.formGrid}>
            {/* Nama Divisi (Lebar: 8 kolom) */}
            <FormInput
              label="Nama Divisi"
              name="nama_divisi"
              value={formData.nama_divisi || ""}
              onChange={handleFormChange}
              required
              span={8}
            />

            {/* Urutan (Lebar: 4 kolom) */}
            <FormInput
              label="Urutan"
              name="urutan"
              type="number"
              value={formData.urutan || ""}
              onChange={handleFormChange}
              span={4}
            />

            {/* Periode (Lebar: Full 12 kolom) */}
            <FormInput
              label="Periode Jabatan"
              name="periode_id"
              type="select"
              value={formData.periode_id || ""}
              onChange={handleFormChange}
              required
              span={12}
            >
              <option value="">-- Pilih Periode --</option>
              {periodeList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama_kabinet}
                </option>
              ))}
            </FormInput>

            {/* Deskripsi (Lebar: Full 12 kolom) */}
            <FormInput
              label="Deskripsi / Tugas"
              name="deskripsi"
              type="textarea"
              value={formData.deskripsi || ""}
              onChange={handleFormChange}
              span={12}
              rows={3}
              placeholder="Jelaskan tugas utama divisi ini..."
            />

            {/* Upload Logo (Custom Style dari CSS Module) */}
            <div className={formStyles.colSpan12}>
              <label className={formStyles.formLabel}>
                Logo Divisi (Opsional)
              </label>
              <div className={formStyles.uploadRow}>
                <div className={formStyles.previewBox}>
                  {preview ? (
                    <img src={preview} alt="Logo" />
                  ) : (
                    <FiImage size={24} color="#ccc" />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    className={formStyles.uploadBtn}
                    style={{ width: "fit-content" }}
                  >
                    Pilih File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      hidden
                    />
                  </label>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "#94a3b8",
                      marginLeft: "0.5rem",
                    }}
                  >
                    Max 200KB
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Tombol */}
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

export default KelolaDivisi;
