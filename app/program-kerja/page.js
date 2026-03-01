import { createClient } from "@/lib/supabase/static";
import ProgramKerjaClient from "@/components/program-kerja/ProgramKerjaClient";

export const metadata = {
  title: "Program Kerja",
  description:
    "Lihat daftar program kerja, agenda kegiatan, dan dokumentasi proker seluruh divisi organisasi.",
  openGraph: {
    title: "Program Kerja - OSIM",
    description:
      "Lihat daftar program kerja, agenda kegiatan, dan dokumentasi proker seluruh divisi organisasi.",
  },
};

export default async function ProgramKerjaPage() {
  const supabase = await createClient();

  // 1. Fetch divisions
  const { data: divisions } = await supabase
    .from("divisi")
    .select("id, nama_divisi")
    .order("nama_divisi");

  // 2. Fetch members (for PJ options)
  const { data: members } = await supabase
    .from("anggota")
    .select("id, nama")
    .order("nama");

  // 3. Fetch periods
  const { data: periods } = await supabase
    .from("periode_jabatan")
    .select("id, nama_kabinet, is_active, tahun_mulai")
    .order("tahun_mulai", { ascending: false });

  // Determine initial period
  const initialPeriode =
    periods?.find((p) => p.is_active) || periods?.[0] || null;

  // 4. Initial proker for the active period
  let initialProker = [];
  if (initialPeriode) {
    const { data } = await supabase
      .from("program_kerja")
      .select(
        "*, divisi:divisi_id (nama_divisi), pj:penanggung_jawab_id (nama)",
      )
      .eq("periode_id", initialPeriode.id)
      .order("tanggal", { ascending: false });
    initialProker = data || [];
  }

  return (
    <ProgramKerjaClient
      initialDivisions={divisions || []}
      initialMembers={members || []}
      initialPeriods={periods || []}
      initialProker={initialProker}
      initialPeriodeId={initialPeriode?.id || ""}
    />
  );
}
