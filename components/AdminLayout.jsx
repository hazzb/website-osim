// src/components/AdminLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./admin/Sidebar.jsx";
import Breadcrumbs from "./Breadcrumbs.jsx"; // Import Breadcrumbs

function AdminLayout() {
  return (
    <div className="admin-layout">
      {/* 1. Sidebar Navigasi */}
      <Sidebar />

      {/* 2. Konten Halaman Admin */}
      <div className="admin-content">
        {/* Breadcrumb Navigasi di Admin Area */}
        <div style={{ marginBottom: "1rem" }}>
          <Breadcrumbs />
        </div>

        {/* Halaman Aktif (Dashboard, Form, dll) */}
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
