import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

// UI Components
import PageContainer from "../components/ui/PageContainer.jsx";
import { AnggotaSkeletonGrid } from "../components/ui/Skeletons.jsx";
import { FilterBar, FilterSelect } from "../components/ui/FilterBar.jsx";
import AnggotaCard from "../components/cards/AnggotaCard.jsx";
import Modal from "../components/Modal.jsx";

// Forms
import AnggotaForm from "../components/forms/AnggotaForm.jsx";
import DivisiForm from "../components/forms/DivisiForm.jsx";
import DivisiReorderModal from "../components/admin/DivisiReorderModal.jsx";
import JabatanManager from "../components/admin/JabatanManager.jsx";
import PeriodeForm from "../components/forms/PeriodeForm.jsx";

// Styles
import styles from "./DaftarAnggota.module.css";

// Utils (INI YANG DITAMBAHKAN)
import { uploadImage } from "../utils/uploadHelper";

// Icons
import {
  FiSearch,
  FiArrowRight,
  FiPlus,
  FiEdit,
  FiBriefcase,
} from "react-icons/fi";

function DaftarAnggota() {
  const { session } = useAuth();
  const isAdmin = !!session;

  // --- STATE ---
  const [periodeList, setPeriodeList] = useState([]);
  const [divisiList, setDivisiList] = useState([]);
  const [anggotaList, setAnggotaList] = useState([]);
  const [jabatanList, setJabatanList] = useState([]);

  // RELASI DIVISI <-> JABATAN
  const [jabatanLinks, setJabatanLinks] = useState([]);

  // Filter
  const [activeTab, setActiveTab] = useState("");
  const [selectedDivisi, setSelectedDivisi] = useState("semua");
  const [selectedGender, setSelectedGender] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [formFile, setFormFile] = useState(null);
  const [formPreview, setFormPreview] = useState(null);
  const [existingFotoUrl, setExistingFotoUrl] = useState(null);

  // --- FETCHING ---
  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Periode
      const { data: periodes } = await supabase
        .from("periode_jabatan")
        .select("*")
        .order("tahun_mulai", { ascending: false });
      setPeriodeList(periodes || []);
      if (periodes?.length > 0) {
        const active = periodes.find((p) => p.is_active);
        setActiveTab(active ? active.id : periodes[0].id);
      }

      // 2. Divisi
      const { data: divisis } = await supabase
        .from("divisi")
        .select("*")
        .order("urutan", { ascending: true });
      setDivisiList(divisis || []);

      // 3. Jabatan Master
      const { data: jabatans } = await supabase
        .from("master_jabatan")
        .select("*")
        .order("nama_jabatan", { ascending: true });
      setJabatanList(jabatans || []);

      // 4. Relasi Divisi-Jabatan
      const { data: links } = await supabase
        .from("divisi_jabatan_link")
        .select("*");
      setJabatanLinks(links || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const fetchAnggota = useCallback(async (periodeId) => {
    if (!periodeId) return;
    try {
      const { data, error } = await supabase
        .from("anggota")
        .select("*, divisi(nama_divisi, urutan)")
        .eq("periode_id", periodeId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setAnggotaList(data || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchAnggota(activeTab);
  }, [activeTab, fetchAnggota]);

  // --- HANDLERS ---
  const getModalTitle = () => {
    if (activeModal === "reorder_divisi") return "Atur Urutan Divisi";
    if (activeModal === "jabatan") return "Kelola Jabatan";
    const action = editingId ? "Edit" : "Tambah";
    return `${action} ${activeModal || ""}`;
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

  const openModal = (type, item = null) => {
    setActiveModal(type);
    setFormFile(null);
    setFormPreview(null);
    setExistingFotoUrl(null);

    if (type === "reorder_divisi" || type === "jabatan") {
      setIsModalOpen(true);
      return;
    }

    if (item) {
      setEditingId(item.id);
      setFormData(item);
      if (type === "anggota") {
        setExistingFotoUrl(item.foto_url);
        setFormPreview(item.foto_url);
      } else if (type === "divisi") {
        setExistingFotoUrl(item.logo_url);
        setFormPreview(item.logo_url);
      }
    } else {
      setEditingId(null);
      setFormData({
        periode_id: activeTab,
        divisi_id: selectedDivisi !== "semua" ? selectedDivisi : "",
        jenis_kelamin: "Ikhwan",
        alamat: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveModal(null);
    setFormData({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      let payload = { ...formData };

      // LOGIC UPLOAD GAMBAR PAKE HELPER
      if (activeModal === "anggota" || activeModal === "divisi") {
        if (formFile) {
          // Gunakan helper uploadImage di sini
          const folder = activeModal; // 'anggota' atau 'divisi'
          const url = await uploadImage(formFile, folder);
          payload[activeModal === "anggota" ? "foto_url" : "logo_url"] = url;
        }
      }

      const table = activeModal === "periode" ? "periode_jabatan" : activeModal;

      if (editingId) {
        await supabase.from(table).update(payload).eq("id", editingId);
      } else {
        await supabase.from(table).insert(payload);
      }

      alert("Berhasil disimpan!");

      if (activeModal === "anggota") fetchAnggota(activeTab);
      else fetchInitialData();

      closeModal();
    } catch (err) {
      alert(err.message || err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm("Hapus?")) return;
    const table = type === "periode" ? "periode_jabatan" : type;
    await supabase.from(table).delete().eq("id", id);
    if (type === "anggota") fetchAnggota(activeTab);
    else fetchInitialData();
  };

  // --- FILTERING ---
  const filteredAnggota = anggotaList.filter((anggota) => {
    const matchDivisi =
      selectedDivisi === "semua" ||
      anggota.divisi_id === parseInt(selectedDivisi);
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

  const sortedDivisiList = [...divisiList].sort(
    (a, b) => (a.urutan || 99) - (b.urutan || 99)
  );

  // --- RENDER ---
  return (
    <PageContainer breadcrumbText="Daftar Anggota">
      {/* HEADER & STICKY */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          backgroundColor: "#f8fafc",
          paddingBottom: "1rem",
          paddingTop: "0.5rem",
          margin: "0 -1.5rem",
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <div className={styles["header-section"]}>
          <h1 className="page-title">Daftar Anggota</h1>
          <p style={{ color: "#64748b" }}>Struktur Kepengurusan</p>
        </div>

        {isAdmin && (
          <div
            className={styles["action-buttons"]}
            style={{ marginBottom: "1rem" }}
          >
            <button
              onClick={() => openModal("anggota")}
              className={`${styles["modern-button"]} ${styles["btn-blue"]}`}
            >
              <FiPlus /> Anggota
            </button>
            <button
              onClick={() => openModal("divisi")}
              className={`${styles["modern-button"]} ${styles["btn-orange"]}`}
            >
              <FiPlus /> Divisi
            </button>
            <button
              onClick={() => openModal("periode")}
              className={`${styles["modern-button"]} ${styles["btn-purple"]}`}
            >
              <FiPlus /> Periode
            </button>
            <button
              onClick={() => openModal("jabatan")}
              className={`${styles["modern-button"]}`}
              style={{
                backgroundColor: "#0891b2",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <FiBriefcase /> Jabatan
            </button>
            <button
              onClick={() => openModal("reorder_divisi")}
              className={`${styles["modern-button"]}`}
              style={{ backgroundColor: "#319795" }}
            >
              Urutkan Divisi
            </button>
          </div>
        )}

        <FilterBar>
          <FilterSelect
            label="Periode"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            {periodeList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama_kabinet} {p.is_active ? "(Aktif)" : ""}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            label="Divisi"
            value={selectedDivisi}
            onChange={(e) => setSelectedDivisi(e.target.value)}
          >
            <option value="semua">Semua Divisi</option>
            {divisiList.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nama_divisi}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            label="Gender"
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
          >
            <option value="all">Semua</option>{" "}
            <option value="Ikhwan">Ikhwan</option>{" "}
            <option value="Akhwat">Akhwat</option>
          </FilterSelect>
          <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
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
              placeholder="Cari nama anggota..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "0.6rem 1rem 0.6rem 2.5rem",
                border: "1px solid #cbd5e0",
                borderRadius: "8px",
                fontSize: "0.9rem",
                height: "38px",
              }}
            />
          </div>
        </FilterBar>
      </div>

      {/* CONTENT */}
      {loading ? (
        <AnggotaSkeletonGrid />
      ) : anggotaList.length === 0 ? (
        <div className={styles.emptyState}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📂</div>
          <p>Tidak ada data anggota ditemukan.</p>
        </div>
      ) : (
        <div className={styles.contentWrapper}>
          {sortedDivisiList.map((divisi) => {
            const members = memberMap[divisi.id];
            if (!members || members.length === 0) return null;
            return (
              <section key={divisi.id} className={styles["divisi-section"]}>
                <div className={styles["divisi-header"]}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    {divisi.logo_url && (
                      <img
                        src={divisi.logo_url}
                        alt="logo"
                        className={styles["divisi-logo"]}
                      />
                    )}
                    <h2 className={styles["divisi-title"]}>
                      {divisi.nama_divisi}
                    </h2>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      marginLeft: "auto",
                    }}
                  >
                    <Link
                      to={`/divisi/${divisi.id}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        color: "#3b82f6",
                        textDecoration: "none",
                        fontWeight: "600",
                        fontSize: "0.9rem",
                      }}
                    >
                      Lihat Detail <FiArrowRight />
                    </Link>
                    {isAdmin && (
                      <button
                        onClick={() => openModal("divisi", divisi)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#64748b",
                        }}
                        title="Edit Divisi"
                      >
                        <FiEdit />
                      </button>
                    )}
                  </div>
                </div>
                <div className={styles["card-grid"]}>
                  {members.map((anggota) => (
                    <AnggotaCard
                      key={anggota.id}
                      data={anggota}
                      isAdmin={isAdmin}
                      onEdit={(item) => openModal("anggota", item)}
                      onDelete={(id) => handleDelete("anggota", id)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
          {memberMap["others"]?.length > 0 && (
            <section className={styles["divisi-section"]}>
              <div className={styles["divisi-header"]}>
                <h2 className={styles["divisi-title"]}>Lainnya</h2>
              </div>
              <div className={styles["card-grid"]}>
                {memberMap["others"].map((m) => (
                  <AnggotaCard key={m.id} data={m} isAdmin={isAdmin} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* MODALS */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={getModalTitle()}>
        {activeModal === "anggota" && (
          <AnggotaForm
            formData={formData}
            onChange={handleFormChange}
            onFileChange={handleFileChange}
            onSubmit={handleSubmit}
            onCancel={closeModal}
            loading={modalLoading}
            periodeList={periodeList}
            divisiList={divisiList}
            jabatanList={jabatanList}
            jabatanLinks={jabatanLinks}
            preview={formPreview}
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
          />
        )}
        {activeModal === "periode" && (
          <PeriodeForm
            formData={formData}
            onChange={handleFormChange}
            onSubmit={handleSubmit}
            onCancel={closeModal}
            loading={modalLoading}
          />
        )}
        {activeModal === "reorder_divisi" && (
          <DivisiReorderModal
            isOpen={true}
            onClose={closeModal}
            divisiList={divisiList}
            activePeriodeId={activeTab}
            onSuccess={fetchInitialData}
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
    </PageContainer>
  );
}

export default DaftarAnggota;
