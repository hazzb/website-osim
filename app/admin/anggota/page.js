import { createClient } from "@/lib/supabase/static";
import AnggotaManagement from "@/components/admin/AnggotaManagement";

export const metadata = {
  title: "Kelola Anggota - OSIM Website",
  description: "Pengaturan database anggota dan kepengurusan.",
};

export default async function AdminAnggotaPage() {
  const supabase = await createClient();

  // Fetch Dropdowns
  const { data: periode } = await supabase
    .from("periode_jabatan")
    .select("id, nama_kabinet, tahun_mulai, tahun_selesai, is_active")
    .order("tahun_mulai", { ascending: false });

  const { data: divisi } = await supabase
    .from("divisi")
    .select("id, nama_divisi")
    .order("nama_divisi");

  const { data: jabatan } = await supabase
    .from("master_jabatan")
    .select("id, nama_jabatan")
    .order("nama_jabatan");

  return (
    <AnggotaManagement
      initialPeriode={periode || []}
      initialDivisi={divisi || []}
      initialJabatan={jabatan || []}
    />
  );
}
