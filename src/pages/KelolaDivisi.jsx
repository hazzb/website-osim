import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

// Components
import PageContainer from "../components/ui/PageContainer.jsx";
import Modal from "../components/Modal.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";

// Styles (Menggunakan style tabel global yang kita buat tadi)
import tableStyles from "../components/admin/AdminTable.module.css";
import formStyles from "../components/admin/AdminForm.module.css";

// Icons
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiUsers } from "react-icons/fi";

function KelolaDivisi() {
  const { session } = useAuth();

  // Data States
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periodeList, setPeriodeList] = useState([]); // Dropdown Periode

  // Filter State
  const [searchTerm, setSearchTerm] = useState("");

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});

  // File Upload State
  const [formFile, setFormFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // --- 1. FETCH DATA ---
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

  // --- 2. HANDLERS FORM ---
  const openModal = (item = null) => {
    setFormFile(null);
    setPreview(null);

    if (item) {
      // Mode Edit
      setEditingId(item.id);
      setFormData(item);
      setPreview(item.logo_url);
    } else {
      // Mode Tambah
      setEditingId(null);
      // Default urutan +10 dari yang terakhir
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

      // Upload Logo jika ada file baru
      if (formFile) {
        const ext = formFile.name.split(".").pop();
        const fileName = `divisi_${Date.now()}.${ext}`;
        // Upload ke bucket 'logos' (sesuai yang ada)
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
      fetchData(); // Refresh tabel
    } catch (err) {
      alert("Gagal: " + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Hapus divisi ini? Anggota di dalamnya mungkin akan kehilangan data divisi."
      )
    )
      return;
    try {
      const { error } = await supabase.from("divisi").delete().eq("id", id);
      if (error) throw error;
      setDataList((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      alert("Gagal hapus: " + err.message);
    }
  };

  // --- 3. FILTER LOGIC ---
  const filteredData = dataList.filter((item) =>
    item.nama_divisi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- RENDER ---
  if (loading)
    return (
      <PageContainer breadcrumbText="Memuat...">
        <LoadingState message="Memuat data divisi..." />
      </PageContainer>
    );

  return (
    <PageContainer breadcrumbText="Kelola Divisi">
      {/* HEADER & SEARCH */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        {/* Search Bar */}
        <div style={{ position: "relative", minWidth: "300px" }}>
          <FiSearch
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
            }}
          />
          <input
            type="text"
            placeholder="Cari nama divisi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "0.6rem 1rem 0.6rem 2.5rem",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              fontSize: "0.9rem",
            }}
          />
        </div>

        {/* Tombol Tambah */}
        <button
          onClick={() => openModal()}
          className="button button-primary"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <FiPlus /> Tambah Divisi
        </button>
      </div>

      {/* TABEL DATA */}
      <div className={tableStyles.tableContainer}>
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th style={{ width: "50px" }}>No</th>
              <th style={{ width: "80px" }}>Logo</th>
              <th>Nama Divisi</th>
              <th>Periode</th>
              <th>Urutan</th>
              <th style={{ width: "150px" }}>Aksi</th>
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
                        background: "#f1f5f9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid #e2e8f0",
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

      {/* MODAL FORM - Update ClassName ke CamelCase */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Divisi" : "Tambah Divisi Baru"}
      >
        <form onSubmit={handleSubmit}>
          <div className={formStyles.formGrid}>
            {" "}
            {/* Ganti formStyles['form-grid'] jadi .formGrid */}
            {/* Nama Divisi */}
            <div className={`${formStyles.colSpan2} ${formStyles.formGroup}`}>
              <label className={formStyles.formLabel}>Nama Divisi</label>
              <input
                type="text"
                name="nama_divisi"
                required
                value={formData.nama_divisi || ""}
                onChange={handleFormChange}
                className={formStyles.formInput}
              />
            </div>
            {/* Urutan */}
            <div className={`${formStyles.colSpan1} ${formStyles.formGroup}`}>
              <label className={formStyles.formLabel}>Urutan</label>
              <input
                type="number"
                name="urutan"
                value={formData.urutan || ""}
                onChange={handleFormChange}
                className={formStyles.formInput}
              />
            </div>
            {/* Periode */}
            <div className={`${formStyles.colSpan3} ${formStyles.formGroup}`}>
              <label className={formStyles.formLabel}>Periode Jabatan</label>
              <select
                name="periode_id"
                required
                value={formData.periode_id || ""}
                onChange={handleFormChange}
                className={formStyles.formSelect}
              >
                <option value="">-- Pilih Periode --</option>
                {periodeList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama_kabinet}
                  </option>
                ))}
              </select>
            </div>
            {/* Deskripsi */}
            <div className={`${formStyles.colSpan3} ${formStyles.formGroup}`}>
              <label className={formStyles.formLabel}>
                Deskripsi / Tugas Pokok
              </label>
              <textarea
                name="deskripsi"
                rows="4"
                value={formData.deskripsi || ""}
                onChange={handleFormChange}
                className={formStyles.formTextarea}
                placeholder="Jelaskan tugas utama divisi ini..."
              />
            </div>
            {/* Logo Upload */}
            <div
              className={`${formStyles.colSpan3} ${formStyles.uploadSection}`}
            >
              <label className={formStyles.formLabel}>
                Logo Divisi (Opsional)
              </label>
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  alignItems: "center",
                  marginTop: "0.5rem",
                }}
              >
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {preview ? (
                    <img
                      src={preview}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      alt="preview"
                    />
                  ) : (
                    <FiUsers style={{ fontSize: "1.5rem", color: "#cbd5e0" }} />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={formStyles.formInput}
                  style={{ flex: 1 }}
                />
              </div>
            </div>
          </div>

          <div className={formStyles.formFooter}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="button button-secondary"
              disabled={modalLoading}
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
