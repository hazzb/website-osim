import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";
// PENTING: Jangan import Breadcrumbs di sini!

function MainLayout() {
  return (
    <div className="app-layout">
      <Navbar />

      {/* MainLayout sekarang hanya wadah kosong.
         Breadcrumb dan Layout Lebar (1200px) sudah diurus oleh 
         PageContainer di masing-masing halaman.
      */}
      <main style={{ width: "100%", minHeight: "100vh" }}>
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
