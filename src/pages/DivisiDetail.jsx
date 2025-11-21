// src/pages/DivisiDetail.jsx
// --- VERSI UPDATE: Filter Gender Ikhwan/Akhwat ---

import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import styles from "./DivisiDetail.module.css";

// Components
import AnggotaCard from "../components/cards/AnggotaCard.jsx";
import Modal from "../components/Modal.jsx";
import AnggotaForm from "../components/forms/AnggotaForm.jsx";

function DivisiDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const isAdmin = !!session;

  // --- States ---
  const [divisi, setDivisi] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // FILTER STATES
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("all"); // 'all', 'Ikhwan', 'Akhwat'

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [formFile, setFormFile] = useState(null);
  const [formPreview, setFormPreview] = useState(null);
  const [existingFotoUrl, setExistingFotoUrl] = useState(null);

  // Dropdown Data
  const [periodeList, setPeriodeList] = useState([]);
  const [divisiList, setDivisiList] = useState([]);
  const [jabatanList, setJabatanList] = useState([]);

  // --- Fetching Data ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Get Divisi Info
        const { data: divData, error: divError } = await supabase
          .from("divisi")
          .select(
            `*, periode_jabatan ( nama_kabinet, tahun_mulai, tahun_selesai )`
          )
          .eq("id", id)
          .single();

        if (divError) throw divError;
        if (!divData) throw new Error("Divisi tidak ditemukan");
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

  // --- Handlers ---

  // LOGIC FILTER (SEARCH + GENDER)
  const filteredMembers = members.filter((m) => {
    // 1. Cek Search Text
    const matchSearch =
      m.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.jabatan_di_divisi &&
        m.jabatan_di_divisi.toLowerCase().includes(searchTerm.toLowerCase()));

    // 2. Cek Gender
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
    if (!window.confirm("Yakin ingin menghapus anggota ini dari divisi?"))
      return;
    try {
      const { error } = await supabase
        .from("anggota")
        .delete()
        .eq("id", memberId);
      if (error) throw error;
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

      const { error } = await supabase
        .from("anggota")
        .update(payload)
        .eq("id", editingId);
      if (error) throw error;

      alert("Data berhasil diperbarui!");
      setIsModalOpen(false);

      const { data: updatedMembers } = await supabase
        .from("anggota")
        .select("*")
        .eq("divisi_id", id)
        .order("created_at", { ascending: true });
      setMembers(updatedMembers || []);
    } catch (err) {
      alert("Gagal update: " + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // --- Render ---
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
        <div className={styles.navBar}>
          <Link to="/daftar-anggota" className={styles.backLink}>
            &larr; Kembali ke Daftar
          </Link>
        </div>

        <div className={styles.heroSection}>
          <div className={styles.visualContainer}>
            <div className={styles.logoWrapper}>
              {divisi.logo_url ? (
                <img
                  src={divisi.logo_url}
                  alt={divisi.nama_divisi}
                  className={styles.logo}
                />
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
              {divisi.deskripsi || "Belum ada deskripsi divisi."}
            </p>
          </div>
        </div>

        {/* FILTER SECTION */}
        <div className={styles.filterSection}>
          <h3 className={styles.sectionTitle}>
            Anggota ({filteredMembers.length})
          </h3>

          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              flexWrap: "wrap",
              flexGrow: 1,
              justifyContent: "flex-end",
            }}
          >
            {/* FILTER GENDER (BARU) */}
            <select
              className={styles.filterSelect}
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
            >
              <option value="all">Semua Gender</option>
              <option value="Ikhwan">Ikhwan (Putra)</option>
              <option value="Akhwat">Akhwat (Putri)</option>
            </select>

            {/* SEARCH BAR */}
            <div className={styles.searchWrapper}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Cari nama..."
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Members Grid */}
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
          <div className={styles.emptyState}>
            {members.length === 0
              ? "Belum ada anggota di divisi ini."
              : "Tidak ditemukan anggota yang cocok."}
          </div>
        )}
      </div>

      {/* Modal Edit */}
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
