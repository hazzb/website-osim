import React, { Suspense } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LightboxProvider } from "./context/LightboxContext";

// KOMPONEN GLOBAL
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

import LoadingState from "./components/ui/LoadingState";
import NotFound from "./pages/NotFound.jsx";

// HALAMAN PUBLIK (Lazy Load)
const Beranda = React.lazy(() => import("./pages/Beranda.jsx"));
const VisiMisi = React.lazy(() => import("./pages/VisiMisi.jsx"));
const DaftarAnggota = React.lazy(() => import("./pages/DaftarAnggota.jsx"));
const ProgramKerja = React.lazy(() => import("./pages/ProgramKerja.jsx"));
const ProgramKerjaDetail = React.lazy(
  () => import("./pages/ProgramKerjaDetail.jsx"),
);
const DivisiDetail = React.lazy(() => import("./pages/DivisiDetail.jsx"));
const LoginPage = React.lazy(() => import("./pages/LoginPage.jsx"));

// HALAMAN ADMIN (Lazy Load)
const DashboardAdmin = React.lazy(() => import("./pages/DashboardAdmin.jsx"));
const Pengaturan = React.lazy(() => import("./pages/Pengaturan.jsx"));
const KelolaAnggota = React.lazy(() => import("./pages/KelolaAnggota.jsx"));
const KelolaDivisi = React.lazy(() => import("./pages/KelolaDivisi.jsx"));
const KelolaPeriode = React.lazy(() => import("./pages/KelolaPeriode.jsx"));
const KelolaJabatan = React.lazy(() => import("./pages/KelolaJabatan.jsx"));
const KelolaProgramKerja = React.lazy(
  () => import("./pages/KelolaProgramKerja.jsx"),
);

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
    location.pathname.startsWith(path),
  );

  const shouldHideNavbar = location.pathname === "/login";

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
      {!shouldHideNavbar && <Navbar />}

      <main style={{ flex: 1, paddingBottom: shouldHideFooter ? "0" : "3rem" }}>
        <React.Suspense
          fallback={
            <div className="flex h-[80vh] items-center justify-center">
              <LoadingState />
            </div>
          }
        >
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
            <Route
              path="/admin"
              element={<Navigate to="/dashboard" replace />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </React.Suspense>
      </main>

      {/* Footer hanya muncul di halaman publik */}
      {!shouldHideFooter && <Footer />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <LightboxProvider>
        <BrowserRouter>
          <ScrollToTop />
          <MainLayout />
        </BrowserRouter>
      </LightboxProvider>
    </AuthProvider>
  );
}

export default App;
