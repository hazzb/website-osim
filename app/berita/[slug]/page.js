import React from "react";
import { notFound } from "next/navigation";
import BeritaDetail from "@/components/berita/BeritaDetail";
import { createClient } from "@/lib/supabase/static";

// Generate static params for Next.js static export
export async function generateStaticParams() {
  const supabase = await createClient();
  try {
    const { data: berita, error } = await supabase
      .from("berita")
      .select("slug");
    
    if (!error && berita) {
      return berita.map((b) => ({
        slug: b.slug,
      }));
    }
  } catch (e) {
    console.error("Gagal men-generate static params untuk berita:", e);
  }
  return [];
}

// Dynamically generate metadata based on the Supabase article data
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const supabase = await createClient();
  let berita = null;

  try {
    const { data, error } = await supabase
      .from("berita")
      .select("*")
      .eq("slug", slug)
      .single();
    
    if (!error && data) {
      berita = data;
    }
  } catch (e) {
    console.error("Error generating metadata for berita:", e);
  }

  if (!berita) {
    return { title: "Berita Tidak Ditemukan" };
  }

  return {
    title: berita.judul,
    description: berita.excerpt,
    openGraph: {
      title: berita.judul,
      description: berita.excerpt,
      images: berita.image_url ? [berita.image_url] : [],
    },
  };
}

export default async function BeritaDetailPage({ params }) {
  const { slug } = await params;
  const supabase = await createClient();
  let berita = null;

  try {
    const { data, error } = await supabase
      .from("berita")
      .select("*")
      .eq("slug", slug)
      .single();
    
    if (!error && data) {
      berita = data;
    }
  } catch (e) {
    console.error("Error fetching berita detail:", e);
  }

  if (!berita) {
    notFound();
  }

  return <BeritaDetail berita={berita} />;
}
