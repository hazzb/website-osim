"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminIndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/dashboard");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg-page">
      <div className="text-center p-8 bg-bg-card rounded-2xl shadow-xl border border-border-dim">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-text-main mb-2">
          Mengalihkan ke Dashboard...
        </h2>
        <p className="text-text-muted text-sm">Harap tunggu sebentar.</p>
      </div>
    </div>
  );
}
