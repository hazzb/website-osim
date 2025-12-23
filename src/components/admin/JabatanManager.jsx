import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { FiTrash2, FiPlus, FiTag, FiBriefcase } from "react-icons/fi";
import formStyles from "./AdminForm.module.css"; 

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
      const { error } = await supabase.from("master_jabatan").delete().eq("id", id);
      if (error) {
         if (error.code === '23503') alert("Gagal hapus. Jabatan sedang dipakai oleh anggota.");
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
     const order = { 'Inti': 1, 'Divisi': 2, 'Lainnya': 3 };
     return (order[a] || 99) - (order[b] || 99);
  });

  // Helper Label agar user paham
  const getLabelByTipe = (tipe) => {
    if (tipe === 'Inti') return "JABATAN KHUSUS BPH (INTI)";
    if (tipe === 'Divisi') return "JABATAN STRUKTURAL DIVISI";
    return "JABATAN LAINNYA";
  };

  return (
    <div style={{ padding: "0 0.5rem" }}>
      
      {/* FORM INPUT (Sesuai Layout Compact) */}
      <div
        style={{
          background: "#f8fafc",
          padding: "1rem",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
          marginBottom: "1.5rem",
        }}
      >
        <h4 className={formStyles.formLabel} style={{ marginBottom: "0.8rem", color: "#334155" }}>
          Tambah Jabatan Master
        </h4>

        <form
          onSubmit={handleAdd}
          className={formStyles.formGrid}
          style={{
            gridTemplateColumns: "2fr 1.5fr auto", // Kolom Tipe diperlebar sedikit
            gap: "0.5rem",
            marginBottom: 0,
          }}
        >
          {/* Input Nama */}
          <div className={formStyles.colSpan1}>
            <input
              type="text"
              placeholder="Nama Jabatan (e.g. Sekretaris I)"
              className={formStyles.formInput}
              value={newJabatan}
              onChange={(e) => setNewJabatan(e.target.value)}
              required
              style={{ height: "38px" }}
            />
          </div>

          {/* Input Tipe (Sesuai Jenis Divisi) */}
          <div className={formStyles.colSpan1}>
            <select
              className={formStyles.formSelect}
              value={newTipe}
              onChange={(e) => setNewTipe(e.target.value)}
              style={{ height: "38px", fontSize: "0.85rem" }}
            >
              <option value="Divisi">Struktural Divisi (Ketua/Staf)</option>
              <option value="Inti">Pengurus Inti (Ketua/Wakil)</option>
            </select>
          </div>

          {/* Tombol Add */}
          <div className={formStyles.colSpan1} style={{ display: "flex", alignItems: "center" }}>
            <button
              type="submit"
              className="button button-primary"
              disabled={loading}
              style={{ height: "38px", padding: "0 1rem", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <FiPlus />
            </button>
          </div>
        </form>
        <p style={{fontSize: '0.7rem', color:'#64748b', marginTop:'6px', marginBottom:0}}>
           * Jabatan <strong>Inti</strong> hanya muncul saat input anggota <strong>BPH</strong>.<br/>
           * Jabatan <strong>Struktural</strong> muncul untuk divisi biasa.
        </p>
      </div>

      {/* LIST JABATAN (SCROLLABLE & GROUPED) */}
      <div style={{ maxHeight: "400px", overflowY: "auto", paddingRight: "4px" }}>
        {sortedGroupKeys.length === 0 ? (
          <p className={formStyles.helperText} style={{ textAlign: "center", padding: "2rem" }}>
            Belum ada data jabatan master.
          </p>
        ) : (
          sortedGroupKeys.map((tipe) => (
            <div key={tipe} style={{ marginBottom: "1.5rem" }}>
              
              {/* Header Group */}
              <div
                style={{
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  marginBottom: "0.5rem", borderBottom: "2px solid #f1f5f9",
                  paddingBottom: "0.25rem",
                }}
              >
                <FiTag size={14} color={tipe === 'Inti' ? '#dc2626' : '#3b82f6'} />
                <span
                  style={{
                    fontWeight: "700", color: "#475569", fontSize: "0.75rem",
                    textTransform: "uppercase", letterSpacing: "0.05em"
                  }}
                >
                  {getLabelByTipe(tipe)}
                </span>
              </div>

              {/* Items in Group */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {groupedJabatan[tipe].map((j) => (
                  <div
                    key={j.id}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "0.6rem 1rem", background: "white",
                      border: "1px solid #e2e8f0", borderRadius: "6px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                      <FiBriefcase size={14} color="#94a3b8" />
                      <span style={{ fontWeight: 500, color: "#334155", fontSize: "0.9rem" }}>
                        {j.nama_jabatan}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDelete(j.id)}
                      style={{
                        background: "#fff1f2", color: "#fb7185",
                        border: "1px solid #fecdd3", width: "28px", height: "28px",
                        borderRadius: "6px", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
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
      <div className={formStyles.formFooter} style={{marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0'}}>
        <button
          type="button"
          onClick={onClose}
          className="button button-secondary"
          style={{ width: "100%" }}
        >
          Selesai & Tutup
        </button>
      </div>
    </div>
  );
};

export default JabatanManager;