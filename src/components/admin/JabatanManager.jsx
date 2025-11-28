import React, { useState } from "react";
import { supabase } from "../../supabaseClient";
import { FiTrash2, FiPlus, FiTag, FiBriefcase } from "react-icons/fi";
import formStyles from "./AdminForm.module.css"; // Menggunakan CSS Pusat

const JabatanManager = ({ onClose, onSuccess, jabatanList }) => {
  const [newJabatan, setNewJabatan] = useState("");
  const [newTipe, setNewTipe] = useState("Divisi");
  const [loading, setLoading] = useState(false);

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
      onSuccess();
    } catch (err) {
      alert("Gagal: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus jabatan ini?")) return;
    try {
      await supabase.from("master_jabatan").delete().eq("id", id);
      onSuccess();
    } catch (err) {
      alert("Gagal hapus. Mungkin jabatan ini sedang dipakai oleh anggota.");
    }
  };

  const groupedJabatan = jabatanList.reduce((acc, curr) => {
    const tipe = curr.tipe_jabatan || "Lainnya";
    if (!acc[tipe]) acc[tipe] = [];
    acc[tipe].push(curr);
    return acc;
  }, {});

  return (
    <div style={{ padding: "0 0.5rem" }}>
      {/* FORM INPUT COMPACT */}
      <div
        style={{
          background: "#f8fafc",
          padding: "1rem",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
          marginBottom: "1.5rem",
        }}
      >
        <h4 className={formStyles.formLabel} style={{ marginBottom: "0.8rem" }}>
          Tambah Jabatan Baru
        </h4>

        <form
          onSubmit={handleAdd}
          className={formStyles.formGrid}
          style={{
            gridTemplateColumns: "2fr 1fr auto",
            gap: "0.5rem",
            marginBottom: 0,
          }}
        >
          <div className={formStyles.colSpan1}>
            <input
              type="text"
              placeholder="Nama Jabatan"
              className={formStyles.formInput}
              value={newJabatan}
              onChange={(e) => setNewJabatan(e.target.value)}
              required
            />
          </div>

          <div className={formStyles.colSpan1}>
            <select
              className={formStyles.formSelect}
              value={newTipe}
              onChange={(e) => setNewTipe(e.target.value)}
            >
              <option value="Inti">Pengurus Inti</option>
              <option value="Divisi">Pengurus Divisi</option>
              <option value="Umum">Umum/Anggota</option>
            </select>
          </div>

          <div
            className={formStyles.colSpan1}
            style={{ display: "flex", alignItems: "center" }}
          >
            <button
              type="submit"
              className="button button-primary"
              disabled={loading}
              style={{ height: "38px", padding: "0 1rem" }}
            >
              <FiPlus />
            </button>
          </div>
        </form>
      </div>

      {/* LIST JABATAN (SCROLLABLE) */}
      <div
        style={{ maxHeight: "400px", overflowY: "auto", paddingRight: "4px" }}
      >
        {Object.keys(groupedJabatan).length === 0 ? (
          <p
            className={formStyles.helperText}
            style={{ textAlign: "center", padding: "2rem" }}
          >
            Belum ada data jabatan master.
          </p>
        ) : (
          Object.keys(groupedJabatan).map((tipe) => (
            <div key={tipe} style={{ marginBottom: "1.5rem" }}>
              {/* Header Group */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.5rem",
                  borderBottom: "2px solid #f1f5f9",
                  paddingBottom: "0.25rem",
                }}
              >
                <FiTag size={14} color="#3b82f6" />
                <span
                  style={{
                    fontWeight: "700",
                    color: "#475569",
                    fontSize: "0.85rem",
                    textTransform: "uppercase",
                  }}
                >
                  {tipe}
                </span>
              </div>

              {/* Items */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {groupedJabatan[tipe].map((j) => (
                  <div
                    key={j.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.6rem 1rem",
                      background: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <FiBriefcase size={14} color="#94a3b8" />
                      <span
                        style={{
                          fontWeight: 500,
                          color: "#334155",
                          fontSize: "0.9rem",
                        }}
                      >
                        {j.nama_jabatan}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDelete(j.id)}
                      style={{
                        background: "#fff1f2",
                        color: "#fb7185",
                        border: "1px solid #fecdd3",
                        width: "28px",
                        height: "28px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
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

      {/* FOOTER BUTTON (Full Width Selesai) */}
      <div className={formStyles.formFooter}>
        <button
          type="button"
          onClick={onClose}
          className="button button-secondary"
          style={{ width: "100%" }}
        >
          Selesai
        </button>
      </div>
    </div>
  );
};

export default JabatanManager;
