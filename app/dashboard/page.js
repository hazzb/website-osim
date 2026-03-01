"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardIndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect /dashboard to /admin/dashboard to match the new structure
    router.replace("/admin/dashboard");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          Mengalihkan ke Admin Panel...
        </h2>
        <p className="text-slate-500 text-sm">Harap tunggu sebentar.</p>
      </div>
    </div>
  );
}
