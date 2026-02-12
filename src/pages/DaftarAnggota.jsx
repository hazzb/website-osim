import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

// Components
import PageContainer from "../components/ui/PageContainer.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import { AnggotaSkeletonGrid } from "../components/ui/Skeletons.jsx";
import {
  FilterSelect,
  FilterSearch,
  FilterToggle,
  FilterIconButton,
} from "../components/ui/FilterBar.jsx";
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
  const [visibleCount, setVisibleCount] = useState(12);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [formFile, setFormFile] = useState(null);
  const [formPreview, setFormPreview] = useState(null);
  const observerTarget = useRef(null);

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
  }, [fetchInitialData]);

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
    if (activeTab) {
      fetchAnggota(activeTab);
      setVisibleCount(12);
    }
  }, [activeTab, fetchAnggota]);

  // Infinite Scroll Intersection Observer
  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setVisibleCount((prev) => prev + 12);
        }
      },
      { threshold: 1.0 },
    );

    observer.observe(target);
    return () => {
      if (target) observer.unobserve(target);
    };
  }, [loading]);

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

  const openModal = (type, item = null) => {
    setActiveModal(type);
    setFormFile(null);
    setFormPreview(null);
    if (type === "reorder_divisi") {
      setIsModalOpen(false);
      return;
    }
    if (type === "jabatan") {
      setIsModalOpen(true);
      return;
    }
    if (item) {
      setEditingId(item.id);
      if (type === "anggota") {
        setFormData({
          ...item,
          divisi_id: item.divisi_id || "",
          jabatan_id: item.jabatan_id || "",
          instagram_username: item.instagram_username || "",
          motto: item.motto || "",
          alamat: item.alamat || "",
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

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setActiveModal(null);
    setFormData({});
  }, []);

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

  // --- HANDLERS ---
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleFileChange = useCallback((e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormFile(file);
      const objectUrl = URL.createObjectURL(file);
      setFormPreview(objectUrl);
    }
  }, []);

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

  const getModalTitle = () => {
    if (activeModal === "jabatan") return "Kelola Jabatan";
    const action = editingId ? "Edit" : "Tambah";
    return `${action} ${
      activeModal?.charAt(0).toUpperCase() + activeModal?.slice(1) || ""
    }`;
  };

  return (
    <PageContainer breadcrumbText="Daftar Anggota">
      <PageHeader
        title="Daftar Anggota"
        subtitle={
          activeTab === "semua"
            ? "Menampilkan anggota dari semua periode"
            : activePeriodeData
              ? `Periode: ${activePeriodeData.nama_kabinet}`
              : "Manajemen personil, struktur divisi, dan jabatan"
        }
        actions={
          isAdmin && (
            <>
              <button
                onClick={() => navigate("/kelola-anggota")}
                className="button button-secondary"
              >
                <FiDatabase /> <span>Database</span>
              </button>
              <button
                onClick={() => openModal("anggota")}
                className="button button-primary"
              >
                <FiPlus /> <span>Anggota</span>
              </button>
              <button
                onClick={() => openModal("divisi")}
                className="button button-secondary"
              >
                <FiPlus /> <span>Divisi</span>
              </button>
              <button
                onClick={() => openModal("reorder_divisi")}
                className="button button-secondary"
              >
                <FiList /> <span>Urutan</span>
              </button>
              <button
                onClick={() => setIsWizardOpen(true)}
                className="button button-secondary"
              >
                <FiZap /> <span>Kabinet</span>
              </button>
              <button
                onClick={() => openModal("jabatan")}
                className="button button-secondary"
              >
                <FiBriefcase /> <span>Jabatan</span>
              </button>
            </>
          )
        }
        searchBar={
          <FilterSearch
            placeholder="Cari anggota..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        }
        genderFilter={
          <FilterToggle
            value={selectedGender}
            onChange={setSelectedGender}
            options={[
              { value: "all", label: "All" },
              { value: "Ikhwan", label: "L" },
              { value: "Akhwat", label: "P" },
            ]}
          />
        }
        extraActions={
          <div className="flex bg-slate-100 p-1 rounded-lg shrink-0 gap-0.5 border border-slate-200">
            <button
              onClick={() => setViewMode("compact")}
              className={`border-none rounded-md px-2 py-1 cursor-pointer flex items-center justify-center transition-all ${
                viewMode === "compact"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "bg-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
              }`}
              title="List View"
            >
              <FiLayout size={16} />
            </button>
            <button
              onClick={() => setViewMode("aesthetic")}
              className={`border-none rounded-md px-2 py-1 cursor-pointer flex items-center justify-center transition-all ${
                viewMode === "aesthetic"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "bg-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
              }`}
              title="Grid View"
            >
              <FiGrid size={16} />
            </button>
          </div>
        }
        filters={
          <div className="flex flex-wrap gap-4 w-full">
            <div className="flex-1 min-w-[200px]">
              <FilterSelect
                label="Periode Jabatan"
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
              >
                <option value="semua">Semua Periode</option>
                {periodeList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama_kabinet} {p.is_active ? "(Aktif)" : ""}
                  </option>
                ))}
              </FilterSelect>
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
          </div>
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
          {(() => {
            let renderedCount = 0;
            const limit = visibleCount;
            return (
              <>
                {filteredAnggota.length === 0 ? (
                  <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl animate-fadeIn">
                    <div className="text-6xl mb-4 grayscale opacity-30">🔍</div>
                    <h3 className="text-xl font-bold text-slate-700 m-0">
                      Pencarian tidak ditemukan
                    </h3>
                    <p className="text-slate-500 mt-2 max-w-xs mx-auto">
                      Tidak ada anggota yang cocok dengan filter atau kata kunci
                      "
                      <span className="font-semibold text-blue-600">
                        {searchTerm}
                      </span>
                      ".
                    </p>
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedGender("all");
                        setSelectedDivisi("semua");
                      }}
                      className="mt-6 text-blue-600 font-semibold hover:underline bg-transparent border-none cursor-pointer"
                    >
                      Reset Filter
                    </button>
                  </div>
                ) : (
                  <>
                    {sortedDivisiList.map((divisi) => {
                      if (renderedCount >= limit) return null;
                      const rawMembers = memberMap[divisi.id] || [];
                      const members = sortMembers([...rawMembers]);
                      if (members.length === 0) return null;
                      const remainingQuota = limit - renderedCount;
                      if (remainingQuota <= 0) return null;
                      const membersToShow = members.slice(0, remainingQuota);
                      renderedCount += membersToShow.length;
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
                            {membersToShow.map((anggota) => (
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
                          {members.length > membersToShow.length && (
                            <div className="text-center text-xs text-slate-400 mt-4 italic">
                              +{members.length - membersToShow.length} anggota
                              lainnya (Load More untuk melihat)
                            </div>
                          )}
                        </section>
                      );
                    })}

                    {memberMap["others"]?.length > 0 &&
                      renderedCount < limit && (
                        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                            <h3 className="text-lg font-bold text-slate-800 m-0">
                              Lainnya / Tanpa Divisi
                            </h3>
                          </div>
                          {(() => {
                            const others = sortMembers([
                              ...memberMap["others"],
                            ]);
                            const remainingQuota = limit - renderedCount;
                            const othersToShow = others.slice(
                              0,
                              remainingQuota,
                            );
                            renderedCount += othersToShow.length;
                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {othersToShow.map((m) => (
                                  <AnggotaCard
                                    key={m.id}
                                    data={m}
                                    isAdmin={isAdmin}
                                    onDelete={(id) =>
                                      handleDelete("anggota", id)
                                    }
                                    onEdit={(item) =>
                                      openModal("anggota", item)
                                    }
                                    layout={viewMode}
                                  />
                                ))}
                              </div>
                            );
                          })()}
                        </section>
                      )}
                  </>
                )}

                {renderedCount < filteredAnggota.length && (
                  <div
                    ref={observerTarget}
                    className="flex flex-col items-center justify-center py-10 gap-3"
                  >
                    <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                    <span className="text-slate-400 text-sm font-medium">
                      Memuat lebih banyak...
                    </span>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={getModalTitle()}>
        {activeModal === "anggota" && (
          <AnggotaForm
            formData={formData}
            onChange={handleChange}
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
            onChange={handleChange}
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
