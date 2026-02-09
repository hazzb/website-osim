import React, { useState } from "react";
import { supabase } from "../../supabaseClient";
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

// TEMPLATE DATA
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
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // --- STATE PERIODE ---
  const [periodeData, setPeriodeData] = useState({
    nama_kabinet: "",
    tahun_mulai: new Date().getFullYear(),
    tahun_selesai: new Date().getFullYear() + 1,
    motto_kabinet: "",
    is_active: true, // Default langsung aktif
  });

  // --- STATE DIVISI ---
  // Default: BPH sudah terpilih
  const [selectedDivisions, setSelectedDivisions] = useState([
    { ...BPH_TEMPLATE, selected: true },
  ]);

  // --- HANDLERS ---
  const handlePeriodeChange = (e) => {
    setPeriodeData({ ...periodeData, [e.target.name]: e.target.value });
  };

  // Toggle untuk Divisi Umum
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

  // Tambah Divisi Custom (Manual)
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

  // --- FINAL SUBMIT ---
  const handleFinish = async () => {
    if (loading) return;
    setLoading(true);

    try {
      // 1. Matikan periode aktif yang lama (Opsional, agar rapi)
      await supabase
        .from("periode_jabatan")
        .update({ is_active: false })
        .neq("id", 0);

      // 2. Buat Periode Baru
      const { data: periode, error: errPeriode } = await supabase
        .from("periode_jabatan")
        .insert(periodeData)
        .select()
        .single();

      if (errPeriode) throw errPeriode;

      // 3. Buat Divisi (Batch Insert)
      // Kita map urutan: BPH selalu no 1, sisanya mengikuti
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

  // --- RENDER ---
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Wizard Setup Kabinet"
      maxWidth="700px"
    >
      {/* STEPPER */}
      <div className="flex justify-center items-center mb-8">
        <StepIndicator num={1} active={step >= 1} />
        <StepLine active={step >= 2} />
        <StepIndicator num={2} active={step >= 2} />
        <StepLine active={step >= 3} />
        <StepIndicator num={3} active={step >= 3} />
      </div>

      {/* --- STEP 1: IDENTITAS --- */}
      {step === 1 && (
        <div className="animate-fade-in space-y-4">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-800">
              Langkah 1: Identitas Kabinet
            </h3>
            <p className="text-sm text-slate-500">
              Tentukan nama dan masa bakti kabinet baru.
            </p>
          </div>

          <div className="grid grid-cols-12 gap-4">
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

      {/* --- STEP 2: SUSUNAN DIVISI --- */}
      {step === 2 && (
        <div className="animate-fade-in">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-800">
              Langkah 2: Susunan Struktur
            </h3>
            <p className="text-sm text-slate-500">
              Pilih divisi mana saja yang ada di periode ini.
            </p>
          </div>

          <div className="flex flex-col gap-6 max-h-[400px] overflow-y-auto pr-1">
            {/* GROUP 1: INTI (BPH) */}
            <div>
              <div className="flex items-center gap-2 mb-2 text-amber-700">
                <FiStar className="text-amber-600" />
                <span className="font-bold text-sm">PENGURUS INTI (WAJIB)</span>
              </div>

              <div className="p-4 border-2 border-amber-300 bg-amber-50 rounded-lg flex items-center gap-4">
                <div className="bg-amber-500 text-white rounded-full p-1">
                  <FiCheck size={16} />
                </div>
                <div>
                  <div className="font-bold text-amber-900">
                    Badan Pengurus Harian (BPH)
                  </div>
                  <div className="text-xs text-amber-800">
                    Otomatis berisi jabatan Ketua, Wakil, Sekretaris, Bendahara.
                  </div>
                </div>
              </div>
            </div>

            {/* GROUP 2: DIVISI UMUM */}
            <div>
              <div className="flex items-center gap-2 mb-2 text-slate-800">
                <FiGrid />
                <span className="font-bold text-sm">
                  DIVISI / SEKBID (PILIH)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {COMMON_DIVISIONS.map((template) => {
                  const isSelected = selectedDivisions.find(
                    (d) => d.nama_divisi === template.nama_divisi,
                  );
                  return (
                    <div
                      key={template.nama_divisi}
                      onClick={() => toggleDivision(template)}
                      className={`p-3 border rounded-lg cursor-pointer transition-all flex flex-col gap-2 relative ${
                        isSelected
                          ? "border-blue-500 bg-blue-50/50"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span
                          className={`text-sm font-semibold ${isSelected ? "text-blue-800" : "text-slate-700"}`}
                        >
                          {template.nama_divisi}
                        </span>
                        {isSelected && (
                          <FiCheck className="text-blue-500" size={16} />
                        )}
                      </div>
                      <span className="text-xs text-slate-500 leading-tight block">
                        {template.deskripsi}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* LIST CUSTOM */}
              {selectedDivisions.filter(
                (d) =>
                  d.tipe === "Umum" &&
                  !COMMON_DIVISIONS.find(
                    (c) => c.nama_divisi === d.nama_divisi,
                  ),
              ).length > 0 && (
                <div className="mt-4">
                  <span className="text-xs font-semibold text-slate-500">
                    Divisi Tambahan:
                  </span>
                  <div className="flex flex-wrap gap-2 mt-2">
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
                          className="bg-blue-50 border border-blue-200 rounded-full px-3 py-1 text-xs flex items-center gap-2 text-blue-800"
                        >
                          {custom.nama_divisi}
                          <button
                            onClick={() =>
                              setSelectedDivisions(
                                selectedDivisions.filter(
                                  (x) => x.nama_divisi !== custom.nama_divisi,
                                ),
                              )
                            }
                            className="hover:text-red-500 transition-colors"
                          >
                            <FiTrash2 size={12} />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <button
                onClick={addCustomDivision}
                className="w-full mt-4 p-3 border border-dashed border-slate-300 text-slate-500 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors font-semibold flex items-center justify-center gap-2 text-sm"
              >
                <FiPlus /> Buat Divisi Lain Manual
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- STEP 3: KONFIRMASI --- */}
      {step === 3 && (
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiLayers size={32} className="text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            Konfirmasi Pembuatan
          </h3>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">
            Sistem akan membuat <strong>{periodeData.nama_kabinet}</strong> dan
            mengatur struktur organisasi secara otomatis.
          </p>

          <div className="bg-slate-50 p-6 rounded-xl text-left border border-slate-200 max-w-md mx-auto">
            <div className="flex justify-between border-b border-slate-200 pb-3 mb-3">
              <span className="text-slate-500 text-sm">Total Divisi</span>
              <span className="font-bold text-slate-800">
                {selectedDivisions.length} Unit
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-3 mb-3">
              <span className="text-slate-500 text-sm">Status</span>
              <span className="font-bold text-emerald-600">Langsung Aktif</span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block mb-2">
                Daftar Unit:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedDivisions.map((d, i) => (
                  <span
                    key={i}
                    className={`text-xs px-2 py-0.5 rounded-full border ${
                      d.tipe === "Inti"
                        ? "bg-amber-100 text-amber-800 border-amber-200"
                        : "bg-slate-200 text-slate-600 border-slate-300"
                    }`}
                  >
                    {d.nama_divisi}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- FOOTER --- */}
      <div className="mt-8 flex justify-between border-t border-slate-100 pt-6">
        {step > 1 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium"
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
            className="flex items-center gap-2 px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm shadow-blue-200"
          >
            Lanjut <FiArrowRight />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition-colors text-base font-medium shadow-sm shadow-emerald-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              "Memproses..."
            ) : (
              <>
                Buat Kabinet Sekarang <FiCheck />
              </>
            )}
          </button>
        )}
      </div>
    </Modal>
  );
}

// Sub-components untuk styling
const StepIndicator = ({ num, active }) => (
  <div
    className={`
    w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all z-10
    ${active ? "bg-blue-500 text-white shadow-blue-200 shadow-md" : "bg-slate-100 text-slate-400 border border-slate-300"}
  `}
  >
    {num}
  </div>
);

const StepLine = ({ active }) => (
  <div
    className={`
    w-16 h-1 mx-2 rounded-full transition-all
    ${active ? "bg-blue-500" : "bg-slate-200"}
  `}
  />
);
