import { createClient } from "@/lib/supabase/static";
import DivisiManagement from "@/components/admin/DivisiManagement";

export const metadata = {
  title: "Kelola Divisi - OSIM Website",
  description: "Pengaturan daftar divisi dan unit kerja.",
};

export default async function AdminDivisiPage() {
  const supabase = await createClient();

  const { data: periodes } = await supabase
    .from("periode_jabatan")
    .select("*")
    .order("tahun_mulai", { ascending: false });

  return <DivisiManagement initialPeriodes={periodes || []} />;
}
