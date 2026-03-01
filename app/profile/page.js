import { createClient } from "@/lib/supabase/static";
import ProfileClient from "@/components/profile/ProfileClient";

export const metadata = {
  title: "Profile",
  description:
    "Kenali lebih dekat organisasi kami: visi, misi, dan struktur kepengurusan OSIM.",
  openGraph: {
    title: "Profile - OSIM",
    description:
      "Kenali lebih dekat organisasi kami: visi, misi, dan struktur kepengurusan OSIM.",
  },
};

export default async function ProfilePage() {
  const supabase = await createClient();

  // 1. Fetch settings (for layout)
  const { data: settings, error: settingsError } = await supabase
    .from("pengaturan")
    .select(
      "nama_organisasi, nama_sekolah, logo_osis_url, logo_sekolah_url, deskripsi_singkat, alamat, email, no_hp, instagram_url, tiktok_url, youtube_url, footer_managed_by, visi_misi_layout",
    )
    .eq("id", 1)
    .single();

  // 2. Fetch content blocks
  const { data: contentBlocks, error: blocksError } = await supabase
    .from("konten_halaman")
    .select(
      "id, page_type, tipe, judul, isi, urutan, image_url, button_text, button_link",
    )
    .eq("page_type", "profile")
    .order("urutan", { ascending: true });

  console.log("Profile Page Debug:", {
    settingsData: !!settings,
    settingsError: settingsError?.message,
    blocksCount: contentBlocks?.length || 0,
    blocksError: blocksError?.message,
  });

  return (
    <ProfileClient
      initialSettings={settings || {}}
      initialContentBlocks={contentBlocks || []}
    />
  );
}
