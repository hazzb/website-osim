// src/pages/DaftarAnggota.jsx
import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

// Styles
import styles from "./DaftarAnggota.module.css";
import formStyles from "../components/admin/AdminForm.module.css";

// Icons (FIXED: Tambahkan FiSearch di sini)
import { FiSearch } from "react-icons/fi";

// Components
import PageContainer from "../components/ui/PageContainer.jsx"; // Pastikan pakai ini untuk Breadcrumb
import Modal from "../components/Modal.jsx";
import AnggotaForm from "../components/forms/AnggotaForm.jsx";
import DivisiForm from "../components/forms/DivisiForm.jsx";
import DivisiReorderModal from "../components/admin/DivisiReorderModal.jsx";
import AnggotaCard from "../components/cards/AnggotaCard.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";

// UI Components (New)
import { FilterBar, FilterSelect } from "../components/ui/FilterBar.jsx";

function DaftarAnggota() {
  const { session } = useAuth();
  const isAdmin = !!session;

  // --- States ---
  const [periodeList, setPeriodeList] = useState([]);
  const [divisiList, setDivisiList] = useState([]);
  const [anggotaList, setAnggotaList] = useState([]);
  const [jabatanList, setJabatanList] = useState([]);

  // Filter States
  const [activeTab, setActiveTab] = useState(""); // Periode ID
  const [selectedDivisi, setSelectedDivisi] = useState("semua");
  const [selectedGender, setSelectedGender] = useState("all");
  const [searchTerm, setSearchTerm] = useState(""); // Tambahkan state Search

  const [loading, setLoading] = useState(true);

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [formFile, setFormFile] = useState(null);
  const [formPreview, setFormPreview] = useState(null);
  const [existingFotoUrl, setExistingFotoUrl] = useState(null);

  // --- Data Fetching ---
  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Periode
      const { data: periodes } = await supabase
        .from("periode_jabatan")
        .select("*")
        .order("tahun_mulai", { ascending: false });
      setPeriodeList(periodes || []);

      if (periodes?.length > 0) {
        const active = periodes.find((p) => p.is_active);
        setActiveTab(active ? active.id : periodes[0].id);
      }

      // 2. Fetch Divisi
      const { data: divisis } = await supabase
        .from("divisi")
        .select("*")
        .order("urutan", { ascending: true });
      setDivisiList(divisis || []);

      // 3. Fetch Jabatan
      const { data: jabatans } = await supabase
        .from("master_jabatan")
        .select("*");
      setJabatanList(jabatans || []);
    } catch (err) {
      console.error("Error fetch:", err);
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

  // --- Helper Functions ---
  const getModalTitle = () => {
    if (activeModal === "reorder_divisi") return "Atur Urutan Divisi";
    const action = editingId ? "Edit" : "Tambah";
    const typeMap = {
      periode: "Periode",
      divisi: "Divisi",
      anggota: "Anggota",
    };
    return `${action} ${typeMap[activeModal] || ""}`;
  };

  const uploadFile = async (file, folder) => {
    const ext = file.name.split(".").pop();
    const fileName = `${folder}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("logos")
      .upload(`${folder}/${fileName}`, file, { upsert: true }); // Ubah ke bucket 'logos' agar konsisten
    if (error) throw new Error(error.message);
    const { data } = supabase.storage
      .from("logos")
      .getPublicUrl(`${folder}/${fileName}`);
    return data.publicUrl;
  };

  // --- Handlers ---
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
      // Default form data logic... (Sama seperti kode asli)
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
      // Logic Upload & Insert/Update (Sama seperti kode asli, pastikan bucket 'logos')
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

  // --- Filtering Logic ---
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

  // --- Render ---
  return (
    <PageContainer breadcrumbText="Daftar Anggota">
      {/* HEADER */}
      <div className={styles["header-section"]}>
        <h1 className="page-title">Daftar Anggota</h1>
        <p style={{ color: "#64748b" }}>Struktur Kepengurusan</p>
      </div>

      {/* ADMIN BUTTONS */}
      {isAdmin && (
        <div className={styles["action-buttons"]}>
          <button
            onClick={() => openModal("anggota")}
            className={`${styles["modern-button"]} ${styles["btn-blue"]}`}
          >
            + Anggota
          </button>
          <button
            onClick={() => openModal("divisi")}
            className={`${styles["modern-button"]} ${styles["btn-orange"]}`}
          >
            + Divisi
          </button>
          <button
            onClick={() => openModal("periode")}
            className={`${styles["modern-button"]} ${styles["btn-purple"]}`}
          >
            + Periode
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

      {/* FILTER BAR (FIXED SEARCH ICON) */}
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

        {/* SEARCH INPUT DENGAN REACT ICON */}
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
              height: "38px", // Samakan tinggi dengan filter select
            }}
          />
        </div>
      </FilterBar>

      {/* CONTENT */}
      {loading ? (
        <LoadingState />
      ) : (
        <div style={{ marginTop: "2rem" }}>
          {sortedDivisiList.map((divisi) => {
            const members = memberMap[divisi.id];
            if (!members || members.length === 0) return null;
            return (
              <section key={divisi.id} className={styles["divisi-section"]}>
                <div className={styles["divisi-header"]}>
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
                  {isAdmin && (
                    <button
                      onClick={() => openModal("divisi", divisi)}
                      style={{ marginLeft: "auto" }}
                    >
                      ✏️
                    </button>
                  )}
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
            /* Render Others... (Sama seperti kode lama) */
            <section className={styles["divisi-section"]}>
              <h2 className={styles["divisi-title"]}>Lainnya</h2>
              <div className={styles["card-grid"]}>
                {memberMap["others"].map((m) => (
                  <AnggotaCard key={m.id} data={m} isAdmin={isAdmin} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* MODALS (Sama seperti kode lama, hanya perlu render form sesuai activeModal) */}
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
        {/* ... Render modal lain (periode, reorder) ... */}
      </Modal>
    </PageContainer>
  );
}

export default DaftarAnggota;
