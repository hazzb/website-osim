import React, { useState, useEffect } from "react";
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
  FiUser,
  FiExternalLink,
  FiXCircle,
} from "react-icons/fi";

import PageContainer from "../components/ui/PageContainer.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import ProgramKerjaCard from "../components/cards/ProgramKerjaCard.jsx";
import Modal from "../components/Modal.jsx";
import ProgramKerjaForm from "../components/forms/ProgramKerjaForm.jsx";

// ... (OptionToggle Component biarkan sama) ...
const OptionToggle = ({ label, icon: Icon, isEnabled, onToggle, isSaving }) => (
  <div
    className={styles.toggleItem}
    onClick={() => !isSaving && onToggle(!isEnabled)}
    style={{ opacity: isSaving ? 0.5 : 1 }}
  >
    <div className={styles.toggleLabel}>
      {Icon && <Icon size={16} color={isEnabled ? "#3b82f6" : "#94a3b8"} />}
      <span style={{ color: isEnabled ? "#1e293b" : "#94a3b8" }}>{label}</span>
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
  const [activeTab, setActiveTab] = useState("");
  const [periodeList, setPeriodeList] = useState([]);
  const [progjaList, setProgjaList] = useState([]);
  const [divisiList, setDivisiList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDivisi, setSelectedDivisi] = useState("semua");
  const [selectedStatus, setSelectedStatus] = useState("semua");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Visibility (Ganti 'akanDatang' jadi 'batal')
  const [visibleSections, setVisibleSections] = useState({
    rencana: true,
    selesai: true,
    batal: true,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  const [formDivisiList, setFormDivisiList] = useState([]);
  const [formPeriodeList, setFormPeriodeList] = useState([]);
  const [formAnggotaList, setFormAnggotaList] = useState([]);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchInit = async () => {
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
          .order("nama_divisi");
        setDivisiList(divisis || []);
        setFormDivisiList(divisis || []);
        setFormPeriodeList(periodes || []);

        const { data: settings } = await supabase
          .from("pengaturan_website")
          .select("key, value");
        if (settings) {
          const newVis = { ...visibleSections };
          settings.forEach((s) => {
            if (s.key === "tampilkan_progja_rencana")
              newVis.rencana = s.value === "true";
            if (s.key === "tampilkan_progja_selesai")
              newVis.selesai = s.value === "true";
            // Mapping setting lama ke UI baru
            if (s.key === "tampilkan_progja_akan_datang")
              newVis.batal = s.value === "true";
          });
          setVisibleSections(newVis);
        }

        const { data: members } = await supabase
          .from("anggota")
          .select("id, nama")
          .order("nama");
        setFormAnggotaList(members || []);
      } catch (err) {
        console.error("Init Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInit();
  }, []);

  useEffect(() => {
    if (!activeTab) return;
    const fetchProgja = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("program_kerja")
          .select(
            `*, divisi (nama_divisi, logo_url), pj:anggota!penanggung_jawab_id (nama)`
          )
          .order("tanggal", { ascending: true });

        if (activeTab !== "semua") query = query.eq("periode_id", activeTab);

        const { data, error } = await query;
        if (error) throw error;
        setProgjaList(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgja();
  }, [activeTab]);

  // --- HANDLER FORM (PERBAIKAN BUG EMBED) ---

  // 1. Handler Change yang Aman
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 2. Submit dengan Payload Eksplisit (Mengatasi Bug Embed)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      // Cek apakah string embed kosong/hanya spasi? Jika ya, set NULL.
      const cleanEmbed =
        formData.embed_html && formData.embed_html.trim().length > 0
          ? formData.embed_html
          : null;

      // Konstruksi Payload Manual (Jangan pakai ...formData agar bersih)
      const payload = {
        nama_acara: formData.nama_acara,
        tanggal: formData.tanggal,
        status: formData.status,
        deskripsi: formData.deskripsi,
        link_dokumentasi: formData.link_dokumentasi || null,
        embed_html: cleanEmbed, // Pastikan ini null jika kosong
        divisi_id: parseInt(formData.divisi_id),
        periode_id: parseInt(formData.periode_id),
        penanggung_jawab_id: formData.penanggung_jawab_id,
      };

      if (editingId) {
        const { error } = await supabase
          .from("program_kerja")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("program_kerja").insert(payload);
        if (error) throw error;
      }

      // Reload halaman agar data segar
      window.location.reload();
    } catch (err) {
      alert("Gagal menyimpan: " + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // --- FILTER & OTOMATISASI ---
  const filteredList = progjaList.filter((item) => {
    const matchDivisi =
      selectedDivisi === "semua" ||
      String(item.divisi_id) === String(selectedDivisi);
    const matchStatus =
      selectedStatus === "semua" || item.status === selectedStatus;
    const matchSearch =
      searchTerm === "" ||
      item.nama_acara.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStart = startDate === "" || item.tanggal >= startDate;
    const matchEnd = endDate === "" || item.tanggal <= endDate;
    return matchDivisi && matchStatus && matchSearch && matchStart && matchEnd;
  });

  const getListBySection = (sectionName) => {
    // Dapatkan tanggal hari ini (YYYY-MM-DD)
    const today = new Date().toISOString().split("T")[0];

    if (sectionName === "Rencana") {
      // Rencana: Status 'Rencana' DAN Tanggalnya >= Hari Ini
      return filteredList.filter(
        (p) => p.status === "Rencana" && p.tanggal >= today
      );
    }

    if (sectionName === "Selesai") {
      // Selesai: Status 'Selesai' ATAU (Status 'Rencana' TAPI Tanggalnya < Hari Ini/Sudah Lewat)
      return filteredList.filter(
        (p) =>
          p.status === "Selesai" ||
          (p.status === "Rencana" && p.tanggal < today)
      );
    }

    if (sectionName === "Batal") {
      // Batal: Khusus status 'Batal'
      return filteredList.filter((p) => p.status === "Batal");
    }

    return [];
  };

  // ... (Sisa fungsi: handlers modal, delete, render, dll sama) ...
  const toggleSection = async (key, dbKey, value) => {
    setVisibleSections((prev) => ({ ...prev, [key]: value }));
    if (isAdmin)
      await supabase
        .from("pengaturan_website")
        .upsert({ key: dbKey, value: String(value) }, { onConflict: "key" });
  };

  const openModal = (item = null) => {
    setEditingId(item ? item.id : null);
    setFormData(
      item
        ? { ...item }
        : {
            nama_acara: "",
            deskripsi: "",
            status: "Rencana",
            tanggal: new Date().toISOString().split("T")[0],
            divisi_id: "",
            periode_id: activeTab !== "semua" ? activeTab : "",
            penanggung_jawab_id: "",
            link_dokumentasi: "",
            embed_html: "",
          }
    );
    setIsModalOpen(true);
  };

  const openDetail = (item) => {
    setDetailItem(item);
    setIsDetailModalOpen(true);
  };
  const handleDelete = async (id) => {
    if (!confirm("Hapus?")) return;
    try {
      await supabase.from("program_kerja").delete().eq("id", id);
      setProgjaList((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const renderSection = (title, list, visibilityKey, titleClass, icon) => {
    if (!visibleSections[visibilityKey] && !isAdmin) return null;
    if (list.length === 0 && !visibleSections[visibilityKey]) return null;
    return (
      <section className={styles.timelineSection}>
        <div className={styles.sectionHeader}>
          <h3 className={`${styles.sectionTitle} ${styles[titleClass]}`}>
            {icon} {title}
          </h3>
          <span className={styles.sectionCount}>{list.length}</span>
        </div>
        {list.length === 0 ? (
          <p className={styles.emptyText}>Tidak ada program.</p>
        ) : (
          <div className={styles.masonryGrid}>
            {list.map((progja) => (
              <div key={progja.id} className={styles.masonryItem}>
                <ProgramKerjaCard
                  data={progja}
                  isAdmin={isAdmin}
                  onEdit={() => openModal(progja)}
                  onDelete={() => handleDelete(progja.id)}
                  onDetail={() => openDetail(progja)}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    );
  };

  // EFFECT INSTAGRAM
  useEffect(() => {
    if (isDetailModalOpen && detailItem?.embed_html?.includes("instagram")) {
      if (window.instgrm)
        setTimeout(() => window.instgrm.Embeds.process(), 200);
      else {
        const script = document.createElement("script");
        script.src = "//www.instagram.com/embed.js";
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, [isDetailModalOpen, detailItem]);

  return (
    <PageContainer breadcrumbText="Program Kerja">
      <PageHeader
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span>Program Kerja</span>
          </div>
        }
        subtitle="Timeline kegiatan dan agenda organisasi."
        actions={
          isAdmin && (
            <button
              onClick={() => openModal()}
              className="button button-primary"
            >
              <FiPlus /> Program Baru
            </button>
          )
        }
        searchBar={
          <div style={{ width: "100%" }}>
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              style={{
                width: "100%",
                height: "40px",
                padding: "0 0.5rem",
                borderRadius: "8px",
                border: "1px solid #cbd5e0",
              }}
            >
              {periodeList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama_kabinet}
                </option>
              ))}
            </select>
          </div>
        }
        filters={
          <>
            <div
              style={{
                width: "100%",
                marginBottom: "0.5rem",
                borderBottom: "1px dashed #e2e8f0",
                position: "relative",
              }}
            >
              <FiSearch
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "12px",
                  color: "#94a3b8",
                }}
              />
              <input
                type="text"
                placeholder="Cari nama acara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  height: "40px",
                  paddingLeft: "35px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e0",
                }}
              />
            </div>
            <div
              style={{
                width: "100%",
                display: "flex",
                gap: "0.5rem",
                alignItems: "flex-end",
                paddingBottom: "0.5rem",
                borderBottom: "1px dashed #e2e8f0",
                marginBottom: "0.5rem",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "#64748b",
                    marginBottom: "2px",
                  }}
                >
                  Dari
                </div>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    width: "100%",
                    height: "38px",
                    padding: "0 0.5rem",
                    border: "1px solid #cbd5e0",
                    borderRadius: "8px",
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "#64748b",
                    marginBottom: "2px",
                  }}
                >
                  Sampai
                </div>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    width: "100%",
                    height: "38px",
                    padding: "0 0.5rem",
                    border: "1px solid #cbd5e0",
                    borderRadius: "8px",
                  }}
                />
              </div>
            </div>
            <div style={{ flex: 1, minWidth: "150px" }}>
              <FilterSelect
                label="Divisi"
                value={selectedDivisi}
                onChange={(e) => setSelectedDivisi(e.target.value)}
              >
                <option value="semua">Semua</option>
                {divisiList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nama_divisi}
                  </option>
                ))}
              </FilterSelect>
            </div>
            <div style={{ flex: 1, minWidth: "150px" }}>
              <FilterSelect
                label="Status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="semua">Semua</option>
                <option value="Rencana">Rencana</option>
                <option value="Selesai">Selesai</option>
                <option value="Batal">Batal</option>
              </FilterSelect>
            </div>
          </>
        }
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
                Pengaturan Tampilan
              </div>
              <OptionToggle
                label="Section: Rencana"
                icon={FiTarget}
                isEnabled={visibleSections.rencana}
                onToggle={(val) =>
                  toggleSection("rencana", "tampilkan_progja_rencana", val)
                }
              />
              <OptionToggle
                label="Section: Selesai"
                icon={FiCheckCircle}
                isEnabled={visibleSections.selesai}
                onToggle={(val) =>
                  toggleSection("selesai", "tampilkan_progja_selesai", val)
                }
              />
              <OptionToggle
                label="Section: Batal / Gagal"
                icon={FiXCircle}
                isEnabled={visibleSections.batal}
                onToggle={(val) =>
                  toggleSection("batal", "tampilkan_progja_akan_datang", val)
                }
              />
            </div>
          )
        }
      />

      {loading ? (
        <ProgjaSkeletonGrid />
      ) : (
        <div className={styles.contentWrapper}>
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
          {renderSection(
            "Batal / Gagal",
            getListBySection("Batal"),
            "batal",
            "titleAkanDatang",
            <FiXCircle />
          )}
        </div>
      )}

      {isAdmin && isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingId ? "Edit Program" : "Tambah Program"}
        >
          {/* Perbaikan: Pass handleFormChange sebagai onChange */}
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

      {isDetailModalOpen && detailItem && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title="Detail Program Kerja"
          maxWidth="600px"
        >
          <div style={{ padding: "0.5rem" }}>
            {detailItem.embed_html && (
              <div
                style={{
                  width: "100%",
                  aspectRatio: detailItem.embed_html.includes("instagram")
                    ? "auto"
                    : "16/9",
                  background: "#f1f5f9",
                  borderRadius: "12px",
                  overflow: "hidden",
                  marginBottom: "1.5rem",
                  display: "flex",
                  justifyContent: "center",
                }}
                dangerouslySetInnerHTML={{
                  __html: detailItem.embed_html
                    .replace(/width="\d+"/g, 'width="100%"')
                    .replace(
                      /<iframe([^>]+)height="\d+"/g,
                      '<iframe$1height="100%"'
                    ),
                }}
              />
            )}
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "800",
                color: "#1e293b",
                marginBottom: "0.5rem",
              }}
            >
              {detailItem.nama_acara}
            </h2>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1rem",
                marginBottom: "1.5rem",
                fontSize: "0.9rem",
                color: "#64748b",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <FiCalendar />{" "}
                {new Date(detailItem.tanggal).toLocaleDateString("id-ID", {
                  dateStyle: "full",
                })}
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <FiUser /> PJ: {detailItem.pj?.nama || "-"}
              </div>
              <div>
                <span
                  style={{
                    padding: "2px 8px",
                    background: "#e0f2fe",
                    color: "#0284c7",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                  }}
                >
                  {detailItem.status}
                </span>
              </div>
            </div>
            <div
              style={{
                background: "#f8fafc",
                padding: "1.5rem",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
              }}
            >
              <h4 style={{ margin: "0 0 0.5rem 0", color: "#334155" }}>
                Deskripsi
              </h4>
              <p
                style={{
                  whiteSpace: "pre-wrap",
                  color: "#475569",
                  lineHeight: "1.6",
                }}
              >
                {detailItem.deskripsi || "Tidak ada deskripsi."}
              </p>
            </div>
            {detailItem.link_dokumentasi && (
              <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
                <a
                  href={detailItem.link_dokumentasi}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button button-primary"
                  style={{ display: "inline-flex", gap: "8px" }}
                >
                  <FiExternalLink /> Buka Dokumen / LPJ
                </a>
              </div>
            )}
          </div>
        </Modal>
      )}
    </PageContainer>
  );
}

export default ProgramKerja;
