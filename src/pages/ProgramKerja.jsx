import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import styles from "./ProgramKerja.module.css";
import { ProgjaSkeletonGrid } from "../components/ui/Skeletons.jsx";

import { FiPlus, FiSearch } from "react-icons/fi";

import PageContainer from "../components/ui/PageContainer.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import ProgramKerjaCard from "../components/cards/ProgramKerjaCard.jsx";
import Modal from "../components/Modal.jsx";
import ProgramKerjaForm from "../components/forms/ProgramKerjaForm.jsx";

function ProgramKerja() {
  const { session } = useAuth();
  const isAdmin = !!session;

  // --- STATE ---
  const [progjaList, setProgjaList] = useState([]);
  const [filteredProgja, setFilteredProgja] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterPeriode, setFilterPeriode] = useState(""); // Filter Utama (Header)
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterDivisi, setFilterDivisi] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterGender, setFilterGender] = useState("");

  // Options Data
  const [divisiOptions, setDivisiOptions] = useState([]);
  const [anggotaOptions, setAnggotaOptions] = useState([]);
  const [periodeOptions, setPeriodeOptions] = useState([]);

  // Modal & Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const initialFormState = {
    nama_acara: "",
    tanggal: "",
    status: "Rencana",
    target_gender: "Semua",
    deskripsi: "",
    link_dokumentasi: "",
    divisi_id: "",
    penanggung_jawab_id: "",
    periode_id: "",
    embed_html: "",
  };
  const [formData, setFormData] = useState(initialFormState);
  const [formLoading, setFormLoading] = useState(false);

  // --- FETCH DATA ---
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 1. Options
      const [divRes, aggRes, perRes] = await Promise.all([
        supabase.from("divisi").select("id, nama_divisi").order("nama_divisi"),
        supabase.from("anggota").select("id, nama").order("nama"),
        supabase
          .from("periode_jabatan")
          .select("id, nama_kabinet, is_active, tahun_mulai")
          .order("tahun_mulai", { ascending: false }),
      ]);

      setDivisiOptions(divRes.data || []);
      setAnggotaOptions(aggRes.data || []);
      setPeriodeOptions(perRes.data || []);

      // Default Periode
      const activePeriode = perRes.data?.find((p) => p.is_active);
      if (activePeriode) {
        setFilterPeriode(activePeriode.id);
        setFormData((prev) => ({ ...prev, periode_id: activePeriode.id }));
      } else if (perRes.data?.length > 0) {
        setFilterPeriode(perRes.data[0].id);
      }

      // 2. Program Kerja
      const { data: progjaData, error } = await supabase
        .from("program_kerja")
        .select(
          `
          *,
          divisi:divisi_id (nama_divisi),
          pj:penanggung_jawab_id (nama)
        `
        )
        .order("tanggal", { ascending: false });

      if (error) throw error;
      setProgjaList(progjaData || []);
      setFilteredProgja(progjaData || []);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // --- FILTERING ---
  useEffect(() => {
    let result = progjaList;

    if (filterPeriode)
      result = result.filter((item) => item.periode_id == filterPeriode);
    if (searchTerm)
      result = result.filter((item) =>
        item.nama_acara.toLowerCase().includes(searchTerm.toLowerCase())
      );
    if (startDate)
      result = result.filter(
        (item) => item.tanggal && item.tanggal >= startDate
      );
    if (endDate)
      result = result.filter((item) => item.tanggal && item.tanggal <= endDate);
    if (filterDivisi)
      result = result.filter((item) => item.divisi_id == filterDivisi);
    if (filterStatus)
      result = result.filter((item) => item.status === filterStatus);
    if (filterGender)
      result = result.filter((item) => item.target_gender === filterGender);

    setFilteredProgja(result);
  }, [
    progjaList,
    filterPeriode,
    searchTerm,
    startDate,
    endDate,
    filterDivisi,
    filterStatus,
    filterGender,
  ]);

  // --- HANDLERS ---
  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      setFormData({ ...item });
    } else {
      setFormData({
        ...initialFormState,
        periode_id: filterPeriode || "",
      });
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = { ...formData };
      delete payload.divisi;
      delete payload.pj;
      delete payload.id;
      delete payload.created_at;

      if (!payload.tanggal) payload.tanggal = null;
      if (!payload.target_gender) payload.target_gender = "Semua";

      if (editingItem) {
        const { error } = await supabase
          .from("program_kerja")
          .update(payload)
          .eq("id", editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("program_kerja")
          .insert([payload]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchAllData();
    } catch (err) {
      alert("Gagal menyimpan: " + err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus program kerja ini?")) return;
    try {
      await supabase.from("program_kerja").delete().eq("id", id);
      fetchAllData();
    } catch (err) {
      alert("Gagal menghapus.");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Program Kerja"
        subtitle="Agenda kegiatan dan proker organisasi."
        // 1. POSISI UTAMA (HEADER) = PERIODE FILTER
        searchBar={
          <select
            value={filterPeriode}
            onChange={(e) => setFilterPeriode(e.target.value)}
            className={styles.periodeSelect}
            title="Pilih Periode Kabinet"
          >
            {periodeOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama_kabinet} {p.is_active ? "(Aktif)" : ""}
              </option>
            ))}
          </select>
        }
        // 2. POSISI FILTER MENU = PENCARIAN & LAINNYA
        filters={
          <div className={styles.filterContainer}>
            {/* Baris 1: Pencarian & Tanggal */}
            <div className={styles.filterRow}>
              {/* Search (Pindah ke sini) */}
              <div className={styles.filterGroup} style={{ flex: 1.5 }}>
                <label className={styles.filterLabel}>Pencarian</label>
                <div className={styles.searchWrapper}>
                  <FiSearch className={styles.searchIcon} size={16} />
                  <input
                    placeholder="Cari nama acara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInputWithIcon}
                  />
                </div>
              </div>

              {/* Rentang Tanggal */}
              <div className={styles.filterGroup} style={{ flex: 2 }}>
                <label className={styles.filterLabel}>Rentang Tanggal</label>
                <div className={styles.dateRangeWrapper}>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={styles.filterInput}
                  />
                  <span className={styles.dateSeparator}>-</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={styles.filterInput}
                  />
                </div>
              </div>
            </div>

            {/* Baris 2: Kategori Lainnya */}
            <div className={styles.filterRow}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Divisi</label>
                <select
                  value={filterDivisi}
                  onChange={(e) => setFilterDivisi(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="">Semua Divisi</option>
                  {divisiOptions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nama_divisi}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="">Semua Status</option>
                  <option value="Rencana">Rencana</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Target</label>
                <select
                  value={filterGender}
                  onChange={(e) => setFilterGender(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="">Semua Target</option>
                  <option value="Ikhwan">Ikhwan</option>
                  <option value="Akhwat">Akhwat</option>
                  <option value="Semua">Semua</option>
                </select>
              </div>
            </div>
          </div>
        }
        // 3. ACTION ADD
        actions={
          isAdmin && (
            <button
              className="button button-primary"
              onClick={() => handleOpenModal()}
            >
              <FiPlus /> Tambah
            </button>
          )
        }
      />

      {loading ? (
        <ProgjaSkeletonGrid />
      ) : (
        <div className={styles.masonryGrid}>
          {filteredProgja.map((progja) => (
            <div key={progja.id} className={styles.masonryItem}>
              <ProgramKerjaCard
                data={{
                  ...progja,
                  nama_divisi: progja.divisi?.nama_divisi,
                  pj: progja.pj,
                }}
                isAdmin={isAdmin}
                onEdit={() => handleOpenModal(progja)}
                onDelete={() => handleDelete(progja.id)}
              />
            </div>
          ))}
          {filteredProgja.length === 0 && (
            <div
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: "3rem",
                color: "#94a3b8",
                width: "100%",
              }}
            >
              <p>Tidak ada program kerja yang ditemukan.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Program Kerja" : "Tambah Program Kerja"}
      >
        <ProgramKerjaForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
          loading={formLoading}
          divisiOptions={divisiOptions}
          anggotaOptions={anggotaOptions}
          periodeOptions={periodeOptions}
        />
      </Modal>
    </PageContainer>
  );
}

export default ProgramKerja;
