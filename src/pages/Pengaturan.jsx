import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

// Components
import PageContainer from "../components/ui/PageContainer.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import FormInput from "../components/admin/FormInput.jsx";
import { uploadImage } from "../utils/uploadHelper";

// Icons
import { FiSave, FiMonitor, FiInfo, FiPhone, FiImage } from "react-icons/fi";

function Pengaturan() {
  const { session } = useAuth();
  const isAdmin = !!session;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("umum");

  // Data State
  const [formData, setFormData] = useState({});
  const [files, setFiles] = useState({ logo_sekolah: null, logo_osis: null });
  const [previews, setPreviews] = useState({
    logo_sekolah: null,
    logo_osis: null,
  });

  // 1. FETCH DATA
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("pengaturan")
          .select("*")
          .eq("id", 1)
          .single();

        if (error && error.code !== "PGRST116") throw error;

        if (data) {
          setFormData(data);
          setPreviews({
            logo_sekolah: data.logo_sekolah_url,
            logo_osis: data.logo_osis_url,
          });
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // 2. HANDLERS
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setFiles((prev) => ({ ...prev, [field]: file }));
      setPreviews((prev) => ({ ...prev, [field]: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let updates = { ...formData, id: 1 };

      if (files.logo_sekolah) {
        updates.logo_sekolah_url = await uploadImage(
          files.logo_sekolah,
          "logos",
        );
      }
      if (files.logo_osis) {
        updates.logo_osis_url = await uploadImage(files.logo_osis, "logos");
      }

      const { error } = await supabase.from("pengaturan").upsert(updates);
      if (error) throw error;

      alert("Pengaturan berhasil disimpan!");
      window.location.reload();
    } catch (err) {
      alert("Gagal menyimpan: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <PageContainer>
      <PageHeader
        title="Pengaturan Website"
        subtitle="Kelola informasi umum, kontak, dan tampilan sesuai database."
        primaryAction={
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="button button-primary min-w-[100px] !py-2 !px-4 !text-xs"
            title="Simpan Perubahan"
          >
            {saving ? (
              "..."
            ) : (
              <>
                <FiSave /> <span>Simpan</span>
              </>
            )}
          </button>
        }
      />

      {/* Tabs Navigation */}
      <div className="mb-6 overflow-x-auto pb-1">
        <div className="inline-flex gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab("umum")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === "umum"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            <FiMonitor /> Umum & Tampilan
          </button>
          <button
            onClick={() => setActiveTab("kontak")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === "kontak"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            <FiPhone /> Kontak & Sosmed
          </button>
          <button
            onClick={() => setActiveTab("tentang")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeTab === "tentang"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            <FiInfo /> Tentang & Footer
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm max-w-4xl mx-auto mb-12">
        <div className="w-full">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-12 gap-y-4 gap-x-6"
          >
            {/* --- TAB 1: UMUM & TAMPILAN --- */}
            {activeTab === "umum" && (
              <>
                <div className="col-span-12">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 pb-3 border-b border-dashed border-slate-200">
                    Identitas Organisasi
                  </h3>
                </div>

                <div className="col-span-12 md:col-span-6">
                  <FormInput
                    label="Nama Organisasi"
                    name="nama_organisasi"
                    value={formData.nama_organisasi || ""}
                    onChange={handleChange}
                    placeholder="Contoh: OSIS SMAN Contoh"
                    span={12} // FormInput handles responsive mapping
                  />
                </div>
                <div className="col-span-12 md:col-span-6">
                  <FormInput
                    label="Nama Sekolah"
                    name="nama_sekolah"
                    value={formData.nama_sekolah || ""}
                    onChange={handleChange}
                    placeholder="Nama sekolah lengkap"
                    span={12}
                  />
                </div>

                {/* Upload Logos */}
                <div className="col-span-12 md:col-span-6">
                  <div className="flex flex-col w-full">
                    <label className="text-sm font-semibold text-slate-700 mb-1.5">
                      Logo Sekolah
                    </label>
                    <div className="flex items-center gap-4 p-3 border border-dashed border-slate-300 rounded-lg bg-slate-50">
                      <div className="w-[70px] h-[70px] bg-white border border-slate-200 rounded-lg flex items-center justify-center p-1 shrink-0">
                        {previews.logo_sekolah ? (
                          <img
                            src={previews.logo_sekolah}
                            className="w-full h-full object-contain"
                            alt="Preview"
                          />
                        ) : (
                          <span className="text-[10px] text-slate-300">
                            No img
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "logo_sekolah")}
                          className="block w-full text-xs text-slate-500
                            file:mr-2 file:py-1 file:px-2
                            file:rounded-md file:border-0
                            file:text-xs file:font-semibold
                            file:bg-slate-200 file:text-slate-700
                            hover:file:bg-slate-300
                            cursor-pointer"
                        />
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          Maks 2MB (PNG/JPG)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-12 md:col-span-6">
                  <div className="flex flex-col w-full">
                    <label className="text-sm font-semibold text-slate-700 mb-1.5">
                      Logo OSIS
                    </label>
                    <div className="flex items-center gap-4 p-3 border border-dashed border-slate-300 rounded-lg bg-slate-50">
                      <div className="w-[70px] h-[70px] bg-white border border-slate-200 rounded-lg flex items-center justify-center p-1 shrink-0">
                        {previews.logo_osis ? (
                          <img
                            src={previews.logo_osis}
                            className="w-full h-full object-contain"
                            alt="Preview"
                          />
                        ) : (
                          <span className="text-[10px] text-slate-300">
                            No img
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, "logo_osis")}
                          className="block w-full text-xs text-slate-500
                            file:mr-2 file:py-1 file:px-2
                            file:rounded-md file:border-0
                            file:text-xs file:font-semibold
                            file:bg-slate-200 file:text-slate-700
                            hover:file:bg-slate-300
                            cursor-pointer"
                        />
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          Maks 2MB (PNG/JPG)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-12">
                  <FormInput
                    label="Alamat Lengkap"
                    name="alamat"
                    type="textarea"
                    value={formData.alamat || ""}
                    onChange={handleChange}
                    span={12}
                  />
                </div>
              </>
            )}

            {/* --- TAB 2: KONTAK & SOSMED --- */}
            {activeTab === "kontak" && (
              <>
                <div className="col-span-12">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 pb-3 border-b border-dashed border-slate-200">
                    Kontak & Sosial Media
                  </h3>
                </div>

                <div className="col-span-12 md:col-span-6">
                  <FormInput
                    label="Email Resmi"
                    name="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={handleChange}
                    span={12}
                  />
                </div>
                <div className="col-span-12 md:col-span-6">
                  <FormInput
                    label="Nomor HP / WA"
                    name="no_hp"
                    value={formData.no_hp || ""}
                    onChange={handleChange}
                    span={12}
                  />
                </div>

                <div className="col-span-12 my-4 border-t border-dashed border-slate-200"></div>

                <div className="col-span-12 md:col-span-6">
                  <FormInput
                    label="Instagram URL"
                    name="instagram_url"
                    value={formData.instagram_url || ""}
                    onChange={handleChange}
                    placeholder="https://instagram.com/..."
                    span={12}
                  />
                </div>
                <div className="col-span-12 md:col-span-6">
                  <FormInput
                    label="TikTok URL"
                    name="tiktok_url"
                    value={formData.tiktok_url || ""}
                    onChange={handleChange}
                    placeholder="https://tiktok.com/@..."
                    span={12}
                  />
                </div>
                <div className="col-span-12 md:col-span-6">
                  <FormInput
                    label="YouTube URL"
                    name="youtube_url"
                    value={formData.youtube_url || ""}
                    onChange={handleChange}
                    span={12}
                  />
                </div>
              </>
            )}

            {/* --- TAB 3: TENTANG & FOOTER --- */}
            {activeTab === "tentang" && (
              <>
                <div className="col-span-12">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 pb-3 border-b border-dashed border-slate-200">
                    Konfigurasi Halaman
                  </h3>
                </div>

                <div className="col-span-12">
                  <FormInput
                    label="Deskripsi Singkat (Footer)"
                    name="deskripsi_singkat"
                    type="textarea"
                    value={formData.deskripsi_singkat || ""}
                    onChange={handleChange}
                    span={12}
                  />
                </div>

                <div className="col-span-12 md:col-span-6">
                  <div className="flex flex-col w-full mb-0">
                    <label className="text-sm font-semibold text-slate-700 mb-1.5">
                      Tampilan Hero Section
                    </label>
                    <div className="flex items-center gap-2 mt-1.5">
                      <input
                        type="checkbox"
                        name="beranda_tampilkan_hero"
                        checked={formData.beranda_tampilkan_hero || false}
                        onChange={handleChange}
                        id="chkHero"
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="chkHero"
                        className="text-sm text-slate-700 cursor-pointer select-none"
                      >
                        Tampilkan judul besar di halaman utama
                      </label>
                    </div>
                  </div>
                </div>

                <div className="col-span-12 md:col-span-6">
                  <FormInput
                    label="Layout Visi Misi"
                    name="visi_misi_layout"
                    type="select"
                    value={formData.visi_misi_layout || "modular"}
                    onChange={handleChange}
                    span={12}
                  >
                    <option value="modular">Modular Grid (Modern)</option>
                    <option value="split">Split Card (Klasik)</option>
                    <option value="zigzag">Zig-Zag Story</option>
                    <option value="simple">Simple Centered (Vertical)</option>
                  </FormInput>
                </div>

                {/* SETTING FOOTER */}
                <div className="col-span-12 mt-4 pt-4 border-t border-dashed border-slate-200">
                  <strong className="block mb-2 text-slate-700 text-sm font-bold">
                    Pengaturan Footer
                  </strong>
                  <FormInput
                    label="Divisi Pengelola (Managed By)"
                    name="footer_managed_by"
                    value={formData.footer_managed_by || ""}
                    onChange={handleChange}
                    span={12}
                    placeholder="Contoh: Divisi Media"
                  />
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </PageContainer>
  );
}

export default Pengaturan;
