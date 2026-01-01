import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

// Components
import PageContainer from "../components/ui/PageContainer.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import AnggotaCard from "../components/cards/AnggotaCard.jsx";
import ProgramKerjaCard from "../components/cards/ProgramKerjaCard.jsx";

// Icons
import {
  FiArrowLeft,
  FiUsers,
  FiBriefcase,
  FiImage,
  FiAlertCircle,
  FiLayout, // Icon Compact
  FiGrid, // Icon Aesthetic
} from "react-icons/fi";

// Styles
import styles from "./DivisiDetail.module.css";

function DivisiDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  // STATE VIEW MODE (Default Aesthetic)
  const [viewMode, setViewMode] = useState("aesthetic");

  const [data, setData] = useState({
    divisi: null,
    anggota: [],
    progja: [],
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Ambil Detail Divisi
        const { data: divData, error: divError } = await supabase
          .from("divisi")
          .select("*, periode_jabatan(nama_kabinet)")
          .eq("id", id)
          .single();

        if (divError) throw divError;

        // 2. Ambil Anggota Divisi
        const { data: aggData, error: aggError } = await supabase
          .from("anggota")
          .select("*, master_jabatan(nama_jabatan)")
          .eq("divisi_id", id);

        if (aggError) throw aggError;

        // 3. Ambil Progja Divisi
        const { data: progData, error: progError } = await supabase
          .from("program_kerja")
          .select("*")
          .eq("divisi_id", id)
          .order("tanggal", { ascending: true });

        if (progError) throw progError;

        // Sorting manual Anggota (Ketua -> Wakil -> Anggota)
        const getRank = (jabatan) => {
          const j = jabatan?.toLowerCase() || "";
          if (j.includes("ketua") && !j.includes("wakil")) return 1;
          if (j.includes("wakil")) return 2;
          if (j.includes("sekretaris")) return 3;
          if (j.includes("bendahara")) return 4;
          if (j.includes("koordinator")) return 5;
          if (j.includes("staff ahli")) return 6;
          return 99;
        };

        const sortedAnggota = (aggData || []).sort((a, b) => {
          const rankA = getRank(a.master_jabatan?.nama_jabatan);
          const rankB = getRank(b.master_jabatan?.nama_jabatan);
          if (rankA !== rankB) return rankA - rankB;
          return a.nama.localeCompare(b.nama);
        });

        setData({
          divisi: divData,
          anggota: sortedAnggota,
          progja: progData || [],
        });
      } catch (err) {
        console.error("Error fetching detail:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  // --- RENDERING ---

  if (loading)
    return (
      <PageContainer>
        <LoadingState />
      </PageContainer>
    );

  if (error || !data.divisi) {
    return (
      <PageContainer>
        <div
          style={{
            textAlign: "center",
            padding: "4rem 1rem",
            color: "#64748b",
          }}
        >
          <FiAlertCircle
            size={48}
            style={{ marginBottom: "1rem", color: "#ef4444" }}
          />
          <h2>Divisi Tidak Ditemukan</h2>
          <p>Mungkin divisi ini sudah dihapus atau URL salah.</p>
          <button
            onClick={() => navigate("/anggota")}
            className="button button-primary"
            style={{ marginTop: "1rem" }}
          >
            Kembali ke Daftar
          </button>
        </div>
      </PageContainer>
    );
  }

  const { divisi, anggota, progja } = data;

  return (
    <PageContainer breadcrumbText={divisi.nama_divisi}>
      {/* 1. HEADER */}
      <PageHeader
        title={divisi.nama_divisi}
        subtitle={`Detail profil, anggota, dan program kerja ${divisi.nama_divisi}.`}
        // ACTIONS: TOMBOL KEMBALI & TOGGLE VIEW
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {/* VIEW MODE TOGGLE */}
            <div
              style={{
                display: "flex",
                backgroundColor: "#f1f5f9",
                padding: "2px",
                borderRadius: "6px",
                height: "34px",
              }}
            >
              <button
                onClick={() => setViewMode("compact")}
                title="Tampilan Compact (List)"
                style={{
                  border: "none",
                  borderRadius: "4px",
                  padding: "0 8px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor:
                    viewMode === "compact" ? "white" : "transparent",
                  color: viewMode === "compact" ? "#2563eb" : "#94a3b8",
                  boxShadow:
                    viewMode === "compact"
                      ? "0 1px 2px rgba(0,0,0,0.1)"
                      : "none",
                  transition: "all 0.2s",
                }}
              >
                <FiLayout size={16} />
              </button>
              <button
                onClick={() => setViewMode("aesthetic")}
                title="Tampilan Aesthetic (Grid)"
                style={{
                  border: "none",
                  borderRadius: "4px",
                  padding: "0 8px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor:
                    viewMode === "aesthetic" ? "white" : "transparent",
                  color: viewMode === "aesthetic" ? "#2563eb" : "#94a3b8",
                  boxShadow:
                    viewMode === "aesthetic"
                      ? "0 1px 2px rgba(0,0,0,0.1)"
                      : "none",
                  transition: "all 0.2s",
                }}
              >
                <FiGrid size={16} />
              </button>
            </div>

            {/* BUTTON KEMBALI */}
            <button
              onClick={() => navigate("/anggota")}
              className="button button-secondary"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                height: "34px",
              }}
            >
              <FiArrowLeft /> Kembali
            </button>
          </div>
        }
      />

      {/* 2. INFO CARD */}
      <div className={styles.infoCard}>
        <div className={styles.logoWrapper}>
          {divisi.logo_url ? (
            <img
              src={divisi.logo_url}
              alt="Logo"
              className={styles.logoImage}
            />
          ) : (
            <div className={styles.logoPlaceholder}>
              <FiImage />
            </div>
          )}
        </div>

        <div className={styles.infoContent}>
          <div className={styles.metaInfo}>
            <span className={styles.badge}>
              {divisi.periode_jabatan?.nama_kabinet}
            </span>
            {divisi.tipe && (
              <span
                className={styles.badge}
                style={{ background: "#f1f5f9", color: "#475569" }}
              >
                {divisi.tipe}
              </span>
            )}
          </div>

          <h3
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#1e293b",
              margin: "0.5rem 0",
            }}
          >
            Tentang {divisi.nama_divisi}
          </h3>

          <p className={styles.description}>
            {divisi.deskripsi || "Belum ada deskripsi untuk divisi ini."}
          </p>
        </div>
      </div>

      {/* 3. STRUKTUR ANGGOTA */}
      <div className={styles.sectionWrapper}>
        <h2 className={styles.sectionTitle}>
          <FiUsers style={{ color: "#3b82f6" }} /> Struktur Anggota (
          {anggota.length})
        </h2>

        {anggota.length === 0 ? (
          <div className={styles.emptyState}>
            Belum ada anggota terdaftar di divisi ini.
          </div>
        ) : (
          <div className={styles.grid}>
            {anggota.map((member) => (
              <AnggotaCard
                key={member.id}
                data={{
                  ...member,
                  divisi: { nama_divisi: divisi.nama_divisi },
                }}
                isAdmin={false} // Mode View Only
                showPeriode={false}
                layout={viewMode} // Pass State View Mode
              />
            ))}
          </div>
        )}
      </div>

      {/* 4. PROGRAM KERJA */}
      <div className={styles.sectionWrapper}>
        <h2 className={styles.sectionTitle}>
          <FiBriefcase style={{ color: "#f59e0b" }} /> Program Kerja (
          {progja.length})
        </h2>

        {progja.length === 0 ? (
          <div className={styles.emptyState}>
            Belum ada program kerja yang ditambahkan.
          </div>
        ) : (
          <div className={styles.grid}>
            {progja.map((program) => (
              <ProgramKerjaCard
                key={program.id}
                data={{
                  ...program,
                  nama_divisi: divisi.nama_divisi,
                }}
                isAdmin={false} // Mode View Only
              />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}

export default DivisiDetail;
