"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "@/components/context/AuthContext";

export default function LoginPage() {
  const { user, loading: authLoading } = useAuth();
  const [logoUrl, setLogoUrl] = useState(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/admin/dashboard");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase
        .from("pengaturan")
        .select("logo_osis_url")
        .eq("id", 1)
        .single();
      if (data) setLogoUrl(data.logo_osis_url);
    }
    fetchSettings();
  }, [supabase]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-page">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-sky-50 to-slate-100 relative overflow-hidden font-sans">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-200/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200/20 rounded-full blur-[100px]" />

      <LoginForm logoUrl={logoUrl} />
    </div>
  );
}
