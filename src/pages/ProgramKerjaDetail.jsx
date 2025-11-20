// src/pages/ProgramKerjaDetail.jsx
// --- VERSI FINAL (Clean & Production Ready) ---

import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import styles from "./ProgramKerjaDetail.module.css";

import Modal from "../components/Modal.jsx";
import ProgramKerjaForm from "../components/forms/ProgramKerjaForm.jsx";

function ProgramKerjaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const isAdmin = !!session;

  const [progja, setProgja] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [formData, setFormData] = useState({});

  // Dropdown Data
  const [periodeList, setPeriodeList] = useState([]);
  const [divisiList, setDivisiList] = useState([]);
  const [anggotaList, setAnggotaList] = useState([]);

  // 1. FETCH DETAIL
  const fetchDetail = async () => {
    try {
      const { data, error } = await supabase
        .from("program_kerja")
        .select(`*, divisi ( id, nama_divisi ), anggota ( id, nama )`)
        .eq("id", id)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Data tidak ditemukan");

      setProgja(data);
    } catch (err) {
      console.error("Error:", err);
      if (loading) navigate("/program-kerja");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  // 2. FETCH DROPDOWNS
  const fetchDropdowns = async () => {
    if (periodeList.length > 0) return;

    const { data: pData } = await supabase
      .from("periode_jabatan")
      .select("id, nama_kabinet")
      .order("tahun_mulai", { ascending: false });
    setPeriodeList(pData || []);

    const { data: dData } = await supabase
      .from("divisi")
      .select("id, nama_divisi")
      .order("nama_divisi");
    setDivisiList(dData || []);

    const { data: aData } = await supabase
      .from("anggota")
      .select("id, nama")
      .order("nama");
    setAnggotaList(aData || []);
  };

  // 3. HANDLERS
  const handleOpenEdit = async () => {
    setEditLoading(true);
    await fetchDropdowns();

    setFormData({
      nama_acara: progja.nama_acara,
      tanggal: progja.tanggal,
      status: progja.status,
      deskripsi: progja.deskripsi || "",
      link_dokumentasi: progja.link_dokumentasi || "",
      divisi_id: progja.divisi_id,
      penanggung_jawab_id: progja.penanggung_jawab_id,
      periode_id: progja.periode_id,
      embed_html: progja.embed_html || "",
    });

    setEditLoading(false);
    setIsEditModalOpen(true);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    try {
      const { error } = await supabase
        .from("program_kerja")
        .update(formData)
        .eq("id", id);

      if (error) throw error;

      alert("Berhasil diperbarui!");
      setIsEditModalOpen(false);
      await fetchDetail(); // Refresh data
    } catch (err) {
      alert("Gagal update: " + err.message);
    } finally {
      setEditLoading(false);
    }
  };

  if (loading)
    return (
      <div className="main-content">
        <p style={{ textAlign: "center" }}>Memuat...</p>
      </div>
    );
  if (!progja) return null;

  const formattedDate = new Date(progja.tanggal).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="main-content">
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles["header-actions"]}>
            <Link to="/program-kerja" className={styles["back-link"]}>
              &larr; Kembali
            </Link>
            {isAdmin && (
              <button
                onClick={handleOpenEdit}
                className={styles["edit-shortcut-btn"]}
                style={{ border: "none", cursor: "pointer" }}
              >
                ✏️ Edit Program Ini
              </button>
            )}
          </div>
          <div className={styles["title-row"]}>
            <h1 className={styles.title}>{progja.nama_acara}</h1>
            <span
              className={`${styles["status-badge"]} ${
                progja.status === "Selesai"
                  ? styles["status-selesai"]
                  : progja.status === "Akan Datang"
                  ? styles["status-akan-datang"]
                  : styles["status-rencana"]
              }`}
            >
              {progja.status}
            </span>
          </div>
        </div>

        {progja.embed_html && (
          <div className={styles["media-section"]}>
            <div
              className={styles["video-container"]}
              dangerouslySetInnerHTML={{ __html: progja.embed_html }}
            />
          </div>
        )}

        <div className={styles["info-box"]}>
          <div className={styles["info-item"]}>
            <span className={styles["info-label"]}>Divisi Pelaksana</span>
            <div className={styles["info-value"]}>
              🏢 {progja.divisi?.nama_divisi || "-"}
            </div>
          </div>
          <div className={styles["info-item"]}>
            <span className={styles["info-label"]}>Penanggung Jawab</span>
            <div className={styles["info-value"]} style={{ color: "#2b6cb0" }}>
              👤 {progja.anggota?.nama || "-"}
            </div>
          </div>
          <div className={styles["info-item"]}>
            <span className={styles["info-label"]}>Tanggal</span>
            <div className={styles["info-value"]}>🗓️ {formattedDate}</div>
          </div>
        </div>

        <div className={styles["content-section"]}>
          <div className={styles["full-desc"]}>
            {progja.deskripsi || "Tidak ada deskripsi."}
          </div>
          {progja.link_dokumentasi && (
            <div className={styles["doc-link-container"]}>
              <a
                href={progja.link_dokumentasi}
                target="_blank"
                rel="noopener noreferrer"
                className={styles["doc-button"]}
              >
                📂 Buka Link Dokumentasi
              </a>
            </div>
          )}
        </div>
      </div>

      {isAdmin && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Program Kerja"
        >
          <ProgramKerjaForm
            formData={formData}
            onChange={handleFormChange}
            onSubmit={handleSave}
            onCancel={() => setIsEditModalOpen(false)}
            loading={editLoading}
            periodeList={periodeList}
            divisiList={divisiList}
            anggotaList={anggotaList}
          />
        </Modal>
      )}
    </div>
  );
}

export default ProgramKerjaDetail;
