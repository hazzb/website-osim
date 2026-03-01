"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiChevronRight, FiHome } from "react-icons/fi";

const Breadcrumbs = ({ overrideLastText, isCompact = false }) => {
  const pathname = usePathname();

  // Sembunyikan breadcrumb di halaman Home dan Login
  if (pathname === "/" || pathname === "/login") return null;

  // 1. Ambil segmen URL asli
  let pathnames = pathname.split("/").filter((x) => x);

  // Check if it's an admin path
  const isAdminPath = pathnames[0] === "admin";

  const routeNameMap = {
    profile: "Profile",
    "daftar-anggota": "Daftar Anggota",
    "kelola-anggota": "Kelola Anggota",
    "program-kerja": "Program Kerja",
    dashboard: "Dashboard",
    pengaturan: "Pengaturan",
    divisi: "Divisi",
    anggota: "Anggota",
    admin: "Admin",
    jabatan: "Jabatan",
    periode: "Periode",
    "visi-misi": "Visi & Misi",
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
        className={isCompact ? "" : "max-w-6xl mx-auto px-6"}
      >
        <ol className="flex items-center flex-wrap gap-2 text-sm">
          <li className="flex items-center">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-slate-500 hover:text-primary transition-colors no-underline font-medium"
            >
              <FiHome size={16} /> Beranda
            </Link>
          </li>

          {pathnames.map((value, index) => {
            const isLast = index === pathnames.length - 1;
            let href = `/${pathnames.slice(0, index + 1).join("/")}`;

            // No specific bypass needed anymore as we follow real paths

            let displayName = routeNameMap[value] || value.replace(/-/g, " ");
            if (isId(value)) displayName = "Detail";

            displayName = displayName
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");

            if (isLast && overrideLastText) displayName = overrideLastText;

            return (
              <li key={`${href}-${index}`} className="flex items-center gap-2">
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
                    href={href}
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
