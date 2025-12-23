import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

// UI Components
import PageContainer from "../components/ui/PageContainer.jsx";
import PageHeader from "../components/ui/PageHeader.jsx"; // <--- IMPORT KOMPONEN HEADER STANDAR
import { AnggotaSkeletonGrid } from "../components/ui/Skeletons.jsx";
import { FilterBar, FilterSelect } from "../components/ui/FilterBar.jsx"; // Kita tetap pakai FilterSelect
import AnggotaCard from "../components/cards/AnggotaCard.jsx";
import Modal from "../components/Modal.jsx";

// Forms & Managers
import AnggotaForm from "../components/forms/AnggotaForm.jsx";
import DivisiForm from "../components/forms/DivisiForm.jsx";
import DivisiReorderModal from "../components/admin/DivisiReorderModal.jsx";
import JabatanManager from "../components/admin/JabatanManager.jsx";
import PeriodeForm from "../components/forms/PeriodeForm.jsx";

// Styles
import styles from "./DaftarAnggota.module.css";

// Utils
import { uploadImage } from "../utils/uploadHelper";

// Icons
import {
  FiSearch,
  FiArrowRight,
  FiPlus,
  FiEdit,
  FiBriefcase,
  FiList
} from "react-icons/fi";

function DaftarAnggota() {
  const { session } = useAuth();
  const isAdmin = !!session;

  // --- 1. STATE ---
  const [periodeList, setPeriodeList] = useState([]);
  const [activeTab, setActiveTab] = useState(""); 
  
  // Data Master
  const [allDivisi, setAllDivisi] = useState([]); 
  const [jabatanList, setJabatanList] = useState([]);
  const [jabatanLinks, setJabatanLinks] = useState([]);
  
  // Data Filtered
  const [divisiPerPeriode, setDivisiPerPeriode] = useState([]); 
  const [anggotaList, setAnggotaList] = useState([]);

  // UI Filter
  const [selectedDivisi, setSelectedDivisi] = useState("semua");
  const [selectedGender, setSelectedGender] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [formFile, setFormFile] = useState(null);
  const [formPreview, setFormPreview] = useState(null);

  // --- 2. FETCH INITIAL DATA ---
  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: periodes } = await supabase.from("periode_jabatan").select("*").order("tahun_mulai", { ascending: false });
      setPeriodeList(periodes || []);
      
      if (periodes?.length > 0 && !activeTab) {
        const active = periodes.find((p) => p.is_active);
        setActiveTab(active ? active.id : periodes[0].id);
      }

      const { data: divisis } = await supabase.from("divisi").select("*").order("urutan", { ascending: true });
      setAllDivisi(divisis || []);

      const { data: jabatans } = await supabase.from("master_jabatan").select("*").order("nama_jabatan", { ascending: true });
      setJabatanList(jabatans || []);

      const { data: links } = await supabase.from("divisi_jabatan_link").select("*");
      setJabatanLinks(links || []);

    } catch (err) {
      console.error("Init Error:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchInitialData();
  }, []); 

  // --- 3. FETCH ANGGOTA ---
  const fetchAnggota = useCallback(async (periodeId) => {
    if (!periodeId) return;
    setLoading(true);
    try {
      const relevantDivisi = allDivisi.filter(d => String(d.periode_id) === String(periodeId));
      setDivisiPerPeriode(relevantDivisi);

      const { data, error } = await supabase
        .from("anggota")
        .select(`*, divisi ( nama_divisi, urutan, logo_url, tipe ), master_jabatan ( nama_jabatan )`)
        .eq("periode_id", periodeId)
        .order("nama", { ascending: true });

      if (error) throw error;
      setAnggotaList(data || []);
    } catch (err) {
      console.error("Fetch Anggota Error:", err);
    } finally {
      setLoading(false);
    }
  }, [allDivisi]);

  useEffect(() => {
    if (activeTab) {
      fetchAnggota(activeTab);
    }
  }, [activeTab, fetchAnggota]);

  // --- 4. HANDLERS ---
  const getModalTitle = () => {
    if (activeModal === "reorder_divisi") return "Atur Urutan Divisi";
    if (activeModal === "jabatan") return "Kelola Jabatan";
    const action = editingId ? "Edit" : "Tambah";
    return `${action} ${activeModal?.charAt(0).toUpperCase() + activeModal?.slice(1) || ""}`;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormFile(file);
      setFormPreview(URL.createObjectURL(file));
    }
  };

  const handleFormChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openModal = (type, item = null) => {
    setActiveModal(type);
    setFormFile(null);
    setFormPreview(null);

    if (type === "reorder_divisi" || type === "jabatan") {
      setIsModalOpen(true);
      return;
    }

    if (item) {
      setEditingId(item.id);
      setFormData({ ...item, divisi_id: item.divisi_id, jabatan_id: item.jabatan_id || "" });
      if (type === "anggota") setFormPreview(item.foto_url);
      else if (type === "divisi") setFormPreview(item.logo_url);
    } else {
      setEditingId(null);
      if (type === "anggota") {
        setFormData({ nama: "", jenis_kelamin: "Ikhwan", periode_id: activeTab, divisi_id: selectedDivisi !== "semua" ? selectedDivisi : "", jabatan_id: "", instagram_username: "", alamat: "", motto: "" });
      } else if (type === "divisi") {
        setFormData({ nama_divisi: "", deskripsi: "", urutan: 10, periode_id: activeTab, tipe: "Umum" });
      } else if (type === "periode") {
        setFormData({ nama_kabinet: "", tahun_mulai: "", tahun_selesai: "", is_active: false, motto_kabinet: "" });
      }
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveModal(null);
    setFormData({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      let payload = {};
      let table = "";

      if (activeModal === "periode") {
        table = "periode_jabatan";
        payload = { nama_kabinet: formData.nama_kabinet, tahun_mulai: parseInt(formData.tahun_mulai), tahun_selesai: parseInt(formData.tahun_selesai), is_active: formData.is_active === true || formData.is_active === "true", motto_kabinet: formData.motto_kabinet };
      } else if (activeModal === "divisi") {
        table = "divisi";
        let logoUrl = formData.logo_url;
        if (formFile) logoUrl = await uploadImage(formFile, "divisi");
        payload = { nama_divisi: formData.nama_divisi, deskripsi: formData.deskripsi, urutan: parseInt(formData.urutan || 10), logo_url: logoUrl, periode_id: parseInt(activeTab), tipe: formData.tipe || "Umum" };
      } else if (activeModal === "anggota") {
        table = "anggota";
        let fotoUrl = formData.foto_url;
        if (formFile) fotoUrl = await uploadImage(formFile, "anggota");
        payload = { nama: formData.nama, motto: formData.motto, instagram_username: formData.instagram_username, jenis_kelamin: formData.jenis_kelamin, alamat: formData.alamat, foto_url: fotoUrl, divisi_id: parseInt(formData.divisi_id), periode_id: parseInt(formData.periode_id || activeTab), jabatan_id: formData.jabatan_id ? parseInt(formData.jabatan_id) : null, jabatan_di_divisi: formData.jabatan_di_divisi || "" };
      }

      if (editingId) {
        const { error } = await supabase.from(table).update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(table).insert(payload);
        if (error) throw error;
      }

      alert("Berhasil disimpan!");
      
      if (activeModal === "periode") fetchInitialData();
      else if (activeModal === "anggota") await fetchAnggota(activeTab);
      else { fetchInitialData(); fetchAnggota(activeTab); }

      closeModal();
    } catch (err) {
      console.error("Submit Error:", err);
      alert("Gagal menyimpan: " + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm("Hapus item ini?")) return;
    try {
        const table = type === "periode" ? "periode_jabatan" : type;
        await supabase.from(table).delete().eq("id", id);
        
        if (type === "periode" || type === "divisi") fetchInitialData();
        else fetchAnggota(activeTab);
    } catch (err) {
        alert("Gagal hapus: " + err.message);
    }
  };

  const filteredAnggota = anggotaList.filter((anggota) => {
    const matchDivisi = selectedDivisi === "semua" || String(anggota.divisi_id) === String(selectedDivisi);
    const matchGender = selectedGender === "all" || anggota.jenis_kelamin === selectedGender;
    const matchSearch = searchTerm === "" || anggota.nama.toLowerCase().includes(searchTerm.toLowerCase());
    return matchDivisi && matchGender && matchSearch;
  });

  const memberMap = {};
  filteredAnggota.forEach((member) => {
    const divId = member.divisi_id || "others";
    if (!memberMap[divId]) memberMap[divId] = [];
    memberMap[divId].push(member);
  });

  const sortedDivisiList = [...divisiPerPeriode].sort((a, b) => (a.urutan || 99) - (b.urutan || 99));

  return (
    <PageContainer breadcrumbText="Daftar Anggota">
      
      {/* --- MENGGUNAKAN PAGE HEADER STANDAR --- */}
      <PageHeader
        title="Daftar Anggota"
        subtitle="Manajemen Personil"
        
        // Actions dikosongkan (atau sisakan 1 tombol utama jika mau)
        actions={null} 

        // SEARCH BAR
        searchBar={
          <div style={{ position: "relative", width: "100%" }}>
            <FiSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              type="text"
              placeholder="Cari nama anggota..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        }

        // MENU OPSI (HIDDEN BUTTONS) - RAPI & RINGKAS!
        options={isAdmin && (
          <>
             <button onClick={() => openModal("anggota")} className={`${styles.modernButton} ${styles.btnBlue}`}>
                <FiPlus /> Tambah Anggota
             </button>
             <button onClick={() => openModal("divisi")} className={`${styles.modernButton} ${styles.btnOrange}`}>
                <FiPlus /> Divisi
             </button>
             <button onClick={() => openModal("periode")} className={`${styles.modernButton} ${styles.btnPurple}`}>
                <FiPlus /> Periode
             </button>
             <button onClick={() => openModal("jabatan")} className={`${styles.modernButton} ${styles.btnCyan}`}>
                <FiBriefcase /> Jabatan
             </button>
             <button onClick={() => openModal("reorder_divisi")} className={`${styles.modernButton} ${styles.btnTeal}`}>
                <FiList /> Urutkan Divisi
             </button>
          </>
        )}

        // FILTER (Sama seperti sebelumnya)
        filters={
          <>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <FilterSelect label="Periode" value={activeTab} onChange={(e) => setActiveTab(e.target.value)}>
                {periodeList.map((p) => <option key={p.id} value={p.id}>{p.nama_kabinet}</option>)}
              </FilterSelect>
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <FilterSelect label="Divisi" value={selectedDivisi} onChange={(e) => setSelectedDivisi(e.target.value)}>
                <option value="semua">Semua Divisi</option>
                {divisiPerPeriode.map((d) => <option key={d.id} value={d.id}>{d.nama_divisi}</option>)}
              </FilterSelect>
            </div>
            <div style={{ flex: 1, minWidth: '120px' }}>
              <FilterSelect label="Gender" value={selectedGender} onChange={(e) => setSelectedGender(e.target.value)}>
                <option value="all">Semua</option>
                <option value="Ikhwan">Ikhwan</option>
                <option value="Akhwat">Akhwat</option>
              </FilterSelect>
            </div>
          </>
        }
      />
      {/* --------------------------------------- */}

      {/* CONTENT GRID */}
      {loading ? (
        <AnggotaSkeletonGrid />
      ) : anggotaList.length === 0 ? (
        <div className={styles.emptyState}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📂</div>
          <p>Belum ada data anggota di periode ini.</p>
        </div>
      ) : (
        <div className={styles.contentWrapper}>
          
          {sortedDivisiList.map((divisi) => {
            const members = memberMap[divisi.id];
            if (!members || members.length === 0) return null;

            return (
              <section key={divisi.id} className={styles.divisiSection}>
                <div className={styles.divisiHeader}>
                  <div className={styles.divisiTitleGroup}>
                    {divisi.logo_url ? <img src={divisi.logo_url} alt="logo" className={styles.divisiLogo} /> : <div className={styles.divisiLogoPlaceholder}>{divisi.nama_divisi.charAt(0)}</div>}
                    <div>
                        <h3 className={styles.divisiTitle}>{divisi.nama_divisi}</h3>
                        {divisi.tipe === 'Inti' && <span className={styles.badgeInti}>BPH / INTI</span>}
                    </div>
                  </div>
                  
                  <div className={styles.divisiActions}>
                     <Link to={`/divisi/${divisi.id}`} className={styles.linkDetail}>Detail <FiArrowRight/></Link>
                     {isAdmin && <button onClick={() => openModal("divisi", divisi)} className={styles.btnIconEdit}><FiEdit/></button>}
                  </div>
                </div>
                
                <div className={styles.cardGrid}>
                  {members.map((anggota) => (
                    <AnggotaCard key={anggota.id} data={anggota} isAdmin={isAdmin} onEdit={(item) => openModal("anggota", item)} onDelete={(id) => handleDelete("anggota", id)} />
                  ))}
                </div>
              </section>
            );
          })}

          {memberMap["others"]?.length > 0 && (
            <section className={styles.divisiSection}>
              <div className={styles.divisiHeader}>
                <h3 className={styles.divisiTitle}>Lainnya / Tanpa Divisi</h3>
              </div>
              <div className={styles.cardGrid}>
                {memberMap["others"].map((m) => (
                  <AnggotaCard key={m.id} data={m} isAdmin={isAdmin} onDelete={(id) => handleDelete("anggota", id)} onEdit={(item) => openModal("anggota", item)} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* MODAL FORM (INPUT DATA) */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={getModalTitle()}>
        {activeModal === "anggota" && <AnggotaForm formData={formData} onChange={handleFormChange} onFileChange={handleFileChange} onSubmit={handleSubmit} onCancel={closeModal} loading={modalLoading} preview={formPreview} periodeList={periodeList} divisiList={divisiPerPeriode} jabatanList={jabatanList} jabatanLinks={jabatanLinks} />}
        {activeModal === "divisi" && <DivisiForm formData={formData} onChange={handleFormChange} onFileChange={handleFileChange} onSubmit={handleSubmit} onCancel={closeModal} loading={modalLoading} periodeList={periodeList} preview={formPreview} />}
        {activeModal === "periode" && <PeriodeForm formData={formData} onChange={handleFormChange} onSubmit={handleSubmit} onCancel={closeModal} loading={modalLoading} />}
        
        {/* JABATAN MANAGER: Kita render di sini sebagai konten modal */}
        {activeModal === "jabatan" && <JabatanManager onClose={closeModal} onSuccess={fetchInitialData} jabatanList={jabatanList} />}
      </Modal>

      {/* MODAL REORDER (MANDIRI DI LUAR) */}
      {activeModal === "reorder_divisi" && (
        <DivisiReorderModal
          isOpen={true}
          onClose={closeModal}
          divisiList={divisiPerPeriode}
          activePeriodeId={activeTab}
          onSuccess={() => fetchInitialData()}
        />
      )}

    </PageContainer>
  );
}

export default DaftarAnggota;