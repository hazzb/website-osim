import React, { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import styles from "./ProgramKerja.module.css";
import {
  FilterBar,
  FilterSelect,
  FilterPill,
} from "../components/ui/FilterBar.jsx";
import ProgramKerjaCard from "../components/cards/ProgramKerjaCard.jsx";
import Modal from "../components/Modal.jsx";
import ProgramKerjaForm from "../components/forms/ProgramKerjaForm.jsx";

function AdminToggle({ label, isEnabled, onToggle, isSaving }) {
  return (
    <div
      className={`${styles["toggle-wrapper"]} ${isEnabled ? styles.active : ""}`}
      onClick={() => !isSaving && onToggle(!isEnabled)}
    >
      <div className={styles["toggle-switch"]}>
        <div className={styles["toggle-knob"]}></div>
      </div>
      <span className={styles["toggle-label"]}>{label}</span>
    </div>
  );
}

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

  const [progjaList, setProgjaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [divisiOptions, setDivisiOptions] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("semua");
  const [selectedDivisi, setSelectedDivisi] = useState("semua");

  const [pengaturan, setPengaturan] = useState({
    tampilkan_progja_rencana: true,
    tampilkan_progja_akan_datang: true,
    tampilkan_progja_selesai: true,
  });
  const [isSavingSetting, setIsSavingSetting] = useState(false);
  const [viewPublicMode, setViewPublicMode] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});

  const [formPeriodeList, setFormPeriodeList] = useState([]);
  const [formDivisiList, setFormDivisiList] = useState([]);
  const [formAnggotaList, setFormAnggotaList] = useState([]);

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

  const progjaListRef = useRef(progjaList);
  useEffect(() => {
    progjaListRef.current = progjaList;
    const timer = setTimeout(processInstagramEmbeds, 100);
    return () => clearTimeout(timer);
  }, [progjaList, selectedStatus, selectedDivisi]);

  const handleToggleSetting = async (key, newValue) => {
    setIsSavingSetting(true);
    setPengaturan((prev) => ({ ...prev, [key]: newValue }));
    try {
      await supabase
        .from("pengaturan")
        .update({ [key]: newValue })
        .eq("id", 1);
    } catch (err) {
      setPengaturan((prev) => ({ ...prev, [key]: !newValue }));
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
    if (!window.confirm("Yakin hapus?")) return;
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

  const renderSection = (title, list, statusKey, cssClass) => {
    const isGlobalVisible = pengaturan[statusKey] !== false;
    if (list.length === 0) return null;
    if ((!isAdmin || viewPublicMode) && !isGlobalVisible) return null;
    const sectionStyle =
      isAdmin && !viewPublicMode && !isGlobalVisible
        ? {
            opacity: 0.6,
            border: "2px dashed #cbd5e0",
            padding: "1rem",
            borderRadius: "8px",
            background: "#f7fafc",
          }
        : {};

    return (
      <section className={styles["timeline-section"]} style={sectionStyle}>
        <div className={styles["section-header"]}>
          <h2 className={`${styles["section-title"]} ${styles[cssClass]}`}>
            {title}
          </h2>
          <span className={styles["section-count"]}>{list.length}</span>
          {isAdmin && !viewPublicMode && !isGlobalVisible && (
            <span
              style={{
                marginLeft: "auto",
                fontSize: "0.7rem",
                color: "red",
                border: "1px solid red",
                padding: "2px 6px",
                borderRadius: "4px",
              }}
            >
              Hidden
            </span>
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

  if (loading)
    return (
      <div className="main-content">
        <p className="loading-text">Memuat...</p>
      </div>
    );

  return (
    <div className="main-content">
      <div className={styles["header-section"]}>
        <h1 className="page-title">Program Kerja</h1>
      </div>

      {isAdmin && (
        <div className={styles["admin-controls"]}>
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
            onToggle={(v) => handleToggleSetting("tampilkan_progja_rencana", v)}
            isSaving={isSavingSetting}
          />
          <AdminToggle
            label="Selesai"
            isEnabled={pengaturan.tampilkan_progja_selesai !== false}
            onToggle={(v) => handleToggleSetting("tampilkan_progja_selesai", v)}
            isSaving={isSavingSetting}
          />
          <button
            onClick={() => openModal()}
            className="button button-primary"
            style={{
              marginLeft: "auto",
              fontSize: "0.85rem",
              padding: "0.4rem 1rem",
            }}
          >
            + Tambah Program
          </button>
        </div>
      )}

      <FilterBar>
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
        {isAdmin && (
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <label className={styles["preview-toggle"]}>
              <input
                type="checkbox"
                checked={viewPublicMode}
                onChange={() => setViewPublicMode(!viewPublicMode)}
              />
              <span>Preview Tamu</span>
            </label>
          </div>
        )}
      </FilterBar>

      {filteredList.length === 0 ? (
        <div className={styles["empty-state"]}>
          <span className={styles["empty-icon"]}>📭</span>
          <h3 className={styles["empty-title"]}>Belum ada Program Kerja</h3>
          <p className={styles["empty-desc"]}>Tidak ada data sesuai filter.</p>
        </div>
      ) : (
        <>
          {renderSection(
            "🔥 Akan Datang",
            getListBySection("Akan Datang"),
            "tampilkan_progja_akan_datang",
            "title-akan-datang"
          )}
          {renderSection(
            "📌 Rencana Program",
            getListBySection("Rencana"),
            "tampilkan_progja_rencana",
            "title-rencana"
          )}
          {renderSection(
            "✅ Terlaksana / Selesai",
            getListBySection("Selesai"),
            "tampilkan_progja_selesai",
            "title-selesai"
          )}
        </>
      )}

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
    </div>
  );
}
export default ProgramKerja;
