import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// KOMPONEN GLOBAL
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

// HALAMAN PUBLIK
import Beranda from "./pages/Beranda.jsx";
import VisiMisi from "./pages/VisiMisi.jsx";
import DaftarAnggota from "./pages/DaftarAnggota.jsx";
import ProgramKerja from "./pages/ProgramKerja.jsx";
import ProgramKerjaDetail from "./pages/ProgramKerjaDetail.jsx";
import DivisiDetail from "./pages/DivisiDetail.jsx";
import LoginPage from "./pages/LoginPage.jsx";

// HALAMAN ADMIN
import DashboardAdmin from "./pages/DashboardAdmin.jsx";
import Pengaturan from "./pages/Pengaturan.jsx";
import KelolaAnggota from "./pages/KelolaAnggota.jsx";
import KelolaDivisi from "./pages/KelolaDivisi.jsx";
import KelolaPeriode from "./pages/KelolaPeriode.jsx";
import KelolaJabatan from "./pages/KelolaJabatan.jsx";
import KelolaProgramKerja from "./pages/KelolaProgramKerja.jsx"; // <--- TAMBAHKAN INI

const ProtectedRoute = ({ children }) => {
  const { session, loading } = useAuth();
  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: "50px", color: "#64748b" }}>
        Memuat sesi...
      </div>
    );
  if (!session) return <Navigate to="/login" replace />;
  return children;
};

// --- KOMPONEN LAYOUT UTAMA ---
const MainLayout = () => {
  const location = useLocation();

  // Daftar halaman Admin yang TIDAK butuh footer
  const hideFooterOn = [
    "/dashboard",
    "/pengaturan",
    "/kelola-anggota",
    "/kelola-divisi",
    "/kelola-periode",
    "/kelola-jabatan",
    "/kelola-program-kerja", // Tambahkan ini agar footer hilang di sini
    "/login",
  ];

  // Logic: Sembunyikan footer jika URL diawali dengan salah satu path di atas
  const shouldHideFooter = hideFooterOn.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <div
      className="app-container"
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#f8fafc", // Background global
      }}
    >
      <Navbar />

      <main style={{ flex: 1, paddingBottom: shouldHideFooter ? "0" : "3rem" }}>
        <Routes>
          {/* --- RUTE PUBLIK --- */}
          <Route path="/" element={<Beranda />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/visi-misi" element={<VisiMisi />} />

          {/* Anggota & Divisi */}
          <Route path="/anggota" element={<DaftarAnggota />} />
          <Route path="/divisi/:id" element={<DivisiDetail />} />

          {/* Program Kerja (Publik) */}
          <Route path="/program-kerja" element={<ProgramKerja />} />
          <Route path="/program-kerja/:id" element={<ProgramKerjaDetail />} />

          {/* --- RUTE ADMIN (Protected) --- */}
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

          {/* Kelola Data Master */}
          <Route
            path="/kelola-anggota"
            element={
              <ProtectedRoute>
                <KelolaAnggota />
              </ProtectedRoute>
            }
          />
          <Route
            path="/kelola-divisi"
            element={
              <ProtectedRoute>
                <KelolaDivisi />
              </ProtectedRoute>
            }
          />
          <Route
            path="/kelola-jabatan"
            element={
              <ProtectedRoute>
                <KelolaJabatan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/kelola-periode"
            element={
              <ProtectedRoute>
                <KelolaPeriode />
              </ProtectedRoute>
            }
          />

          {/* Kelola Program Kerja (Admin) */}
          <Route
            path="/kelola-program-kerja"
            element={
              <ProtectedRoute>
                <KelolaProgramKerja />
              </ProtectedRoute>
            }
          />

          {/* Redirects */}
          <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {/* Footer hanya muncul di halaman publik */}
      {!shouldHideFooter && <Footer />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <MainLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
