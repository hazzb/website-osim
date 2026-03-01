import { createClient } from "@/lib/supabase/static";
import { notFound } from "next/navigation";
import ProgramKerjaDetailClient from "@/components/program-kerja/ProgramKerjaDetailClient";

export async function generateStaticParams() {
  const supabase = await createClient();
  const { data: proker } = await supabase.from("program_kerja").select("id");

  return (proker || []).map((p) => ({
    id: p.id.toString(),
  }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://osim.example.com";
  const supabase = await createClient();
  const { data: progja } = await supabase
    .from("program_kerja")
    .select("nama_acara, deskripsi, dokumentasi_url")
    .eq("id", id)
    .single();

  if (!progja) return { title: "Program Tidak Ditemukan" };

  const description =
    progja.deskripsi?.substring(0, 160) || "Detail program kerja OSIM.";
  const ogImage = progja.dokumentasi_url?.[0] || "/og-image.png";

  return {
    title: progja.nama_acara,
    description,
    openGraph: {
      title: `${progja.nama_acara} | OSIM`,
      description,
      url: `${siteUrl}/program-kerja/${id}`,
      images: [{ url: ogImage, alt: progja.nama_acara }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${progja.nama_acara} | OSIM`,
      description,
      images: [ogImage],
    },
  };
}

export default async function ProgramKerjaDetailPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: progja, error } = await supabase
    .from("program_kerja")
    .select(
      `*, divisi:divisi_id (id, nama_divisi), pj:penanggung_jawab_id (id, nama)`,
    )
    .eq("id", id)
    .single();

  if (error || !progja) {
    notFound();
  }

  // Fetch options for admin if logged in (handled in client but passed from here if needed)
  // For now, let the client fetch them if needed or just pass empty for public view

  return <ProgramKerjaDetailClient initialData={progja} />;
}
