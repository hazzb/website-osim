// src/pages/ProgramKerja.jsx
// --- VERSI 10.0 (Fix: Logika Pengaturan Tampilan Publik) ---

import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./ProgramKerja.module.css";

// Helper: Toggle Switch
function AdminToggle({ label, isEnabled, onToggle, isSaving }) {
  return (
    <div
      className={`${styles["toggle-wrapper"]} ${isEnabled ? styles.active : ""}`}
      onClick={() => !isSaving && onToggle(!isEnabled)}
      title={
        isEnabled ? "Sedang Ditampilkan ke Publik" : "Disembunyikan dari Publik"
      }
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
  const [error, setError] = useState(null);

  // Filter Dropdown
  const [selectedDivisi, setSelectedDivisi] = useState("semua");
  const [divisiOptions, setDivisiOptions] = useState([]);

  // Admin State
  const { session } = useAuth();
  const isAdmin = !!session;

  // State Pengaturan (Default True semua agar aman jika fetch gagal)
  const [pengaturan, setPengaturan] = useState({
    tampilkan_progja_rencana: true,
    tampilkan_progja_akan_datang: true,
    tampilkan_progja_selesai: true,
  });
  const [isSavingSetting, setIsSavingSetting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Ambil Pengaturan (Pastikan ID = 1)
      const { data: settings, error: setErr } = await supabase
        .from("pengaturan")
        .select("*")
        .eq("id", 1) // Sesuai constraint tabel Anda
        .single();

      if (setErr && setErr.code !== "PGRST116") {
        console.error("Gagal ambil pengaturan:", setErr);
      } else if (settings) {
        setPengaturan(settings);
      }

      // 2. Ambil Data Program Kerja
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
      setError("Gagal memuat data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handler Update Pengaturan
  const handleToggleSetting = async (key, newValue) => {
    setIsSavingSetting(true);

    // 1. Optimistic Update (Ubah tampilan duluan biar cepat)
    setPengaturan((prev) => ({ ...prev, [key]: newValue }));

    try {
      // 2. Update ke Database (ID selalu 1)
      const { error } = await supabase
        .from("pengaturan")
        .update({ [key]: newValue })
        .eq("id", 1); // KUNCI PERBAIKAN: Selalu target ID 1

      if (error) throw error;
    } catch (err) {
      alert("Gagal menyimpan pengaturan: " + err.message);
      // Revert jika gagal
      setPengaturan((prev) => ({ ...prev, [key]: !newValue }));
    } finally {
      setIsSavingSetting(false);
    }
  };

  // --- FILTERING LOGIC ---
  const filterItem = (item, contextStatus) => {
    // 1. Filter Divisi (Dropdown)
    if (selectedDivisi !== "semua" && item.nama_divisi !== selectedDivisi)
      return false;

    // 2. Cek Visibility per Item (Manual Hidden)
    // Jika admin, kita tetap loloskan tapi nanti diberi tanda. Jika publik, harus true.
    if (!isAdmin && !item.tampilkan_di_publik) return false;

    return true;
  };

  // Pisahkan Data
  const listAkanDatang = progjaList.filter(
    (item) => item.status === "Akan Datang" && filterItem(item)
  );
  const listRencana = progjaList.filter(
    (item) => item.status === "Rencana" && filterItem(item)
  );
  const listSelesai = progjaList.filter(
    (item) => item.status === "Selesai" && filterItem(item)
  );

  // --- RENDER SECTION HELPER ---
  const renderSection = (title, list, statusKey, cssClass) => {
    // Cek apakah bagian ini boleh tampil untuk Publik
    const isPublicVisible = pengaturan ? pengaturan[statusKey] : true;

    // LOGIKA TAMPILAN:
    // 1. Jika Publik: Hanya render jika isPublicVisible = TRUE
    // 2. Jika Admin: Selalu render, tapi beri tanda visual jika isPublicVisible = FALSE

    if (!isAdmin && !isPublicVisible) return null; // Publik tidak melihat jika dimatikan
    if (list.length === 0 && !isAdmin) return null; // Publik tidak melihat list kosong

    // Style khusus jika disembunyikan (untuk Admin)
    const sectionStyle =
      !isPublicVisible && isAdmin
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

          {/* Indikator Visual untuk Admin jika bagian ini Hidden */}
          {isAdmin && !isPublicVisible && (
            <span
              style={{
                marginLeft: "auto",
                fontSize: "0.75rem",
                color: "#c53030",
                fontWeight: "bold",
                background: "#fff5f5",
                padding: "2px 8px",
                border: "1px solid #feb2b2",
                borderRadius: "4px",
              }}
            >
              👁️ Disembunyikan dari Publik
            </span>
          )}
        </div>

        {list.length > 0 ? (
          <div className={styles["progja-grid"]}>
            {list.map((item) => (
              <div key={item.id} className={styles.card}>
                {/* Media Area */}
                <div className={styles["media-container"]}>
                  {item.embed_html ? (
                    <div
                      className={styles["embed-wrapper"]}
                      dangerouslySetInnerHTML={{ __html: item.embed_html }}
                    />
                  ) : (
                    <div className={styles["no-media"]}>
                      <span style={{ fontSize: "2rem" }}>📅</span>
                    </div>
                  )}
                </div>

                <div className={styles["card-body"]}>
                  {/* Label Hidden per Item */}
                  {isAdmin && !item.tampilkan_di_publik && (
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "red",
                        border: "1px solid red",
                        padding: "2px 5px",
                        borderRadius: "4px",
                        width: "fit-content",
                        marginBottom: "0.5rem",
                      }}
                    >
                      🔒 Draft (Hidden)
                    </div>
                  )}

                  <h3 className={styles["card-title"]}>{item.nama_acara}</h3>

                  <div className={styles["card-meta"]}>
                    <div className={styles["meta-item"]}>
                      <span>🗓️</span>
                      <span>
                        {new Date(item.tanggal).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    {item.waktu && (
                      <div className={styles["meta-item"]}>
                        <span>⏰</span>
                        <span>{item.waktu}</span>
                      </div>
                    )}
                    {item.tempat && (
                      <div className={styles["meta-item"]}>
                        <span>📍</span>
                        <span>{item.tempat}</span>
                      </div>
                    )}
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
                    {item.deskripsi || "..."}
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
  if (error)
    return (
      <div className="main-content">
        <p className="error-text">{error}</p>
      </div>
    );

  return (
    <div className="main-content">
      <div className={styles["header-section"]}>
        <h1 className="page-title">Program Kerja</h1>
      </div>

      {/* 1. Admin Controls (Switch Global) */}
      {isAdmin && (
        <div className={styles["admin-controls"]}>
          <span className={styles["admin-controls-title"]}>
            Tampilkan ke Publik:
          </span>

          <AdminToggle
            label="Status: Akan Datang"
            isEnabled={pengaturan.tampilkan_progja_akan_datang}
            onToggle={(v) =>
              handleToggleSetting("tampilkan_progja_akan_datang", v)
            }
            isSaving={isSavingSetting}
          />

          <AdminToggle
            label="Status: Rencana"
            isEnabled={pengaturan.tampilkan_progja_rencana}
            onToggle={(v) => handleToggleSetting("tampilkan_progja_rencana", v)}
            isSaving={isSavingSetting}
          />

          <AdminToggle
            label="Status: Selesai"
            isEnabled={pengaturan.tampilkan_progja_selesai}
            onToggle={(v) => handleToggleSetting("tampilkan_progja_selesai", v)}
            isSaving={isSavingSetting}
          />
        </div>
      )}

      {/* 2. Filter Bar */}
      <div className={styles["filter-bar"]}>
        <div className={styles["filter-group"]}>
          <label>Divisi:</label>
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
      </div>

      {/* 3. Render Sections */}

      {/* Akan Datang (Menggunakan kolom 'tampilkan_progja_akan_datang') */}
      {renderSection(
        "🔥 Akan Datang",
        listAkanDatang,
        "tampilkan_progja_akan_datang",
        "title-akan-datang"
      )}

      {/* Rencana (Menggunakan kolom 'tampilkan_progja_rencana') */}
      {renderSection(
        "📌 Rencana Program",
        listRencana,
        "tampilkan_progja_rencana",
        "title-rencana"
      )}

      {/* Selesai (Menggunakan kolom 'tampilkan_progja_selesai') */}
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
