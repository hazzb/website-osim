import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // 1. Import Portal
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { uploadImage } from "../utils/uploadHelper";

// Components
import PageContainer from "../components/ui/PageContainer.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import AnggotaCard from "../components/cards/AnggotaCard.jsx";
import ProgramKerjaCard from "../components/cards/ProgramKerjaCard.jsx";
import Modal from "../components/Modal.jsx";
import DivisiForm from "../components/forms/DivisiForm.jsx";

// Icons
import {
  FiUsers,
  FiBriefcase,
  FiLayout,
  FiGrid,
  FiEdit,
  FiArrowLeft,
  FiX, // 2. Import Icon Close
} from "react-icons/fi";

// Styles
import styles from "./DivisiDetail.module.css";
// 3. REUSE CSS LIGHTBOX DARI KARTU ANGGOTA
import lightboxStyles from "../components/cards/AnggotaCard.module.css";

function DivisiDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const isAdmin = !!session;

  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("aesthetic");

  // Data Utama
  const [data, setData] = useState({
    divisi: null,
    anggota: [],
    progja: [],
  });
  const [error, setError] = useState(null);

  // State Modal Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [formPreview, setFormPreview] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [periodeList, setPeriodeList] = useState([]);

  // 4. STATE LIGHTBOX LOGO
  const [isLogoLightboxOpen, setIsLogoLightboxOpen] = useState(false);

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Divisi
      const { data: divisiData, error: divisiErr } = await supabase
        .from("divisi")
        .select("*")
        .eq("id", id)
        .single();

      if (divisiErr) throw divisiErr;

      // 2. Fetch Anggota
      const { data: anggotaData } = await supabase
        .from("anggota")
        .select("*, master_jabatan(nama_jabatan)")
        .eq("divisi_id", id)
        .order("id", { ascending: true });

      // 3. Fetch Progja
      const { data: progjaData, error: progjaErr } = await supabase
        .from("program_kerja")
        .select(`*, pj:anggota!penanggung_jawab_id (id, nama)`)
        .eq("divisi_id", id);

      if (progjaErr) throw progjaErr;

      // 4. Fetch Periode
      const { data: periodeData } = await supabase
        .from("periode_jabatan")
        .select("*")
        .order("tahun_mulai", { ascending: false });

      setPeriodeList(periodeData || []);

      setData({
        divisi: divisiData,
        anggota: anggotaData || [],
        progja: progjaData || [],
      });
    } catch (err) {
      console.error("Error fetching detail:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  // --- HANDLERS ---
  const handleBack = () => navigate(-1);

  const handleOpenEdit = () => {
    setFormData({ ...data.divisi });
    setFormPreview(data.divisi.logo_url);
    setIsEditModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, file }));
      setFormPreview(URL.createObjectURL(file));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      let logoUrl = formData.logo_url;
      if (formData.file) {
        logoUrl = await uploadImage(formData.file, "divisi");
      }
      const payload = {
        nama_divisi: formData.nama_divisi,
        deskripsi: formData.deskripsi,
        periode_id: formData.periode_id,
        tipe: formData.tipe,
        logo_url: logoUrl,
      };
      const { error } = await supabase
        .from("divisi")
        .update(payload)
        .eq("id", id);
      if (error) throw error;

      setIsEditModalOpen(false);
      fetchData();
    } catch (err) {
      alert("Gagal update divisi: " + err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditAnggota = (item) => {
    alert(`Edit Anggota: ${item.nama}`);
  };
  const handleDeleteAnggota = (itemId) => {
    if (confirm("Hapus anggota?")) alert(`Hapus ID: ${itemId}`);
  };
  const handleEditProgja = (item) => {
    alert(`Edit Progja: ${item.nama_acara}`);
  };
  const handleDeleteProgja = (itemId) => {
    if (confirm("Hapus proker?")) alert(`Hapus ID: ${itemId}`);
  };

  if (loading) return <LoadingState message="Memuat detail divisi..." />;
  if (error || !data.divisi)
    return (
      <div className={styles.error}>
        Error: {error || "Divisi tidak ditemukan"}
      </div>
    );

  const { divisi, anggota, progja } = data;

  return (
    <PageContainer>
      <PageHeader
        title={divisi.nama_divisi}
        subtitle={divisi.deskripsi || "Informasi detail divisi."}
        actions={
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              className={styles.actionBtn}
              onClick={handleBack}
              title="Kembali"
            >
              <FiArrowLeft /> <span className={styles.hideMobile}>Kembali</span>
            </button>

            {isAdmin && (
              <button
                className={`${styles.actionBtn} ${styles.editBtn}`}
                onClick={handleOpenEdit}
                title="Edit Divisi"
              >
                <FiEdit /> <span className={styles.hideMobile}>Edit</span>
              </button>
            )}

            <div className={styles.viewToggle}>
              <button
                className={viewMode === "aesthetic" ? styles.active : ""}
                onClick={() => setViewMode("aesthetic")}
              >
                <FiGrid />
              </button>
              <button
                className={viewMode === "compact" ? styles.active : ""}
                onClick={() => setViewMode("compact")}
              >
                <FiLayout />
              </button>
            </div>
          </div>
        }
      />

      {/* INFO CARD */}
      <div className={styles.infoCard}>
        <div className={styles.logoWrapper}>
          {divisi.logo_url ? (
            <img
              src={divisi.logo_url}
              alt="Logo"
              className={styles.logoImage}
              // 5. TRIGGER OPEN LIGHTBOX
              onClick={() => setIsLogoLightboxOpen(true)}
              style={{ cursor: "zoom-in" }}
            />
          ) : (
            <span className={styles.logoPlaceholder}>#</span>
          )}
        </div>
        <div className={styles.infoContent}>
          <h3>Tentang {divisi.nama_divisi}</h3>
          <p>{divisi.deskripsi || "Tidak ada deskripsi."}</p>
        </div>
      </div>

      {/* SECTION ANGGOTA */}
      <div className={styles.sectionWrapper}>
        <h2 className={styles.sectionTitle}>
          <FiUsers style={{ color: "#3b82f6" }} /> Anggota ({anggota.length})
        </h2>
        {anggota.length === 0 ? (
          <div className={styles.emptyState}>Belum ada anggota.</div>
        ) : (
          <div className={viewMode === "aesthetic" ? styles.grid : styles.list}>
            {anggota.map((member) => (
              <AnggotaCard
                key={member.id}
                data={member}
                layout={viewMode}
                isAdmin={isAdmin}
                onEdit={() => handleEditAnggota(member)}
                onDelete={() => handleDeleteAnggota(member.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* SECTION PROGJA */}
      <div className={styles.sectionWrapper}>
        <h2 className={styles.sectionTitle}>
          <FiBriefcase style={{ color: "#f59e0b" }} /> Program Kerja (
          {progja.length})
        </h2>
        {progja.length === 0 ? (
          <div className={styles.emptyState}>Belum ada program kerja.</div>
        ) : (
          <div className={styles.grid}>
            {progja.map((program) => (
              <ProgramKerjaCard
                key={program.id}
                data={{ ...program, nama_divisi: divisi.nama_divisi }}
                isAdmin={isAdmin}
                onEdit={() => handleEditProgja(program)}
                onDelete={() => handleDeleteProgja(program.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* MODAL EDIT DIVISI */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Divisi"
      >
        <DivisiForm
          formData={formData}
          onChange={handleFormChange}
          onFileChange={handleFileChange}
          onSubmit={handleEditSubmit}
          onCancel={() => setIsEditModalOpen(false)}
          loading={formLoading}
          preview={formPreview}
          periodeList={periodeList}
        />
      </Modal>

      {/* 6. LIGHTBOX PORTAL (LOGO) */}
      {isLogoLightboxOpen &&
        divisi.logo_url &&
        createPortal(
          <div
            className={lightboxStyles.lightboxOverlay}
            onClick={() => setIsLogoLightboxOpen(false)}
          >
            <div
              className={lightboxStyles.lightboxContent}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className={lightboxStyles.closeButton}
                onClick={() => setIsLogoLightboxOpen(false)}
              >
                <FiX size={24} />
              </button>
              <img
                src={divisi.logo_url}
                alt={divisi.nama_divisi}
                className={lightboxStyles.lightboxImage}
              />
              {/* Optional: Caption */}
              <div
                style={{
                  marginTop: "1rem",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                }}
              >
                {divisi.nama_divisi}
              </div>
            </div>
          </div>,
          document.body
        )}
    </PageContainer>
  );
}

export default DivisiDetail;
