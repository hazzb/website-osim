import React from "react";
import BeritaList from "@/components/berita/BeritaList";
import { createClient } from "@/lib/supabase/static";

export const metadata = {
  title: "Berita & Reportase",
  description: "Berita terbaru, kegiatan, dan reportase dari OSIM.",
};

export default async function BeritaPage() {
  const supabase = await createClient();
  let berita = [];

  try {
    const { data, error } = await supabase
      .from("berita")
      .select("*")
      .order("tanggal", { ascending: false });
    
    if (!error && data) {
      berita = data;
    } else if (error) {
      console.warn("Gagal memuat berita dari Supabase, menggunakan array kosong:", error.message);
    }
  } catch (e) {
    console.error("Gagal memuat berita saat build:", e);
  }

  return <BeritaList initialBerita={berita} />;
}
