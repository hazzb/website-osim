// src/pages/DaftarAnggota.jsx
// --- VERSI FINAL: Filter Gender (Ikhwan/Akhwat) + Responsive ---

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

import styles from "./DaftarAnggota.module.css";
import formStyles from "../components/admin/AdminForm.module.css";

import Modal from "../components/Modal.jsx";
import AnggotaForm from "../components/forms/AnggotaForm.jsx";
import DivisiForm from "../components/forms/DivisiForm.jsx";
import DivisiReorderModal from "../components/admin/DivisiReorderModal.jsx";
import AnggotaCard from "../components/cards/AnggotaCard.jsx";
import FormInput from "../components/admin/FormInput.jsx";

function DaftarAnggota() {
  const { session } = useAuth();
  const isAdmin = !!session;

  // --- States ---
  const [periodeList, setPeriodeList] = useState([]);
  const [divisiList, setDivisiList] = useState([]);
  const [anggotaList, setAnggotaList] = useState([]);
  const [jabatanList, setJabatanList] = useState([]);

  // Filter States
  const [activeTab, setActiveTab] = useState(""); // Periode
  const [selectedDivisi, setSelectedDivisi] = useState("semua");
  const [selectedGender, setSelectedGender] = useState("all"); // <--- STATE BARU

  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [formFile, setFormFile] = useState(null);
  const [formPreview, setFormPreview] = useState(null);
  const [existingFotoUrl, setExistingFotoUrl] = useState(null);

  // --- Data Fetching ---
  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: periodes } = await supabase
        .from("periode_jabatan")
        .select("*")
        .order("tahun_mulai", { ascending: false });
      setPeriodeList(periodes || []);

      if (periodes?.length > 0) {
        const active = periodes.find((p) => p.is_active);
        setActiveTab(active ? active.id : periodes[0].id);
      }

      const { data: divisis } = await supabase
        .from("divisi")
        .select("*")
        .order("urutan", { ascending: true });
      setDivisiList(divisis || []);

      const { data: jabatans } = await supabase
        .from("master_jabatan")
        .select("*");
      setJabatanList(jabatans || []);
    } catch (err) {
      console.error("Error fetching initial data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const fetchAnggota = useCallback(async (periodeId) => {
    if (!periodeId) return;
    try {
      const { data, error } = await supabase
        .from("anggota")
        .select("*, divisi(nama_divisi, urutan)")
        .eq("periode_id", periodeId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setAnggotaList(data || []);
    } catch (err) {
      console.error("Error fetching anggota:", err);
    }
  }, []);

  useEffect(() => {
    fetchAnggota(activeTab);
  }, [activeTab, fetchAnggota]);

  // --- Event Handlers ---
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500000) {
        alert("Maksimal ukuran file 500KB");
        return;
      }
      setFormFile(file);
      setFormPreview(URL.createObjectURL(file));
    }
  };

  const handleFormChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openModal = (type, item = null) => {
    setActiveModal(type);
    setFormFile(null);
    setFormPreview(null);
    setExistingFotoUrl(null);

    if (type === "reorder_divisi") {
      setIsModalOpen(true);
      return;
    }

    if (item) {
      setEditingId(item.id);
      setFormData(item);
      if (type === "anggota") {
        setExistingFotoUrl(item.foto_url);
        setFormPreview(item.foto_url);
      } else if (type === "divisi") {
        setExistingFotoUrl(item.logo_url);
        setFormPreview(item.logo_url);
      }
    } else {
      setEditingId(null);
      const defaults = {
        periode: {
          tahun_mulai: "",
          tahun_selesai: "",
          nama_kabinet: "",
          motto_kabinet: "",
        },
        divisi: {
          nama_divisi: "",
          deskripsi: "",
          urutan: 10,
          periode_id: activeTab,
        },
        anggota: {
          nama: "",
          motto: "",
          instagram_username: "",
          jenis_kelamin: "Ikhwan",
          divisi_id:
            selectedDivisi !== "semua"
              ? selectedDivisi
              : divisiList[0]?.id || "",
          periode_id: activeTab,
          jabatan_di_divisi: "",
        },
      };
      setFormData(defaults[type] || {});
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveModal(null);
    setFormData({});
  };

  const uploadFile = async (file, folder) => {
    const ext = file.name.split(".").pop();
    const fileName = `${folder}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(`${folder}/${fileName}`, file, { upsert: true });

    if (error) throw new Error(`Gagal upload ${folder}: ${error.message}`);

    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(`${folder}/${fileName}`);
    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      let payload = { ...formData };

      if (activeModal === "periode") {
        if (editingId)
          await supabase
            .from("periode_jabatan")
            .update(payload)
            .eq("id", editingId);
        else await supabase.from("periode_jabatan").insert(payload);
        fetchInitialData();
      } else if (activeModal === "divisi") {
        if (formFile) {
          payload.logo_url = await uploadFile(formFile, "divisi");
        } else {
          payload.logo_url = existingFotoUrl;
        }

        if (editingId)
          await supabase.from("divisi").update(payload).eq("id", editingId);
        else await supabase.from("divisi").insert(payload);
        fetchInitialData();
      } else if (activeModal === "anggota") {
        if (formFile) {
          payload.foto_url = await uploadFile(formFile, "anggota");
        } else {
          payload.foto_url = existingFotoUrl;
        }

        // Clean up empty fields
        if (!payload.motto) delete payload.motto;
        if (!payload.instagram_username) delete payload.instagram_username;

        if (editingId)
          await supabase.from("anggota").update(payload).eq("id", editingId);
        else await supabase.from("anggota").insert(payload);

        alert(
          editingId ? "Berhasil update anggota!" : "Berhasil tambah anggota!"
        );
        fetchAnggota(activeTab);
      }
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Gagal: " + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm("Yakin hapus data ini?")) return;
    try {
      const tableMap = {
        anggota: "anggota",
        divisi: "divisi",
        periode: "periode_jabatan",
      };

      await supabase.from(tableMap[type]).delete().eq("id", id);

      if (type === "anggota") fetchAnggota(activeTab);
      else fetchInitialData();
    } catch (err) {
      alert("Gagal hapus: " + err.message);
    }
  };

  const getModalTitle = () => {
    const titles = {
      periode: editingId ? "Edit Periode" : "Tambah Periode",
      divisi: editingId ? "Edit Divisi" : "Tambah Divisi",
      anggota: editingId ? "Edit Anggota" : "Tambah Anggota",
      reorder_divisi: "Atur Urutan Divisi",
    };
    return titles[activeModal] || "";
  };

  // --- FILTERING & GROUPING LOGIC (UPDATED) ---
  const filteredAnggota = anggotaList.filter((anggota) => {
    // 1. Filter Divisi
    const matchDivisi =
      selectedDivisi === "semua" ||
      anggota.divisi_id === parseInt(selectedDivisi);

    // 2. Filter Gender
    const matchGender =
      selectedGender === "all" || anggota.jenis_kelamin === selectedGender;

    return matchDivisi && matchGender;
  });

  const sortedDivisiList = [...divisiList].sort(
    (a, b) => (a.urutan || 99) - (b.urutan || 99)
  );

  const memberMap = {};
  filteredAnggota.forEach((member) => {
    const divId = member.divisi_id || "others";
    if (!memberMap[divId]) memberMap[divId] = [];
    memberMap[divId].push(member);
  });

  // --- JSX Render ---
  return (
    <div className="main-content">
      <div className={styles["header-section"]}>
        <h1 className="page-title">Daftar Anggota</h1>
      </div>

      {isAdmin && (
        <div className={styles["action-buttons"]}>
          <button
            onClick={() => openModal("anggota")}
            className={`${styles["modern-button"]} ${styles["btn-blue"]}`}
          >
            + Tambah Anggota
          </button>
          <button
            onClick={() => openModal("divisi")}
            className={`${styles["modern-button"]} ${styles["btn-orange"]}`}
          >
            + Tambah Divisi
          </button>
          <button
            onClick={() => openModal("periode")}
            className={`${styles["modern-button"]} ${styles["btn-purple"]}`}
          >
            + Tambah Periode
          </button>
          <button
            onClick={() => openModal("reorder_divisi")}
            className={`${styles["modern-button"]}`}
            style={{ backgroundColor: "#319795" }}
          >
            Atur Urutan Divisi
          </button>
        </div>
      )}

      {/* --- FILTER BAR (STICKY) --- */}
      <div className={styles["filter-bar"]}>
        {/* 1. PERIODE */}
        <div className={styles["filter-group"]}>
          <label className={styles["filter-label"]}>Periode:</label>
          <select
            className={styles["filter-select"]}
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            {periodeList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama_kabinet} {p.is_active ? "(Aktif)" : ""}
              </option>
            ))}
          </select>
          {isAdmin && activeTab && (
            <button
              onClick={() =>
                openModal(
                  "periode",
                  periodeList.find((p) => p.id == activeTab)
                )
              }
              className={styles["icon-btn"]}
            >
              ✏️
            </button>
          )}
        </div>

        {/* 2. DIVISI */}
        <div className={styles["filter-group"]}>
          <label className={styles["filter-label"]}>Divisi:</label>
          <select
            className={styles["filter-select"]}
            value={selectedDivisi}
            onChange={(e) => setSelectedDivisi(e.target.value)}
          >
            <option value="semua">Semua Divisi</option>
            {divisiList.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nama_divisi}
              </option>
            ))}
          </select>
        </div>

        {/* 3. GENDER (FILTER BARU) */}
        <div className={styles["filter-group"]}>
          <label className={styles["filter-label"]}>Gender:</label>
          <select
            className={styles["filter-select"]}
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
          >
            <option value="all">Semua</option>
            <option value="Ikhwan">Ikhwan (Putra)</option>
            <option value="Akhwat">Akhwat (Putri)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="loading-text">Memuat data...</p>
      ) : (
        <>
          {sortedDivisiList.map((divisi) => {
            const members = memberMap[divisi.id];
            if (!members || members.length === 0) return null;

            return (
              <section key={divisi.id} className={styles["divisi-section"]}>
                <div className={styles["divisi-header"]}>
                  {divisi.logo_url && (
                    <img
                      src={divisi.logo_url}
                      alt="logo"
                      className={styles["divisi-logo"]}
                    />
                  )}
                  <h2 className={styles["divisi-title"]}>
                    {divisi.nama_divisi}
                  </h2>

                  <Link
                    to={`/divisi/${divisi.id}`}
                    className={styles["btn-detail-divisi"]}
                  >
                    Lihat Detail &rarr;
                  </Link>

                  {isAdmin && (
                    <div className={styles["divisi-controls"]}>
                      <button
                        onClick={() => openModal("divisi", divisi)}
                        className={styles["icon-btn"]}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete("divisi", divisi.id)}
                        className={`${styles["icon-btn"]} ${styles["danger"]}`}
                      >
                        🗑️
                      </button>
                      <button
                        className={styles["btn-add-circle"]}
                        onClick={() => {
                          openModal("anggota");
                          setFormData((prev) => ({
                            ...prev,
                            divisi_id: divisi.id,
                          }));
                        }}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>

                <div className={styles["card-grid"]}>
                  {members.map((anggota) => (
                    <AnggotaCard
                      key={anggota.id}
                      data={anggota}
                      isAdmin={isAdmin}
                      onEdit={(item) => openModal("anggota", item)}
                      onDelete={(id) => handleDelete("anggota", id)}
                    />
                  ))}
                </div>
              </section>
            );
          })}

          {memberMap["others"]?.length > 0 && (
            <section className={styles["divisi-section"]}>
              <div className={styles["divisi-header"]}>
                <h2 className={styles["divisi-title"]}>
                  Lainnya / Tanpa Divisi
                </h2>
              </div>
              <div className={styles["card-grid"]}>
                {memberMap["others"].map((anggota) => (
                  <AnggotaCard
                    key={anggota.id}
                    data={anggota}
                    isAdmin={isAdmin}
                    onEdit={(item) => openModal("anggota", item)}
                    onDelete={(id) => handleDelete("anggota", id)}
                  />
                ))}
              </div>
            </section>
          )}

          {Object.keys(memberMap).length === 0 && (
            <p
              style={{
                textAlign: "center",
                padding: "3rem",
                color: "#718096",
                background: "#f9fafb",
                borderRadius: "0.5rem",
                border: "1px dashed #e2e8f0",
              }}
            >
              Tidak ditemukan data anggota dengan filter ini.
            </p>
          )}
        </>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={getModalTitle()}>
        {activeModal === "periode" && (
          <form onSubmit={handleSubmit}>
            <div className={formStyles["form-grid"]}>
              <FormInput
                label="Nama Kabinet"
                name="nama_kabinet"
                type="text"
                value={formData.nama_kabinet || ""}
                onChange={handleFormChange}
                required
                span="col-span-3"
              />
              <FormInput
                label="Mulai"
                name="tahun_mulai"
                type="number"
                value={formData.tahun_mulai || ""}
                onChange={handleFormChange}
                required
                span="col-span-1"
              />
              <FormInput
                label="Selesai"
                name="tahun_selesai"
                type="number"
                value={formData.tahun_selesai || ""}
                onChange={handleFormChange}
                required
                span="col-span-1"
              />
              <FormInput
                label="Aktif?"
                name="is_active"
                type="select"
                value={formData.is_active}
                onChange={handleFormChange}
                span="col-span-1"
              >
                <option value={false}>Tidak</option>
                <option value={true}>Ya</option>
              </FormInput>
            </div>
            <div className={formStyles["form-footer"]}>
              <button
                type="button"
                onClick={closeModal}
                className="button button-secondary"
              >
                Batal
              </button>
              <button
                type="submit"
                className="button button-primary"
                disabled={modalLoading}
              >
                {modalLoading ? "Simpan..." : "Simpan"}
              </button>
            </div>
          </form>
        )}

        {activeModal === "divisi" && (
          <DivisiForm
            formData={formData}
            onChange={handleFormChange}
            onFileChange={handleFileChange}
            onSubmit={handleSubmit}
            onCancel={closeModal}
            loading={modalLoading}
            periodeList={periodeList}
          />
        )}

        {activeModal === "anggota" && (
          <AnggotaForm
            formData={formData}
            onChange={handleFormChange}
            onFileChange={handleFileChange}
            onSubmit={handleSubmit}
            onCancel={closeModal}
            loading={modalLoading}
            periodeList={periodeList}
            divisiList={divisiList}
            jabatanList={jabatanList}
            preview={formPreview}
          />
        )}

        {activeModal === "reorder_divisi" && (
          <DivisiReorderModal
            isOpen={true}
            onClose={closeModal}
            divisiList={divisiList}
            activePeriodeId={activeTab}
            onSuccess={fetchInitialData}
          />
        )}
      </Modal>
    </div>
  );
}

export default DaftarAnggota;
