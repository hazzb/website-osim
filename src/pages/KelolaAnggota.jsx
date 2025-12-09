import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

// Components UI
import PageContainer from "../components/ui/PageContainer.jsx";
import Modal from "../components/Modal.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import FormInput from "../components/admin/FormInput.jsx"; // PENTING
import {
  FilterBar,
  FilterSelect,
  FilterSearch,
} from "../components/ui/FilterBar.jsx";

// Styles & Icons
import tableStyles from "../components/admin/AdminTable.module.css";
import formStyles from "../components/admin/AdminForm.module.css";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiUser,
  FiImage,
} from "react-icons/fi";

const PER_PAGE = 10;

function KelolaAnggota() {
  const { session } = useAuth();

  // --- STATE DATA UTAMA ---
  const [anggotaList, setAnggotaList] = useState([]);
  const [loadingTable, setLoadingTable] = useState(true);

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

  // --- STATE REFERENSI (DROPDOWN) ---
  const [periodeList, setPeriodeList] = useState([]); // Semua Periode
  const [allDivisi, setAllDivisi] = useState([]); // Semua Divisi (Raw)
  const [allJabatan, setAllJabatan] = useState([]); // Semua Master Jabatan
  const [jabatanLinks, setJabatanLinks] = useState([]); // Relasi Divisi-Jabatan

  // State Dinamis untuk Form (Hasil Filter)
  const [formDivisiOptions, setFormDivisiOptions] = useState([]);
  const [formJabatanOptions, setFormJabatanOptions] = useState([]);

  // =================================================================
  // 1. FETCH DATA REFERENSI (Sekali di awal)
  // =================================================================
  useEffect(() => {
    const fetchRefs = async () => {
      try {
        // 1. Periode
        const { data: pData } = await supabase
          .from("periode_jabatan")
          .select("*")
          .order("tahun_mulai", { ascending: false });
        setPeriodeList(pData || []);
        if (pData?.length > 0) {
          const active = pData.find((p) => p.is_active);
          setSelectedPeriodeId(active ? active.id : pData[0].id);
        }

        // 2. Divisi
        const { data: dData } = await supabase
          .from("divisi")
          .select("*")
          .order("urutan");
        setAllDivisi(dData || []);

        // 3. Master Jabatan
        const { data: jData } = await supabase
          .from("master_jabatan")
          .select("*");
        setAllJabatan(jData || []);

        // 4. Link Divisi-Jabatan
        const { data: lData } = await supabase
          .from("divisi_jabatan_link")
          .select("*");
        setJabatanLinks(lData || []);
      } catch (err) {
        console.error("Error fetching refs:", err);
      }
    };
    fetchRefs();
  }, []);

  // =================================================================
  // 2. FETCH DATA TABEL (Reactive)
  // =================================================================
  useEffect(() => {
    if (!selectedPeriodeId) return;

    const loadTableData = async () => {
      setLoadingTable(true);
      try {
        const from = (currentPage - 1) * PER_PAGE;
        const to = from + PER_PAGE - 1;

        let query = supabase
          .from("anggota_detail_view") // Pastikan View ini ada
          .select("*", { count: "exact" })
          .eq("periode_id", selectedPeriodeId)
          .range(from, to)
          .order("urutan", { ascending: true }) // Urutan Divisi
          .order("nama", { ascending: true });

        if (selectedDivisiId !== "semua")
          query = query.eq("divisi_id", selectedDivisiId);
        if (searchTerm) query = query.ilike("nama", `%${searchTerm}%`);

        const { data, count, error } = await query;
        if (error) throw error;

        setAnggotaList(data || []);
        setTotalCount(count || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingTable(false);
      }
    };

    loadTableData();
  }, [selectedPeriodeId, selectedDivisiId, currentPage, searchTerm]);

  // =================================================================
  // 3. LOGIC FORM & CASCADING DROPDOWN
  // =================================================================

  // Helper: Filter Divisi berdasarkan Periode
  const filterDivisiByPeriode = (pId) => {
    const filtered = allDivisi.filter(
      (d) => String(d.periode_id) === String(pId)
    );
    setFormDivisiOptions(filtered);
  };

  // Helper: Filter Jabatan berdasarkan Divisi (Logic Inti)
  const filterJabatanByDivisi = (dId) => {
    if (!dId) {
      setFormJabatanOptions([]);
      return;
    }
    // Cari ID jabatan yang boleh untuk divisi ini
    const allowedIds = jabatanLinks
      .filter((l) => String(l.divisi_id) === String(dId))
      .map((l) => l.jabatan_id);

    // Jika tidak ada settingan (kosong), tampilkan jabatan tipe 'Divisi' & 'Umum' sebagai fallback
    // Agar tidak macet kalau admin lupa setting relasi
    if (allowedIds.length === 0) {
      const fallback = allJabatan.filter((j) => j.tipe_jabatan !== "Inti");
      setFormJabatanOptions(fallback);
    } else {
      const filtered = allJabatan.filter((j) => allowedIds.includes(j.id));
      setFormJabatanOptions(filtered);
    }
  };

  const openModal = async (item = null) => {
    setFormFile(null);
    setFormPreview(null);

    if (item) {
      // EDIT
      setEditingId(item.id);
      // Fetch single data agar ID relasinya akurat
      const { data } = await supabase
        .from("anggota")
        .select("*")
        .eq("id", item.id)
        .single();
      if (data) {
        setFormData(data);
        setFormPreview(data.foto_url);

        // Trigger filter dropdown agar terisi sesuai data yg diedit
        filterDivisiByPeriode(data.periode_id);
        filterJabatanByDivisi(data.divisi_id);
      }
    } else {
      // ADD
      setEditingId(null);
      // Default ke periode yang sedang dipilih di filter
      setFormData({
        nama: "",
        jenis_kelamin: "Ikhwan",
        alamat: "",
        motto: "",
        instagram_username: "",
        periode_id: selectedPeriodeId,
        divisi_id: "",
        jabatan_di_divisi: "", // String
      });

      filterDivisiByPeriode(selectedPeriodeId);
      setFormJabatanOptions([]); // Reset jabatan
    }
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // CASCADING LOGIC
    if (name === "periode_id") {
      setFormData((prev) => ({
        ...prev,
        divisi_id: "",
        jabatan_di_divisi: "",
      }));
      filterDivisiByPeriode(value);
      setFormJabatanOptions([]);
    }
    if (name === "divisi_id") {
      setFormData((prev) => ({ ...prev, jabatan_di_divisi: "" }));
      filterJabatanByDivisi(value);
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
      let finalFotoUrl = formData.foto_url;

      if (formFile) {
        const ext = formFile.name.split(".").pop();
        const fileName = `anggota_${Date.now()}.${ext}`;
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
        jabatan_di_divisi: formData.jabatan_di_divisi, // Simpan Nama Jabatan (String)
        foto_url: finalFotoUrl,
      };

      if (editingId) {
        await supabase.from("anggota").update(payload).eq("id", editingId);
      } else {
        await supabase.from("anggota").insert(payload);
      }

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
      setAnggotaList((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  // =================================================================
  // 4. RENDER UI
  // =================================================================

  // Filter list divisi untuk bagian ATAS (Filter Bar)
  const filterDivisiList = allDivisi.filter(
    (d) => String(d.periode_id) === String(selectedPeriodeId)
  );

  if (loadingTable && !selectedPeriodeId)
    return (
      <PageContainer breadcrumbText="Memuat...">
        <LoadingState />
      </PageContainer>
    );

  return (
    <PageContainer breadcrumbText="Kelola Anggota">
      {/* HEADER */}
      <div className={tableStyles.adminPageHeader}>
        <div>
          <h1 className="page-title">Database Anggota</h1>
          <p style={{ color: "var(--text-muted)" }}>
            Data seluruh pengurus organisasi.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="button button-primary"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <FiPlus /> Tambah Anggota
        </button>
      </div>

      {/* FILTER BAR */}
      <div
        className={tableStyles.tableFilterContainer}
        style={{ flexWrap: "wrap" }}
      >
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

        <FilterSelect
          label="Divisi"
          value={selectedDivisiId}
          onChange={(e) => setSelectedDivisiId(e.target.value)}
        >
          <option value="semua">Semua Divisi</option>
          {filterDivisiList.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nama_divisi}
            </option>
          ))}
        </FilterSelect>

        <div
          className={tableStyles.searchInputGroup}
          style={{ maxWidth: "250px" }}
        >
          <FiSearch style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Cari nama..."
            className={tableStyles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className={tableStyles.tableContainer}>
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th style={{ width: "60px" }}>Foto</th>
              <th>Nama Lengkap</th>
              <th>Divisi</th>
              <th>Jabatan</th>
              <th>Gender</th>
              <th style={{ width: "100px", textAlign: "right" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {anggotaList.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "#94a3b8",
                  }}
                >
                  Tidak ada data.
                </td>
              </tr>
            ) : (
              anggotaList.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div
                      className={formStyles.previewBox}
                      style={{ width: 40, height: 40, borderRadius: "50%" }}
                    >
                      {item.foto_url ? (
                        <img src={item.foto_url} alt="foto" />
                      ) : (
                        <FiUser color="#cbd5e0" />
                      )}
                    </div>
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
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className={`${tableStyles.btnAction} ${tableStyles.btnDelete}`}
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
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <button
              className={tableStyles.paginationButton}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* --- FORM YANG DIPERBAIKI (GRID & LOGIC) --- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Anggota" : "Tambah Anggota"}
      >
        <form onSubmit={handleSubmit}>
          <div className={formStyles.formGrid}>
            {/* Nama (Span 8) */}
            <FormInput
              label="Nama Lengkap"
              name="nama"
              value={formData.nama || ""}
              onChange={handleFormChange}
              required
              span={8}
            />

            {/* Gender (Span 4) */}
            <div className={formStyles.colSpan4}>
              <FormInput
                label="Gender"
                name="jenis_kelamin"
                type="select"
                value={formData.jenis_kelamin || "Ikhwan"}
                onChange={handleFormChange}
              >
                <option value="Ikhwan">Ikhwan</option>
                <option value="Akhwat">Akhwat</option>
              </FormInput>
            </div>

            {/* Periode (Span 6) */}
            <div className={formStyles.colSpan6}>
              <FormInput
                label="Periode"
                name="periode_id"
                type="select"
                value={formData.periode_id || ""}
                onChange={handleFormChange}
                required
              >
                <option value="">-- Pilih --</option>
                {periodeList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama_kabinet}
                  </option>
                ))}
              </FormInput>
            </div>

            {/* Divisi (Span 6) - Filtered */}
            <div className={formStyles.colSpan6}>
              <FormInput
                label="Divisi"
                name="divisi_id"
                type="select"
                value={formData.divisi_id || ""}
                onChange={handleFormChange}
                required
                disabled={!formData.periode_id}
              >
                <option value="">-- Pilih Divisi --</option>
                {formDivisiOptions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nama_divisi}
                  </option>
                ))}
              </FormInput>
            </div>

            {/* Jabatan (Full 12) - Filtered */}
            <div className={formStyles.colSpan12}>
              <FormInput
                label="Jabatan"
                name="jabatan_di_divisi" // Sesuai kolom database (String)
                type="select"
                value={formData.jabatan_di_divisi || ""}
                onChange={handleFormChange}
                required
                disabled={!formData.divisi_id}
                helper={
                  formData.divisi_id && formJabatanOptions.length === 0
                    ? "Belum ada jabatan yang diatur untuk divisi ini. Silakan atur di menu Divisi."
                    : ""
                }
              >
                <option value="">-- Pilih Jabatan --</option>
                {formJabatanOptions.map((j) => (
                  // VALUE MENGGUNAKAN NAMA (STRING) AGAR SESUAI DATABASE
                  <option key={j.id} value={j.nama_jabatan}>
                    {j.nama_jabatan}
                  </option>
                ))}
              </FormInput>
            </div>

            {/* Instagram & Alamat */}
            <div className={formStyles.colSpan6}>
              <FormInput
                label="Instagram"
                name="instagram_username"
                value={formData.instagram_username || ""}
                onChange={handleFormChange}
                placeholder="username"
              />
            </div>
            <div className={formStyles.colSpan6}>
              <FormInput
                label="Alamat"
                name="alamat"
                value={formData.alamat || ""}
                onChange={handleFormChange}
              />
            </div>

            {/* Motto */}
            <FormInput
              label="Motto"
              name="motto"
              type="textarea"
              value={formData.motto || ""}
              onChange={handleFormChange}
              span={12}
              rows={2}
            />

            {/* Upload Foto */}
            <FormInput
              type="file"
              label="Foto Profil"
              onChange={handleFileChange}
              preview={formPreview} // State preview dari parent
              accept="image/*"
              helper="Max 200 KB (JPG/PNG)"
              span={12}
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
              {modalLoading ? "Menyimpan..." : "Simpan Data"}
            </button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
}

export default KelolaAnggota;
