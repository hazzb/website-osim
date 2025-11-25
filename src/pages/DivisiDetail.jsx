import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import styles from "./DivisiDetail.module.css";
import LoadingState from "../components/ui/LoadingState.jsx";

// ICONS
import { FiUsers, FiEdit3, FiLoader } from "react-icons/fi"; // FiLoader untuk ikon loading

// COMPONENTS
import PageContainer from "../components/ui/PageContainer.jsx"; // Wrapper Layout & Breadcrumb
import AnggotaCard from "../components/cards/AnggotaCard.jsx";
import Modal from "../components/Modal.jsx";
import AnggotaForm from "../components/forms/AnggotaForm.jsx";
import DivisiForm from "../components/forms/DivisiForm.jsx";
import {
  FilterBar,
  FilterSelect,
  FilterSearch,
} from "../components/ui/FilterBar.jsx";

function DivisiDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const isAdmin = !!session;

  // --- STATES ---
  const [divisi, setDivisi] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");

  // Modal & Form States
  const [modalType, setModalType] = useState(null); // 'anggota' | 'divisi' | null
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

  // File Upload States
  const [formFile, setFormFile] = useState(null);
  const [formPreview, setFormPreview] = useState(null);
  const [existingFotoUrl, setExistingFotoUrl] = useState(null);

  // Dropdowns Data
  const [periodeList, setPeriodeList] = useState([]);
  const [divisiList, setDivisiList] = useState([]);
  const [jabatanList, setJabatanList] = useState([]);

  // --- FETCH DATA ---
  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Get Divisi
      const { data: divData, error: divError } = await supabase
        .from("divisi")
        .select(
          `*, periode_jabatan ( nama_kabinet, tahun_mulai, tahun_selesai )`
        )
        .eq("id", id)
        .single();
      if (divError) throw divError;
      setDivisi(divData);

      // 2. Get Members
      const { data: memData } = await supabase
        .from("anggota")
        .select("*")
        .eq("divisi_id", id)
        .order("created_at", { ascending: true });
      setMembers(memData || []);
    } catch (err) {
      console.error(err);
      // Opsional: Redirect jika error fatal
      // navigate("/anggota");
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    if (divisiList.length > 0) return;
    const { data: p } = await supabase
      .from("periode_jabatan")
      .select("*")
      .order("tahun_mulai", { ascending: false });
    setPeriodeList(p || []);
    const { data: d } = await supabase
      .from("divisi")
      .select("*")
      .order("urutan", { ascending: true });
    setDivisiList(d || []);
    const { data: j } = await supabase
      .from("master_jabatan")
      .select("*")
      .order("level", { ascending: true });
    setJabatanList(j || []);
  };

  // --- HANDLERS ---
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormFile(file);
      setFormPreview(URL.createObjectURL(file));
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const closeModal = () => {
    setModalType(null);
    setFormData({});
    setFormFile(null);
    setFormPreview(null);
    setEditingId(null);
  };

  // --- ACTIONS: MEMBER ---
  const openEditMember = async (member) => {
    await fetchDropdowns();
    setModalType("anggota");
    setEditingId(member.id);
    setFormData(member);
    setExistingFotoUrl(member.foto_url);
    setFormPreview(member.foto_url);
  };

  const handleSubmitMember = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      let fotoUrl = existingFotoUrl;
      if (formFile) {
        const ext = formFile.name.split(".").pop();
        const name = `anggota_${Date.now()}.${ext}`;
        await supabase.storage
          .from("avatars")
          .upload(`anggota/${name}`, formFile, { upsert: true });
        const { data } = supabase.storage
          .from("avatars")
          .getPublicUrl(`anggota/${name}`);
        fotoUrl = data.publicUrl;
      }
      const payload = { ...formData, foto_url: fotoUrl };
      if (!payload.motto) delete payload.motto;
      if (!payload.instagram_username) delete payload.instagram_username;

      await supabase.from("anggota").update(payload).eq("id", editingId);
      alert("Anggota berhasil diperbarui!");
      closeModal();
      fetchData();
    } catch (err) {
      alert("Gagal: " + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!window.confirm("Hapus anggota ini dari divisi?")) return;
    try {
      await supabase.from("anggota").delete().eq("id", memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err) {
      alert("Gagal hapus: " + err.message);
    }
  };

  // --- ACTIONS: DIVISI ---
  const openEditDivisi = async () => {
    await fetchDropdowns();
    setModalType("divisi");
    setEditingId(divisi.id);
    setFormData({
      nama_divisi: divisi.nama_divisi,
      deskripsi: divisi.deskripsi || "",
      periode_id: divisi.periode_id,
    });
    setExistingFotoUrl(divisi.logo_url);
  };

  const handleSubmitDivisi = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      let logoUrl = existingFotoUrl;
      if (formFile) {
        const ext = formFile.name.split(".").pop();
        const name = `divisi_${Date.now()}.${ext}`;
        await supabase.storage
          .from("avatars")
          .upload(`divisi/${name}`, formFile, { upsert: true });
        const { data } = supabase.storage
          .from("avatars")
          .getPublicUrl(`divisi/${name}`);
        logoUrl = data.publicUrl;
      }

      const payload = { ...formData, logo_url: logoUrl };
      const { error } = await supabase
        .from("divisi")
        .update(payload)
        .eq("id", editingId);
      if (error) throw error;

      alert("Info Divisi diperbarui!");
      closeModal();
      fetchData();
    } catch (err) {
      alert("Gagal update divisi: " + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // --- FILTER LOGIC ---
  const filteredMembers = members.filter((m) => {
    const matchSearch =
      m.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.jabatan_di_divisi || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchGender =
      genderFilter === "all" || m.jenis_kelamin === genderFilter;
    return matchSearch && matchGender;
  });

  // --- RENDER: LOADING STATE (SKELETON UI) ---
  // Kita render PageContainer meski data belum ada, agar Layout & Breadcrumb muncul duluan
  if (loading) {
    return (
      // Kita tetap bungkus dengan PageContainer agar Breadcrumb tetap muncul
      <PageContainer breadcrumbText="Memuat...">
        {/* Panggil komponen LoadingState di sini */}
        <LoadingState message="Sedang mengambil data divisi..." />
      </PageContainer>
    );
  }

  // --- RENDER: NOT FOUND ---
  if (!divisi) {
    return (
      <PageContainer breadcrumbText="Error">
        <div className={styles.emptyState}>
          Divisi tidak ditemukan atau telah dihapus.
        </div>
      </PageContainer>
    );
  }

  // --- RENDER: MAIN CONTENT ---
  return (
    <PageContainer breadcrumbText={divisi.nama_divisi}>
      {/* 1. HERO SECTION */}
      <div className={styles.heroSection}>
        {isAdmin && (
          <button onClick={openEditDivisi} className={styles.editDivisiBtn}>
            <FiEdit3 /> Edit Divisi
          </button>
        )}

        <div className={styles.logoWrapper}>
          {divisi.logo_url ? (
            <img src={divisi.logo_url} alt="logo" className={styles.logo} />
          ) : (
            <FiUsers size={40} color="#cbd5e0" />
          )}
        </div>

        <div className={styles.infoContainer}>
          {divisi.periode_jabatan && (
            <span className={styles.periodeBadge}>
              {divisi.periode_jabatan.nama_kabinet}
            </span>
          )}
          <h1 className={styles.title}>{divisi.nama_divisi}</h1>
          <p className={styles.description}>
            {divisi.deskripsi || "Belum ada deskripsi untuk divisi ini."}
          </p>
        </div>
      </div>

      {/* 2. FILTER BAR */}
      <FilterBar>
        <FilterSearch
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari anggota..."
        />
        <FilterSelect
          label="Gender"
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
        >
          <option value="all">Semua</option>
          <option value="Ikhwan">Ikhwan</option>
          <option value="Akhwat">Akhwat</option>
        </FilterSelect>

        <div className={styles.statsBadge}>Total: {filteredMembers.length}</div>
      </FilterBar>

      {/* 3. GRID ANGGOTA */}
      {filteredMembers.length > 0 ? (
        <div className={styles.cardGrid}>
          {filteredMembers.map((anggota) => (
            <AnggotaCard
              key={anggota.id}
              data={anggota}
              isAdmin={isAdmin}
              onEdit={openEditMember}
              onDelete={handleDeleteMember}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          Tidak ditemukan anggota di divisi ini.
        </div>
      )}

      {/* 4. MODALS */}
      {isAdmin && (
        <Modal
          isOpen={!!modalType}
          onClose={closeModal}
          title={
            modalType === "divisi" ? "Edit Informasi Divisi" : "Edit Anggota"
          }
        >
          {modalType === "anggota" && (
            <AnggotaForm
              formData={formData}
              onChange={handleFormChange}
              onFileChange={handleFileChange}
              onSubmit={handleSubmitMember}
              onCancel={closeModal}
              loading={modalLoading}
              periodeList={periodeList}
              divisiList={divisiList}
              jabatanList={jabatanList}
              preview={formPreview}
            />
          )}

          {modalType === "divisi" && (
            <DivisiForm
              formData={formData}
              onChange={handleFormChange}
              onFileChange={handleFileChange}
              onSubmit={handleSubmitDivisi}
              onCancel={closeModal}
              loading={modalLoading}
              periodeList={periodeList}
            />
          )}
        </Modal>
      )}
    </PageContainer>
  );
}

export default DivisiDetail;
