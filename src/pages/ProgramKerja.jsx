import React, { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import styles from "./ProgramKerja.module.css";
import {
  FilterBar,
  FilterSelect,
  FilterPill,
} from "../components/ui/FilterBar.jsx";

import {
  FiPlus,
  FiEye,
  FiEyeOff,
  FiCalendar, // Untuk "Akan Datang"
  FiTarget, // Untuk "Rencana"
  FiCheckCircle, // Untuk "Selesai"
} from "react-icons/fi";

// COMPONENTS
import PageContainer from "../components/ui/PageContainer.jsx"; // IMPORT BARU
import LoadingState from "../components/ui/LoadingState.jsx"; // IMPORT BARU
import ProgramKerjaCard from "../components/cards/ProgramKerjaCard.jsx";
import Modal from "../components/Modal.jsx";
import ProgramKerjaForm from "../components/forms/ProgramKerjaForm.jsx";

// --- KOMPONEN TOGGLE KHUSUS ADMIN ---
function AdminToggle({ label, isEnabled, onToggle, isSaving }) {
  return (
    <div
      className={`${styles["toggle-wrapper"]} ${
        isEnabled ? styles.active : ""
      }`}
      onClick={() => !isSaving && onToggle(!isEnabled)}
      title={isEnabled ? `Sembunyikan ${label}` : `Tampilkan ${label}`}
    >
      <div className={styles["toggle-switch"]}>
        <div className={styles["toggle-knob"]}></div>
      </div>
      <span className={styles["toggle-label"]}>{label}</span>
    </div>
  );
}

// --- HELPER INSTAGRAM EMBED ---
function processInstagramEmbeds() {
  if (window.instgrm?.Embeds?.process) {
    window.instgrm.Embeds.process();
  } else if (!document.getElementById("instagram-embed-script")) {
    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.id = "instagram-embed-script";
    script.src = "https://www.instagram.com/embed.js";
    document.head.appendChild(script);
    script.onload = () => {
      if (window.instgrm?.Embeds?.process) window.instgrm.Embeds.process();
    };
  }
}

function ProgramKerja() {
  const { session } = useAuth();
  const isAdmin = !!session;

  // --- STATES ---
  const [progjaList, setProgjaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [divisiOptions, setDivisiOptions] = useState([]);

  // Filter States
  const [selectedStatus, setSelectedStatus] = useState("semua");
  const [selectedDivisi, setSelectedDivisi] = useState("semua");

  // Admin Settings
  const [pengaturan, setPengaturan] = useState({
    tampilkan_progja_rencana: true,
    tampilkan_progja_akan_datang: true,
    tampilkan_progja_selesai: true,
  });
  const [isSavingSetting, setIsSavingSetting] = useState(false);
  const [viewPublicMode, setViewPublicMode] = useState(false);

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});

  // Dropdowns
  const [formPeriodeList, setFormPeriodeList] = useState([]);
  const [formDivisiList, setFormDivisiList] = useState([]);
  const [formAnggotaList, setFormAnggotaList] = useState([]);

  // --- FETCH DATA ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: settings } = await supabase
        .from("pengaturan")
        .select("*")
        .eq("id", 1)
        .single();
      if (settings) setPengaturan(settings);

      const { data: progja, error } = await supabase
        .from("program_kerja_detail_view")
        .select("*")
        .order("tanggal", { ascending: false });
      if (error) throw error;

      setProgjaList(progja || []);

      // Ambil list divisi unik untuk filter
      const uniqueDivisi = [
        ...new Set(progja.map((p) => p.nama_divisi).filter(Boolean)),
      ];
      setDivisiOptions(uniqueDivisi.sort());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFormDropdowns = async () => {
    if (formPeriodeList.length > 0) return;
    const { data: p } = await supabase
      .from("periode_jabatan")
      .select("id, nama_kabinet")
      .order("tahun_mulai", { ascending: false });
    setFormPeriodeList(p || []);
    const { data: d } = await supabase
      .from("divisi")
      .select("id, nama_divisi")
      .order("nama_divisi");
    setFormDivisiList(d || []);
    const { data: a } = await supabase
      .from("anggota")
      .select("id, nama")
      .order("nama");
    setFormAnggotaList(a || []);
  };

  // --- EFFECTS ---
  // Re-process Instagram embed saat list berubah
  const progjaListRef = useRef(progjaList);
  useEffect(() => {
    progjaListRef.current = progjaList;
    const timer = setTimeout(processInstagramEmbeds, 500); // Delay sedikit agar DOM ready
    return () => clearTimeout(timer);
  }, [progjaList, selectedStatus, selectedDivisi]);

  // --- HANDLERS ---
  const handleToggleSetting = async (key, newValue) => {
    setIsSavingSetting(true);
    setPengaturan((prev) => ({ ...prev, [key]: newValue }));
    try {
      await supabase
        .from("pengaturan")
        .update({ [key]: newValue })
        .eq("id", 1);
    } catch (err) {
      setPengaturan((prev) => ({ ...prev, [key]: !newValue })); // Revert on error
    } finally {
      setIsSavingSetting(false);
    }
  };

  const openModal = async (item = null) => {
    setModalLoading(true);
    await fetchFormDropdowns();
    setModalLoading(false);
    if (item) {
      setEditingId(item.id);
      setFormData({
        nama_acara: item.nama_acara,
        tanggal: item.tanggal,
        status: item.status,
        deskripsi: item.deskripsi || "",
        link_dokumentasi: item.link_dokumentasi || "",
        divisi_id: item.divisi_id,
        penanggung_jawab_id: item.penanggung_jawab_id,
        periode_id: item.periode_id,
        embed_html: item.embed_html || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        status: "Rencana",
        nama_acara: "",
        tanggal: "",
        deskripsi: "",
        link_dokumentasi: "",
        embed_html: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus program kerja ini?")) return;
    try {
      const { error } = await supabase
        .from("program_kerja")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setProgjaList((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      if (editingId)
        await supabase
          .from("program_kerja")
          .update(formData)
          .eq("id", editingId);
      else await supabase.from("program_kerja").insert(formData);

      alert("Berhasil disimpan!");
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert("Gagal: " + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // --- FILTER LOGIC ---
  const visibleStatusOptions = useMemo(() => {
    const options = ["Semua"];
    if (isAdmin || pengaturan.tampilkan_progja_akan_datang)
      options.push("Akan Datang");
    if (isAdmin || pengaturan.tampilkan_progja_rencana) options.push("Rencana");
    if (isAdmin || pengaturan.tampilkan_progja_selesai) options.push("Selesai");
    return options;
  }, [isAdmin, pengaturan]);

  useEffect(() => {
    if (
      !visibleStatusOptions.includes(
        selectedStatus === "Semua" ? "Semua" : selectedStatus
      )
    )
      setSelectedStatus("semua");
  }, [visibleStatusOptions, selectedStatus]);

  const filteredList = progjaList.filter((item) => {
    if (selectedDivisi !== "semua" && item.nama_divisi !== selectedDivisi)
      return false;
    if (selectedStatus !== "semua" && item.status !== selectedStatus)
      return false;

    // Logic Visibilitas Publik
    if (!isAdmin || viewPublicMode) {
      if (item.tampilkan_di_publik === false) return false;
      if (item.status === "Rencana" && !pengaturan.tampilkan_progja_rencana)
        return false;
      if (
        item.status === "Akan Datang" &&
        !pengaturan.tampilkan_progja_akan_datang
      )
        return false;
      if (item.status === "Selesai" && !pengaturan.tampilkan_progja_selesai)
        return false;
    }
    return true;
  });

  const getListBySection = (status) =>
    filteredList.filter((item) => item.status === status);

  // --- RENDER SECTION HELPER ---
  const renderSection = (title, list, statusKey, cssClass, Icon) => {
    const isGlobalVisible = pengaturan[statusKey] !== false;
    if (list.length === 0) return null;
    if ((!isAdmin || viewPublicMode) && !isGlobalVisible) return null;

    const isAdminViewStyle =
      isAdmin && !viewPublicMode && !isGlobalVisible
        ? {
            opacity: 0.75,
            border: "2px dashed #cbd5e0",
            background: "#f8fafc",
            padding: "1rem",
            borderRadius: "12px",
          }
        : {};

    return (
      <section className={styles["timeline-section"]} style={isAdminViewStyle}>
        <div className={styles["section-header"]}>
          {/* Render Judul dengan Ikon */}
          <h2 className={`${styles["section-title"]} ${styles[cssClass]}`}>
            {Icon && <span className={styles["title-icon"]}>{Icon}</span>}
            {title}
          </h2>

          <span className={styles["section-count"]}>{list.length}</span>

          {isAdmin && !viewPublicMode && !isGlobalVisible && (
            <span className={styles["hidden-badge"]}>Hidden</span>
          )}
        </div>

        <div className={styles["progja-grid"]}>
          {list.map((item) => (
            <ProgramKerjaCard
              key={item.id}
              data={item}
              isAdmin={isAdmin && !viewPublicMode}
              onEdit={() => openModal(item)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </section>
    );
  };

  // --- LOADING STATE ---
  if (loading) {
    return (
      <PageContainer breadcrumbText="Memuat...">
        <LoadingState message="Mengambil data Program Kerja..." />
      </PageContainer>
    );
  }

  // --- MAIN RENDER ---
  return (
    <PageContainer breadcrumbText="Program Kerja">
      {/* 1. HEADER & ADMIN CONTROLS */}
      <div className={styles["header-section"]}>
        {isAdmin && (
          <div className={styles["admin-controls"]}>
            <div className={styles["admin-toggles"]}>
              <span className={styles["admin-controls-title"]}>
                Tampilkan di Publik:
              </span>
              <AdminToggle
                label="Akan Datang"
                isEnabled={pengaturan.tampilkan_progja_akan_datang !== false}
                onToggle={(v) =>
                  handleToggleSetting("tampilkan_progja_akan_datang", v)
                }
                isSaving={isSavingSetting}
              />
              <AdminToggle
                label="Rencana"
                isEnabled={pengaturan.tampilkan_progja_rencana !== false}
                onToggle={(v) =>
                  handleToggleSetting("tampilkan_progja_rencana", v)
                }
                isSaving={isSavingSetting}
              />
              <AdminToggle
                label="Selesai"
                isEnabled={pengaturan.tampilkan_progja_selesai !== false}
                onToggle={(v) =>
                  handleToggleSetting("tampilkan_progja_selesai", v)
                }
                isSaving={isSavingSetting}
              />
            </div>

            <button
              onClick={() => openModal()}
              className="button button-primary"
            >
              <FiPlus /> Tambah Program
            </button>
          </div>
        )}
      </div>

      {/* 2. FILTER BAR */}
      <FilterBar>
        {/* Filter Status (Pills) */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {visibleStatusOptions.map((status) => (
            <FilterPill
              key={status}
              label={status}
              active={
                selectedStatus === (status === "Semua" ? "semua" : status)
              }
              onClick={() =>
                setSelectedStatus(status === "Semua" ? "semua" : status)
              }
            />
          ))}
        </div>

        {/* Filter Divisi (Dropdown) */}
        <FilterSelect
          label="Divisi"
          value={selectedDivisi}
          onChange={(e) => setSelectedDivisi(e.target.value)}
        >
          <option value="semua">Semua Divisi</option>
          {divisiOptions.map((div, idx) => (
            <option key={idx} value={div}>
              {div}
            </option>
          ))}
        </FilterSelect>

        {/* Preview Mode (Admin Only) */}
        {isAdmin && (
          <div className={styles["preview-toggle-wrapper"]}>
            <button
              className={`${styles["preview-btn"]} ${
                viewPublicMode ? styles.active : ""
              }`}
              onClick={() => setViewPublicMode(!viewPublicMode)}
              title={
                viewPublicMode
                  ? "Keluar dari mode preview"
                  : "Lihat sebagai tamu"
              }
            >
              {viewPublicMode ? <FiEyeOff /> : <FiEye />}
              <span>Preview Tamu</span>
            </button>
          </div>
        )}
      </FilterBar>

      {/* 3. CONTENT LIST */}
      {filteredList.length === 0 ? (
        <div className={styles["empty-state"]}>
          <span className={styles["empty-icon"]}>📭</span>
          <h3 className={styles["empty-title"]}>Belum ada Program Kerja</h3>
          <p className={styles["empty-desc"]}>
            Tidak ada data yang sesuai dengan filter Anda.
          </p>
        </div>
      ) : (
        <div className={styles["content-wrapper"]}>
          {renderSection(
            "Akan Datang",
            getListBySection("Akan Datang"),
            "tampilkan_progja_akan_datang",
            "title-akan-datang",
            <FiCalendar /> // Ikon Baru
          )}
          {renderSection(
            "Rencana Program",
            getListBySection("Rencana"),
            "tampilkan_progja_rencana",
            "title-rencana",
            <FiTarget /> // Ikon Baru
          )}
          {renderSection(
            "Terlaksana / Selesai",
            getListBySection("Selesai"),
            "tampilkan_progja_selesai",
            "title-selesai",
            <FiCheckCircle /> // Ikon Baru
          )}
        </div>
      )}

      {/* 4. MODAL FORM */}
      {isAdmin && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingId ? "Edit Program Kerja" : "Tambah Program Kerja"}
        >
          <ProgramKerjaForm
            formData={formData}
            onChange={handleFormChange}
            onSubmit={handleSubmit}
            onCancel={() => setIsModalOpen(false)}
            loading={modalLoading}
            periodeList={formPeriodeList}
            divisiList={formDivisiList}
            anggotaList={formAnggotaList}
          />
        </Modal>
      )}
    </PageContainer>
  );
}

export default ProgramKerja;
