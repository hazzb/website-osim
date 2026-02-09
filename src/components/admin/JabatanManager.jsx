import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { FiTrash2, FiPlus, FiTag, FiBriefcase } from "react-icons/fi";

const JabatanManager = ({ onClose, onSuccess }) => {
  const [jabatans, setJabatans] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [newJabatan, setNewJabatan] = useState("");
  // Default kita set ke 'Divisi' karena itu yang paling sering ditambah
  const [newTipe, setNewTipe] = useState("Divisi");

  // 1. FETCH DATA
  const fetchJabatan = async () => {
    try {
      const { data, error } = await supabase
        .from("master_jabatan")
        .select("*")
        .order("tipe_jabatan", { ascending: false })
        .order("nama_jabatan", { ascending: true });

      if (error) throw error;
      setJabatans(data || []);
    } catch (err) {
      console.error("Gagal load jabatan:", err);
    }
  };

  useEffect(() => {
    fetchJabatan();
  }, []);

  // 2. HANDLERS
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newJabatan.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("master_jabatan").insert({
        nama_jabatan: newJabatan,
        tipe_jabatan: newTipe,
      });
      if (error) throw error;

      setNewJabatan("");
      await fetchJabatan();
      if (onSuccess) onSuccess();
    } catch (err) {
      alert("Gagal: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus jabatan ini?")) return;
    try {
      const { error } = await supabase
        .from("master_jabatan")
        .delete()
        .eq("id", id);
      if (error) {
        if (error.code === "23503")
          alert("Gagal hapus. Jabatan sedang dipakai oleh anggota.");
        else throw error;
        return;
      }
      fetchJabatan();
      if (onSuccess) onSuccess();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // 3. GROUPING DATA (Grouping agar User Mudah Membaca)
  const groupedJabatan = jabatans.reduce((acc, curr) => {
    const tipe = curr.tipe_jabatan || "Lainnya";
    if (!acc[tipe]) acc[tipe] = [];
    acc[tipe].push(curr);
    return acc;
  }, {});

  // Urutan Tampilan: Inti Paling Atas -> Divisi -> Lainnya
  const sortedGroupKeys = Object.keys(groupedJabatan).sort((a, b) => {
    const order = { Inti: 1, Divisi: 2, Lainnya: 3 };
    return (order[a] || 99) - (order[b] || 99);
  });

  // Helper Label agar user paham
  const getLabelByTipe = (tipe) => {
    if (tipe === "Inti") return "JABATAN KHUSUS BPH (INTI)";
    if (tipe === "Divisi") return "JABATAN STRUKTURAL DIVISI";
    return "JABATAN LAINNYA";
  };

  return (
    <div className="px-2 pb-2">
      {/* FORM INPUT */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">
          Tambah Jabatan Master
        </h4>

        <form
          onSubmit={handleAdd}
          className="grid grid-cols-[2fr_1.5fr_auto] gap-2 items-start"
        >
          {/* Input Nama */}
          <div>
            <input
              type="text"
              placeholder="Nama Jabatan (e.g. Sekretaris I)"
              className="w-full h-[38px] px-3 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              value={newJabatan}
              onChange={(e) => setNewJabatan(e.target.value)}
              required
            />
          </div>

          {/* Input Tipe */}
          <div>
            <select
              className="w-full h-[38px] px-3 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              value={newTipe}
              onChange={(e) => setNewTipe(e.target.value)}
            >
              <option value="Divisi">Struktural Divisi (Ketua/Staf)</option>
              <option value="Inti">Pengurus Inti (Ketua/Wakil)</option>
            </select>
          </div>

          {/* Tombol Add */}
          <div className="flex h-[38px]">
            <button
              type="submit"
              disabled={loading}
              className="h-full px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center transition-colors"
            >
              <FiPlus />
            </button>
          </div>
        </form>
        <div className="mt-2 text-xs text-slate-500 space-y-1">
          <p>
            * Jabatan <strong>Inti</strong> hanya muncul saat input anggota{" "}
            <strong>BPH</strong>.
          </p>
          <p>
            * Jabatan <strong>Struktural</strong> muncul untuk divisi biasa.
          </p>
        </div>
      </div>

      {/* LIST JABATAN (SCROLLABLE & GROUPED) */}
      <div className="max-h-[400px] overflow-y-auto pr-1">
        {sortedGroupKeys.length === 0 ? (
          <p className="text-center py-8 text-sm text-slate-500">
            Belum ada data jabatan master.
          </p>
        ) : (
          sortedGroupKeys.map((tipe) => (
            <div key={tipe} className="mb-6 last:mb-2">
              {/* Header Group */}
              <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-1">
                <FiTag
                  size={14}
                  className={tipe === "Inti" ? "text-red-600" : "text-blue-500"}
                />
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                  {getLabelByTipe(tipe)}
                </span>
              </div>

              {/* Items in Group */}
              <div className="flex flex-col gap-2">
                {groupedJabatan[tipe].map((j) => (
                  <div
                    key={j.id}
                    className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-md hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FiBriefcase size={14} className="text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">
                        {j.nama_jabatan}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDelete(j.id)}
                      className="w-7 h-7 flex items-center justify-center rounded bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-colors"
                      title="Hapus"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* FOOTER BUTTON */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2 px-4 bg-slate-100 text-slate-700 font-medium rounded-md hover:bg-slate-200 transition-colors text-sm"
        >
          Selesai & Tutup
        </button>
      </div>
    </div>
  );
};

export default JabatanManager;
