import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useAdminTable } from "../hooks/useAdminTable";
import PeriodeForm from "../components/forms/PeriodeForm.jsx";

// Components
import PageContainer from "../components/ui/PageContainer.jsx";
import PageHeader from "../components/ui/PageHeader.jsx"; 
import Modal from "../components/Modal.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import KabinetWizard from "../components/admin/KabinetWizard.jsx"; // <--- 1. IMPORT WIZARD

// Styles
import tableStyles from "../components/admin/AdminTable.module.css";
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiCheckCircle, FiArchive, FiZap } from "react-icons/fi";

function KelolaPeriode() {
  // --- HOOKS ---
  const {
    data: periodeList,
    loading,
    error,
    currentPage,
    setCurrentPage,
    totalPages,
    searchTerm,
    setSearchTerm,
    refreshData,
  } = useAdminTable({
    tableName: "periode_jabatan",
    searchColumn: "nama_kabinet",
    defaultOrder: { column: "tahun_mulai", ascending: false },
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false); // <--- 2. STATE WIZARD
  const [modalLoading, setModalLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});

  // --- HANDLERS ---
  const openModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData(item);
    } else {
      setEditingId(null);
      setFormData({
        nama_kabinet: "",
        tahun_mulai: "",
        tahun_selesai: "",
        is_active: false,
        motto_kabinet: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      if (editingId) await supabase.from("periode_jabatan").update(formData).eq("id", editingId);
      else await supabase.from("periode_jabatan").insert(formData);
      
      setIsModalOpen(false);
      refreshData();
      alert("Berhasil disimpan!");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus periode ini?")) return;
    await supabase.from("periode_jabatan").delete().eq("id", id);
    refreshData();
  };

  // --- RENDER ---
  return (
    <PageContainer breadcrumbText="Kelola Periode">
      
      {/* HEADER */}
      <PageHeader
        title="Kelola Periode"
        subtitle="Manajemen tahun kepengurusan."
        
        actions={
          <div style={{display:'flex', gap:'8px'}}>
             {/* 3. TOMBOL WIZARD (Warna Ungu/Indigo agar spesial) */}
             <button
                onClick={() => setIsWizardOpen(true)}
                className="button"
                style={{ display: "flex", alignItems: "center", gap: "0.5rem", backgroundColor:'#6366f1', color:'white', border:'none' }}
             >
                <FiZap /> Wizard Kabinet
             </button>

             <button
                onClick={() => openModal()}
                className="button button-primary"
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
             >
                <FiPlus /> Manual
             </button>
          </div>
        }

        searchBar={
          <div style={{ position: "relative", width: "100%" }}>
            <FiSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              type="text"
              placeholder="Cari nama kabinet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", padding: "0.6rem 1rem 0.6rem 2.5rem", border: "1px solid #cbd5e0", borderRadius: "8px", fontSize: "0.9rem", height: "38px" }}
            />
          </div>
        }
      />

      {/* TABLE */}
      {loading ? (
        <LoadingState message="Memuat periode..." />
      ) : (
        <div className={tableStyles.tableContainer}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Nama Kabinet</th>
                <th>Tahun</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {periodeList.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.nama_kabinet}</strong></td>
                  <td>{item.tahun_mulai} - {item.tahun_selesai}</td>
                  <td>
                    {item.is_active ? (
                      <span className={`${tableStyles.badge} ${tableStyles.badgeSuccess}`}>
                        <FiCheckCircle size={12} /> Aktif
                      </span>
                    ) : (
                      <span className={`${tableStyles.badge} ${tableStyles.badgeGray}`}>
                        <FiArchive size={12} /> Arsip
                      </span>
                    )}
                  </td>
                  <td>
                    <div className={tableStyles.actionCell}>
                      <button onClick={() => openModal(item)} className={`${tableStyles.btnAction} ${tableStyles.btnEdit}`}><FiEdit /></button>
                      <button onClick={() => handleDelete(item.id)} className={`${tableStyles.btnAction} ${tableStyles.btnDelete}`}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL FORM (MANUAL) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Periode" : "Tambah Periode Baru"}
      >
        <PeriodeForm
          formData={formData}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          loading={modalLoading}
        />
      </Modal>

      {/* 4. MODAL WIZARD (OTOMATIS) */}
      {isWizardOpen && (
        <KabinetWizard 
           isOpen={isWizardOpen}
           onClose={() => setIsWizardOpen(false)}
           onSuccess={refreshData}
        />
      )}

    </PageContainer>
  );
}

export default KelolaPeriode;