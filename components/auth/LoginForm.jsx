"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from "react-icons/fi";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm({ logoUrl }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg("Email atau password salah.");
      setLoading(false);
    } else {
      router.push("/admin/dashboard");
    }
  };

  return (
    <div className="w-full max-w-[400px] bg-white/80 backdrop-blur-xl rounded-2xl p-8 sm:p-10 shadow-2xl shadow-sky-900/5 border border-white/50 animate-scaleIn relative z-10">
      {/* LOGO SECTION */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 mb-4 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center p-3 animate-slideDown">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo OSIS"
              className="w-full h-full object-contain"
            />
          ) : (
            <span className="text-3xl">🔐</span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Selamat Datang
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Silakan login untuk masuk ke dashboard
        </p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-100 text-sm mb-6 flex items-center gap-2 animate-fadeIn">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="space-y-1.5">
          <label
            className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1"
            htmlFor="email"
          >
            Email
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-all">
              <FiMail size={18} />
            </div>
            <input
              id="email"
              type="email"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-medium focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none transition-all placeholder:text-slate-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1"
            htmlFor="password"
          >
            Password
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-all">
              <FiLock size={18} />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-medium focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none transition-all placeholder:text-slate-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 mt-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-sky-500/25 transition-all hover:shadow-sky-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? "Memproses..." : "Masuk Dashboard"}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-sky-600 transition-colors group no-underline"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
