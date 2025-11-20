// src/pages/ProgramKerja.jsx
// --- VERSI 11.2 (Status Filter Pill & Admin Toggle) ---

import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./ProgramKerja.module.css";

function AdminToggle({ label, isEnabled, onToggle, isSaving }) {
  return (
    <div
      className={`${styles["toggle-wrapper"]} ${
        isEnabled ? styles.active : ""
      }`}
      onClick={() => !isSaving && onToggle(!isEnabled)}
    >
      <div className={styles["toggle-switch"]}>
        <div className={styles["toggle-knob"]}></div>
      </div>
      <span className={styles["toggle-label"]}>{label}</span>
    </div>
  );
}

function ProgramKerja() {
  const [progjaList, setProgjaList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [selectedStatus, setSelectedStatus] = useState("semua"); // Default 'semua'
  const [selectedDivisi, setSelectedDivisi] = useState("semua");
  const [divisiOptions, setDivisiOptions] = useState([]);

  const { session } = useAuth();
  const isAdmin = !!session;

  const [pengaturan, setPengaturan] = useState({
    tampilkan_progja_rencana: true,
    tampilkan_progja_akan_datang: true,
    tampilkan_progja_selesai: true,
  });
  const [isSavingSetting, setIsSavingSetting] = useState(false);
  const [viewPublicMode, setViewPublicMode] = useState(false);

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

      const { data: progja, error: err } = await supabase
        .from("program_kerja_detail_view")
        .select("*")
        .order("tanggal", { ascending: false });

      if (err) throw err;
      setProgjaList(progja || []);

      const uniqueDivisi = [
        ...new Set(progja.map((p) => p.nama_divisi).filter(Boolean)),
      ];
      setDivisiOptions(uniqueDivisi.sort());
    } catch (err) {
      console.error("Gagal memuat data:", err.message);
    } finally {
      setLoading(false);
    }
  };

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

  const filterItem = (item) => {
    // 1. Filter Divisi
    if (selectedDivisi !== "semua" && item.nama_divisi !== selectedDivisi)
      return false;

    // 2. Filter Status (PILL) - Cek logic ini
    if (selectedStatus !== "semua") {
      // Pastikan casing huruf cocok (biasanya Title Case di DB)
      if (item.status !== selectedStatus) return false;
    }

    // 3. Filter Publik/Admin
    if (!isAdmin || viewPublicMode) {
      if (item.tampilkan_di_publik === false) return false;
      const p = pengaturan || {};
      if (item.status === "Rencana" && p.tampilkan_progja_rencana === false)
        return false;
      if (
        item.status === "Akan Datang" &&
        p.tampilkan_progja_akan_datang === false
      )
        return false;
      if (item.status === "Selesai" && p.tampilkan_progja_selesai === false)
        return false;
    }
    return true;
  };

  // Karena kita punya filter status global (Pill), kita tidak perlu memisahkan list di renderSection
  // Kita kirim list yang sudah terfilter penuh
  const filteredList = progjaList.filter(filterItem);

  // Kita perlu memisahkan list HANYA UNTUK RENDER SECTION, tapi tetap menghormati filter status
  const getListBySection = (status) =>
    filteredList.filter((item) => item.status === status);

  const renderSection = (title, list, statusKey, cssClass) => {
    const isGlobalVisible = pengaturan[statusKey] !== false;
    const isPreviewOrPublic = !isAdmin || viewPublicMode;

    // Jika filter status aktif dan bukan status ini, jangan render section ini
    if (
      selectedStatus !== "semua" &&
      selectedStatus !== list[0]?.status &&
      list.length === 0
    )
      return null;

    if (isPreviewOrPublic && list.length === 0) return null;

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
                fontSize: "0.75rem",
                color: "red",
                background: "#fff5f5",
                padding: "2px 8px",
                border: "1px solid red",
                borderRadius: "4px",
              }}
            >
              👁️ Hidden
            </span>
          )}
        </div>

        {list.length > 0 ? (
          <div className={styles["progja-grid"]}>
            {list.map((item) => (
              <div key={item.id} className={styles.card}>
                {item.embed_html && (
                  <div className={styles["media-container"]}>
                    <div
                      className={styles["embed-wrapper"]}
                      dangerouslySetInnerHTML={{ __html: item.embed_html }}
                    />
                  </div>
                )}
                <div className={styles["card-body"]}>
                  <span
                    className={`${styles["status-badge"]} ${
                      item.status === "Selesai"
                        ? styles["status-selesai"]
                        : item.status === "Akan Datang"
                        ? styles["status-akan-datang"]
                        : styles["status-rencana"]
                    }`}
                  >
                    {item.status}
                  </span>
                  {isAdmin &&
                    !viewPublicMode &&
                    item.tampilkan_di_publik === false && (
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "red",
                          border: "1px solid red",
                          padding: "2px 5px",
                          borderRadius: "4px",
                          display: "inline-block",
                          marginLeft: "0.5rem",
                        }}
                      >
                        🔒 Hidden
                      </div>
                    )}
                  <h3 className={styles["card-title"]}>{item.nama_acara}</h3>
                  <div className={styles["card-meta"]}>
                    <div className={styles["meta-item"]}>
                      <span>🗓️</span>
                      <span>
                        {new Date(item.tanggal).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                    <div className={styles["meta-item"]}>
                      <span>🏢</span>
                      <span>{item.nama_divisi}</span>
                    </div>
                    <div
                      className={styles["meta-item"]}
                      style={{ color: "#2b6cb0" }}
                    >
                      <span>👤</span>
                      <span>{item.nama_penanggung_jawab}</span>
                    </div>
                  </div>
                  <p className={styles["card-desc"]}>
                    {item.deskripsi || "Tidak ada deskripsi."}
                  </p>
                  <div className={styles["card-footer"]}>
                    <Link
                      to={`/program-kerja/${item.id}`}
                      className={styles["btn-detail"]}
                    >
                      Detail &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "#718096", fontStyle: "italic" }}>
            Tidak ada data.
          </p>
        )}
      </section>
    );
  };

  if (loading)
    return (
      <div className="main-content">
        <p className="loading-text">Memuat...</p>
      </div>
    );

  const statusOptions = ["Semua", "Akan Datang", "Rencana", "Selesai"];

  return (
    <div className="main-content">
      <div className={styles["header-section"]}>
        <h1 className="page-title">Program Kerja</h1>
      </div>

      {isAdmin && (
        <div className={styles["admin-controls"]}>
          <span className={styles["admin-controls-title"]}>Tampilkan:</span>
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
        </div>
      )}

      <div className={styles["filter-bar"]}>
        {/* 1. PILL STATUS FILTER (BARU) */}
        <div className={styles["status-pills-container"]}>
          {statusOptions.map((status) => (
            <button
              key={status}
              className={`${styles["status-pill"]} ${
                selectedStatus === (status === "Semua" ? "semua" : status)
                  ? styles.active
                  : ""
              }`}
              onClick={() =>
                setSelectedStatus(status === "Semua" ? "semua" : status)
              }
            >
              {status}
            </button>
          ))}
        </div>

        {/* 2. DIVISI DROPDOWN (Tetap Pill Style) */}
        <div className={styles["filter-group"]} style={{ marginLeft: "auto" }}>
          <label className={styles["filter-label"]}>Divisi:</label>
          <select
            className={styles["filter-select"]}
            value={selectedDivisi}
            onChange={(e) => setSelectedDivisi(e.target.value)}
          >
            <option value="semua">Semua Divisi</option>
            {divisiOptions.map((div, idx) => (
              <option key={idx} value={div}>
                {div}
              </option>
            ))}
          </select>
        </div>

        {/* 3. PREVIEW MODE */}
        {isAdmin && (
          <label
            className={`${styles["preview-toggle"]} ${
              viewPublicMode ? styles.active : ""
            }`}
          >
            <input
              type="checkbox"
              checked={viewPublicMode}
              onChange={() => setViewPublicMode(!viewPublicMode)}
            />
            <span>Preview</span>
          </label>
        )}
      </div>

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
    </div>
  );
}

export default ProgramKerja;
