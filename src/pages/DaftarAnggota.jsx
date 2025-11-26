import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

// UI Components
import PageContainer from "../components/ui/PageContainer.jsx";
import { AnggotaSkeletonGrid } from "../components/ui/Skeletons.jsx"; // Skeleton
import { FilterBar, FilterSelect } from "../components/ui/FilterBar.jsx";
import AnggotaCard from "../components/cards/AnggotaCard.jsx";
import Modal from "../components/Modal.jsx";

// Forms
import AnggotaForm from "../components/forms/AnggotaForm.jsx";
import DivisiForm from "../components/forms/DivisiForm.jsx";
import DivisiReorderModal from "../components/admin/DivisiReorderModal.jsx";
import FormInput from "../components/admin/FormInput.jsx";

// Styles
import styles from "./DaftarAnggota.module.css";
import formStyles from "../components/admin/AdminForm.module.css";

// Icons (PASTIKAN FISEARCH DAN ARROW ADA)
import { FiSearch, FiArrowRight, FiPlus, FiEdit } from "react-icons/fi";

function DaftarAnggota() {
  const { session } = useAuth();
  const isAdmin = !!session;

  // --- STATE ---
  const [periodeList, setPeriodeList] = useState([]);
  const [divisiList, setDivisiList] = useState([]);
  const [anggotaList, setAnggotaList] = useState([]);
  const [jabatanList, setJabatanList] = useState([]);

  // Filter
  const [activeTab, setActiveTab] = useState(""); // Periode
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
      // Periode
      const { data: periodes } = await supabase
        .from("periode_jabatan")
        .select("*")
        .order("tahun_mulai", { ascending: false });
      setPeriodeList(periodes || []);
      if (periodes?.length > 0) {
        const active = periodes.find((p) => p.is_active);
        setActiveTab(active ? active.id : periodes[0].id);
      }

      // Divisi
      const { data: divisis } = await supabase
        .from("divisi")
        .select("*")
        .order("urutan", { ascending: true });
      setDivisiList(divisis || []);

      // Jabatan
      const { data: jabatans } = await supabase
        .from("master_jabatan")
        .select("*");
      setJabatanList(jabatans || []);
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
    const action = editingId ? "Edit" : "Tambah";
    return `${action} ${activeModal || ""}`;
  };

  const uploadFile = async (file, folder) => {
    const ext = file.name.split(".").pop();
    const fileName = `${folder}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("logos")
      .upload(`${folder}/${fileName}`, file, { upsert: true });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage
      .from("logos")
      .getPublicUrl(`${folder}/${fileName}`);
    return data.publicUrl;
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

    if (type === "reorder_divisi") {
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
      if (activeModal === "anggota" || activeModal === "divisi") {
        if (formFile)
          payload[activeModal === "anggota" ? "foto_url" : "logo_url"] =
            await uploadFile(formFile, activeModal);
      }
      const table = activeModal === "periode" ? "periode_jabatan" : activeModal;
      if (editingId)
        await supabase.from(table).update(payload).eq("id", editingId);
      else await supabase.from(table).insert(payload);

      alert("Berhasil disimpan!");
      if (activeModal === "anggota") fetchAnggota(activeTab);
      else fetchInitialData();
      closeModal();
    } catch (err) {
      alert(err.message);
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
      {/* HEADER & STICKY WRAPPER */}
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

        {/* 1. TOMBOL PINTASAN ADMIN (DIKEMBALIKAN) */}
        {isAdmin && (
          <div
            className={styles["action-buttons"]}
            style={{ marginBottom: "1rem" }}
          >
            <button
              onClick={() => openModal("anggota")}
              className={`${styles["modern-button"]} ${styles["btn-blue"]}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <FiPlus /> Anggota
            </button>
            <button
              onClick={() => openModal("divisi")}
              className={`${styles["modern-button"]} ${styles["btn-orange"]}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <FiPlus /> Divisi
            </button>
            <button
              onClick={() => openModal("periode")}
              className={`${styles["modern-button"]} ${styles["btn-purple"]}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <FiPlus /> Periode
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
            <option value="all">Semua</option>
            <option value="Ikhwan">Ikhwan</option>
            <option value="Akhwat">Akhwat</option>
          </FilterSelect>

          {/* 3. INPUT SEARCH DENGAN IKON FiSearch (DIKEMBALIKAN) */}
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
        /* SKELETON SCREEN (DIKEMBALIKAN) */
        <AnggotaSkeletonGrid />
      ) : anggotaList.length === 0 ? (
        <div className={styles.emptyState}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📂</div>
          <p>Tidak ada data anggota ditemukan untuk filter ini.</p>
        </div>
      ) : (
        <div className={styles.contentWrapper}>
          {sortedDivisiList.map((divisi) => {
            const members = memberMap[divisi.id];
            if (!members || members.length === 0) return null;
            return (
              <section key={divisi.id} className={styles["divisi-section"]}>
                {/* HEADER DIVISI DENGAN TOMBOL LIHAT DETAIL */}
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
                    {/* 2. LINK LIHAT DETAIL (DIKEMBALIKAN) */}
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
          <form onSubmit={handleSubmit}>
            <div className={formStyles["form-grid"]}>
              <FormInput
                label="Nama Kabinet"
                name="nama_kabinet"
                type="text"
                value={formData.nama_kabinet || ""}
                onChange={handleFormChange}
                required
                span="col-span-3"
              />
              <FormInput
                label="Mulai"
                name="tahun_mulai"
                type="number"
                value={formData.tahun_mulai || ""}
                onChange={handleFormChange}
                required
                span="col-span-1"
              />
              <FormInput
                label="Selesai"
                name="tahun_selesai"
                type="number"
                value={formData.tahun_selesai || ""}
                onChange={handleFormChange}
                required
                span="col-span-1"
              />
              <FormInput
                label="Aktif?"
                name="is_active"
                type="select"
                value={formData.is_active}
                onChange={handleFormChange}
                span="col-span-1"
              >
                <option value={false}>Tidak</option>
                <option value={true}>Ya</option>
              </FormInput>
            </div>
            <div className={formStyles["form-footer"]}>
              <button
                type="button"
                onClick={closeModal}
                className="button button-secondary"
              >
                Batal
              </button>
              <button
                type="submit"
                className="button button-primary"
                disabled={modalLoading}
              >
                {modalLoading ? "Simpan..." : "Simpan"}
              </button>
            </div>
          </form>
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
      </Modal>
    </PageContainer>
  );
}

export default DaftarAnggota;
