import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

// Components
import PageContainer from "../components/ui/PageContainer.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import { AnggotaSkeletonGrid } from "../components/ui/Skeletons.jsx";
import { FilterSelect } from "../components/ui/FilterBar.jsx";
import AnggotaCard from "../components/cards/AnggotaCard.jsx";
import Modal from "../components/Modal.jsx";

// Forms & Managers
import AnggotaForm from "../components/forms/AnggotaForm.jsx";
import DivisiForm from "../components/forms/DivisiForm.jsx";
import DivisiReorderModal from "../components/admin/DivisiReorderModal.jsx";
import JabatanManager from "../components/admin/JabatanManager.jsx";
import KabinetWizard from "../components/admin/KabinetWizard.jsx";

// Styles
import styles from "./DaftarAnggota.module.css";

// Utils
import { uploadImage } from "../utils/uploadHelper";

// Icons
import {
  FiSearch,
  FiPlus,
  FiEdit,
  FiBriefcase,
  FiList,
  FiZap,
  FiDatabase,
  FiLayout,
  FiGrid,
  FiArrowRight,
} from "react-icons/fi";

function DaftarAnggota() {
  const { session } = useAuth();
  const isAdmin = !!session;
  const navigate = useNavigate();

  // --- STATE ---
  const [periodeList, setPeriodeList] = useState([]);
  const [activeTab, setActiveTab] = useState("");

  // View Mode: 'aesthetic' (Grid) or 'compact' (List)
  const [viewMode, setViewMode] = useState("aesthetic");

  const [allDivisi, setAllDivisi] = useState([]);
  const [jabatanList, setJabatanList] = useState([]);
  const [divisiPerPeriode, setDivisiPerPeriode] = useState([]);
  const [anggotaList, setAnggotaList] = useState([]);

  // Filters
  const [selectedDivisi, setSelectedDivisi] = useState("semua");
  const [selectedGender, setSelectedGender] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [formFile, setFormFile] = useState(null);
  const [formPreview, setFormPreview] = useState(null);

  // Helper Periode Data
  const activePeriodeData = periodeList.find(
    (p) => String(p.id) === String(activeTab)
  );

  // --- FETCH DATA ---
  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: periodes } = await supabase
        .from("periode_jabatan")
        .select("*")
        .order("tahun_mulai", { ascending: false });
      setPeriodeList(periodes || []);

      if (periodes?.length > 0 && !activeTab) {
        const active = periodes.find((p) => p.is_active);
        setActiveTab(active ? active.id : periodes[0].id);
      }

      const { data: divisis } = await supabase
        .from("divisi")
        .select("*")
        .order("urutan", { ascending: true });
      setAllDivisi(divisis || []);

      const { data: jabatans } = await supabase
        .from("master_jabatan")
        .select("*")
        .order("nama_jabatan", { ascending: true });
      setJabatanList(jabatans || []);
    } catch (err) {
      console.error("Init Error:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchAnggota = useCallback(
    async (periodeId) => {
      if (!periodeId && periodeId !== "semua") return;
      setLoading(true);
      try {
        let relevantDivisi = [];
        if (periodeId === "semua") {
          relevantDivisi = allDivisi;
        } else {
          relevantDivisi = allDivisi.filter(
            (d) => String(d.periode_id) === String(periodeId)
          );
        }
        setDivisiPerPeriode(relevantDivisi);

        let query = supabase.from("anggota").select(`
            *, 
            divisi ( nama_divisi, urutan, logo_url, tipe ), 
            master_jabatan ( nama_jabatan ),
            periode_jabatan ( nama_kabinet ) 
        `);

        if (periodeId !== "semua") {
          query = query.eq("periode_id", periodeId);
        }

        const { data, error } = await query;

        if (error) throw error;
        setAnggotaList(data || []);
      } catch (err) {
        console.error("Fetch Anggota Error:", err);
      } finally {
        setLoading(false);
      }
    },
    [allDivisi]
  );

  useEffect(() => {
    if (activeTab) {
      fetchAnggota(activeTab);
    }
  }, [activeTab, fetchAnggota]);

  // --- HANDLERS ---

  // Sort Logic: Ketua -> Wakil -> ... -> Anggota
  const getJobRank = (jabatan) => {
    const j = jabatan?.toLowerCase() || "";
    if (j.includes("ketua") && !j.includes("wakil")) return 1;
    if (j.includes("wakil")) return 2;
    if (j.includes("sekretaris")) return 3;
    if (j.includes("bendahara")) return 4;
    if (j.includes("koordinator")) return 5;
    if (j.includes("staff ahli")) return 6;
    return 99;
  };

  const sortMembers = (members) => {
    return members.sort((a, b) => {
      const rankA = getJobRank(a.master_jabatan?.nama_jabatan);
      const rankB = getJobRank(b.master_jabatan?.nama_jabatan);
      if (rankA !== rankB) return rankA - rankB;
      return a.nama.localeCompare(b.nama);
    });
  };

  const getModalTitle = () => {
    if (activeModal === "jabatan") return "Kelola Jabatan";
    const action = editingId ? "Edit" : "Tambah";
    return `${action} ${
      activeModal?.charAt(0).toUpperCase() + activeModal?.slice(1) || ""
    }`;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormFile(file);
      setFormPreview(URL.createObjectURL(file));
    }
  };

  const handleFormChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // --- MODAL MANAGEMENT ---
  const openModal = (type, item = null) => {
    setActiveModal(type);
    setFormFile(null);
    setFormPreview(null);

    // 1. Reorder Divisi (Modal Khusus)
    if (type === "reorder_divisi") {
      setIsModalOpen(false); // Pastikan modal generic tertutup
      return;
    }

    // 2. Jabatan (Modal Generic)
    if (type === "jabatan") {
      setIsModalOpen(true);
      return;
    }

    // 3. Anggota/Divisi (Modal Generic)
    if (item) {
      setEditingId(item.id);
      setFormData({
        ...item,
        divisi_id: item.divisi_id,
        jabatan_id: item.jabatan_id || "",
      });
      if (type === "anggota") setFormPreview(item.foto_url);
      else if (type === "divisi") setFormPreview(item.logo_url);
    } else {
      setEditingId(null);
      const targetPeriode = activeTab === "semua" ? "" : activeTab;
      if (type === "anggota") {
        setFormData({
          nama: "",
          jenis_kelamin: "Ikhwan",
          periode_id: targetPeriode,
          divisi_id: selectedDivisi !== "semua" ? selectedDivisi : "",
          jabatan_id: "",
          instagram_username: "",
          alamat: "",
          motto: "",
        });
      } else if (type === "divisi") {
        setFormData({
          nama_divisi: "",
          deskripsi: "",
          urutan: 10,
          periode_id: targetPeriode,
          tipe: "Umum",
        });
      }
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveModal(null);
    setFormData({});
  };

  // --- CRUD ACTIONS ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      let payload = {};
      let table = "";

      if (!formData.periode_id)
        throw new Error("Periode Jabatan harus dipilih!");

      if (activeModal === "divisi") {
        table = "divisi";
        let logoUrl = formData.logo_url;
        if (formFile) logoUrl = await uploadImage(formFile, "divisi");
        payload = {
          nama_divisi: formData.nama_divisi,
          deskripsi: formData.deskripsi,
          urutan: parseInt(formData.urutan || 10),
          logo_url: logoUrl,
          periode_id: parseInt(formData.periode_id),
          tipe: formData.tipe || "Umum",
        };
      } else if (activeModal === "anggota") {
        table = "anggota";
        let fotoUrl = formData.foto_url;
        if (formFile) fotoUrl = await uploadImage(formFile, "anggota");
        payload = {
          nama: formData.nama,
          motto: formData.motto,
          instagram_username: formData.instagram_username,
          jenis_kelamin: formData.jenis_kelamin,
          alamat: formData.alamat,
          foto_url: fotoUrl,
          divisi_id: parseInt(formData.divisi_id),
          periode_id: parseInt(formData.periode_id),
          jabatan_id: formData.jabatan_id
            ? parseInt(formData.jabatan_id)
            : null,
        };
      }

      if (editingId) {
        const { error } = await supabase
          .from(table)
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(table).insert(payload);
        if (error) throw error;
      }

      alert("Berhasil disimpan!");
      if (activeModal === "anggota") await fetchAnggota(activeTab);
      else {
        fetchInitialData();
        fetchAnggota(activeTab);
      }
      closeModal();
    } catch (err) {
      alert("Gagal menyimpan: " + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm("Hapus item ini?")) return;
    try {
      const table = type === "periode" ? "periode_jabatan" : type;
      await supabase.from(table).delete().eq("id", id);
      if (type === "periode" || type === "divisi") fetchInitialData();
      else fetchAnggota(activeTab);
    } catch (err) {
      alert("Gagal hapus: " + err.message);
    }
  };

  // --- FILTERING ---
  const filteredAnggota = anggotaList.filter((anggota) => {
    const matchDivisi =
      selectedDivisi === "semua" ||
      String(anggota.divisi_id) === String(selectedDivisi);
    const matchGender =
      selectedGender === "all" || anggota.jenis_kelamin === selectedGender;
    const matchSearch =
      searchTerm === "" ||
      anggota.nama.toLowerCase().includes(searchTerm.toLowerCase());
    return matchDivisi && matchGender && matchSearch;
  });

  const memberMap = {};
  filteredAnggota.forEach((member) => {
    const divId = member.divisi_id || "others";
    if (!memberMap[divId]) memberMap[divId] = [];
    memberMap[divId].push(member);
  });

  const sortedDivisiList = [...divisiPerPeriode].sort(
    (a, b) => (a.urutan || 99) - (b.urutan || 99)
  );

  return (
    <PageContainer breadcrumbText="Daftar Anggota">
      {/* --- PAGE HEADER --- */}
      <PageHeader
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <span>Daftar Anggota</span>
            {activeTab === "semua" ? (
              <span
                style={{
                  fontSize: "0.6em",
                  color: "#64748b",
                  fontWeight: "400",
                  backgroundColor: "#f1f5f9",
                  padding: "4px 10px",
                  borderRadius: "20px",
                }}
              >
                Semua Periode
              </span>
            ) : (
              activePeriodeData && (
                <span
                  style={{
                    fontSize: "0.6em",
                    color: "#2563eb",
                    fontWeight: "600",
                    backgroundColor: "#eff6ff",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    border: "1px solid #bfdbfe",
                  }}
                >
                  {activePeriodeData.nama_kabinet}
                </span>
              )
            )}
          </div>
        }
        subtitle="Manajemen personil, struktur divisi, dan jabatan."
        // ACTIONS (TOMBOL ADMIN) - DIRECT CHILDREN
        actions={
          isAdmin && (
            <>
              <button
                onClick={() => navigate("/kelola-anggota")}
                className="button button-secondary"
                title="Database"
              >
                <FiDatabase />{" "}
                <span style={{ display: "inline-block" }}>Database</span>
              </button>
              <button
                onClick={() => openModal("anggota")}
                className="button button-primary"
                title="Tambah Anggota"
              >
                <FiPlus /> Anggota
              </button>
              <button
                onClick={() => openModal("divisi")}
                className="button button-secondary"
                title="Tambah Divisi"
              >
                <FiPlus /> Divisi
              </button>
              <button
                onClick={() => openModal("reorder_divisi")}
                className="button button-secondary"
                title="Atur Urutan"
              >
                <FiList /> Urutan
              </button>
              <button
                onClick={() => setIsWizardOpen(true)}
                className="button button-secondary"
                title="Wizard Kabinet"
              >
                <FiZap /> Wizard
              </button>
              <button
                onClick={() => openModal("jabatan")}
                className="button button-secondary"
                title="Master Jabatan"
              >
                <FiBriefcase /> Jabatan
              </button>
            </>
          )
        }
        // SEARCH BAR (PERSISTENT ITEMS: Kabinet & Layout)
        searchBar={
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              width: "100%",
              alignItems: "center",
            }}
          >
            {/* Filter Kabinet */}
            <div style={{ flex: 1, minWidth: "130px" }}>
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                style={{
                  width: "100%",
                  height: "40px",
                  padding: "0 0.5rem",
                  border: "1px solid #cbd5e0",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  backgroundColor: "white",
                  color: "#475569",
                  outline: "none",
                  cursor: "pointer",
                  textOverflow: "ellipsis",
                }}
              >
                <option value="semua">Semua Periode</option>
                {periodeList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama_kabinet}
                  </option>
                ))}
              </select>
            </div>

            {/* Layout Toggle */}
            <div
              style={{
                display: "flex",
                backgroundColor: "#f1f5f9",
                padding: "3px",
                borderRadius: "8px",
                height: "40px",
                flexShrink: 0,
              }}
            >
              <button
                onClick={() => setViewMode("compact")}
                title="List View"
                style={{
                  border: "none",
                  borderRadius: "6px",
                  padding: "0 8px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor:
                    viewMode === "compact" ? "white" : "transparent",
                  color: viewMode === "compact" ? "#2563eb" : "#94a3b8",
                  boxShadow:
                    viewMode === "compact"
                      ? "0 1px 2px rgba(0,0,0,0.1)"
                      : "none",
                  transition: "all 0.2s",
                }}
              >
                <FiLayout size={16} />
              </button>
              <button
                onClick={() => setViewMode("aesthetic")}
                title="Grid View"
                style={{
                  border: "none",
                  borderRadius: "6px",
                  padding: "0 8px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor:
                    viewMode === "aesthetic" ? "white" : "transparent",
                  color: viewMode === "aesthetic" ? "#2563eb" : "#94a3b8",
                  boxShadow:
                    viewMode === "aesthetic"
                      ? "0 1px 2px rgba(0,0,0,0.1)"
                      : "none",
                  transition: "all 0.2s",
                }}
              >
                <FiGrid size={16} />
              </button>
            </div>
          </div>
        }
        // FILTERS (EXPANDABLE ITEMS: Search, Divisi, Gender)
        filters={
          <>
            {/* Input Search */}
            <div
              style={{
                width: "100%",
                marginBottom: "0.5rem",
                paddingBottom: "0.5rem",
                borderBottom: "1px dashed #e2e8f0",
                position: "relative",
              }}
            >
              <FiSearch
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "40%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                }}
              />
              <input
                type="text"
                placeholder="Ketik nama anggota..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  height: "40px",
                  padding: "0 0.8rem 0 2.5rem",
                  border: "1px solid #cbd5e0",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  outline: "none",
                }}
                autoFocus
              />
            </div>

            {/* Filter Divisi */}
            <div style={{ flex: 1, minWidth: "150px" }}>
              <FilterSelect
                label="Filter Divisi"
                value={selectedDivisi}
                onChange={(e) => setSelectedDivisi(e.target.value)}
              >
                <option value="semua">Semua Divisi</option>
                {divisiPerPeriode.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nama_divisi}
                  </option>
                ))}
              </FilterSelect>
            </div>

            {/* Filter Gender */}
            <div style={{ flex: 1, minWidth: "120px" }}>
              <FilterSelect
                label="Filter Gender"
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
              >
                <option value="all">Semua</option>
                <option value="Ikhwan">Ikhwan</option>
                <option value="Akhwat">Akhwat</option>
              </FilterSelect>
            </div>
          </>
        }
      />

      {/* --- CONTENT AREA --- */}
      {loading ? (
        <AnggotaSkeletonGrid />
      ) : anggotaList.length === 0 ? (
        <div className={styles.emptyState}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📂</div>
          <p>Belum ada data anggota di periode ini.</p>
        </div>
      ) : (
        <div className={styles.contentWrapper}>
          {/* Loop per Divisi */}
          {sortedDivisiList.map((divisi) => {
            const rawMembers = memberMap[divisi.id] || [];
            const members = sortMembers([...rawMembers]);

            if (members.length === 0) return null;

            return (
              <section key={divisi.id} className={styles.divisiSection}>
                <div className={styles.divisiHeader}>
                  <div className={styles.divisiTitleGroup}>
                    {divisi.logo_url ? (
                      <img
                        src={divisi.logo_url}
                        alt="logo"
                        className={styles.divisiLogo}
                      />
                    ) : (
                      <div className={styles.divisiLogoPlaceholder}>
                        {divisi.nama_divisi.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className={styles.divisiTitle}>
                        {divisi.nama_divisi}
                      </h3>
                      {divisi.tipe === "Inti" && (
                        <span className={styles.badgeInti}>BPH / INTI</span>
                      )}
                    </div>
                  </div>

                  <div className={styles.divisiActions}>
                    <Link
                      to={`/divisi/${divisi.id}`}
                      className={styles.linkDetail}
                    >
                      Detail <FiArrowRight />
                    </Link>
                    {isAdmin && (
                      <button
                        onClick={() => openModal("divisi", divisi)}
                        className={styles.btnIconEdit}
                      >
                        <FiEdit />
                      </button>
                    )}
                  </div>
                </div>

                <div className={styles.cardGrid}>
                  {members.map((anggota) => (
                    <AnggotaCard
                      key={anggota.id}
                      data={anggota}
                      isAdmin={isAdmin}
                      onEdit={(item) => openModal("anggota", item)}
                      onDelete={(id) => handleDelete("anggota", id)}
                      showPeriode={activeTab === "semua"}
                      layout={viewMode} // Pass Layout State
                    />
                  ))}
                </div>
              </section>
            );
          })}

          {/* Anggota Tanpa Divisi */}
          {memberMap["others"]?.length > 0 && (
            <section className={styles.divisiSection}>
              <div className={styles.divisiHeader}>
                <h3 className={styles.divisiTitle}>Lainnya / Tanpa Divisi</h3>
              </div>
              <div className={styles.cardGrid}>
                {sortMembers([...memberMap["others"]]).map((m) => (
                  <AnggotaCard
                    key={m.id}
                    data={m}
                    isAdmin={isAdmin}
                    onDelete={(id) => handleDelete("anggota", id)}
                    onEdit={(item) => openModal("anggota", item)}
                    showPeriode={activeTab === "semua"}
                    layout={viewMode}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* --- MODALS --- */}

      {/* 1. Generic Modal (Form Anggota/Divisi/Jabatan) */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={getModalTitle()}>
        {activeModal === "anggota" && (
          <AnggotaForm
            formData={formData}
            onChange={handleFormChange}
            onFileChange={handleFileChange}
            onSubmit={handleSubmit}
            onCancel={closeModal}
            loading={modalLoading}
            preview={formPreview}
            periodeList={periodeList}
            divisiList={divisiPerPeriode}
            jabatanList={jabatanList}
          />
        )}
        {activeModal === "divisi" && (
          <DivisiForm
            formData={formData}
            onChange={handleFormChange}
            onFileChange={handleFileChange}
            onSubmit={handleSubmit}
            onCancel={closeModal}
            loading={modalLoading}
            periodeList={periodeList}
            preview={formPreview}
          />
        )}
        {activeModal === "jabatan" && (
          <JabatanManager
            onClose={closeModal}
            onSuccess={fetchInitialData}
            jabatanList={jabatanList}
          />
        )}
      </Modal>

      {/* 2. Modal Reorder Divisi (Render Terpisah) */}
      {activeModal === "reorder_divisi" && (
        <DivisiReorderModal
          isOpen={true}
          onClose={closeModal}
          divisiList={divisiPerPeriode}
          activePeriodeId={activeTab}
          onSuccess={() => fetchInitialData()}
        />
      )}

      {/* 3. Modal Wizard Kabinet */}
      {isWizardOpen && (
        <KabinetWizard
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          onSuccess={fetchInitialData}
        />
      )}
    </PageContainer>
  );
}

export default DaftarAnggota;
