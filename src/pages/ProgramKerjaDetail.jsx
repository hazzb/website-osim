// src/pages/ProgramKerjaDetail.jsx

import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import styles from "./ProgramKerjaDetail.module.css";

function ProgramKerjaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [progja, setProgja] = useState(null);
  const [loading, setLoading] = useState(true);

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
        navigate("/program-kerja"); // Redirect jika not found
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

  if (loading)
    return (
      <div className="main-content">
        <p className="loading-text">Memuat detail...</p>
      </div>
    );
  if (!progja) return null;

  return (
    <div className="main-content">
      <div className={styles.container}>
        {/* Navigation */}
        <div className={styles.navBar}>
          <Link to="/program-kerja" className={styles.backLink}>
            &larr; Kembali ke Program Kerja
          </Link>
        </div>

        {/* Main Content Card */}
        <div className={styles.contentCard}>
          {/* 1. Media Section (Video/Foto) */}
          {progja.embed_html ? (
            <div className={styles.mediaContainer}>
              <div
                className={styles.embedWrapper}
                dangerouslySetInnerHTML={{ __html: progja.embed_html }}
              />
            </div>
          ) : (
            <div className={styles.noMediaPlaceholder} />
          )}

          {/* 2. Header Info */}
          <div className={styles.headerSection}>
            <div className={styles.topRow}>
              <span
                className={`${styles.statusBadge} ${getStatusClass(progja.status)}`}
              >
                {progja.status}
              </span>
            </div>

            <h1 className={styles.title}>{progja.nama_acara}</h1>

            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <span className={styles.metaIcon}>🗓️</span>
                <div>
                  <span className={styles.metaLabel}>Tanggal</span>
                  <span className={styles.metaValue}>
                    {formatDate(progja.tanggal)}
                  </span>
                </div>
              </div>

              <div className={styles.metaItem}>
                <span className={styles.metaIcon}>🏢</span>
                <div>
                  <span className={styles.metaLabel}>Divisi</span>
                  <span className={styles.metaValue}>
                    {progja.nama_divisi || "-"}
                  </span>
                </div>
              </div>

              <div className={styles.metaItem}>
                <span className={styles.metaIcon}>👤</span>
                <div>
                  <span className={styles.metaLabel}>Penanggung Jawab</span>
                  <span
                    className={styles.metaValue}
                    style={{ color: "#3182ce" }}
                  >
                    {progja.nama_penanggung_jawab || "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Body Description */}
          <div className={styles.bodySection}>
            {/* Render newlines as paragraphs */}
            {progja.deskripsi ? (
              progja.deskripsi
                .split("\n")
                .map((paragraph, idx) => <p key={idx}>{paragraph}</p>)
            ) : (
              <p style={{ fontStyle: "italic", color: "#a0aec0" }}>
                Tidak ada deskripsi detail.
              </p>
            )}

            {/* Link Dokumentasi External (Opsional) */}
            {progja.link_dokumentasi && (
              <div
                style={{
                  marginTop: "2rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid #edf2f7",
                }}
              >
                <a
                  href={progja.link_dokumentasi}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: "#3182ce",
                    fontWeight: "600",
                    textDecoration: "none",
                  }}
                >
                  📂 Lihat Dokumentasi Lengkap &rarr;
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProgramKerjaDetail;
