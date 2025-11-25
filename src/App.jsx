// src/App.jsx

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// --- 1. KOMPONEN GLOBAL ---
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx"; // 1. IMPORT INI
// HAPUS IMPORT INI: import Breadcrumbs from "./components/Breadcrumbs.jsx";

// --- 2. HALAMAN (HYBRID: Publik + Admin) ---
import Beranda from "./pages/Beranda.jsx";
import VisiMisi from "./pages/VisiMisi.jsx";
import DaftarAnggota from "./pages/DaftarAnggota.jsx";
import ProgramKerja from "./pages/ProgramKerja.jsx";
import ProgramKerjaDetail from "./pages/ProgramKerjaDetail.jsx";
import DivisiDetail from "./pages/DivisiDetail.jsx";
import LoginPage from "./pages/LoginPage.jsx";

// --- 3. HALAMAN KHUSUS ADMIN ---
import DashboardAdmin from "./pages/DashboardAdmin.jsx";
import Pengaturan from "./pages/Pengaturan.jsx";

// --- KOMPONEN PROTEKSI ---
const ProtectedRoute = ({ children }) => {
  const { session, loading } = useAuth();
  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>Memuat...</div>
    );
  if (!session) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div
          className="app-container"
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          }}
        >
          <Navbar />

          {/* HAPUS BARIS INI: <Breadcrumbs /> */}
          {/* Breadcrumb sekarang ditangani oleh PageContainer di tiap halaman */}

          {/* Main Content */}
          <main style={{ flex: 1, paddingBottom: "3rem" }}>
            <Routes>
              {/* === RUTE UTAMA (HYBRID) === */}
              <Route path="/" element={<Beranda />} />
              <Route path="/login" element={<LoginPage />} />

              <Route path="/visi-misi" element={<VisiMisi />} />

              <Route path="/anggota" element={<DaftarAnggota />} />
              <Route path="/divisi/:id" element={<DivisiDetail />} />

              <Route path="/program-kerja" element={<ProgramKerja />} />
              <Route
                path="/program-kerja/:id"
                element={<ProgramKerjaDetail />}
              />

              {/* === RUTE KHUSUS ADMIN === */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardAdmin />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/pengaturan"
                element={
                  <ProtectedRoute>
                    <Pengaturan />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin"
                element={<Navigate to="/dashboard" replace />}
              />

              {/* Fallback 404 */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
