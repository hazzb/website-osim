import { createClient } from "@/lib/supabase/static";
import { notFound } from "next/navigation";
import DivisiDetailClient from "@/components/divisi/DivisiDetailClient";

export async function generateStaticParams() {
  const supabase = await createClient();
  const { data: divisi } = await supabase.from("divisi").select("id");

  return (divisi || []).map((d) => ({
    id: d.id.toString(),
  }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: divisi } = await supabase
    .from("divisi")
    .select("nama_divisi, deskripsi")
    .eq("id", id)
    .single();

  if (!divisi) return { title: "Divisi Tidak Ditemukan" };

  return {
    title: `${divisi.nama_divisi} - OSIM Website`,
    description: divisi.deskripsi?.substring(0, 160) || "Detail divisi OSIM.",
  };
}

export default async function DivisiDetailPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch Divisi
  const { data: divisi, error: divError } = await supabase
    .from("divisi")
    .select("id, nama_divisi, deskripsi, logo_url, tipe, urutan")
    .eq("id", id)
    .single();

  if (divError || !divisi) {
    notFound();
  }

  // 2. Fetch Members of this Division
  const { data: members } = await supabase
    .from("anggota")
    .select(
      "id, nama, foto_url, periode_id, divisi_id, jabatan_id, master_jabatan(id, nama_jabatan), jenis_kelamin, instagram_username, alamat, motto, jabatan_di_divisi",
    )
    .eq("divisi_id", id);

  // 3. Fetch Programs of this Division
  const { data: programs } = await supabase
    .from("program_kerja")
    .select("*, pj:penanggung_jawab_id (nama)")
    .eq("divisi_id", id)
    .order("tanggal", { ascending: false });

  // 4. Fetch Periods and Jabatans (for admin forms if needed)
  const { data: periods } = await supabase
    .from("periode_jabatan")
    .select("id, nama_kabinet, tahun_mulai, tahun_selesai, is_active")
    .order("tahun_mulai", { ascending: false });

  const { data: masterJabatans } = await supabase
    .from("master_jabatan")
    .select("id, nama_jabatan");

  return (
    <DivisiDetailClient
      initialDivisi={divisi}
      initialMembers={members || []}
      initialPrograms={programs || []}
      initialPeriods={periods || []}
      initialMasterJabatans={masterJabatans || []}
    />
  );
}
