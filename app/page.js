import { createClient } from "@/lib/supabase/static";
import HomeClient from "@/components/home/HomeClient";

export default async function Home() {
  const supabase = await createClient();

  // 1. Fetch Pengaturan
  const { data: settings, error: settingsError } = await supabase
    .from("pengaturan")
    .select(
      "nama_organisasi, logo_osis_url, logo_sekolah_url, deskripsi_singkat, instagram_url, tiktok_url, youtube_url, beranda_tampilkan_hero, tampilkan_sambutan, sambutan_judul, sambutan_isi, sambutan_foto_url",
    )
    .eq("id", 1)
    .single();

  // 2. Fetch Slides (active only for public)
  const { data: slides, error: slidesError } = await supabase
    .from("beranda_slides")
    .select("id, judul, deskripsi, image_url, urutan, is_active")
    .eq("is_active", true)
    .order("urutan", { ascending: true })
    .order("created_at", { ascending: false });

  console.log("Home Page Debug:", {
    settingsData: !!settings,
    settingsError: settingsError?.message,
    slidesCount: slides?.length || 0,
    slidesError: slidesError?.message,
  });

  // 3. Fetch Agenda Mendatang (Progja Rencana)
  const today = new Date().toISOString().split("T")[0];
  const { data: latestProgja } = await supabase
    .from("program_kerja")
    .select(`*, divisi(nama_divisi), pj:anggota!penanggung_jawab_id(nama)`)
    .eq("status", "Rencana")
    .gte("tanggal", today)
    .order("tanggal", { ascending: true })
    .limit(6);

  // 4. Statistik counts
  const { count: countAnggota } = await supabase
    .from("anggota")
    .select("id", { count: "exact", head: true });

  const { count: countTotalProgja } = await supabase
    .from("program_kerja")
    .select("id", { count: "exact", head: true });

  const { count: countDone } = await supabase
    .from("program_kerja")
    .select("id", { count: "exact", head: true })
    .eq("status", "Selesai");

  const stats = {
    totalAnggota: countAnggota || 0,
    totalProgja: countTotalProgja || 0,
    progjaSelesai: countDone || 0,
  };

  return (
    <HomeClient
      initialSettings={settings}
      initialSlides={slides || []}
      initialProgja={latestProgja || []}
      stats={stats}
    />
  );
}
