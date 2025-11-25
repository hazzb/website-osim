import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import styles from "./ProgramKerjaDetail.module.css";

// ICONS
import {
  FiArrowLeft,
  FiCalendar,
  FiBriefcase,
  FiUser,
  FiExternalLink,
} from "react-icons/fi";

// COMPONENTS
import PageContainer from "../components/ui/PageContainer.jsx"; // IMPORT BARU
import LoadingState from "../components/ui/LoadingState.jsx"; // IMPORT BARU

function ProgramKerjaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [progja, setProgja] = useState(null);
  const [loading, setLoading] = useState(true);

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("program_kerja_detail_view") // Pastikan view ini ada
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Program tidak ditemukan");

        setProgja(data);

        // Trigger Instagram Embed jika ada
        if (data.embed_html) {
          setTimeout(() => {
            if (window.instgrm?.Embeds?.process)
              window.instgrm.Embeds.process();
          }, 500);
        }
      } catch (err) {
        console.error(err);
        // Optional: Redirect
        // navigate("/program-kerja");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  // Helpers
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    if (status === "Selesai") return styles["status-selesai"];
    if (status === "Akan Datang") return styles["status-akan-datang"];
    return styles["status-rencana"];
  };

  // --- LOADING STATE ---
  if (loading) {
    return (
      <PageContainer breadcrumbText="Memuat...">
        <LoadingState message="Memuat detail program..." />
      </PageContainer>
    );
  }

  // --- NOT FOUND ---
  if (!progja) {
    return (
      <PageContainer breadcrumbText="Error">
        <div className={styles.emptyState}>Program Kerja tidak ditemukan.</div>
      </PageContainer>
    );
  }

  return (
    // Menggunakan PageContainer agar breadcrumb otomatis ("Program Kerja" > "Nama Acara")
    <PageContainer breadcrumbText={progja.nama_acara}>
      {/* 1. TOMBOL KEMBALI (Opsional, tapi bagus untuk navigasi cepat) */}
      <div className={styles.navBar}>
        <Link to="/program-kerja" className={styles.backLink}>
          <FiArrowLeft /> Kembali ke Daftar
        </Link>
      </div>

      {/* 2. MAIN CONTENT CARD */}
      <div className={styles.contentCard}>
        {/* A. Media Section (Video/Foto) */}
        {progja.embed_html ? (
          <div className={styles.mediaContainer}>
            <div
              className={styles.embedWrapper}
              dangerouslySetInnerHTML={{ __html: progja.embed_html }}
            />
          </div>
        ) : (
          /* Placeholder jika tidak ada media */
          <div className={styles.noMediaPlaceholder}>
            <span style={{ fontSize: "3rem" }}>📅</span>
          </div>
        )}

        {/* B. Header Info */}
        <div className={styles.headerSection}>
          <div className={styles.topRow}>
            <span
              className={`${styles.statusBadge} ${getStatusClass(
                progja.status
              )}`}
            >
              {progja.status}
            </span>
          </div>

          <h1 className={styles.title}>{progja.nama_acara}</h1>

          {/* Metadata Grid */}
          <div className={styles.metaGrid}>
            {/* Tanggal */}
            <div className={styles.metaItem}>
              <div className={styles.iconBox}>
                <FiCalendar />
              </div>
              <div>
                <span className={styles.metaLabel}>Tanggal Pelaksanaan</span>
                <span className={styles.metaValue}>
                  {formatDate(progja.tanggal)}
                </span>
              </div>
            </div>

            {/* Divisi */}
            <div className={styles.metaItem}>
              <div className={styles.iconBox}>
                <FiBriefcase />
              </div>
              <div>
                <span className={styles.metaLabel}>Divisi Penyelenggara</span>
                <span className={styles.metaValue}>
                  {progja.nama_divisi || "-"}
                </span>
              </div>
            </div>

            {/* PJ */}
            <div className={styles.metaItem}>
              <div className={styles.iconBox}>
                <FiUser />
              </div>
              <div>
                <span className={styles.metaLabel}>Penanggung Jawab</span>
                <span className={styles.metaValue} style={{ color: "#3182ce" }}>
                  {progja.nama_penanggung_jawab || "-"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* C. Body Description */}
        <div className={styles.bodySection}>
          <h3 className={styles.descTitle}>Deskripsi Kegiatan</h3>

          {progja.deskripsi ? (
            <div className={styles.descContent}>
              {progja.deskripsi.split("\n").map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <p className={styles.emptyDesc}>Tidak ada deskripsi detail.</p>
          )}

          {/* Link Dokumentasi External */}
          {progja.link_dokumentasi && (
            <div className={styles.docSection}>
              <a
                href={progja.link_dokumentasi}
                target="_blank"
                rel="noreferrer"
                className={styles.docLink}
              >
                <FiExternalLink /> Lihat Dokumentasi Lengkap
              </a>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

export default ProgramKerjaDetail;
