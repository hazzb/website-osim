"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Modal from "../Modal";
import FormInput from "./FormInput";
import {
  FiArrowRight,
  FiArrowLeft,
  FiCheck,
  FiTrash2,
  FiLayers,
  FiStar,
  FiGrid,
  FiPlus,
} from "react-icons/fi";

const BPH_TEMPLATE = {
  nama_divisi: "Badan Pengurus Harian",
  tipe: "Inti",
  deskripsi: "Berisi Ketua, Wakil, Sekretaris, dan Bendahara.",
};

const COMMON_DIVISIONS = [
  {
    nama_divisi: "Divisi Keagamaan",
    tipe: "Umum",
    deskripsi: "Mengurus kegiatan rohani dan PHBI.",
  },
  {
    nama_divisi: "Divisi Humas",
    tipe: "Umum",
    deskripsi: "Hubungan masyarakat dan publikasi media.",
  },
  {
    nama_divisi: "Divisi IT & Multimedia",
    tipe: "Umum",
    deskripsi: "Dokumentasi, desain, dan konten kreatif.",
  },
  {
    nama_divisi: "Divisi Kesenian",
    tipe: "Umum",
    deskripsi: "Mengembangkan minat bakat seni.",
  },
  {
    nama_divisi: "Divisi Olahraga",
    tipe: "Umum",
    deskripsi: "Mengurus kegiatan olahraga dan classmeeting.",
  },
  {
    nama_divisi: "Divisi Kebersihan",
    tipe: "Umum",
    deskripsi: "Menjaga kebersihan dan lingkungan sekolah.",
  },
];

export default function KabinetWizard({ isOpen, onClose, onSuccess }) {
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [periodeData, setPeriodeData] = useState({
    nama_kabinet: "",
    tahun_mulai: new Date().getFullYear(),
    tahun_selesai: new Date().getFullYear() + 1,
    motto_kabinet: "",
    is_active: true,
  });

  const [selectedDivisions, setSelectedDivisions] = useState([
    { ...BPH_TEMPLATE, selected: true },
  ]);

  const handlePeriodeChange = (e) => {
    setPeriodeData({ ...periodeData, [e.target.name]: e.target.value });
  };

  const toggleDivision = (template) => {
    const exists = selectedDivisions.find(
      (d) => d.nama_divisi === template.nama_divisi,
    );
    if (exists) {
      setSelectedDivisions(
        selectedDivisions.filter((d) => d.nama_divisi !== template.nama_divisi),
      );
    } else {
      setSelectedDivisions([
        ...selectedDivisions,
        { ...template, selected: true },
      ]);
    }
  };

  const addCustomDivision = () => {
    const name = prompt("Masukkan Nama Divisi Baru:");
    if (name) {
      if (
        selectedDivisions.some(
          (d) => d.nama_divisi.toLowerCase() === name.toLowerCase(),
        )
      ) {
        alert("Divisi ini sudah ada!");
        return;
      }
      setSelectedDivisions([
        ...selectedDivisions,
        {
          nama_divisi: name,
          tipe: "Umum",
          deskripsi: "Divisi tambahan manual",
          selected: true,
        },
      ]);
    }
  };

  const handleFinish = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await supabase
        .from("periode_jabatan")
        .update({ is_active: false })
        .neq("id", 0);

      const { data: periode, error: errPeriode } = await supabase
        .from("periode_jabatan")
        .insert(periodeData)
        .select()
        .single();

      if (errPeriode) throw errPeriode;

      const divisionsPayload = selectedDivisions.map((div, index) => ({
        nama_divisi: div.nama_divisi,
        deskripsi: div.deskripsi,
        tipe: div.tipe,
        urutan: index + 1,
        periode_id: periode.id,
      }));

      const { error: errDivisi } = await supabase
        .from("divisi")
        .insert(divisionsPayload);

      if (errDivisi) throw errDivisi;

      alert("🎉 Kabinet berhasil dibentuk!");
      onSuccess();
      onClose();
    } catch (err) {
      alert("Gagal: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2">
      <div className="flex justify-center items-center mb-10">
        <StepIndicator num={1} active={step >= 1} />
        <StepLine active={step >= 2} />
        <StepIndicator num={2} active={step >= 2} />
        <StepLine active={step >= 3} />
        <StepIndicator num={3} active={step >= 3} />
      </div>

      {step === 1 && (
        <div className="animate-fadeIn space-y-4">
          <div className="mb-8 p-4 bg-primary-light border border-primary-border rounded-2xl">
            <h3 className="text-sm font-black text-blue-900 uppercase tracking-tight">
              Langkah 1: Identitas Kabinet
            </h3>
            <p className="text-xs text-blue-700 font-medium">
              Tentukan nama dan masa bakti kabinet baru.
            </p>
          </div>

          <div className="grid grid-cols-12 gap-5">
            <FormInput
              label="Nama Kabinet"
              name="nama_kabinet"
              value={periodeData.nama_kabinet}
              onChange={handlePeriodeChange}
              placeholder="Contoh: Kabinet Pembaharu"
              required
              span={12}
            />
            <FormInput
              label="Tahun Mulai"
              name="tahun_mulai"
              type="number"
              value={periodeData.tahun_mulai}
              onChange={handlePeriodeChange}
              span={6}
            />
            <FormInput
              label="Tahun Selesai"
              name="tahun_selesai"
              type="number"
              value={periodeData.tahun_selesai}
              onChange={handlePeriodeChange}
              span={6}
            />
            <FormInput
              label="Motto"
              name="motto_kabinet"
              value={periodeData.motto_kabinet}
              onChange={handlePeriodeChange}
              placeholder="Slogan singkat..."
              span={12}
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fadeIn">
          <div className="mb-8 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
            <h3 className="text-sm font-black text-indigo-900 uppercase tracking-tight">
              Langkah 2: Susunan Struktur
            </h3>
            <p className="text-xs text-indigo-700 font-medium">
              Pilih divisi yang akan diaktifkan di periode ini.
            </p>
          </div>

          <div className="flex flex-col gap-8 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar">
            <div>
              <div className="flex items-center gap-2 mb-4 text-amber-600 px-1">
                <FiStar className="text-amber-500" />
                <span className="font-black text-[10px] uppercase tracking-widest">
                  PENGURUS INTI (WAJIB)
                </span>
              </div>
              <div className="p-4 border-2 border-amber-200 bg-amber-50/50 rounded-2xl flex items-center gap-4 group">
                <div className="w-8 h-8 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-amber-200">
                  <FiCheck size={18} />
                </div>
                <div>
                  <div className="font-bold text-amber-900 text-sm">
                    Badan Pengurus Harian (BPH)
                  </div>
                  <div className="text-[10px] text-amber-700 font-medium">
                    Otomatis berisi jabatan Ketua, Wakil, Sekretaris, Bendahara.
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4 text-primary px-1">
                <FiGrid className="text-primary" />
                <span className="font-black text-[10px] uppercase tracking-widest">
                  DIVISI / SEKBID (PILIH)
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {COMMON_DIVISIONS.map((template) => {
                  const isSelected = selectedDivisions.find(
                    (d) => d.nama_divisi === template.nama_divisi,
                  );
                  return (
                    <div
                      key={template.nama_divisi}
                      onClick={() => toggleDivision(template)}
                      className={`p-4 border-2 rounded-2xl cursor-pointer transition-all flex flex-col gap-2 relative group ${
                        isSelected
                          ? "border-blue-500 bg-primary-light/30"
                          : "border-border-dim bg-bg-page hover:border-slate-300 hover:bg-bg-card"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span
                          className={`text-[13px] font-bold ${isSelected ? "text-blue-900" : "text-text-main"}`}
                        >
                          {template.nama_divisi}
                        </span>
                        {isSelected && (
                          <FiCheck className="text-primary" size={18} />
                        )}
                      </div>
                      <span className="text-[10px] text-text-muted leading-relaxed font-medium">
                        {template.deskripsi}
                      </span>
                    </div>
                  );
                })}
              </div>

              {selectedDivisions.filter(
                (d) =>
                  d.tipe === "Umum" &&
                  !COMMON_DIVISIONS.find(
                    (c) => c.nama_divisi === d.nama_divisi,
                  ),
              ).length > 0 && (
                <div className="mt-8 border-t border-border-dim pt-6">
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">
                    Divisi Tambahan Manual:
                  </span>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedDivisions
                      .filter(
                        (d) =>
                          d.tipe === "Umum" &&
                          !COMMON_DIVISIONS.find(
                            (c) => c.nama_divisi === d.nama_divisi,
                          ),
                      )
                      .map((custom, idx) => (
                        <div
                          key={idx}
                          className="bg-bg-card border border-border-dim rounded-xl px-4 py-2 text-xs flex items-center gap-3 text-text-main font-bold shadow-sm transition-all hover:border-red-200 hover:text-red-500 group animate-scaleIn"
                        >
                          {custom.nama_divisi}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDivisions(
                                selectedDivisions.filter(
                                  (x) => x.nama_divisi !== custom.nama_divisi,
                                ),
                              );
                            }}
                            className="text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <button
                onClick={addCustomDivision}
                className="w-full mt-6 p-4 border-2 border-dashed border-border-dim text-text-muted bg-bg-page rounded-2xl hover:bg-bg-card hover:border-blue-300 hover:text-primary transition-all font-black uppercase tracking-tighter flex items-center justify-center gap-2 text-xs"
              >
                <FiPlus size={16} /> Buat Divisi Lain Manual
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="text-center animate-fadeIn">
          <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-100 ring-2 ring-emerald-500/10">
            <FiLayers size={36} className="text-emerald-500" />
          </div>
          <h3 className="text-xl font-black text-text-main mb-2 uppercase tracking-tight">
            Konfirmasi Pembuatan
          </h3>
          <p className="text-text-muted text-sm mb-10 max-w-sm mx-auto font-medium">
            Sistem akan membuat <strong>{periodeData.nama_kabinet}</strong> dan
            mengatur struktur organisasi secara otomatis.
          </p>

          <div className="bg-slate-900 p-8 rounded-3xl text-left border border-slate-700 max-w-md mx-auto shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <FiLayers size={100} className="text-white" />
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4 relative z-10">
              <span className="text-text-muted text-xs font-bold uppercase tracking-widest">
                Total Unit Kerja
              </span>
              <span className="font-black text-white text-lg">
                {selectedDivisions.length}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4 relative z-10">
              <span className="text-text-muted text-xs font-bold uppercase tracking-widest">
                Status
              </span>
              <span className="font-black text-emerald-400 text-xs uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                🔥 SEGERA AKTIF
              </span>
            </div>
            <div className="relative z-10">
              <span className="text-text-muted text-[10px] font-black uppercase tracking-widest block mb-4">
                Struktur Organisasi:
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedDivisions.map((d, i) => (
                  <span
                    key={i}
                    className={`text-[10px] px-3 py-1.5 rounded-xl font-black uppercase tracking-tighter transition-all ${d.tipe === "Inti" ? "bg-amber-400 text-amber-950 shadow-md shadow-amber-400/20 hover:scale-105" : "bg-bg-card/5 text-slate-300 border border-white/5 hover:bg-bg-card/10"}`}
                  >
                    {d.nama_divisi}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-12 flex justify-between border-t border-border-dim pt-8 px-2">
        {step > 1 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-bg-card border border-border-dim text-text-body hover:bg-bg-page transition-all text-xs font-black uppercase active:scale-95"
          >
            <FiArrowLeft /> Kembali
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button
            onClick={() => {
              if (step === 1 && !periodeData.nama_kabinet)
                return alert("Nama kabinet wajib diisi!");
              setStep(step + 1);
            }}
            className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-primary text-white hover:bg-primary-hover transition-all text-xs font-black uppercase shadow-lg shadow-blue-200 active:scale-95"
          >
            Lanjut <FiArrowRight />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            disabled={loading}
            className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-slate-900 text-white hover:bg-black transition-all text-sm font-black uppercase shadow-xl shadow-slate-200 disabled:opacity-50 disabled:transform-none transform active:scale-95 group"
          >
            {loading ? (
              "Memproses..."
            ) : (
              <>
                <span className="group-hover:translate-x-1 transition-transform">
                  Buat Kabinet Sekarang
                </span>{" "}
                <FiCheck className="text-emerald-400" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

const StepIndicator = ({ num, active }) => (
  <div
    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm transition-all z-10 border-2 ${active ? "bg-primary text-white border-blue-600 shadow-xl shadow-blue-200 scale-110" : "bg-bg-card text-slate-300 border-border-dim"}`}
  >
    {num}
  </div>
);

const StepLine = ({ active }) => (
  <div
    className={`w-16 h-1.5 mx-1 rounded-full transition-all duration-500 ${active ? "bg-primary shadow-[0_0_10px_rgba(37,99,235,0.4)]" : "bg-border-dim"}`}
  />
);
