import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import styles from "./DivisiDetail.module.css";

// Components
import AnggotaCard from "../components/cards/AnggotaCard.jsx";
import Modal from "../components/Modal.jsx";
import AnggotaForm from "../components/forms/AnggotaForm.jsx";
import {
  FilterBar,
  FilterSelect,
  FilterSearch,
} from "../components/ui/FilterBar.jsx"; // Import UI Baru

function DivisiDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const isAdmin = !!session;

  // State
  const [divisi, setDivisi] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");

  // Modal & Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [formFile, setFormFile] = useState(null);
  const [formPreview, setFormPreview] = useState(null);
  const [existingFotoUrl, setExistingFotoUrl] = useState(null);

  // Dropdowns
  const [periodeList, setPeriodeList] = useState([]);
  const [divisiList, setDivisiList] = useState([]);
  const [jabatanList, setJabatanList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: divData, error: divError } = await supabase
          .from("divisi")
          .select(
            `*, periode_jabatan ( nama_kabinet, tahun_mulai, tahun_selesai )`
          )
          .eq("id", id)
          .single();
        if (divError || !divData) throw new Error("Divisi tidak ditemukan");
        setDivisi(divData);

        const { data: memData } = await supabase
          .from("anggota")
          .select("*")
          .eq("divisi_id", id)
          .order("created_at", { ascending: true });
        setMembers(memData || []);
      } catch (err) {
        console.error(err);
        navigate("/daftar-anggota");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

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
    const { data: j } = await supabase.from("master_jabatan").select("*");
    setJabatanList(j || []);
  };

  // Handlers
  const filteredMembers = members.filter((m) => {
    const matchSearch =
      m.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.jabatan_di_divisi &&
        m.jabatan_di_divisi.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchGender =
      genderFilter === "all" || m.jenis_kelamin === genderFilter;
    return matchSearch && matchGender;
  });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 500000) {
        alert("Maksimal 500KB");
        return;
      }
      setFormFile(file);
      setFormPreview(URL.createObjectURL(file));
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = async (member) => {
    await fetchDropdowns();
    setEditingId(member.id);
    setFormData(member);
    setExistingFotoUrl(member.foto_url);
    setFormPreview(member.foto_url);
    setFormFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (memberId) => {
    if (!window.confirm("Hapus anggota ini?")) return;
    try {
      await supabase.from("anggota").delete().eq("id", memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err) {
      alert("Gagal hapus: " + err.message);
    }
  };

  const handleSubmit = async (e) => {
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
      alert("Berhasil update!");
      setIsModalOpen(false);

      const { data: updated } = await supabase
        .from("anggota")
        .select("*")
        .eq("divisi_id", id)
        .order("created_at", { ascending: true });
      setMembers(updated || []);
    } catch (err) {
      alert("Gagal: " + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  if (loading)
    return (
      <div className="main-content">
        <p style={{ textAlign: "center", marginTop: "3rem" }}>Memuat...</p>
      </div>
    );
  if (!divisi) return null;

  return (
    <div className="main-content">
      <div className={styles.container}>
        {/* Nav */}
        <div className={styles.navBar}>
          <Link to="/daftar-anggota" className={styles.backLink}>
            &larr; Kembali ke Daftar
          </Link>
        </div>

        {/* Hero Section (Profile Divisi) */}
        <div className={styles.heroSection}>
          <div className={styles.visualContainer}>
            <div className={styles.logoWrapper}>
              {divisi.logo_url ? (
                <img src={divisi.logo_url} alt="logo" className={styles.logo} />
              ) : (
                <span style={{ fontSize: "3rem" }}>🏢</span>
              )}
            </div>
          </div>
          <div className={styles.infoContainer}>
            {divisi.periode_jabatan && (
              <span className={styles.periodeBadge}>
                {divisi.periode_jabatan.nama_kabinet} (
                {divisi.periode_jabatan.tahun_mulai}-
                {divisi.periode_jabatan.tahun_selesai})
              </span>
            )}
            <h1 className={styles.title}>{divisi.nama_divisi}</h1>
            <p className={styles.description}>
              {divisi.deskripsi || "Belum ada deskripsi."}
            </p>
          </div>
        </div>

        {/* Filter Bar (New UI) */}
        <FilterBar>
          <FilterSelect
            label="Gender"
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
          >
            <option value="all">Semua Gender</option>
            <option value="Ikhwan">Ikhwan</option>
            <option value="Akhwat">Akhwat</option>
          </FilterSelect>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: "600",
                color: "#718096",
              }}
            >
              Total: {filteredMembers.length}
            </span>
            <FilterSearch
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari anggota..."
            />
          </div>
        </FilterBar>

        {/* Grid */}
        {filteredMembers.length > 0 ? (
          <div className={styles.cardGrid}>
            {filteredMembers.map((anggota) => (
              <AnggotaCard
                key={anggota.id}
                data={anggota}
                isAdmin={isAdmin}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>Tidak ditemukan anggota.</div>
        )}
      </div>

      {isAdmin && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Edit Anggota"
        >
          <AnggotaForm
            formData={formData}
            onChange={handleFormChange}
            onFileChange={handleFileChange}
            onSubmit={handleSubmit}
            onCancel={() => setIsModalOpen(false)}
            loading={modalLoading}
            periodeList={periodeList}
            divisiList={divisiList}
            jabatanList={jabatanList}
            preview={formPreview}
          />
        </Modal>
      )}
    </div>
  );
}
export default DivisiDetail;
