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
import Footer from "./components/Footer.jsx"; // <--- IMPORT LAGI FOOTERNYA
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

const ProtectedRoute = ({ children }) => {
  const { session, loading } = useAuth();
  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>Memuat...</div>
    );
  if (!session) return <Navigate to="/login" replace />;
  return children;
};

// --- KOMPONEN LAYOUT UTAMA (LOGIC FOOTER DISINI) ---
const MainLayout = () => {
  const location = useLocation();

  // Daftar halaman yang TIDAK BOLEH ada footer
  const hideFooterOn = [
    "/dashboard",
    "/pengaturan",
    "/kelola-anggota",
    "/kelola-divisi",
    "/kelola-periode",
    "/kelola-jabatan",
    "/login",
  ];

  // Cek apakah URL saat ini ada di daftar blacklist
  // Kita pakai 'startsWith' agar sub-halaman admin juga kena (misal /kelola-anggota/edit)
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
        backgroundColor: "#f8fafc",
      }}
    >
      <Navbar />

      <main style={{ flex: 1, paddingBottom: "3rem" }}>
        <Routes>
          {/* RUTE PUBLIK */}
          <Route path="/" element={<Beranda />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/visi-misi" element={<VisiMisi />} />
          <Route path="/anggota" element={<DaftarAnggota />} />
          <Route path="/divisi/:id" element={<DivisiDetail />} />
          <Route path="/program-kerja" element={<ProgramKerja />} />
          <Route path="/program-kerja/:id" element={<ProgramKerjaDetail />} />

          {/* RUTE ADMIN */}
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
            path="/kelola-periode"
            element={
              <ProtectedRoute>
                <KelolaPeriode />
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
            path="/kelola-anggota"
            element={
              <ProtectedRoute>
                <KelolaAnggota />
              </ProtectedRoute>
            }
          />

          <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {/* HANYA TAMPILKAN FOOTER JIKA BUKAN HALAMAN ADMIN */}
      {!shouldHideFooter && <Footer />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        {/* Panggil Layout Utama di dalam BrowserRouter */}
        <MainLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
