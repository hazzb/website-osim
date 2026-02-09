import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

// Components
import PageContainer from "../components/ui/PageContainer.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import { AnggotaSkeletonGrid } from "../components/ui/Skeletons.jsx";
import { FilterSelect } from "../components/ui/FilterBar.jsx";
import AnggotaCard from "../components/cards/AnggotaCard.jsx";
import Modal from "../components/Modal.jsx";

// Forms & Managers
import AnggotaForm from "../components/forms/AnggotaForm.jsx";
import DivisiForm from "../components/forms/DivisiForm.jsx";
import DivisiReorderModal from "../components/admin/DivisiReorderModal.jsx";
import JabatanManager from "../components/admin/JabatanManager.jsx";
import KabinetWizard from "../components/admin/KabinetWizard.jsx";

import { uploadImage } from "../utils/uploadHelper";
import {
  FiSearch,
  FiPlus,
  FiEdit,
  FiBriefcase,
  FiList,
  FiZap,
  FiDatabase,
  FiLayout,
  FiGrid,
  FiArrowRight,
} from "react-icons/fi";

function DaftarAnggota() {
  const { session } = useAuth();
  const isAdmin = !!session;
  const navigate = useNavigate();

  // --- STATE ---
  const [periodeList, setPeriodeList] = useState([]);
  const [activeTab, setActiveTab] = useState("");
  const [viewMode, setViewMode] = useState("aesthetic");
  const [allDivisi, setAllDivisi] = useState([]);
  const [jabatanList, setJabatanList] = useState([]);
  const [divisiPerPeriode, setDivisiPerPeriode] = useState([]);
  const [anggotaList, setAnggotaList] = useState([]);

  // Filters
  const [selectedDivisi, setSelectedDivisi] = useState("semua");
  const [selectedGender, setSelectedGender] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [formFile, setFormFile] = useState(null);
  const [formPreview, setFormPreview] = useState(null);

  // ... (activePeriodeData, fetchInitialData, fetchAnggota, useEffects tetap sama) ...
  // [JANGAN DIHAPUS BAGIAN FETCH DATA YANG SUDAH ADA]
  const activePeriodeData = periodeList.find(
    (p) => String(p.id) === String(activeTab),
  );

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: periodes } = await supabase
        .from("periode_jabatan")
        .select("*")
        .order("tahun_mulai", { ascending: false });
      setPeriodeList(periodes || []);
      if (periodes?.length > 0 && !activeTab) {
        const active = periodes.find((p) => p.is_active);
        setActiveTab(active ? active.id : periodes[0].id);
      }
      const { data: divisis } = await supabase
        .from("divisi")
        .select("*")
        .order("urutan", { ascending: true });
      setAllDivisi(divisis || []);
      const { data: jabatans } = await supabase
        .from("master_jabatan")
        .select("*")
        .order("nama_jabatan", { ascending: true });
      setJabatanList(jabatans || []);
    } catch (err) {
      console.error("Init Error:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchAnggota = useCallback(
    async (periodeId) => {
      if (!periodeId && periodeId !== "semua") return;
      setLoading(true);
      try {
        let relevantDivisi = [];
        if (periodeId === "semua") relevantDivisi = allDivisi;
        else
          relevantDivisi = allDivisi.filter(
            (d) => String(d.periode_id) === String(periodeId),
          );
        setDivisiPerPeriode(relevantDivisi);

        let query = supabase
          .from("anggota")
          .select(
            `*, divisi ( nama_divisi, urutan, logo_url, tipe ), master_jabatan ( nama_jabatan ), periode_jabatan ( nama_kabinet )`,
          );
        if (periodeId !== "semua") query = query.eq("periode_id", periodeId);
        const { data, error } = await query;
        if (error) throw error;
        setAnggotaList(data || []);
      } catch (err) {
        console.error("Fetch Anggota Error:", err);
      } finally {
        setLoading(false);
      }
    },
    [allDivisi],
  );

  useEffect(() => {
    if (activeTab) fetchAnggota(activeTab);
  }, [activeTab, fetchAnggota]);

  // ... (Sort Logic helper functions tetap sama) ...
  const getJobRank = (jabatan) => {
    const j = jabatan?.toLowerCase() || "";
    if (j.includes("ketua") && !j.includes("wakil")) return 1;
    if (j.includes("wakil")) return 2;
    if (j.includes("sekretaris")) return 3;
    if (j.includes("bendahara")) return 4;
    if (j.includes("koordinator")) return 5;
    if (j.includes("staff ahli")) return 6;
    return 99;
  };
  const sortMembers = (members) => {
    return members.sort((a, b) => {
      const rankA = getJobRank(a.master_jabatan?.nama_jabatan);
      const rankB = getJobRank(b.master_jabatan?.nama_jabatan);
      if (rankA !== rankB) return rankA - rankB;
      return a.nama.localeCompare(b.nama);
    });
  };
  const getModalTitle = () => {
    if (activeModal === "jabatan") return "Kelola Jabatan";
    const action = editingId ? "Edit" : "Tambah";
    return `${action} ${
      activeModal?.charAt(0).toUpperCase() + activeModal?.slice(1) || ""
    }`;
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

  // --- MODAL MANAGEMENT (PERBAIKAN UTAMA) ---
  const openModal = (type, item = null) => {
    setActiveModal(type);
    setFormFile(null);
    setFormPreview(null);

    // 1. Reorder & Jabatan
    if (type === "reorder_divisi") {
      setIsModalOpen(false);
      return;
    }
    if (type === "jabatan") {
      setIsModalOpen(true);
      return;
    }

    // 2. Anggota/Divisi (Generic)
    if (item) {
      setEditingId(item.id);

      // PERBAIKAN: Handle null value agar input form tidak warning
      if (type === "anggota") {
        setFormData({
          ...item,
          divisi_id: item.divisi_id || "",
          jabatan_id: item.jabatan_id || "",
          instagram_username: item.instagram_username || "", // Handle null
          motto: item.motto || "", // Handle null
          alamat: item.alamat || "", // Handle null
        });
        setFormPreview(item.foto_url);
      } else if (type === "divisi") {
        setFormData({ ...item });
        setFormPreview(item.logo_url);
      }
    } else {
      setEditingId(null);
      const targetPeriode = activeTab === "semua" ? "" : activeTab;

      if (type === "anggota") {
        setFormData({
          nama: "",
          jenis_kelamin: "Ikhwan",
          periode_id: targetPeriode,
          divisi_id: selectedDivisi !== "semua" ? selectedDivisi : "",
          jabatan_id: "",
          instagram_username: "",
          alamat: "",
          motto: "",
        });
      } else if (type === "divisi") {
        setFormData({
          nama_divisi: "",
          deskripsi: "",
          urutan: 10,
          periode_id: targetPeriode,
          tipe: "Umum",
        });
      }
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveModal(null);
    setFormData({});
  };

  // --- CRUD ACTIONS (Tetap sama) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      let payload = {};
      let table = "";
      if (!formData.periode_id)
        throw new Error("Periode Jabatan harus dipilih!");

      if (activeModal === "divisi") {
        table = "divisi";
        let logoUrl = formData.logo_url;
        if (formFile) logoUrl = await uploadImage(formFile, "divisi");
        payload = {
          nama_divisi: formData.nama_divisi,
          deskripsi: formData.deskripsi,
          urutan: parseInt(formData.urutan || 10),
          logo_url: logoUrl,
          periode_id: parseInt(formData.periode_id),
          tipe: formData.tipe || "Umum",
        };
      } else if (activeModal === "anggota") {
        table = "anggota";
        let fotoUrl = formData.foto_url;
        if (formFile) fotoUrl = await uploadImage(formFile, "anggota");
        payload = {
          nama: formData.nama,
          motto: formData.motto,
          instagram_username: formData.instagram_username,
          jenis_kelamin: formData.jenis_kelamin,
          alamat: formData.alamat,
          foto_url: fotoUrl,
          divisi_id: parseInt(formData.divisi_id),
          periode_id: parseInt(formData.periode_id),
          jabatan_id: formData.jabatan_id
            ? parseInt(formData.jabatan_id)
            : null,
        };
      }

      if (editingId) {
        const { error } = await supabase
          .from(table)
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(table).insert(payload);
        if (error) throw error;
      }
      alert("Berhasil disimpan!");
      if (activeModal === "anggota") await fetchAnggota(activeTab);
      else {
        fetchInitialData();
        fetchAnggota(activeTab);
      }
      closeModal();
    } catch (err) {
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

  // --- FILTERING (Tetap sama) ---
  const filteredAnggota = anggotaList.filter((anggota) => {
    const matchDivisi =
      selectedDivisi === "semua" ||
      String(anggota.divisi_id) === String(selectedDivisi);
    const matchGender =
      selectedGender === "all" || anggota.jenis_kelamin === selectedGender;
    const matchSearch =
      searchTerm === "" ||
      anggota.nama.toLowerCase().includes(searchTerm.toLowerCase());
    return matchDivisi && matchGender && matchSearch;
  });

  const memberMap = {};
  filteredAnggota.forEach((member) => {
    const divId = member.divisi_id || "others";
    if (!memberMap[divId]) memberMap[divId] = [];
    memberMap[divId].push(member);
  });

  const sortedDivisiList = [...divisiPerPeriode].sort(
    (a, b) => (a.urutan || 99) - (b.urutan || 99),
  );

  return (
    <PageContainer breadcrumbText="Daftar Anggota">
      <PageHeader
        title={
          <div className="flex items-center flex-wrap gap-2">
            <span>Daftar Anggota</span>
            {activeTab === "semua" ? (
              <span className="text-[0.6em] text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                Semua Periode
              </span>
            ) : (
              activePeriodeData && (
                <span className="text-[0.6em] text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  {activePeriodeData.nama_kabinet}
                </span>
              )
            )}
          </div>
        }
        subtitle="Manajemen personil, struktur divisi, dan jabatan."
        actions={
          isAdmin && (
            <>
              <button
                onClick={() => navigate("/kelola-anggota")}
                className="button button-secondary" // Reusing global utility class but keeping logic
                title="Database"
              >
                <FiDatabase />{" "}
                <span className="hidden sm:inline">Database</span>
              </button>
              <button
                onClick={() => openModal("anggota")}
                className="button button-primary"
                title="Tambah Anggota"
              >
                <FiPlus /> Anggota
              </button>
              <button
                onClick={() => openModal("divisi")}
                className="button button-secondary"
                title="Tambah Divisi"
              >
                <FiPlus /> Divisi
              </button>
              <button
                onClick={() => openModal("reorder_divisi")}
                className="button button-secondary"
                title="Atur Urutan"
              >
                <FiList /> Urutan
              </button>
              <button
                onClick={() => setIsWizardOpen(true)}
                className="button button-secondary"
                title="Wizard Kabinet"
              >
                <FiZap /> Kabinet
              </button>
              <button
                onClick={() => openModal("jabatan")}
                className="button button-secondary"
                title="Master Jabatan"
              >
                <FiBriefcase /> Jabatan
              </button>
            </>
          )
        }
        searchBar={
          <div className="flex gap-2 w-full items-center">
            <div className="flex-1 min-w-[130px]">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="w-full h-10 px-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-600 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="semua">Semua Periode</option>
                {periodeList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama_kabinet} {p.is_active ? "(Aktif)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-lg h-10 shrink-0 gap-0.5 border border-slate-200">
              <button
                onClick={() => setViewMode("compact")}
                className={`border-none rounded-md px-2 cursor-pointer flex items-center justify-center transition-all ${viewMode === "compact" ? "bg-white text-blue-600 shadow-sm" : "bg-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"}`}
              >
                <FiLayout size={16} />
              </button>
              <button
                onClick={() => setViewMode("aesthetic")}
                className={`border-none rounded-md px-2 cursor-pointer flex items-center justify-center transition-all ${viewMode === "aesthetic" ? "bg-white text-blue-600 shadow-sm" : "bg-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"}`}
              >
                <FiGrid size={16} />
              </button>
            </div>
          </div>
        }
        filters={
          <>
            <div className="w-full mb-2 pb-2 border-b border-dashed border-slate-200 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Ketik nama anggota..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                autoFocus
              />
            </div>
            <div className="flex-1 min-w-[150px]">
              <FilterSelect
                label="Filter Divisi"
                value={selectedDivisi}
                onChange={(e) => setSelectedDivisi(e.target.value)}
              >
                <option value="semua">Semua Divisi</option>
                {divisiPerPeriode.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nama_divisi}
                  </option>
                ))}
              </FilterSelect>
            </div>
            <div className="flex-1 min-w-[120px]">
              <FilterSelect
                label="Filter Gender"
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
              >
                <option value="all">Semua</option>
                <option value="Ikhwan">Ikhwan</option>
                <option value="Akhwat">Akhwat</option>
              </FilterSelect>
            </div>
          </>
        }
      />

      {loading ? (
        <AnggotaSkeletonGrid />
      ) : anggotaList.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <div className="text-5xl mb-4 grayscale opacity-50">📂</div>
          <p className="font-medium">Belum ada data anggota di periode ini.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8 pt-6 pb-20">
          {sortedDivisiList.map((divisi) => {
            const rawMembers = memberMap[divisi.id] || [];
            const members = sortMembers([...rawMembers]);
            if (members.length === 0) return null;
            return (
              <section
                key={divisi.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    {divisi.logo_url ? (
                      <img
                        src={divisi.logo_url}
                        alt="logo"
                        className="w-12 h-12 object-cover rounded-xl bg-slate-50 border border-slate-100"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400 text-xl border border-slate-200">
                        {divisi.nama_divisi.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 m-0 leading-tight">
                        {divisi.nama_divisi}
                      </h3>
                      {divisi.tipe === "Inti" && (
                        <span className="bg-red-50 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-bold mt-1 inline-block border border-red-100">
                          BPH / INTI
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/divisi/${divisi.id}`}
                      className="inline-flex items-center gap-1 text-blue-600 text-sm font-semibold hover:underline"
                    >
                      Detail <FiArrowRight />
                    </Link>
                    {isAdmin && (
                      <button
                        onClick={() => openModal("divisi", divisi)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                        title="Edit Divisi"
                      >
                        <FiEdit size={16} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {members.map((anggota) => (
                    <AnggotaCard
                      key={anggota.id}
                      data={anggota}
                      isAdmin={isAdmin}
                      onEdit={(item) => openModal("anggota", item)}
                      onDelete={(id) => handleDelete("anggota", id)}
                      layout={viewMode}
                    />
                  ))}
                </div>
              </section>
            );
          })}
          {memberMap["others"]?.length > 0 && (
            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-800 m-0">
                  Lainnya / Tanpa Divisi
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortMembers([...memberMap["others"]]).map((m) => (
                  <AnggotaCard
                    key={m.id}
                    data={m}
                    isAdmin={isAdmin}
                    onDelete={(id) => handleDelete("anggota", id)}
                    onEdit={(item) => openModal("anggota", item)}
                    layout={viewMode}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* MODALS */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={getModalTitle()}>
        {activeModal === "anggota" && (
          <AnggotaForm
            formData={formData}
            onChange={handleFormChange}
            onFileChange={handleFileChange}
            onSubmit={handleSubmit}
            onCancel={closeModal}
            loading={modalLoading}
            preview={formPreview}
            periodeList={periodeList}
            divisiList={divisiPerPeriode}
            jabatanList={jabatanList}
          />
        )}
        {activeModal === "divisi" && (
          <DivisiForm
            formData={formData}
            onChange={handleFormChange}
            onFileChange={handleFileChange}
            onSubmit={handleSubmit}
            onCancel={closeModal}
            loading={modalLoading}
            periodeList={periodeList}
            preview={formPreview}
          />
        )}
        {activeModal === "jabatan" && (
          <JabatanManager
            onClose={closeModal}
            onSuccess={fetchInitialData}
            jabatanList={jabatanList}
          />
        )}
      </Modal>
      {activeModal === "reorder_divisi" && (
        <DivisiReorderModal
          isOpen={true}
          onClose={closeModal}
          divisiList={divisiPerPeriode}
          activePeriodeId={activeTab}
          onSuccess={() => fetchInitialData()}
        />
      )}
      {isWizardOpen && (
        <KabinetWizard
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          onSuccess={fetchInitialData}
        />
      )}
    </PageContainer>
  );
}

export default DaftarAnggota;
