import { createClient } from "@/lib/supabase/static";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";

export const metadata = {
  title: "Admin Dashboard - OSIM Website",
  description: "Ringkasan data organisasi dan kontrol administrasi.",
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // 1. Fetch Stats
  const { count: countAnggota } = await supabase
    .from("anggota")
    .select("*", { count: "exact", head: true });

  const { count: countDivisi } = await supabase
    .from("divisi")
    .select("*", { count: "exact", head: true });

  const { data: activePeriode } = await supabase
    .from("periode_jabatan")
    .select("nama_kabinet")
    .eq("is_active", true)
    .single();

  const { data: progjaData } = await supabase
    .from("program_kerja")
    .select("status");

  const total = progjaData?.length || 0;
  const selesai = progjaData?.filter((p) => p.status === "Selesai").length || 0;
  const rencana = progjaData?.filter((p) => p.status === "Rencana").length || 0;

  const stats = {
    anggota: countAnggota || 0,
    divisi: countDivisi || 0,
    periodeName: activePeriode ? activePeriode.nama_kabinet : "Non-Aktif",
    progjaTotal: total,
    progjaSelesai: selesai,
    progjaRencana: rencana,
  };

  return <AdminDashboardClient stats={stats} />;
}
