import React, { useState, useEffect } from "react";
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
  FiSearch,
} from "react-icons/fi";

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
          a.jabatan_di_divisi || a.master_jabatan?.nama_jabatan,
        );
        const rankB = getJabatanRank(
          b.jabatan_di_divisi || b.master_jabatan?.nama_jabatan,
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
        .includes(searchTerm.toLowerCase()),
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
    return (
      <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-center font-semibold mt-8">
        Divisi tidak ditemukan
      </div>
    );

  return (
    <PageContainer>
      <PageHeader
        title={data.divisi.nama_divisi}
        subtitle={data.divisi.deskripsi || "Informasi detail divisi."}
        // --- HEADER BARU (Layout mirip Daftar Anggota) ---
        searchBar={
          <div className="flex items-center gap-3 w-full">
            {/* 1. Tombol Kembali (Kiri) */}
            <button
              className="flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 transition-all shrink-0 cursor-pointer"
              onClick={() => navigate(-1)}
              title="Kembali"
            >
              <FiArrowLeft size={18} />
            </button>

            {/* 2. Search Bar (Tengah & Flexible) */}
            <div className="flex-1 relative min-w-[100px]">
              <FiSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                placeholder="Cari anggota divisi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              />
            </div>

            {/* 3. Actions Kanan (Edit & Toggle) */}
            <div className="flex items-center gap-2 shrink-0">
              {isAdmin && (
                <button
                  className="flex items-center gap-2 px-4 h-10 bg-blue-50 border border-blue-200 rounded-lg text-blue-600 font-semibold text-sm cursor-pointer whitespace-nowrap hover:bg-blue-100 hover:border-blue-300 transition-all w-10 p-0 sm:w-auto sm:px-4 justify-center"
                  onClick={() => {
                    setFormData(data.divisi);
                    setFormPreview(data.divisi.logo_url);
                    setActiveModal("divisi");
                  }}
                  title="Edit Divisi"
                >
                  <FiEdit />
                  <span className="hidden sm:inline">Edit</span>
                </button>
              )}

              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 h-10 box-border gap-0.5">
                <button
                  className={`border-none bg-transparent px-2.5 h-full rounded-md cursor-pointer flex items-center justify-center transition-all ${viewMode === "aesthetic" ? "bg-white text-blue-600 shadow-sm font-bold" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
                  onClick={() => setViewMode("aesthetic")}
                  title="Grid View"
                >
                  <FiGrid />
                </button>
                <button
                  className={`border-none bg-transparent px-2.5 h-full rounded-md cursor-pointer flex items-center justify-center transition-all ${viewMode === "compact" ? "bg-white text-blue-600 shadow-sm font-bold" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
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
      <div className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col md:flex-row items-center md:items-start md:text-left text-center mb-12 shadow-sm gap-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
        <div className="w-[120px] h-[120px] shrink-0 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center p-4 overflow-hidden md:mb-0 shadow-inner group">
          <img
            src={data.divisi.logo_url || "/placeholder.png"}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110 cursor-zoom-in"
            onClick={() => setIsLogoLightboxOpen(true)}
            alt={data.divisi.nama_divisi}
          />
        </div>
        <div className="flex-1">
          <h3 className="m-0 mb-3 text-2xl font-extrabold text-slate-800 tracking-tight">
            Tentang {data.divisi.nama_divisi}
          </h3>
          <p className="text-slate-600 leading-relaxed text-base">
            {data.divisi.deskripsi}
          </p>
        </div>
      </div>

      {/* ANGGOTA SECTION (Filtered) */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3 border-b border-slate-200 pb-3">
          <FiUsers className="text-blue-500" /> Anggota (
          {filteredAnggota.length})
        </h2>

        {filteredAnggota.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center text-slate-400 italic">
            {searchTerm
              ? "Tidak ada anggota yang cocok dengan pencarian."
              : "Belum ada anggota."}
          </div>
        ) : (
          <div
            className={
              viewMode === "aesthetic"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            }
          >
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
      <div className="mb-12">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3 border-b border-slate-200 pb-3">
          <FiBriefcase className="text-indigo-500" /> Program Kerja (
          {data.progja.length})
        </h2>
        <div className="w-full columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {data.progja.map((p) => (
            <div key={p.id} className="break-inside-avoid">
              <ProgramKerjaCard
                data={p}
                isAdmin={isAdmin}
                onEdit={() => {
                  setEditingId(p.id);
                  setFormData(p);
                  setActiveModal("progja");
                }}
              />
            </div>
          ))}
          {data.progja.length === 0 && (
            <div className="col-span-full py-8 text-center text-slate-400 italic bg-slate-50 rounded-xl border-dashed border-2 border-slate-200 w-full">
              Belum ada program kerja.
            </div>
          )}
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
