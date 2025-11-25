// src/components/Breadcrumbs.jsx (Konfirmasi)

import React from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Breadcrumbs.module.css";
import { FiChevronRight, FiHome } from "react-icons/fi";

const Breadcrumbs = ({ overrideLastText }) => {
  const location = useLocation();

  if (location.pathname === "/" || location.pathname === "/login") return null;

  const pathnames = location.pathname.split("/").filter((x) => x);

  const routeNameMap = {
    "visi-misi": "Visi & Misi",
    "daftar-anggota": "Daftar Anggota",
    "program-kerja": "Program Kerja",
    dashboard: "Dashboard",
    pengaturan: "Pengaturan",
    divisi: "Divisi",
  };

  const isId = (str) => !isNaN(str) || str.length > 15;

  return (
    <div className={styles.container}>
      <nav aria-label="Breadcrumb">
        <ol className={styles.list}>
          {/* Home */}
          <li className={styles.item}>
            <Link to="/" className={styles.link}>
              <FiHome className={styles.homeIcon} /> Beranda
            </Link>
          </li>

          {/* Loop Segments */}
          {pathnames.map((value, index) => {
            const isLast = index === pathnames.length - 1;
            const to = `/${pathnames.slice(0, index + 1).join("/")}`;

            let displayName = routeNameMap[value] || value.replace(/-/g, " ");
            if (isId(value)) displayName = "Detail";
            displayName =
              displayName.charAt(0).toUpperCase() + displayName.slice(1);

            if (isLast && overrideLastText) displayName = overrideLastText;

            return (
              <li key={to} className={styles.item}>
                <span className={styles.separator}>
                  <FiChevronRight />
                </span>

                {isLast ? (
                  <span className={styles.active} aria-current="page">
                    {displayName}
                  </span>
                ) : (
                  <Link to={to} className={styles.link}>
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
