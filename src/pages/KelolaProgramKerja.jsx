import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAdminTable } from "../hooks/useAdminTable";

// Components
import PageContainer from "../components/ui/PageContainer.jsx";
import PageHeader from "../components/ui/PageHeader.jsx"; // <--- IMPORT HEADER
import Modal from "../components/Modal.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import ProgramKerjaForm from "../components/forms/ProgramKerjaForm.jsx";

// Styles & Icons
import tableStyles from "../components/admin/AdminTable.module.css";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch, // Pastikan FiSearch diimport
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiActivity,
} from "react-icons/fi";

function KelolaProgramKerja() {
  // --- 1. SETUP TABLE HOOK ---
  const {
    data: progjaList,
    loading,
    error,
    currentPage,
    setCurrentPage,
    totalPages,
    searchTerm,
    setSearchTerm,
    handleDelete,
    refreshData,
  } = useAdminTable({
    tableName: "program_kerja",
    searchColumn: "nama_acara",
    select: "*, divisi(nama_divisi), periode_jabatan(nama_kabinet)",
    defaultOrder: { column: "tanggal", ascending: false },
  });

  // --- 2. STATE FORM ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});

  // Dropdown Data
  const [periodeList, setPeriodeList] = useState([]);
  const [divisiList, setDivisiList] = useState([]);
  const [anggotaList, setAnggotaList] = useState([]);

  // Fetch Dropdowns (Sekali saja saat mount)
  useEffect(() => {
    const fetchDropdowns = async () => {
      const { data: p } = await supabase.from("periode_jabatan").select("id, nama_kabinet").order("tahun_mulai", { ascending: false });
      setPeriodeList(p || []);
      const { data: d } = await supabase.from("divisi").select("id, nama_divisi").order("nama_divisi");
      setDivisiList(d || []);
      const { data: a } = await supabase.from("anggota").select("id, nama").order("nama");
      setAnggotaList(a || []);
    };
    fetchDropdowns();
  }, []);

  // --- HANDLERS ---
  const openModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData(item);
    } else {
      setEditingId(null);
      setFormData({
        nama_acara: "",
        status: "Rencana",
        tanggal: "",
        periode_id: "",
        divisi_id: "",
        penanggung_jawab_id: "",
        deskripsi: "",
        link_dokumentasi: "",
        embed_html: "",
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
      if (editingId) await supabase.from("program_kerja").update(formData).eq("id", editingId);
      else await supabase.from("program_kerja").insert(formData);
      
      setIsModalOpen(false);
      refreshData(); // Refresh tabel
      alert("Berhasil disimpan!");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // --- RENDER ---
  return (
    <PageContainer breadcrumbText="Kelola Program Kerja">
      
      {/* HEADER STANDAR */}
      <PageHeader
        title="Kelola Program Kerja"
        subtitle="Database seluruh kegiatan organisasi."
        
        // Tombol Tambah
        actions={
          <button
            onClick={() => openModal()}
            className="button button-primary"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <FiPlus /> Tambah Progja
          </button>
        }

        // Search Bar
        searchBar={
          <div style={{ position: "relative", width: "100%" }}>
            <FiSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              type="text"
              placeholder="Cari nama acara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", padding: "0.6rem 1rem 0.6rem 2.5rem", border: "1px solid #cbd5e0", borderRadius: "8px", fontSize: "0.9rem", height: "38px" }}
            />
          </div>
        }
      />

      {/* ERROR */}
      {error && <div style={{ color: "red", margin: "1rem 0" }}>{error}</div>}

      {/* TABLE CONTENT */}
      {loading ? (
        <LoadingState message="Memuat data..." />
      ) : (
        <div className={tableStyles.tableContainer}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Nama Acara</th>
                <th>Divisi</th>
                <th>Periode</th>
                <th>Status</th>
                <th>Tanggal</th>
                <th style={{ textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {progjaList.length === 0 ? (
                <tr><td colSpan="6" style={{textAlign:'center', padding:'2rem'}}>Tidak ada data.</td></tr>
              ) : (
                progjaList.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.nama_acara}</strong></td>
                    <td>{item.divisi?.nama_divisi || "-"}</td>
                    <td>{item.periode_jabatan?.nama_kabinet || "-"}</td>
                    <td>
                      <span className={`${tableStyles.badge} ${
                        item.status === 'Selesai' ? tableStyles.badgeSuccess : 
                        item.status === 'Berjalan' ? tableStyles.badgeWarning : tableStyles.badgeGray
                      }`}>
                        {item.status === 'Selesai' ? <FiCheckCircle/> : item.status === 'Berjalan' ? <FiActivity/> : <FiClock/>} 
                        {item.status}
                      </span>
                    </td>
                    <td>{new Date(item.tanggal).toLocaleDateString("id-ID")}</td>
                    <td>
                      <div className={tableStyles.actionCell}>
                        <button onClick={() => openModal(item)} className={`${tableStyles.btnAction} ${tableStyles.btnEdit}`}><FiEdit /></button>
                        <button onClick={() => handleDelete(item.id)} className={`${tableStyles.btnAction} ${tableStyles.btnDelete}`}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className={tableStyles.paginationContainer}>
          <span>Halaman {currentPage} dari {totalPages}</span>
          <div className={tableStyles.paginationButtons}>
            <button className={tableStyles.paginationButton} onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 1}>Prev</button>
            <button className={tableStyles.paginationButton} onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === totalPages}>Next</button>
          </div>
        </div>
      )}

      {/* MODAL FORM */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingId ? "Edit Program Kerja" : "Tambah Program Kerja"}
          maxWidth="800px"
        >
          <ProgramKerjaForm
            formData={formData}
            onChange={handleFormChange}
            onSubmit={handleSubmit}
            onCancel={() => setIsModalOpen(false)}
            loading={modalLoading}
            periodeList={periodeList}
            divisiList={divisiList}
            anggotaList={anggotaList}
          />
        </Modal>
      )}
    </PageContainer>
  );
}

export default KelolaProgramKerja;