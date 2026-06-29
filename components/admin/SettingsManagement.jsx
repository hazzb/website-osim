"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import PageContainer from "@/components/ui/PageContainer";
import PageHeader from "@/components/ui/PageHeader";
import LoadingState from "@/components/ui/LoadingState";
import FormInput from "@/components/admin/FormInput";
import { uploadImage } from "@/utils/uploadHelper";
import {
  FiSave,
  FiMonitor,
  FiInfo,
  FiPhone,
  FiImage,
  FiGlobe,
} from "react-icons/fi";

export default function SettingsManagement() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("umum");

  const [formData, setFormData] = useState({});
  const [files, setFiles] = useState({ logo_sekolah: null, logo_osis: null });
  const [previews, setPreviews] = useState({
    logo_sekolah: null,
    logo_osis: null,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("pengaturan")
          .select("*")
          .eq("id", 1)
          .single();
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
    if (e) e.preventDefault();
    setSaving(true);
    try {
      let updates = { ...formData, id: 1 };
      if (files.logo_sekolah)
        updates.logo_sekolah_url = await uploadImage(
          files.logo_sekolah,
          "logos",
        );
      if (files.logo_osis)
        updates.logo_osis_url = await uploadImage(files.logo_osis, "logos");

      const { error } = await supabase.from("pengaturan").upsert(updates);
      if (error) throw error;
      alert("Pengaturan berhasil disimpan!");
    } catch (err) {
      alert("Gagal: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Memuat konfigurasi sistem..." />;

  return (
    <PageContainer breadcrumbText="Pengaturan Website">
      <PageHeader
        title="Konfigurasi Website"
        subtitle="Kelola identitas, kontak, dan tampilan utama organisasi."
      />

      <div className="flex flex-col md:flex-row gap-8 mt-4 pb-24">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 flex flex-col gap-2">
          {[
            { id: "umum", label: "Umum & Tampilan", icon: <FiMonitor /> },
            { id: "kontak", label: "Kontak & Sosmed", icon: <FiPhone /> },
            { id: "tentang", label: "Tentang & Footer", icon: <FiInfo /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-5 py-4 text-xs font-black uppercase tracking-widest rounded-2xl transition-all border-2 ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200"
                  : "bg-bg-card text-text-muted border-transparent hover:bg-bg-page hover:text-text-body"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-bg-card border border-border-dim rounded-3xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-6">
            {activeTab === "umum" && (
              <>
                <div className="col-span-12 mb-4">
                  <h3 className="text-sm font-black text-text-main uppercase tracking-widest flex items-center gap-2">
                    <FiGlobe className="text-primary" /> Identitas Organisasi
                  </h3>
                  <div className="h-1 w-12 bg-blue-500 rounded-full mt-2"></div>
                </div>

                <FormInput
                  label="Nama Organisasi"
                  name="nama_organisasi"
                  value={formData.nama_organisasi || ""}
                  onChange={handleChange}
                  placeholder="Contoh: OSIS SMAN Contoh"
                  span={12}
                />

                <FormInput
                  label="Nama Sekolah / Institusi"
                  name="nama_sekolah"
                  value={formData.nama_sekolah || ""}
                  onChange={handleChange}
                  placeholder="Nama sekolah lengkap"
                  span={12}
                />

                <div className="col-span-12 md:col-span-6">
                  <label className="block text-[10px] font-extrabold text-text-muted uppercase tracking-widest mb-3 px-1">
                    Logo Sekolah
                  </label>
                  <div className="relative group">
                    <div className="w-full aspect-square md:aspect-video bg-bg-page border-2 border-dashed border-border-dim rounded-2xl flex items-center justify-center p-6 transition-all group-hover:border-blue-400 group-hover:bg-primary-light/30 overflow-hidden">
                      {previews.logo_sekolah ? (
                        <img
                          src={previews.logo_sekolah}
                          className="max-w-full max-h-full object-contain"
                          alt="Logo Sekolah"
                        />
                      ) : (
                        <FiImage size={40} className="text-slate-200" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "logo_sekolah")}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="col-span-12 md:col-span-6">
                  <label className="block text-[10px] font-extrabold text-text-muted uppercase tracking-widest mb-3 px-1">
                    Logo Organisasi
                  </label>
                  <div className="relative group">
                    <div className="w-full aspect-square md:aspect-video bg-bg-page border-2 border-dashed border-border-dim rounded-2xl flex items-center justify-center p-6 transition-all group-hover:border-blue-400 group-hover:bg-primary-light/30 overflow-hidden">
                      {previews.logo_osis ? (
                        <img
                          src={previews.logo_osis}
                          className="max-w-full max-h-full object-contain"
                          alt="Logo OSIS"
                        />
                      ) : (
                        <FiImage size={40} className="text-slate-200" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "logo_osis")}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <FormInput
                  label="Alamat Sekretariat"
                  name="alamat"
                  type="textarea"
                  value={formData.alamat || ""}
                  onChange={handleChange}
                  span={12}
                  rows={3}
                />
              </>
            )}

            {activeTab === "kontak" && (
              <>
                <div className="col-span-12 mb-4">
                  <h3 className="text-sm font-black text-text-main uppercase tracking-widest flex items-center gap-2">
                    <FiPhone className="text-emerald-500" /> Kontak & Saluran
                    Resmi
                  </h3>
                  <div className="h-1 w-12 bg-emerald-500 rounded-full mt-2"></div>
                </div>

                <FormInput
                  label="Email Resmi"
                  name="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  span={6}
                />
                <FormInput
                  label="WhatsApp / No HP"
                  name="no_hp"
                  value={formData.no_hp || ""}
                  onChange={handleChange}
                  span={6}
                />

                <FormInput
                  label="Instagram URL"
                  name="instagram_url"
                  value={formData.instagram_url || ""}
                  onChange={handleChange}
                  placeholder="https://instagram.com/..."
                  span={12}
                />
                <FormInput
                  label="TikTok URL"
                  name="tiktok_url"
                  value={formData.tiktok_url || ""}
                  onChange={handleChange}
                  placeholder="https://tiktok.com/@..."
                  span={12}
                />
                <FormInput
                  label="YouTube Channel URL"
                  name="youtube_url"
                  value={formData.youtube_url || ""}
                  onChange={handleChange}
                  span={12}
                />
              </>
            )}

            {activeTab === "tentang" && (
              <>
                <div className="col-span-12 mb-4">
                  <h3 className="text-sm font-black text-text-main uppercase tracking-widest flex items-center gap-2">
                    <FiInfo className="text-indigo-500" /> Konfigurasi Halaman &
                    Footer
                  </h3>
                  <div className="h-1 w-12 bg-indigo-500 rounded-full mt-2"></div>
                </div>

                <FormInput
                  label="Deskripsi Footer"
                  name="deskripsi_singkat"
                  type="textarea"
                  value={formData.deskripsi_singkat || ""}
                  onChange={handleChange}
                  span={12}
                  rows={4}
                  placeholder="Jelaskan secara singkat mengenai organisasi untuk ditampilkan di footer."
                />

                <div className="col-span-12 md:col-span-6 bg-bg-page p-4 rounded-2xl border border-border-dim ring-1 ring-slate-100/50">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="beranda_tampilkan_hero"
                        checked={formData.beranda_tampilkan_hero || false}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-border-dim rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-bg-card after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-blue-600"></div>
                    </div>
                    <div>
                      <span className="text-xs font-black text-text-main uppercase tracking-tight">
                        Tampilan Hero
                      </span>
                      <p className="text-[10px] text-text-muted font-medium">
                        Tampilkan teks selamat datang di halaman utama.
                      </p>
                    </div>
                  </label>
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
                    <option value="simple">Simple Centered</option>
                  </FormInput>
                </div>

                <FormInput
                  label="Divisi Pengelola Website (Managed By)"
                  name="footer_managed_by"
                  value={formData.footer_managed_by || ""}
                  onChange={handleChange}
                  span={12}
                  placeholder="Contoh: Divisi IT & Multimedia"
                />
              </>
            )}
          </form>
        </div>
      </div>

      {/* Sticky Bottom Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:left-64 bg-bg-card/80 backdrop-blur-md border-t border-border-dim p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          <div className="hidden md:block">
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">
              Pengaturan Website
            </p>
            <p className="text-xs font-medium text-text-body">
              {saving
                ? "Sedang menyimpan data..."
                : "Pastikan semua data sudah benar sebelum menyimpan."}
            </p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full md:w-auto px-10 py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary active:scale-95 transition-all shadow-2xl shadow-slate-200 disabled:opacity-50"
          >
            <FiSave className="text-lg" />
            <span>{saving ? "Sedang Menyimpan..." : "Simpan Perubahan"}</span>
          </button>
        </div>
      </div>
    </PageContainer>
  );
}
