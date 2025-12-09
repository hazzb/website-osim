import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

// Components
import PageContainer from "../components/ui/PageContainer.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import AnggotaCard from "../components/cards/AnggotaCard.jsx";
import ProgramKerjaCard from "../components/cards/ProgramKerjaCard.jsx"; // Pastikan komponen ini ada

// Icons
import { FiArrowLeft, FiUsers, FiBriefcase, FiLayers } from "react-icons/fi";

// Styles
import styles from "./DivisiDetail.module.css";

function DivisiDetail() {
  const { id } = useParams(); // Ambil ID dari URL
  const [loading, setLoading] = useState(true);
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

        // 2. Ambil Anggota di Divisi ini
        const { data: angData, error: angError } = await supabase
          .from("anggota")
          .select("*")
          .eq("divisi_id", id)
          .order("id", { ascending: true }); // Atau order by jabatan level jika ada

        if (angError) throw angError;

        // 3. Ambil Program Kerja di Divisi ini
        const { data: progData, error: progError } = await supabase
          .from("program_kerja") // Gunakan tabel atau view detail
          .select("*")
          .eq("divisi_id", id)
          .order("tanggal", { ascending: false });

        if (progError) throw progError;

        setData({
          divisi: divData,
          anggota: angData || [],
          progja: progData || [],
        });
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data divisi.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (loading)
    return (
      <PageContainer>
        <LoadingState message="Memuat detail divisi..." />
      </PageContainer>
    );

  if (error || !data.divisi)
    return (
      <PageContainer>
        <Link to="/daftar-anggota" className={styles.backButton}>
          <FiArrowLeft /> Kembali
        </Link>
        <div className={styles.emptyState}>
          <h3>Data Tidak Ditemukan</h3>
          <p>Divisi yang Anda cari tidak tersedia atau telah dihapus.</p>
        </div>
      </PageContainer>
    );

  const { divisi, anggota, progja } = data;

  return (
    <PageContainer>
      {/* Tombol Kembali */}
      <div className={styles.stickyHeader}>
        <Link to="/anggota" className={styles.backButton}>
          <FiArrowLeft /> Kembali ke Daftar
        </Link>
      </div>

      {/* HEADER: INFO DIVISI */}
      <div className={styles.headerCard}>
        <div className={styles.logoWrapper}>
          {divisi.logo_url ? (
            <img
              src={divisi.logo_url}
              alt={divisi.nama_divisi}
              className={styles.logoImage}
            />
          ) : (
            <FiLayers size={40} color="#cbd5e0" />
          )}
        </div>
        <div className={styles.infoWrapper}>
          <div className={styles.periodeBadge}>
            {divisi.periode_jabatan?.nama_kabinet || "Periode Tidak Diketahui"}
          </div>
          <h1 className={styles.title}>{divisi.nama_divisi}</h1>
          <p className={styles.description}>
            {divisi.deskripsi || "Tidak ada deskripsi untuk divisi ini."}
          </p>
        </div>
      </div>

      {/* BAGIAN 1: ANGGOTA */}
      <div>
        <h2 className={styles.sectionTitle}>
          <FiUsers /> Struktur Anggota
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
                  divisi: { nama_divisi: divisi.nama_divisi }, // Mock biar card tidak error
                }}
                isAdmin={false} // Mode view only
              />
            ))}
          </div>
        )}
      </div>

      {/* BAGIAN 2: PROGRAM KERJA */}
      <div style={{ marginTop: "3rem" }}>
        <h2 className={styles.sectionTitle}>
          <FiBriefcase /> Program Kerja
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
                  nama_divisi: divisi.nama_divisi, // Mock untuk card
                }}
                isAdmin={false} // Mode view only
              />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}

export default DivisiDetail;
