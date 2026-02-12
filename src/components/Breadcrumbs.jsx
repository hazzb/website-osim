import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiChevronRight, FiHome } from "react-icons/fi";

const Breadcrumbs = ({ overrideLastText, isCompact = false }) => {
  const location = useLocation();

  // Sembunyikan breadcrumb di halaman Home dan Login
  if (location.pathname === "/" || location.pathname === "/login") return null;

  // 1. Ambil segmen URL asli
  let pathnames = location.pathname.split("/").filter((x) => x);

  // --- LOGIKA PERBAIKAN HIERARKI (VIRTUAL NESTING) ---
  // Daftar halaman yang secara visual harus ada di bawah "Dashboard"
  const adminRoutes = ["kelola-anggota", "pengaturan", "kelola-jabatan"];

  // Cek apakah halaman saat ini adalah halaman admin tapi URL-nya tidak ada 'dashboard'
  const isAdminPage =
    pathnames.length > 0 && adminRoutes.includes(pathnames[0]);

  // Jika ya, kita suntikkan 'dashboard' ke depan array agar breadcrumb terlihat rapi
  if (isAdminPage) {
    pathnames.unshift("dashboard");
  }
  // ----------------------------------------------------

  const routeNameMap = {
    profile: "Profile",
    "daftar-anggota": "Daftar Anggota",
    "kelola-anggota": "Kelola Anggota",
    "program-kerja": "Program Kerja",
    dashboard: "Dashboard",
    pengaturan: "Pengaturan",
    divisi: "Divisi",
  };

  const isId = (str) => !isNaN(str) || str.length > 15;

  return (
    <div
      className={
        isCompact ? "py-1.5" : "bg-slate-50 border-b border-slate-200 py-3 mb-6"
      }
    >
      <nav
        aria-label="Breadcrumb"
        className={isCompact ? "" : "max-w-7xl mx-auto px-6"}
      >
        <ol className="flex items-center flex-wrap gap-2 text-sm">
          {/* Home */}
          <li className="flex items-center">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-slate-500 hover:text-primary transition-colors no-underline font-medium"
            >
              <FiHome size={16} /> Beranda
            </Link>
          </li>

          {/* Loop Segments */}
          {pathnames.map((value, index) => {
            const isLast = index === pathnames.length - 1;

            // 2. Generate Link (Hati-hati dengan path virtual)
            // Default logic: gabungkan path dari awal sampai index ini
            let to = `/${pathnames.slice(0, index + 1).join("/")}`;

            // FIX URL: Jika kita menyuntikkan 'dashboard' secara virtual,
            // URL seperti '/dashboard/kelola-anggota' mungkin tidak valid di router.
            // Kita harus menghapus '/dashboard' dari string URL untuk child-nya.
            if (isAdminPage && index > 0) {
              to = to.replace("/dashboard", ""); // Kembalikan ke /kelola-anggota
            }

            // Formatting Nama Tampilan
            let displayName = routeNameMap[value] || value.replace(/-/g, " ");
            if (isId(value)) displayName = "Detail";

            // Kapitalisasi huruf pertama setiap kata
            displayName = displayName
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");

            if (isLast && overrideLastText) displayName = overrideLastText;

            return (
              <li key={`${to}-${index}`} className="flex items-center gap-2">
                <span className="text-slate-300">
                  <FiChevronRight size={14} />
                </span>

                {isLast ? (
                  <span
                    className="text-slate-800 font-semibold"
                    aria-current="page"
                  >
                    {displayName}
                  </span>
                ) : (
                  <Link
                    to={to}
                    className="text-slate-500 hover:text-primary transition-colors no-underline font-medium"
                  >
                    {displayName}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};

export default Breadcrumbs;
