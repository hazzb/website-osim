import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
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

// Forms
import DivisiForm from "../components/forms/DivisiForm.jsx";
import AnggotaForm from "../components/forms/AnggotaForm.jsx";
import ProgramKerjaForm from "../components/forms/ProgramKerjaForm.jsx";

// Icons
import {
  FiUsers,
  FiBriefcase,
  FiLayout,
  FiGrid,
  FiEdit,
  FiArrowLeft,
  FiX,
  FiSearch,
} from "react-icons/fi";

// Styles
import styles from "./DivisiDetail.module.css";
import ImageViewer from "../components/ui/ImageViewer.jsx";

const getJabatanRank = (jabatan) => {
  if (!jabatan) return 99;
  const role = jabatan.toLowerCase();
  if (role.includes("ketua") || role.includes("kepala")) return 1;
  if (role.includes("wakil")) return 2;
  if (role.includes("sekretaris")) return 3;
  if (role.includes("bendahara")) return 4;
  if (role.includes("koordinator") || role.includes("co")) return 5;
  return 10;
};

function DivisiDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const isAdmin = !!session;

  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("aesthetic");
  const [data, setData] = useState({ divisi: null, anggota: [], progja: [] });

  // State Search (Filter Anggota)
  const [searchTerm, setSearchTerm] = useState("");

  const [periodeList, setPeriodeList] = useState([]);
  const [jabatanList, setJabatanList] = useState([]);

  const [activeModal, setActiveModal] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [formPreview, setFormPreview] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [isLogoLightboxOpen, setIsLogoLightboxOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: div } = await supabase
        .from("divisi")
        .select("*")
        .eq("id", id)
        .single();
      const { data: ang } = await supabase
        .from("anggota")
        .select("*, master_jabatan(*)")
        .eq("divisi_id", id);
      const { data: pro } = await supabase
        .from("program_kerja")
        .select("*, pj:anggota!penanggung_jawab_id(*)")
        .eq("divisi_id", id);
      const { data: per } = await supabase
        .from("periode_jabatan")
        .select("*")
        .order("tahun_mulai", { ascending: false });
      const { data: jab } = await supabase.from("master_jabatan").select("*");

      const sortedAnggota = (ang || []).sort((a, b) => {
        const rankA = getJabatanRank(
          a.jabatan_di_divisi || a.master_jabatan?.nama_jabatan
        );
        const rankB = getJabatanRank(
          b.jabatan_di_divisi || b.master_jabatan?.nama_jabatan
        );
        return rankA !== rankB ? rankA - rankB : a.nama.localeCompare(b.nama);
      });

      setData({ divisi: div, anggota: sortedAnggota, progja: pro || [] });
      setPeriodeList(per || []);
      setJabatanList(jab || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  // LOGIKA FILTER PENCARIAN
  const filteredAnggota = data.anggota.filter(
    (m) =>
      m.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.jabatan_di_divisi || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const closeModal = () => {
    setActiveModal(null);
    setFormData({});
    setFormPreview(null);
    setEditingId(null);
  };

  // --- HANDLERS (Sama seperti sebelumnya) ---
  const handleEditDivisi = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      let logoUrl = formData.logo_url;
      if (formData.file) logoUrl = await uploadImage(formData.file, "divisi");
      await supabase
        .from("divisi")
        .update({ ...formData, logo_url: logoUrl })
        .eq("id", id);
      closeModal();
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditAnggota = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      let fotoUrl = formData.foto_url;
      if (formData.file) fotoUrl = await uploadImage(formData.file, "profiles");
      const { file, master_jabatan, ...payload } = formData;
      await supabase
        .from("anggota")
        .update({ ...payload, foto_url: fotoUrl })
        .eq("id", editingId);
      closeModal();
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditProgja = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const { pj, id: _, created_at, ...payload } = formData;
      await supabase.from("program_kerja").update(payload).eq("id", editingId);
      closeModal();
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return <LoadingState />;
  if (!data.divisi)
    return <div className={styles.error}>Divisi tidak ditemukan</div>;

  return (
    <PageContainer>
      <PageHeader
        title={data.divisi.nama_divisi}
        subtitle={data.divisi.deskripsi || "Informasi detail divisi."}
        // --- HEADER BARU (Layout mirip Daftar Anggota) ---
        // Semua dimasukkan ke slot 'searchBar' agar persistent (selalu muncul) di mobile
        searchBar={
          <div className={styles.headerToolbar}>
            {/* 1. Tombol Kembali (Kiri) */}
            <button
              className={styles.backBtn}
              onClick={() => navigate(-1)}
              title="Kembali"
            >
              <FiArrowLeft size={18} />
            </button>

            {/* 2. Search Bar (Tengah & Flexible) */}
            <div className={styles.searchWrapper}>
              <FiSearch className={styles.searchIcon} size={16} />
              <input
                placeholder="Cari anggota divisi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {/* 3. Actions Kanan (Edit & Toggle) */}
            <div className={styles.rightActions}>
              {isAdmin && (
                <button
                  className={`${styles.actionBtn} ${styles.editBtn}`}
                  onClick={() => {
                    setFormData(data.divisi);
                    setFormPreview(data.divisi.logo_url);
                    setActiveModal("divisi");
                  }}
                  title="Edit Divisi"
                >
                  <FiEdit />
                  <span className={styles.hideMobile}>Edit</span>
                </button>
              )}

              <div className={styles.viewToggle}>
                <button
                  className={viewMode === "aesthetic" ? styles.active : ""}
                  onClick={() => setViewMode("aesthetic")}
                  title="Grid View"
                >
                  <FiGrid />
                </button>
                <button
                  className={viewMode === "compact" ? styles.active : ""}
                  onClick={() => setViewMode("compact")}
                  title="List View"
                >
                  <FiLayout />
                </button>
              </div>
            </div>
          </div>
        }
        // Kosongkan slot lain agar tidak ada burger menu
        actions={null}
        filters={null}
      />

      {/* Info Card */}
      <div className={styles.infoCard}>
        <div className={styles.logoWrapper}>
          <img
            src={data.divisi.logo_url || "/placeholder.png"}
            className={styles.logoImage}
            onClick={() => setIsLogoLightboxOpen(true)}
            style={{ cursor: "zoom-in" }}
          />
        </div>
        <div className={styles.infoContent}>
          <h3>Tentang {data.divisi.nama_divisi}</h3>
          <p>{data.divisi.deskripsi}</p>
        </div>
      </div>

      {/* ANGGOTA SECTION (Filtered) */}
      <div className={styles.sectionWrapper}>
        <h2 className={styles.sectionTitle}>
          <FiUsers style={{ marginRight: "8px" }} /> Anggota (
          {filteredAnggota.length})
        </h2>

        {filteredAnggota.length === 0 ? (
          <div className={styles.emptyState}>
            {searchTerm
              ? "Tidak ada anggota yang cocok dengan pencarian."
              : "Belum ada anggota."}
          </div>
        ) : (
          <div className={viewMode === "aesthetic" ? styles.grid : styles.list}>
            {filteredAnggota.map((m) => (
              <AnggotaCard
                key={m.id}
                data={m}
                layout={viewMode}
                isAdmin={isAdmin}
                onEdit={() => {
                  setEditingId(m.id);
                  setFormData(m);
                  setFormPreview(m.foto_url);
                  setActiveModal("anggota");
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* PROGJA SECTION */}
      <div className={styles.sectionWrapper}>
        <h2 className={styles.sectionTitle}>
          <FiBriefcase style={{ marginRight: "8px" }} /> Program Kerja (
          {data.progja.length})
        </h2>
        <div className={styles.grid}>
          {data.progja.map((p) => (
            <ProgramKerjaCard
              key={p.id}
              data={p}
              isAdmin={isAdmin}
              onEdit={() => {
                setEditingId(p.id);
                setFormData(p);
                setActiveModal("progja");
              }}
            />
          ))}
        </div>
      </div>

      {/* MODALS */}
      <Modal
        isOpen={!!activeModal}
        onClose={closeModal}
        title={`Edit ${activeModal}`}
      >
        {activeModal === "divisi" && (
          <DivisiForm
            formData={formData}
            onChange={(e) =>
              setFormData({ ...formData, [e.target.name]: e.target.value })
            }
            onFileChange={(e) => {
              setFormData({ ...formData, file: e.target.files[0] });
              setFormPreview(URL.createObjectURL(e.target.files[0]));
            }}
            onSubmit={handleEditDivisi}
            onCancel={closeModal}
            loading={formLoading}
            preview={formPreview}
            periodeList={periodeList}
          />
        )}
        {activeModal === "anggota" && (
          <AnggotaForm
            formData={formData}
            onChange={(e) =>
              setFormData({ ...formData, [e.target.name]: e.target.value })
            }
            onFileChange={(e) => {
              setFormData({ ...formData, file: e.target.files[0] });
              setFormPreview(URL.createObjectURL(e.target.files[0]));
            }}
            onSubmit={handleEditAnggota}
            onCancel={closeModal}
            loading={formLoading}
            preview={formPreview}
            periodeList={periodeList}
            divisiList={[data.divisi]}
            jabatanList={jabatanList}
          />
        )}
        {activeModal === "progja" && (
          <ProgramKerjaForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleEditProgja}
            onCancel={closeModal}
            loading={formLoading}
            divisiOptions={[data.divisi]}
            anggotaOptions={data.anggota}
            periodeOptions={periodeList}
          />
        )}
      </Modal>

      <ImageViewer
        isOpen={isLogoLightboxOpen}
        onClose={() => setIsLogoLightboxOpen(false)}
        src={data.divisi.logo_url}
        alt={data.divisi.nama_divisi}
        caption={data.divisi.nama_divisi}
      />
    </PageContainer>
  );
}

export default DivisiDetail;
