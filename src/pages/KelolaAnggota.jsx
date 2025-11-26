import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

// Components UI
import PageContainer from "../components/ui/PageContainer.jsx";
import Modal from "../components/Modal.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import {
  FilterBar,
  FilterSelect,
  FilterSearch,
} from "../components/ui/FilterBar.jsx";

// Styles & Icons
import tableStyles from "../components/admin/AdminTable.module.css";
import formStyles from "../components/admin/AdminForm.module.css";
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiUser } from "react-icons/fi";

const PER_PAGE = 10;

function KelolaAnggota() {
  const { session } = useAuth();

  // --- STATE DATA & TABEL ---
  const [anggotaList, setAnggotaList] = useState([]);
  const [loadingTable, setLoadingTable] = useState(true);
  const [error, setError] = useState(null);

  // --- STATE FILTER & PAGINATION ---
  const [selectedPeriodeId, setSelectedPeriodeId] = useState("");
  const [selectedDivisiId, setSelectedDivisiId] = useState("semua");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.ceil(totalCount / PER_PAGE);

  // --- STATE MODAL & FORM ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState({});

  // File Upload
  const [formFile, setFormFile] = useState(null);
  const [formPreview, setFormPreview] = useState(null);
  const [existingFotoUrl, setExistingFotoUrl] = useState(null);

  // --- STATE DROPDOWN ---
  const [periodeList, setPeriodeList] = useState([]);
  const [divisiFilterList, setDivisiFilterList] = useState([]); // List Divisi untuk Filter (Atas)
  const [divisiFormList, setDivisiFormList] = useState([]); // List Divisi untuk Form (Modal)
  const [jabatanList, setJabatanList] = useState([]); // List Jabatan untuk Form (Modal)

  // =================================================================
  // 1. FETCH DATA AWAL (Periode)
  // =================================================================
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const { data } = await supabase
          .from("periode_jabatan")
          .select("*")
          .order("tahun_mulai", { ascending: false });
        setPeriodeList(data || []);

        // Default filter ke periode aktif (atau yang pertama)
        if (data?.length > 0) {
          const active = data.find((p) => p.is_active);
          setSelectedPeriodeId(active ? active.id : data[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchInitialData();
  }, []);

  // =================================================================
  // 2. FETCH DATA TABEL (Reactive terhadap Filter)
  // =================================================================
  useEffect(() => {
    if (!selectedPeriodeId) return;

    const loadTableData = async () => {
      setLoadingTable(true);
      try {
        // A. Ambil Divisi untuk Filter (Sesuai periode yang dipilih di filter bar)
        const { data: divData } = await supabase
          .from("divisi")
          .select("id, nama_divisi")
          .eq("periode_id", selectedPeriodeId)
          .order("urutan");
        setDivisiFilterList(divData || []);

        // B. Ambil Data Anggota
        const from = (currentPage - 1) * PER_PAGE;
        const to = from + PER_PAGE - 1;

        let query = supabase
          .from("anggota_detail_view") // Pastikan view ini ada di Database Anda
          .select("*", { count: "exact" })
          .eq("periode_id", selectedPeriodeId)
          .order("urutan", { ascending: true }) // Urut berdasarkan divisi urutan
          .order("nama", { ascending: true })
          .range(from, to);

        if (selectedDivisiId !== "semua")
          query = query.eq("divisi_id", selectedDivisiId);
        if (searchTerm) query = query.ilike("nama", `%${searchTerm}%`);

        const { data, error, count } = await query;
        if (error) throw error;

        setAnggotaList(data || []);
        setTotalCount(count || 0);
      } catch (err) {
        setError("Gagal memuat data: " + err.message);
      } finally {
        setLoadingTable(false);
      }
    };

    loadTableData();
  }, [selectedPeriodeId, selectedDivisiId, currentPage, searchTerm]);

  // =================================================================
  // 3. LOGIC FORM (Cascading Dropdown)
  // =================================================================

  // Ambil divisi untuk form modal (berdasarkan periode yang dipilih di form)
  const fetchDivisiForForm = async (pId) => {
    const { data } = await supabase
      .from("divisi")
      .select("id, nama_divisi")
      .eq("periode_id", pId)
      .order("urutan");
    setDivisiFormList(data || []);
  };

  // Ambil jabatan untuk form modal (berdasarkan divisi yang dipilih di form)
  const fetchJabatanForDivisi = async (dId) => {
    if (!dId) {
      setJabatanList([]);
      return;
    }
    const { data } = await supabase
      .from("divisi_jabatan_link")
      .select("master_jabatan (id, nama_jabatan)")
      .eq("divisi_id", dId);

    if (data) {
      setJabatanList(data.map((item) => item.master_jabatan));
    }
  };

  const openModal = async (item = null) => {
    setFormFile(null);
    setFormPreview(null);
    setExistingFotoUrl(null);
    setJabatanList([]); // Reset jabatan

    if (item) {
      // EDIT MODE
      setEditingId(item.id);
      // Fetch data asli (bukan view) agar ID relasinya benar
      const { data } = await supabase
        .from("anggota")
        .select("*")
        .eq("id", item.id)
        .single();
      setFormData(data);
      setExistingFotoUrl(data.foto_url);
      setFormPreview(data.foto_url);

      // Isi dropdown sesuai data yang diedit
      await fetchDivisiForForm(data.periode_id);
      await fetchJabatanForDivisi(data.divisi_id);
    } else {
      // ADD MODE
      setEditingId(null);
      setFormData({
        jenis_kelamin: "Ikhwan",
        periode_id: selectedPeriodeId, // Default ke periode yang sedang dilihat
      });
      // Isi dropdown default
      await fetchDivisiForForm(selectedPeriodeId);
    }
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Logika Cascading Dropdown (Periode -> Divisi -> Jabatan)
    if (name === "periode_id") {
      setFormData((prev) => ({
        ...prev,
        divisi_id: "",
        jabatan_di_divisi: "",
      }));
      fetchDivisiForForm(value);
    }
    if (name === "divisi_id") {
      setFormData((prev) => ({ ...prev, jabatan_di_divisi: "" }));
      fetchJabatanForDivisi(value);
    }
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
      let finalFotoUrl = existingFotoUrl;

      // Upload Foto
      if (formFile) {
        const ext = formFile.name.split(".").pop();
        const fileName = `anggota_${Date.now()}.${ext}`;
        // Upload ke bucket 'logos' -> folder 'anggota'
        const { error: upErr } = await supabase.storage
          .from("logos")
          .upload(`anggota/${fileName}`, formFile);
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage
          .from("logos")
          .getPublicUrl(`anggota/${fileName}`);
        finalFotoUrl = urlData.publicUrl;
      }

      const payload = {
        nama: formData.nama,
        jenis_kelamin: formData.jenis_kelamin,
        alamat: formData.alamat,
        motto: formData.motto,
        instagram_username: formData.instagram_username,
        periode_id: formData.periode_id,
        divisi_id: formData.divisi_id,
        jabatan_di_divisi: formData.jabatan_di_divisi,
        foto_url: finalFotoUrl,
      };

      if (editingId) {
        await supabase.from("anggota").update(payload).eq("id", editingId);
      } else {
        await supabase.from("anggota").insert(payload);
      }

      // Refresh halaman sederhana agar data terupdate
      window.location.reload();
    } catch (err) {
      alert("Gagal: " + err.message);
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus anggota ini?")) return;
    try {
      await supabase.from("anggota").delete().eq("id", id);
      // Update state lokal biar cepat
      setAnggotaList((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  // =================================================================
  // 4. RENDER UI
  // =================================================================

  if (loadingTable && !selectedPeriodeId)
    return (
      <PageContainer breadcrumbText="Memuat...">
        <LoadingState message="Menyiapkan data..." />
      </PageContainer>
    );

  return (
    <PageContainer breadcrumbText="Kelola Anggota">
      {/* === STICKY HEADER & FILTER === */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "#f8fafc",
          paddingBottom: "1rem",
          paddingTop: "0.5rem",
          margin: "0 -1.5rem",
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        {/* Header Title & Tombol Tambah */}
        <div className={tableStyles.adminPageHeader}>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "#1e293b",
              margin: 0,
            }}
          >
            Database Anggota
          </h1>
          <button
            onClick={() => openModal()}
            className="button button-primary"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <FiPlus /> Tambah Anggota
          </button>
        </div>

        {/* Filter Bar */}
        <FilterBar>
          {/* Filter Periode */}
          <FilterSelect
            label="Periode"
            value={selectedPeriodeId}
            onChange={(e) => setSelectedPeriodeId(e.target.value)}
          >
            {periodeList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama_kabinet}
              </option>
            ))}
          </FilterSelect>

          {/* Filter Divisi */}
          <FilterSelect
            label="Divisi"
            value={selectedDivisiId}
            onChange={(e) => setSelectedDivisiId(e.target.value)}
          >
            <option value="semua">Semua Divisi</option>
            {divisiFilterList.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nama_divisi}
              </option>
            ))}
          </FilterSelect>

          {/* Search */}
          <FilterSearch
            placeholder="Cari nama..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </FilterBar>
      </div>
      {/* === END STICKY === */}

      {/* TABEL DATA */}
      <div
        className={tableStyles.tableContainer}
        style={{ marginTop: "1.5rem" }}
      >
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th style={{ width: "60px" }}>Foto</th>
              <th>Nama Lengkap</th>
              <th>Divisi</th>
              <th>Jabatan</th>
              <th>Gender</th>
              <th style={{ width: "120px" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loadingTable ? (
              <tr>
                <td
                  colSpan="6"
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  Memuat data...
                </td>
              </tr>
            ) : anggotaList.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "#94a3b8",
                  }}
                >
                  Tidak ada data anggota.
                </td>
              </tr>
            ) : (
              anggotaList.map((item) => (
                <tr key={item.id}>
                  <td className={tableStyles.avatarCell}>
                    {item.foto_url ? (
                      <img
                        src={item.foto_url}
                        className={tableStyles.avatarImage}
                        alt="foto"
                      />
                    ) : (
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "8px",
                          background: "#f1f5f9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto",
                          color: "#cbd5e0",
                        }}
                      >
                        <FiUser />
                      </div>
                    )}
                  </td>
                  <td style={{ fontWeight: "600", color: "#1e293b" }}>
                    {item.nama}
                  </td>
                  <td>{item.nama_divisi || "-"}</td>
                  <td>
                    <span
                      className={`${tableStyles.badge} ${tableStyles.badgeGray}`}
                    >
                      {item.jabatan_di_divisi}
                    </span>
                  </td>
                  <td>{item.jenis_kelamin}</td>
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
      <div className={tableStyles.paginationContainer}>
        <span className={tableStyles.paginationInfo}>
          Halaman {currentPage} dari {totalPages || 1}
        </span>
        <div className={tableStyles.paginationButtons}>
          <button
            className={tableStyles.paginationButton}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <button
            className={tableStyles.paginationButton}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
          </button>
        </div>
      </div>

      {/* MODAL FORM */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Anggota" : "Tambah Anggota"}
      >
        <form onSubmit={handleSubmit}>
          <div className={formStyles.formGrid}>
            {/* Nama */}
            <div className={`${formStyles.colSpan2} ${formStyles.formGroup}`}>
              <label className={formStyles.formLabel}>Nama Lengkap</label>
              <input
                type="text"
                name="nama"
                required
                value={formData.nama || ""}
                onChange={handleFormChange}
                className={formStyles.formInput}
              />
            </div>

            {/* Gender */}
            <div className={`${formStyles.colSpan1} ${formStyles.formGroup}`}>
              <label className={formStyles.formLabel}>Gender</label>
              <select
                name="jenis_kelamin"
                value={formData.jenis_kelamin || "Ikhwan"}
                onChange={handleFormChange}
                className={formStyles.formSelect}
              >
                <option value="Ikhwan">Ikhwan</option>
                <option value="Akhwat">Akhwat</option>
              </select>
            </div>

            {/* Instagram */}
            <div className={`${formStyles.colSpan1} ${formStyles.formGroup}`}>
              <label className={formStyles.formLabel}>
                Instagram (Opsional)
              </label>
              <input
                type="text"
                name="instagram_username"
                value={formData.instagram_username || ""}
                onChange={handleFormChange}
                className={formStyles.formInput}
                placeholder="username"
              />
            </div>

            {/* Divider */}
            <div
              className={formStyles.colSpan2}
              style={{ borderTop: "1px dashed #e2e8f0", margin: "0.5rem 0" }}
            ></div>

            {/* Periode */}
            <div className={`${formStyles.colSpan1} ${formStyles.formGroup}`}>
              <label className={formStyles.formLabel}>Periode</label>
              <select
                name="periode_id"
                required
                value={formData.periode_id || ""}
                onChange={handleFormChange}
                className={formStyles.formSelect}
              >
                <option value="">-- Pilih --</option>
                {periodeList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama_kabinet}
                  </option>
                ))}
              </select>
            </div>

            {/* Divisi */}
            <div className={`${formStyles.colSpan1} ${formStyles.formGroup}`}>
              <label className={formStyles.formLabel}>Divisi</label>
              <select
                name="divisi_id"
                required
                value={formData.divisi_id || ""}
                onChange={handleFormChange}
                disabled={!formData.periode_id}
                className={formStyles.formSelect}
              >
                <option value="">-- Pilih --</option>
                {divisiFormList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nama_divisi}
                  </option>
                ))}
              </select>
            </div>

            {/* Jabatan */}
            <div className={`${formStyles.colSpan2} ${formStyles.formGroup}`}>
              <label className={formStyles.formLabel}>Jabatan</label>
              <select
                name="jabatan_di_divisi"
                required
                value={formData.jabatan_di_divisi || ""}
                onChange={handleFormChange}
                disabled={!formData.divisi_id}
                className={formStyles.formSelect}
              >
                <option value="">-- Pilih Jabatan --</option>
                {jabatanList.map((j) => (
                  <option key={j.id} value={j.nama_jabatan}>
                    {j.nama_jabatan}
                  </option>
                ))}
              </select>
              <p className={formStyles.formHelper}>
                Jabatan muncul sesuai divisi. Atur di 'Master Jabatan'.
              </p>
            </div>

            {/* Alamat & Motto */}
            <div className={`${formStyles.colSpan2} ${formStyles.formGroup}`}>
              <label className={formStyles.formLabel}>Alamat</label>
              <input
                type="text"
                name="alamat"
                value={formData.alamat || ""}
                onChange={handleFormChange}
                className={formStyles.formInput}
              />
            </div>
            <div className={`${formStyles.colSpan2} ${formStyles.formGroup}`}>
              <label className={formStyles.formLabel}>Motto Hidup</label>
              <textarea
                name="motto"
                value={formData.motto || ""}
                onChange={handleFormChange}
                className={formStyles.formTextarea}
                rows="2"
              />
            </div>

            {/* Foto */}
            <div
              className={`${formStyles.colSpan2} ${formStyles.uploadSection}`}
            >
              <label className={formStyles.formLabel}>Foto Profil</label>
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
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "1px solid #cbd5e0",
                    flexShrink: 0,
                  }}
                >
                  {formPreview ? (
                    <img
                      src={formPreview}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      alt="preview"
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        background: "#f1f5f9",
                      }}
                    ></div>
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
              {modalLoading ? "Menyimpan..." : "Simpan Data"}
            </button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
}

export default KelolaAnggota;
