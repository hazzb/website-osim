import { createClient } from "@/lib/supabase/static";
import ProgramKerjaManagement from "@/components/admin/ProgramKerjaManagement";

export const metadata = {
  title: "Kelola Program Kerja - OSIM Website",
  description: "Pengaturan daftar kegiatan dan acara organisasi.",
};

export default async function AdminProgramKerjaPage() {
  const supabase = await createClient();

  const { data: periode } = await supabase
    .from("periode_jabatan")
    .select("id, nama_kabinet, is_active")
    .order("tahun_mulai", { ascending: false });

  const { data: divisi } = await supabase
    .from("divisi")
    .select("id, nama_divisi")
    .order("nama_divisi");

  const { data: anggota } = await supabase
    .from("anggota")
    .select("id, nama")
    .order("nama");

  return (
    <ProgramKerjaManagement
      initialPeriode={periode || []}
      initialDivisi={divisi || []}
      initialAnggota={anggota || []}
    />
  );
}
