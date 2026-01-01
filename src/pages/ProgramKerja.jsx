import React, { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import styles from "./ProgramKerja.module.css";
import { ProgjaSkeletonGrid } from "../components/ui/Skeletons.jsx";
import { FilterSelect } from "../components/ui/FilterBar.jsx";

import {
  FiPlus,
  FiCalendar,
  FiTarget,
  FiCheckCircle,
  FiSearch,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

// COMPONENTS
import PageContainer from "../components/ui/PageContainer.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import ProgramKerjaCard from "../components/cards/ProgramKerjaCard.jsx";
import Modal from "../components/Modal.jsx";
import ProgramKerjaForm from "../components/forms/ProgramKerjaForm.jsx";

// --- KOMPONEN TOGGLE (Untuk Menu Opsi) ---
const OptionToggle = ({ label, icon: Icon, isEnabled, onToggle, isSaving }) => (
  <div
    className={styles.toggleItem}
    onClick={() => !isSaving && onToggle(!isEnabled)}
  >
    <div className={styles.toggleLabel}>
      {Icon && <Icon size={16} color="#64748b" />}
      {label}
    </div>
    <div className={`${styles.switchTrack} ${isEnabled ? styles.active : ""}`}>
      <div className={styles.switchKnob} />
    </div>
  </div>
);

function ProgramKerja() {
  const { session } = useAuth();
  const isAdmin = !!session;

  // --- STATE ---
  const [activeTab, setActiveTab] = useState(""); // Filter Periode
  const [periodeList, setPeriodeList] = useState([]);

  const [progjaList, setProgjaList] = useState([]);
  const [divisiList, setDivisiList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [selectedDivisi, setSelectedDivisi] = useState("semua");
  const [selectedStatus, setSelectedStatus] = useState("semua");
  const [searchTerm, setSearchTerm] = useState("");

  // Toggle Visibility State (Default true)
  const [visibleSections, setVisibleSections] = useState({
    akanDatang: true,
    rencana: true,
    selesai: true,
  });

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});

  // Data Master untuk Form
  const [formDivisiList, setFormDivisiList] = useState([]);
  const [formPeriodeList, setFormPeriodeList] = useState([]);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchInit = async () => {
      setLoading(true);
      try {
        // 1. Periode
        const { data: periodes } = await supabase
          .from("periode_jabatan")
          .select("*")
          .order("tahun_mulai", { ascending: false });
        setPeriodeList(periodes || []);

        // Set default active tab
        if (periodes?.length > 0 && !activeTab) {
          const active = periodes.find((p) => p.is_active);
          setActiveTab(active ? active.id : periodes[0].id);
        }

        // 2. Divisi (Untuk Filter)
        const { data: divisis } = await supabase
          .from("divisi")
          .select("*")
          .order("nama_divisi");
        setDivisiList(divisis || []);
        setFormDivisiList(divisis || []);
        setFormPeriodeList(periodes || []);

        // 3. Settings (Visibility)
        const { data: settings } = await supabase
          .from("pengaturan_website")
          .select("key, value");
        if (settings) {
          const newVis = { ...visibleSections };
          settings.forEach((s) => {
            if (s.key === "tampilkan_progja_akan_datang")
              newVis.akanDatang = s.value === "true";
            if (s.key === "tampilkan_progja_rencana")
              newVis.rencana = s.value === "true";
            if (s.key === "tampilkan_progja_selesai")
              newVis.selesai = s.value === "true";
          });
          setVisibleSections(newVis);
        }
      } catch (err) {
        console.error("Init Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInit();
  }, []); // Run once on mount

  // Fetch Progja saat Periode Berubah
  useEffect(() => {
    if (!activeTab) return;
    const fetchProgja = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("program_kerja")
          .select("*, divisi(nama_divisi, logo_url)")
          .order("tanggal", { ascending: true });

        if (activeTab !== "semua") {
          query = query.eq("periode_id", activeTab);
        }

        const { data, error } = await query;
        if (error) throw error;
        setProgjaList(data || []);
      } catch (err) {
        console.error("Fetch Progja Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgja();
  }, [activeTab]);

  // --- HANDLERS ---
  const toggleSection = async (key, dbKey, value) => {
    setVisibleSections((prev) => ({ ...prev, [key]: value }));
    if (isAdmin) {
      // Simpan ke DB jika admin
      await supabase
        .from("pengaturan_website")
        .upsert({ key: dbKey, value: String(value) }, { onConflict: "key" });
    }
  };

  // CRUD Handlers (Simpan, Edit, Hapus) - Sama seperti sebelumnya
  const openModal = (item = null) => {
    setEditingId(item ? item.id : null);
    setFormData(
      item
        ? { ...item }
        : {
            nama_program: "",
            deskripsi: "",
            status: "Rencana",
            tanggal: new Date().toISOString().split("T")[0],
            divisi_id: "",
            periode_id: activeTab !== "semua" ? activeTab : "",
          }
    );
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      const payload = { ...formData };
      if (editingId) {
        await supabase
          .from("program_kerja")
          .update(payload)
          .eq("id", editingId);
      } else {
        await supabase.from("program_kerja").insert(payload);
      }
      // Refresh Data (Simple reload for now, or re-fetch)
      window.location.reload();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus program ini?")) return;
    try {
      await supabase.from("program_kerja").delete().eq("id", id);
      setProgjaList((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  // --- FILTERING ---
  const filteredList = progjaList.filter((item) => {
    const matchDivisi =
      selectedDivisi === "semua" ||
      String(item.divisi_id) === String(selectedDivisi);
    const matchStatus =
      selectedStatus === "semua" || item.status === selectedStatus;
    const matchSearch =
      searchTerm === "" ||
      item.nama_program.toLowerCase().includes(searchTerm.toLowerCase());
    return matchDivisi && matchStatus && matchSearch;
  });

  // Grouping
  const getListBySection = (sectionName) => {
    if (sectionName === "Akan Datang") {
      // Logic khusus: Status 'Terjadwal' ATAU (Rencana tapi ada tanggal dekat)
      return filteredList.filter((p) => p.status === "Terjadwal");
    }
    return filteredList.filter((p) => p.status === sectionName);
  };

  // Render Section Helper
  const renderSection = (title, list, visibilityKey, titleClass, icon) => {
    if (!visibleSections[visibilityKey] && !isAdmin) return null; // User biasa gak liat jika hidden
    if (list.length === 0 && !visibleSections[visibilityKey]) return null; // Hide empty if hidden setting is on

    return (
      <section className={styles.timelineSection}>
        <div className={styles.sectionHeader}>
          <h3 className={`${styles.sectionTitle} ${styles[titleClass]}`}>
            {icon} {title}
          </h3>
          <span className={styles.sectionCount}>{list.length}</span>
        </div>

        {list.length === 0 ? (
          <p
            style={{
              color: "#94a3b8",
              fontStyle: "italic",
              fontSize: "0.9rem",
            }}
          >
            Tidak ada program.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {list.map((progja) => (
              <ProgramKerjaCard
                key={progja.id}
                data={progja}
                isAdmin={isAdmin}
                onEdit={() => openModal(progja)}
                onDelete={() => handleDelete(progja.id)}
              />
            ))}
          </div>
        )}
      </section>
    );
  };

  return (
    <PageContainer breadcrumbText="Program Kerja">
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
            <span>Program Kerja</span>
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
                {
                  periodeList.find((p) => String(p.id) === String(activeTab))
                    ?.nama_kabinet
                }
              </span>
            )}
          </div>
        }
        subtitle="Timeline kegiatan dan agenda organisasi."
        // --- 1. ACTIONS (HANYA TOMBOL TAMBAH) ---
        actions={
          isAdmin && (
            <button
              onClick={() => openModal()}
              className="button button-primary"
              title="Tambah Program"
            >
              <FiPlus /> Program Baru
            </button>
          )
        }
        // --- 2. SEARCH BAR + FILTER PERIODE ---
        searchBar={
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              width: "100%",
              alignItems: "center",
            }}
          >
            {/* Filter Periode */}
            <div style={{ flex: "0 0 140px" }}>
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
                }}
              >
                <option value="semua">Semua Periode</option>
                {periodeList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama_kabinet} ({p.tahun_mulai})
                  </option>
                ))}
              </select>
            </div>
            {/* Input Cari */}
            <div style={{ flex: 1, position: "relative" }}>
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
                placeholder="Cari program..."
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
              />
            </div>
          </div>
        }
        // --- 3. FILTERS (Status & Divisi) ---
        filters={
          <>
            <div style={{ flex: 1, minWidth: "150px" }}>
              <FilterSelect
                label="Filter Divisi"
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
            </div>
            <div style={{ flex: 1, minWidth: "150px" }}>
              <FilterSelect
                label="Filter Status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="semua">Semua Status</option>
                <option value="Terjadwal">Akan Datang</option>
                <option value="Rencana">Rencana</option>
                <option value="Selesai">Selesai</option>
              </FilterSelect>
            </div>
          </>
        }
        // --- 4. OPTIONS (Toggle Visibility) ---
        options={
          isAdmin && (
            <div style={{ width: "100%", minWidth: "250px" }}>
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  color: "#94a3b8",
                  marginBottom: "0.5rem",
                  textTransform: "uppercase",
                }}
              >
                Tampilan Publik
              </div>
              <OptionToggle
                label="Akan Datang"
                icon={FiCalendar}
                isEnabled={visibleSections.akanDatang}
                onToggle={(val) =>
                  toggleSection(
                    "akanDatang",
                    "tampilkan_progja_akan_datang",
                    val
                  )
                }
              />
              <OptionToggle
                label="Rencana Program"
                icon={FiTarget}
                isEnabled={visibleSections.rencana}
                onToggle={(val) =>
                  toggleSection("rencana", "tampilkan_progja_rencana", val)
                }
              />
              <OptionToggle
                label="Selesai / Terlaksana"
                icon={FiCheckCircle}
                isEnabled={visibleSections.selesai}
                onToggle={(val) =>
                  toggleSection("selesai", "tampilkan_progja_selesai", val)
                }
              />
            </div>
          )
        }
      />

      {/* CONTENT LIST */}
      {loading ? (
        <ProgjaSkeletonGrid />
      ) : filteredList.length === 0 ? (
        <div className={styles.emptyState}>
          <span
            style={{ fontSize: "3rem", display: "block", marginBottom: "1rem" }}
          >
            📅
          </span>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>
            Belum ada Program Kerja
          </h3>
          <p>Tidak ada data yang sesuai dengan filter Anda.</p>
        </div>
      ) : (
        <div className={styles.contentWrapper}>
          {renderSection(
            "Akan Datang",
            getListBySection("Akan Datang"),
            "akanDatang",
            "titleAkanDatang",
            <FiCalendar />
          )}
          {renderSection(
            "Rencana Program",
            getListBySection("Rencana"),
            "rencana",
            "titleRencana",
            <FiTarget />
          )}
          {renderSection(
            "Terlaksana / Selesai",
            getListBySection("Selesai"),
            "selesai",
            "titleSelesai",
            <FiCheckCircle />
          )}
        </div>
      )}

      {/* MODAL FORM */}
      {isAdmin && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingId ? "Edit Program Kerja" : "Tambah Program Kerja"}
        >
          <ProgramKerjaForm
            formData={formData}
            onChange={(e) =>
              setFormData({ ...formData, [e.target.name]: e.target.value })
            }
            onSubmit={handleSubmit}
            onCancel={() => setIsModalOpen(false)}
            loading={modalLoading}
            periodeList={formPeriodeList}
            divisiList={formDivisiList}
          />
        </Modal>
      )}
    </PageContainer>
  );
}

export default ProgramKerja;
