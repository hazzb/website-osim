import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import DOMPurify from "dompurify";
// import styles from "./ProgramKerjaDetail.module.css"; // REMOVED

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
          `*, divisi:divisi_id (nama_divisi), pj:penanggung_jawab_id (nama)`,
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
      <div className="text-center mt-12 text-red-500 font-medium">
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
          <div className="flex items-center justify-between w-full gap-2.5 mt-1 sm:mt-0">
            <button
              className="flex items-center justify-center gap-2 px-4 h-10 bg-white border border-slate-200 rounded-lg text-slate-600 font-semibold text-sm cursor-pointer whitespace-nowrap hover:bg-slate-50 hover:text-slate-800 transition-all sm:w-auto w-10 p-0 sm:px-4"
              onClick={() => navigate(-1)}
              title="Kembali"
            >
              <FiArrowLeft /> <span className="hidden sm:inline">Kembali</span>
            </button>

            {isAdmin && (
              <div className="flex items-center gap-2">
                <button
                  className="flex items-center justify-center gap-2 px-4 h-10 bg-blue-50 border border-blue-200 rounded-lg text-blue-600 font-semibold text-sm cursor-pointer whitespace-nowrap hover:bg-blue-100 hover:border-blue-400 transition-all sm:w-auto w-10 p-0 sm:px-4"
                  onClick={handleEdit}
                  title="Edit"
                >
                  <FiEdit /> <span className="hidden sm:inline">Edit</span>
                </button>
                <button
                  className="flex items-center justify-center gap-2 px-4 h-10 bg-red-50 border border-red-200 rounded-lg text-red-600 font-semibold text-sm cursor-pointer whitespace-nowrap hover:bg-red-100 hover:border-red-400 transition-all sm:w-auto w-10 p-0 sm:px-4"
                  onClick={handleDelete}
                  title="Hapus"
                >
                  <FiTrash2 /> <span className="hidden sm:inline">Hapus</span>
                </button>
              </div>
            )}
          </div>
        }
        actions={null}
      />

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mt-4">
        {progja.embed_html && (
          <div className="bg-black flex justify-center items-center p-8 min-h-[300px]">
            <div className="bg-white rounded-lg overflow-hidden max-w-[500px] w-full">
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

        <div className="p-6 md:p-10 bg-slate-50 border-b border-slate-200">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-6 leading-tight">
            {progja.nama_acara}
          </h1>

          <div className="flex flex-wrap gap-8">
            {/* Waktu */}
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 text-xl shadow-sm">
                <FiCalendar />
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Waktu Pelaksanaan
                </span>
                <span className="block text-base font-semibold text-slate-700">
                  {formattedDate}
                </span>
              </div>
            </div>

            {/* Divisi */}
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 text-xl shadow-sm">
                <FiBriefcase />
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Divisi Pelaksana
                </span>
                <span className="block text-base font-semibold text-blue-600">
                  {progja.divisi?.nama_divisi || "Umum"}
                </span>
              </div>
            </div>

            {/* Penanggung Jawab */}
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 text-xl shadow-sm">
                <FiUser />
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Penanggung Jawab
                </span>
                <span className="block text-base font-semibold text-slate-700">
                  {progja.pj?.nama || "-"}
                </span>
              </div>
            </div>

            {/* BARU: Target Peserta */}
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 text-xl shadow-sm">
                <FiUsers />
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">
                  Target Peserta
                </span>
                <span
                  className="block text-base font-semibold"
                  style={{ color: getGenderColor(progja.target_gender) }}
                >
                  {progja.target_gender || "Umum"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-10">
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            Deskripsi Kegiatan
          </h3>
          {progja.deskripsi ? (
            <div className="text-base leading-loose text-slate-600 space-y-4">
              {progja.deskripsi.split("\n").map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 italic">Tidak ada deskripsi detail.</p>
          )}

          {progja.link_dokumentasi && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <a
                href={progja.link_dokumentasi}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 px-5 py-3 rounded-lg bg-blue-50 text-blue-600 font-semibold hover:bg-blue-100 hover:text-blue-700 transition-colors border border-transparent"
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
