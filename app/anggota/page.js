import { createClient } from "@/lib/supabase/static";
import AnggotaClient from "@/components/anggota/AnggotaClient";

export const metadata = {
  title: "Daftar Anggota",
  description:
    "Kenali seluruh personil OSIM, struktur divisi, dan jabatan pengurus di setiap periode kepengurusan.",
  openGraph: {
    title: "Daftar Anggota - OSIM",
    description:
      "Kenali seluruh personil OSIM, struktur divisi, dan jabatan pengurus di setiap periode kepengurusan.",
  },
};

export default async function AnggotaPage() {
  const supabase = await createClient();

  // 1. Fetch periods
  const { data: periodes } = await supabase
    .from("periode_jabatan")
    .select("id, nama_kabinet, tahun_mulai, tahun_selesai, is_active")
    .order("tahun_mulai", { ascending: false });

  // 2. Fetch all divisions (to filter by period in client)
  const { data: allDivisi } = await supabase
    .from("divisi")
    .select("id, nama_divisi, urutan, logo_url, tipe, periode_id")
    .order("urutan", { ascending: true });

  // 3. Fetch master jabatans
  const { data: jabatans } = await supabase
    .from("master_jabatan")
    .select("id, nama_jabatan")
    .order("nama_jabatan", { ascending: true });

  // Determine initial period
  const initialPeriode =
    periodes?.find((p) => p.is_active) || periodes?.[0] || null;

  // 4. Initial members for the active period
  let initialAnggota = [];
  if (initialPeriode) {
    const { data } = await supabase
      .from("anggota")
      .select(
        `*, divisi ( nama_divisi, urutan, logo_url, tipe ), master_jabatan ( nama_jabatan ), periode_jabatan ( nama_kabinet )`,
      )
      .eq("periode_id", initialPeriode.id);
    initialAnggota = data || [];
  }

  return (
    <AnggotaClient
      initialPeriodes={periodes || []}
      initialAllDivisi={allDivisi || []}
      initialMasterJabatans={jabatans || []}
      initialAnggota={initialAnggota}
      initialPeriodeId={initialPeriode?.id || "semua"}
    />
  );
}
