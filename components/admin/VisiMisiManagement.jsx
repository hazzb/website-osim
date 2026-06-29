"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import PageContainer from "@/components/ui/PageContainer";
import PageHeader from "@/components/ui/PageHeader";
import LoadingState from "@/components/ui/LoadingState";
import { FiSave, FiEdit3 } from "react-icons/fi";

export default function VisiMisiManagement() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [visi, setVisi] = useState("");
  const [misi, setMisi] = useState("");

  useEffect(() => {
    async function fetchKonten() {
      setLoading(true);
      try {
        const { data: visiData, error: visiError } = await supabase
          .from("konten_halaman")
          .select("konten")
          .eq("nama_halaman", "visi")
          .single();
        if (visiData) setVisi(visiData.konten);

        const { data: misiData, error: misiError } = await supabase
          .from("konten_halaman")
          .select("konten")
          .eq("nama_halaman", "misi")
          .single();
        if (misiData) setMisi(misiData.konten);
      } catch (error) {
        console.error("Gagal mengambil data Visi & Misi:", error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchKonten();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error: visiError } = await supabase
        .from("konten_halaman")
        .update({ konten: visi, updated_at: new Date() })
        .eq("nama_halaman", "visi");
      if (visiError) throw visiError;

      const { error: misiError } = await supabase
        .from("konten_halaman")
        .update({ konten: misi, updated_at: new Date() })
        .eq("nama_halaman", "misi");
      if (misiError) throw misiError;

      alert("Visi & Misi berhasil diperbarui!");
    } catch (error) {
      alert("Gagal menyimpan data: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Memuat konten Visi & Misi..." />;

  return (
    <PageContainer breadcrumbText="Edit Visi & Misi">
      <PageHeader
        title="Visi & Misi Organisasi"
        subtitle="Kelola teks Visi dan Misi yang akan tampil di halaman utama."
        actions={
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-8 py-2.5 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-tight flex items-center gap-2 hover:bg-primary-hover transition-all shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-50"
          >
            <FiSave />{" "}
            <span>{saving ? "Menyimpan..." : "Simpan Perubahan"}</span>
          </button>
        }
      />

      <div className="bg-bg-card border border-border-dim rounded-3xl p-8 shadow-sm max-w-4xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-black text-text-main uppercase tracking-widest flex items-center gap-2">
                <FiEdit3 className="text-primary" /> Teks Visi
              </h3>
              <p className="text-[10px] text-text-muted mt-1">
                Cita-cita atau tujuan jangka panjang organisasi.
              </p>
              <div className="h-1 w-12 bg-blue-500 rounded-full mt-2"></div>
            </div>
            <textarea
              className="w-full min-h-[120px] p-4 bg-bg-page border border-border-dim rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              value={visi}
              onChange={(e) => setVisi(e.target.value)}
              placeholder="Tuliskan visi organisasi..."
            />
          </div>

          <div>
            <div className="mb-4">
              <h3 className="text-sm font-black text-text-main uppercase tracking-widest flex items-center gap-2">
                <FiEdit3 className="text-emerald-500" /> Teks Misi
              </h3>
              <p className="text-[10px] text-text-muted mt-1">
                Langkah-langkah untuk mencapai visi. Gunakan penomoran (1. 2.
                3.) untuk tampilan yang rapi.
              </p>
              <div className="h-1 w-12 bg-emerald-500 rounded-full mt-2"></div>
            </div>
            <textarea
              className="w-full min-h-[200px] p-4 bg-bg-page border border-border-dim rounded-2xl text-sm focus:ring-2 focus:emerald-500/20 focus:border-emerald-500 outline-none transition-all"
              value={misi}
              onChange={(e) => setMisi(e.target.value)}
              placeholder="1. Misi pertama...\n2. Misi kedua..."
            />
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
