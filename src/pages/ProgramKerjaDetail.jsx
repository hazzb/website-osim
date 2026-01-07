import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import DOMPurify from "dompurify";
import styles from "./ProgramKerjaDetail.module.css";

// ICONS
import {
  FiArrowLeft,
  FiCalendar,
  FiBriefcase,
  FiUser,
  FiUsers, // Icon untuk Target Peserta
  FiExternalLink,
  FiEdit,
  FiTrash2,
} from "react-icons/fi";

// COMPONENTS
import PageContainer from "../components/ui/PageContainer.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import Modal from "../components/Modal.jsx";
import ProgramKerjaForm from "../components/forms/ProgramKerjaForm.jsx";

function ProgramKerjaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const isAdmin = !!session;

  const [progja, setProgja] = useState(null);
  const [loading, setLoading] = useState(true);

  // STATE FORM
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({});

  const [options, setOptions] = useState({
    divisi: [],
    anggota: [],
    periode: [],
  });

  // FETCH DATA
  const fetchDetail = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("program_kerja")
        .select(
          `*, divisi:divisi_id (nama_divisi), pj:penanggung_jawab_id (nama)`
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Program tidak ditemukan");

      setProgja(data);

      if (isAdmin) {
        const [divRes, aggRes, perRes] = await Promise.all([
          supabase
            .from("divisi")
            .select("id, nama_divisi")
            .order("nama_divisi"),
          supabase.from("anggota").select("id, nama").order("nama"),
          supabase
            .from("periode_jabatan")
            .select("id, nama_kabinet")
            .order("tahun_mulai", { ascending: false }),
        ]);
        setOptions({
          divisi: divRes.data || [],
          anggota: aggRes.data || [],
          periode: perRes.data || [],
        });
      }

      if (data.embed_html && data.embed_html.includes("instagram")) {
        setTimeout(() => {
          if (window.instgrm) window.instgrm.Embeds.process();
          else {
            const script = document.createElement("script");
            script.src = "//www.instagram.com/embed.js";
            script.async = true;
            document.body.appendChild(script);
          }
        }, 500);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id, isAdmin]);

  // HANDLERS
  const handleEdit = () => {
    setFormData({ ...progja });
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!confirm("Hapus program kerja ini? Data tidak dapat dikembalikan."))
      return;
    try {
      setLoading(true);
      await supabase.from("program_kerja").delete().eq("id", id);
      navigate("/program-kerja", { replace: true });
    } catch (err) {
      alert("Gagal menghapus: " + err.message);
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = { ...formData };
      delete payload.divisi;
      delete payload.pj;
      delete payload.id;
      delete payload.created_at;
      if (!payload.tanggal) payload.tanggal = null;
      if (!payload.target_gender) payload.target_gender = "Umum";

      await supabase.from("program_kerja").update(payload).eq("id", id);
      setIsModalOpen(false);
      fetchDetail();
    } catch (err) {
      alert("Gagal menyimpan: " + err.message);
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return <LoadingState />;
  if (!progja)
    return (
      <div style={{ textAlign: "center", marginTop: "3rem", color: "#ef4444" }}>
        Data tidak ditemukan
      </div>
    );

  const formattedDate = progja.tanggal
    ? new Date(progja.tanggal).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Belum ditentukan";

  // Helper Warna Gender
  const getGenderColor = (g) => {
    if (g === "Ikhwan") return "#2563eb"; // Biru
    if (g === "Akhwat") return "#db2777"; // Pink
    return "#475569"; // Abu-abu (Umum)
  };

  return (
    <PageContainer>
      <PageHeader
        title="Detail Program Kerja"
        subtitle="Informasi lengkap kegiatan."
        // CUSTOM TOOLBAR (Slot SearchBar)
        searchBar={
          <div className={styles.headerToolbar}>
            <button
              className={styles.actionBtn}
              onClick={() => navigate(-1)}
              title="Kembali"
            >
              <FiArrowLeft /> <span className={styles.hideMobile}>Kembali</span>
            </button>

            {isAdmin && (
              <div className={styles.rightActions}>
                <button
                  className={`${styles.actionBtn} ${styles.editBtn}`}
                  onClick={handleEdit}
                  title="Edit"
                >
                  <FiEdit /> <span className={styles.hideMobile}>Edit</span>
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  onClick={handleDelete}
                  title="Hapus"
                >
                  <FiTrash2 /> <span className={styles.hideMobile}>Hapus</span>
                </button>
              </div>
            )}
          </div>
        }
        actions={null}
      />

      <div className={styles.contentCard}>
        {progja.embed_html && (
          <div className={styles.mediaContainer}>
            <div className={styles.embedWrapper}>
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(progja.embed_html, {
                    ADD_TAGS: ["iframe", "blockquote", "script"],
                    ADD_ATTR: [
                      "allow",
                      "allowfullscreen",
                      "frameborder",
                      "scrolling",
                      "src",
                      "width",
                      "height",
                      "class",
                      "data-instgrm-permalink",
                      "data-instgrm-version",
                    ],
                  }),
                }}
              />
            </div>
          </div>
        )}

        <div className={styles.headerInfo}>
          <h1 className={styles.title}>{progja.nama_acara}</h1>

          <div className={styles.metaGrid}>
            {/* Waktu */}
            <div className={styles.metaItem}>
              <div className={styles.iconBox}>
                <FiCalendar />
              </div>
              <div>
                <span className={styles.metaLabel}>Waktu Pelaksanaan</span>
                <span className={styles.metaValue}>{formattedDate}</span>
              </div>
            </div>

            {/* Divisi */}
            <div className={styles.metaItem}>
              <div className={styles.iconBox}>
                <FiBriefcase />
              </div>
              <div>
                <span className={styles.metaLabel}>Divisi Pelaksana</span>
                <span className={styles.metaValue} style={{ color: "#3182ce" }}>
                  {progja.divisi?.nama_divisi || "Umum"}
                </span>
              </div>
            </div>

            {/* Penanggung Jawab */}
            <div className={styles.metaItem}>
              <div className={styles.iconBox}>
                <FiUser />
              </div>
              <div>
                <span className={styles.metaLabel}>Penanggung Jawab</span>
                <span className={styles.metaValue}>
                  {progja.pj?.nama || "-"}
                </span>
              </div>
            </div>

            {/* BARU: Target Peserta */}
            <div className={styles.metaItem}>
              <div className={styles.iconBox}>
                <FiUsers />
              </div>
              <div>
                <span className={styles.metaLabel}>Target Peserta</span>
                <span
                  className={styles.metaValue}
                  style={{ color: getGenderColor(progja.target_gender) }}
                >
                  {progja.target_gender || "Umum"}
                </span>
              </div>
            </div>
          </div>
        </div>

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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit Program Kerja"
      >
        <ProgramKerjaForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
          loading={formLoading}
          divisiOptions={options.divisi}
          anggotaOptions={options.anggota}
          periodeOptions={options.periode}
        />
      </Modal>
    </PageContainer>
  );
}

export default ProgramKerjaDetail;
