import AdminGuard from "@/components/admin/AdminGuard";

export const metadata = {
  title: "Admin Dashboard - OSIM Website",
  description: "Pengaturan dan manajemen website OSIM.",
};

export default function AdminLayout({ children }) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-200">
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </AdminGuard>
  );
}
