import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

// Components
import PageContainer from "../components/ui/PageContainer.jsx";
import PageHeader from "../components/ui/PageHeader.jsx"; // <--- IMPORT HEADER BARU
import LoadingState from "../components/ui/LoadingState.jsx";
import Modal from "../components/Modal.jsx";
import DivisiForm from "../components/forms/DivisiForm.jsx";
import DivisiReorderModal from "../components/admin/DivisiReorderModal.jsx";

// Utils
import { uploadImage } from "../utils/uploadHelper";

// Styles
import tableStyles from "../components/admin/AdminTable.module.css";
import styles from "./DaftarAnggota.module.css"; // Kita pinjam style tombol dari sini agar seragam

// Icons
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiCopy,
  FiInfo,
  FiImage,
  FiFilter,
  FiList,
} from "react-icons/fi";
import { FilterSelect } from "../components/ui/FilterBar.jsx"; // Gunakan FilterSelect agar seragam

function KelolaDivisi() {
  const { session } = useAuth();
  const isAdmin = !!session;

  // --- STATE ---
  const [periodes, setPeriodes] = useState([]);
  const [activeTab, setActiveTab] = useState("");
  const [divisions, setDivisions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [formFile, setFormFile] = useState(null);
  const [formPreview, setFormPreview] = useState(null);

  // Modal State Reorder
  const [showReorderModal, setShowReorderModal] = useState(false);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchPeriodes = async () => {
      try {
        const { data, error } = await supabase
          .from("periode_jabatan")
          .select("*")
          .order("tahun_mulai", { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          setPeriodes(data);
          const active = data.find((p) => p.is_active) || data[0];
          setActiveTab(active.id);
        }
      } catch (err) {
        console.error("Gagal load periode:", err);
        setError("Gagal memuat data periode.");
      }
    };

    if (isAdmin) fetchPeriodes();
  }, [isAdmin]);

  useEffect(() => {
    if (activeTab) {
      fetchDivisi(activeTab);
    }
  }, [activeTab]);

  const fetchDivisi = async (periodeId) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("divisi")
        .select("*")
        .eq("periode_id", periodeId)
        .order("urutan", { ascending: true });

      if (error) throw error;
      setDivisions(data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Gagal memuat data divisi.");
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const openModal = (item = null) => {
    setFormFile(null);
    setFormPreview(null);

    if (item) {
      setEditingId(item.id);
      setFormData(item);
      setFormPreview(item.logo_url);
    } else {
      setEditingId(null);
      setFormData({
        nama_divisi: "",
        deskripsi: "",
        urutan: 10,
        periode_id: activeTab,
        tipe: "Umum",
      });
    }
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormFile(file);
      setFormPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      let payload = {
        nama_divisi: formData.nama_divisi,
        deskripsi: formData.deskripsi,
        urutan: parseInt(formData.urutan || 10),
        periode_id: parseInt(activeTab),
        tipe: formData.tipe || "Umum",
      };

      if (formFile) {
        const url = await uploadImage(formFile, "divisi");
        payload.logo_url = url;
      }

      if (editingId) {
        await supabase.from("divisi").update(payload).eq("id", editingId);
      } else {
        await supabase.from("divisi").insert(payload);
      }

      alert("Berhasil disimpan!");
      setIsModalOpen(false);
      fetchDivisi(activeTab);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus divisi ini?")) return;
    try {
      const { error } = await supabase.from("divisi").delete().eq("id", id);
      if (error) throw error;
      fetchDivisi(activeTab);
    } catch (err) {
      alert("Gagal hapus: " + err.message);
    }
  };

  const handleImportDivisi = async () => {
    if (!confirm("Salin semua divisi dari periode sebelumnya?")) return;
    setLoading(true);
    try {
      const { data: lastPeriode } = await supabase
        .from("periode_jabatan")
        .select("id")
        .neq("id", activeTab)
        .order("tahun_mulai", { ascending: false })
        .limit(1)
        .single();

      if (!lastPeriode) throw new Error("Tidak ada data periode sebelumnya.");

      const { data: oldDivisions } = await supabase
        .from("divisi")
        .select("nama_divisi, deskripsi, logo_url, urutan, tipe")
        .eq("periode_id", lastPeriode.id);

      if (!oldDivisions?.length) throw new Error("Periode lalu tidak punya divisi.");

      const newDivisions = oldDivisions.map((div) => ({
        ...div,
        periode_id: parseInt(activeTab),
      }));

      const { error } = await supabase.from("divisi").insert(newDivisions);
      if (error) throw error;

      alert(`Sukses menyalin ${newDivisions.length} divisi!`);
      fetchDivisi(activeTab);
    } catch (err) {
      alert("Gagal import: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER ---

  if (loading && periodes.length === 0) {
    return (
      <PageContainer breadcrumbText="Memuat...">
        <LoadingState message="Memuat sistem..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer breadcrumbText="Kelola Divisi">
      
      {/* HEADER BARU (MENGGUNAKAN PAGEHEADER) */}
      <PageHeader
        title="Kelola Divisi"
        subtitle="Atur daftar divisi untuk periode ini."
        
        // Slot Actions: Tombol Urutkan & Tambah
        actions={
          <div style={{display:'flex', gap:'8px'}}>
             <button 
                onClick={() => setShowReorderModal(true)} 
                disabled={loading || divisions.length === 0}
                className={`${styles.modernButton} ${styles.btnTeal}`}
             >
                <FiList /> <span style={{marginLeft:'4px'}}>Urutkan</span>
             </button>
             
             <button 
                onClick={() => openModal()} 
                disabled={loading}
                className={`${styles.modernButton} ${styles.btnBlue}`}
             >
                <FiPlus /> <span style={{marginLeft:'4px'}}>Tambah Divisi</span>
             </button>
          </div>
        }

        // Slot Filters: Dropdown Periode
        filters={
          <div style={{ minWidth: '250px' }}>
            <FilterSelect
              label="Periode Kabinet"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
            >
              {periodes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama_kabinet} ({p.tahun_mulai}) {p.is_active ? "✅" : ""}
                </option>
              ))}
            </FilterSelect>
          </div>
        }
      />

      {error && (
        <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
      )}

      {/* --- CONTENT AREA --- */}
      {loading ? (
        <div style={{ padding: "3rem 0" }}>
          <LoadingState message="Memuat data divisi..." />
        </div>
      ) : (
        <>
          {divisions.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                backgroundColor: "#f8fafc",
                borderRadius: "12px",
                border: "2px dashed #cbd5e0",
                marginBottom: "2rem",
              }}
            >
              <FiInfo size={32} color="#94a3b8" style={{ marginBottom: "1rem" }} />
              <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>
                Belum ada divisi di periode ini.
              </p>
              <button
                onClick={handleImportDivisi}
                className="button button-secondary"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                <FiCopy /> Salin Divisi dari Periode Lalu
              </button>
            </div>
          ) : (
            <div className={tableStyles.tableContainer}>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th style={{ width: "60px" }}>Logo</th>
                    <th>Nama Divisi</th>
                    <th>Deskripsi</th>
                    <th style={{ width: "100px" }}>Urutan</th>
                    <th style={{ textAlign: "right", width: "120px" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {divisions.map((div) => (
                    <tr key={div.id}>
                      <td>
                        {div.logo_url ? (
                          <img
                            src={div.logo_url}
                            alt="logo"
                            style={{
                              width: "40px",
                              height: "40px",
                              objectFit: "cover",
                              borderRadius: "8px",
                              border: "1px solid #e2e8f0",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              background: "#f1f5f9",
                              borderRadius: "8px",
                              border: "1px solid #e2e8f0",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <FiImage color="#cbd5e0" />
                          </div>
                        )}
                      </td>
                      <td>
                        <span
                          style={{
                            fontWeight: "600",
                            color: "var(--text-main)",
                            display: "block",
                          }}
                        >
                          {div.nama_divisi}
                        </span>
                        {div.tipe === "Inti" ? (
                          <span
                            style={{
                              fontSize: "0.7rem",
                              fontWeight: "bold",
                              background: "#fee2e2",
                              color: "#dc2626",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              marginTop: "4px",
                              display: "inline-block",
                            }}
                          >
                            ⭐ PENGURUS INTI
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: "0.7rem",
                              fontWeight: "500",
                              background: "#f1f5f9",
                              color: "#64748b",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              marginTop: "4px",
                              display: "inline-block",
                            }}
                          >
                            DIVISI UMUM
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                          {div.deskripsi
                            ? div.deskripsi.length > 50
                              ? div.deskripsi.substring(0, 50) + "..."
                              : div.deskripsi
                            : "-"}
                        </span>
                      </td>
                      <td>
                        <span className={`${tableStyles.badge} ${tableStyles.badgeGray}`}>
                          #{div.urutan}
                        </span>
                      </td>
                      <td>
                        <div className={tableStyles.actionCell}>
                          <button
                            onClick={() => openModal(div)}
                            className={`${tableStyles.btnAction} ${tableStyles.btnEdit}`}
                            title="Edit"
                          >
                            <FiEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(div.id)}
                            className={`${tableStyles.btnAction} ${tableStyles.btnDelete}`}
                            title="Hapus"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* MODAL FORM */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Divisi" : "Tambah Divisi"}
      >
        <DivisiForm
          formData={formData}
          onChange={handleFormChange}
          onFileChange={handleFileChange}
          preview={formPreview}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          loading={modalLoading}
          periodeList={periodes}
        />
      </Modal>

      {/* MODAL REORDER (Dibungkus Modal karena kontennya polos) */}
      {showReorderModal && (
        <Modal
          isOpen={showReorderModal}
          onClose={() => setShowReorderModal(false)}
          title="Atur Urutan Divisi"
        >
          <DivisiReorderModal
            isOpen={true}
            onClose={() => setShowReorderModal(false)}
            divisiList={divisions}
            activePeriodeId={activeTab}
            onSuccess={() => fetchDivisi(activeTab)}
          />
        </Modal>
      )}
    </PageContainer>
  );
}

export default KelolaDivisi;