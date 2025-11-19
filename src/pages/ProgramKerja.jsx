// src/pages/ProgramKerja.jsx
// --- VERSI FINAL (Safe Mode: Default Tampil jika Pengaturan Error) ---

import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./ProgramKerja.module.css";

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

function ProgramKerja() {
  const [progjaList, setProgjaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDivisi, setSelectedDivisi] = useState("semua");
  const [divisiOptions, setDivisiOptions] = useState([]);

  const { session } = useAuth();
  const isAdmin = !!session;

  // Default Settings: TRUE (Agar jika fetch gagal, data tetap tampil)
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
      // 1. Fetch Settings (Dengan Error Handling yang senyap)
      const { data: settings } = await supabase
        .from("pengaturan")
        .select("*")
        .eq("id", 1)
        .single();
      if (settings) setPengaturan(settings);

      // 2. Fetch Program Kerja (Langsung dari tabel, bukan view)
      const { data: progja, error: err } = await supabase
        .from("program_kerja")
        .select(
          `
          *,
          divisi ( nama_divisi ),
          anggota ( nama )
        `
        )
        .order("tanggal", { ascending: false });

      if (err) throw err;

      // Flatten Data
      const formatted = (progja || []).map((p) => ({
        ...p,
        nama_divisi: p.divisi?.nama_divisi || "-",
        nama_penanggung_jawab: p.anggota?.nama || "-",
      }));

      setProgjaList(formatted);
      const uniqueDivisi = [
        ...new Set(
          formatted.map((p) => p.nama_divisi).filter((d) => d !== "-")
        ),
      ];
      setDivisiOptions(uniqueDivisi.sort());
    } catch (err) {
      console.error("Error loading data:", err.message);
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

  // --- FILTER LOGIC ---
  const filterItem = (item) => {
    if (selectedDivisi !== "semua" && item.nama_divisi !== selectedDivisi)
      return false;

    // Logic Publik / Preview
    if (!isAdmin || viewPublicMode) {
      // 1. Cek Hidden Individual (Jika NULL dianggap TRUE/Tampil)
      if (item.tampilkan_di_publik === false) return false;

      // 2. Cek Global Settings (Jika undefined dianggap TRUE/Tampil)
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

  const listAkanDatang = progjaList.filter(
    (item) => item.status === "Akan Datang" && filterItem(item)
  );
  const listRencana = progjaList.filter(
    (item) => item.status === "Rencana" && filterItem(item)
  );
  const listSelesai = progjaList.filter(
    (item) => item.status === "Selesai" && filterItem(item)
  );

  const renderSection = (title, list, statusKey, cssClass) => {
    // Helper visibility
    const isGlobalVisible = pengaturan[statusKey] !== false;
    const isPreviewOrPublic = !isAdmin || viewPublicMode;

    // Jika publik/preview, sembunyikan jika kosong atau dimatikan global
    if (isPreviewOrPublic) {
      if (list.length === 0) return null;
      if (!isGlobalVisible) return null;
    }

    // Style redup untuk Admin
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
                background: "#fff5f5",
                padding: "2px 8px",
                borderRadius: "4px",
                border: "1px solid red",
              }}
            >
              Hidden Global
            </span>
          )}
        </div>

        {list.length > 0 ? (
          <div className={styles["progja-grid"]}>
            {list.map((item) => (
              <div key={item.id} className={styles.card}>
                {/* Media */}
                {item.embed_html && (
                  <div className={styles["media-container"]}>
                    <div
                      className={styles["embed-wrapper"]}
                      dangerouslySetInnerHTML={{ __html: item.embed_html }}
                    />
                  </div>
                )}

                <div className={styles["card-body"]}>
                  {/* Badge Status */}
                  <span
                    className={`${styles["status-badge"]} ${item.status === "Selesai" ? styles["status-selesai"] : item.status === "Akan Datang" ? styles["status-akan-datang"] : styles["status-rencana"]}`}
                  >
                    {item.status}
                  </span>

                  {/* Admin Hidden Label */}
                  {isAdmin &&
                    !viewPublicMode &&
                    item.tampilkan_di_publik === false && (
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "red",
                          border: "1px solid red",
                          padding: "1px 5px",
                          borderRadius: "4px",
                          display: "inline-block",
                          marginBottom: "0.5rem",
                          marginLeft: "0.5rem",
                        }}
                      >
                        🔒 Hidden Item
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
          <p className="info-text" style={{ fontStyle: "italic" }}>
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

  return (
    <div className="main-content">
      <div className={styles["header-section"]}>
        <h1 className="page-title">Program Kerja</h1>
      </div>

      {isAdmin && (
        <div className={styles["admin-controls"]}>
          <span className={styles["admin-controls-title"]}>
            Tampilkan Status:
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
        </div>
      )}

      <div className={styles["filter-bar"]}>
        <div className={styles["filter-group"]}>
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
        {isAdmin && (
          <label
            className={`${styles["preview-toggle"]} ${viewPublicMode ? styles.active : ""}`}
          >
            <input
              type="checkbox"
              checked={viewPublicMode}
              onChange={() => setViewPublicMode(!viewPublicMode)}
            />
            <span>Preview Publik</span>
          </label>
        )}
      </div>

      {renderSection(
        "🔥 Akan Datang",
        listAkanDatang,
        "tampilkan_progja_akan_datang",
        "title-akan-datang"
      )}
      {renderSection(
        "📌 Rencana Program",
        listRencana,
        "tampilkan_progja_rencana",
        "title-rencana"
      )}
      {renderSection(
        "✅ Terlaksana / Selesai",
        listSelesai,
        "tampilkan_progja_selesai",
        "title-selesai"
      )}
    </div>
  );
}

export default ProgramKerja;
