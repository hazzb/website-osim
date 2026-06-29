"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/utils/uploadHelper";
import PageContainer from "@/components/ui/PageContainer";
import PageHeader from "@/components/ui/PageHeader";
import Modal from "@/components/Modal";
import LoadingState from "@/components/ui/LoadingState";
import AnggotaForm from "@/components/forms/AnggotaForm";
import AnggotaTable from "@/components/tables/AnggotaTable";
import {
  FiPlus,
  FiUpload,
  FiDownload,
  FiFileText,
  FiAlertCircle,
} from "react-icons/fi";
import {
  FilterSearch,
  FilterToggle,
  FilterSelect,
} from "@/components/ui/FilterBar";

export default function AnggotaManagement({
  initialPeriode,
  initialDivisi,
  initialJabatan,
}) {
  const supabase = createClient();

  // --- STATE DATA ---
  const [anggotaList, setAnggotaList] = useState([]);
  const [loadingTable, setLoadingTable] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  // --- FILTER & PAGINATION ---
  const [selectedPeriodeId, setSelectedPeriodeId] = useState("");
  const [selectedDivisiId, setSelectedDivisiId] = useState("semua");
  const [selectedGender, setSelectedGender] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // --- DROPDOWN DATA ---
  const [periodeList] = useState(initialPeriode);
  const [divisiList] = useState(initialDivisi);
  const [jabatanList] = useState(initialJabatan);

  // --- MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // --- FORM DATA & FILE ---
  const [formData, setFormData] = useState({});
  const [formFile, setFormFile] = useState(null);
  const [formPreview, setFormPreview] = useState(null);

  // --- DERIVED STATE ---
  const relevantDivisiList = useMemo(() => {
    if (!selectedPeriodeId) return divisiList;
    return divisiList.filter(
      (d) => String(d.periode_id) === String(selectedPeriodeId),
    );
  }, [divisiList, selectedPeriodeId]);

  const formDivisiOptions = useMemo(() => {
    if (!formData.periode_id) return [];
    return divisiList.filter(
      (d) => String(d.periode_id) === String(formData.periode_id),
    );
  }, [divisiList, formData.periode_id]);

  // Set default active periode if not set
  useEffect(() => {
    if (periodeList.length > 0 && !selectedPeriodeId) {
      const active = periodeList.find((item) => item.is_active);
      if (active) setSelectedPeriodeId(active.id);
      else setSelectedPeriodeId(periodeList[0].id);
    }
  }, [periodeList, selectedPeriodeId]);

  // --- FETCH TABLE DATA ---
  const fetchAnggota = async () => {
    setLoadingTable(true);
    try {
      let query = supabase
        .from("anggota")
        .select(
          `*, divisi (nama_divisi), master_jabatan (nama_jabatan), periode_jabatan (nama_kabinet)`,
          { count: "exact" },
        );

      if (selectedPeriodeId) query = query.eq("periode_id", selectedPeriodeId);
      if (selectedDivisiId !== "semua")
        query = query.eq("divisi_id", selectedDivisiId);
      if (selectedGender !== "all")
        query = query.eq(
          "jenis_kelamin",
          selectedGender === "L" ? "Ikhwan" : "Akhwat",
        );
      if (searchTerm) query = query.ilike("nama", `%${searchTerm}%`);

      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to).order("nama", { ascending: true });

      const { data, count, error } = await query;
      if (error) throw error;

      setAnggotaList(data || []);
      if (count !== null) {
        setTotalItems(count);
        setTotalPages(Math.ceil(count / itemsPerPage));
      }
    } catch (err) {
      console.error("Error fetching anggota:", err);
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    fetchAnggota();
  }, [
    selectedPeriodeId,
    selectedDivisiId,
    selectedGender,
    searchTerm,
    currentPage,
    itemsPerPage,
  ]);

  // --- HANDLERS ---
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

  const openModal = (item = null) => {
    setFormFile(null);
    if (item) {
      setEditingId(item.id);
      setFormData(item);
      setFormPreview(item.foto_url);
    } else {
      setEditingId(null);
      setFormPreview(null);
      setFormData({
        nama: "",
        jenis_kelamin: "Ikhwan",
        alamat: "",
        motto: "",
        instagram_username: "",
        periode_id: selectedPeriodeId || "",
        divisi_id: "",
        jabatan_id: "",
        jabatan_di_divisi: "",
        foto_url: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      let payload = { ...formData };
      if (!payload.divisi_id) throw new Error("Divisi wajib dipilih!");
      if (!payload.periode_id) throw new Error("Periode wajib dipilih!");

      if (formFile) {
        const url = await uploadImage(formFile, "anggota");
        payload.foto_url = url;
      }

      // Remove joined data before update/insert
      const cleanedPayload = { ...payload };
      delete cleanedPayload.divisi;
      delete cleanedPayload.master_jabatan;
      delete cleanedPayload.periode_jabatan;

      if (editingId) {
        await supabase
          .from("anggota")
          .update(cleanedPayload)
          .eq("id", editingId);
      } else {
        await supabase.from("anggota").insert(cleanedPayload);
      }
      setIsModalOpen(false);
      fetchAnggota();
      alert("Berhasil disimpan!");
    } catch (err) {
      alert("Gagal: " + err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin hapus anggota ini?")) return;
    try {
      await supabase.from("anggota").delete().eq("id", id);
      fetchAnggota();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDownloadTemplate = async () => {
    if (!selectedPeriodeId) {
      alert(
        "Mohon pilih Periode Kabinet spesifik di filter atas terlebih dahulu.",
      );
      return;
    }

    setModalLoading(true);
    try {
      const XLSX = await import("xlsx");
      const templateData = [
        {
          "Nama Lengkap": "Contoh: Budi Santoso",
          "Jenis Kelamin (L/P)": "L",
          "ID Divisi": "1",
          "ID Jabatan": "2",
          "Jabatan Spesifik": "Staff Ahli",
          Motto: "Tetap Semangat",
          Instagram: "budi_s",
          Alamat: "Jl. Mawar No 1",
        },
      ];

      const referenceData = [];
      const maxLen = Math.max(relevantDivisiList.length, jabatanList.length);
      for (let i = 0; i < maxLen; i++) {
        const div = relevantDivisiList[i];
        const jab = jabatanList[i];
        referenceData.push({
          "ID Divisi": div ? div.id : "",
          "Nama Divisi": div ? div.nama_divisi : "",
          "": "",
          "ID Jabatan": jab ? jab.id : "",
          "Nama Jabatan": jab ? jab.nama_jabatan : "",
        });
      }

      const wb = XLSX.utils.book_new();
      const ws1 = XLSX.utils.json_to_sheet(templateData);
      XLSX.utils.book_append_sheet(wb, ws1, "Form Input Anggota");
      const ws2 = XLSX.utils.json_to_sheet(referenceData);
      XLSX.utils.book_append_sheet(wb, ws2, "Referensi ID");
      XLSX.writeFile(wb, `Template_Anggota_Periode_${selectedPeriodeId}.xlsx`);
    } catch (error) {
      console.error("Failed to load xlsx library", error);
      alert("Gagal mengunduh template Excel.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!selectedPeriodeId) {
      alert("GAGAL: Mohon pilih Periode Kabinet spesifik sebelum import.");
      e.target.value = null;
      return;
    }

    setModalLoading(true);
    let XLSX;
    try {
      XLSX = await import("xlsx");
    } catch (error) {
      console.error("Failed to load xlsx library", error);
      alert("Sistem gagal memuat library Excel.");
      setModalLoading(false);
      e.target.value = null;
      return;
    }

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsName = wb.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(wb.Sheets[wsName]);

        if (data.length === 0) throw new Error("File Excel kosong!");

        const payload = data.map((row, i) => {
          const divId = row["ID Divisi"];
          if (!divId)
            throw new Error(`Baris ${i + 2}: Kolom 'ID Divisi' kosong.`);
          const validDiv = relevantDivisiList.find(
            (d) => String(d.id) === String(divId),
          );
          if (!validDiv)
            throw new Error(
              `Baris ${i + 2}: ID Divisi '${divId}' TIDAK VALID.`,
            );

          const jkRaw = row["Jenis Kelamin (L/P)"] || "L";
          return {
            nama: row["Nama Lengkap"] || "Tanpa Nama",
            jenis_kelamin: jkRaw.toString().toUpperCase().includes("P")
              ? "Akhwat"
              : "Ikhwan",
            alamat: row["Alamat"],
            motto: row["Motto"],
            instagram_username: row["Instagram"],
            jabatan_di_divisi: row["Jabatan Spesifik"],
            periode_id: parseInt(selectedPeriodeId),
            divisi_id: parseInt(divId),
            jabatan_id: row["ID Jabatan"] ? parseInt(row["ID Jabatan"]) : null,
          };
        });

        const { error } = await supabase.from("anggota").insert(payload);
        if (error) throw error;

        alert(`Berhasil mengimpor ${payload.length} anggota!`);
        setIsBulkModalOpen(false);
        fetchAnggota();
      } catch (err) {
        alert("Gagal Import: " + err.message);
      } finally {
        setModalLoading(false);
        e.target.value = null;
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <PageContainer breadcrumbText="Kelola Anggota">
      <PageHeader
        title="Kelola Anggota"
        subtitle="Database seluruh anggota OSIS."
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="px-4 py-2 bg-border-dim text-text-main rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-border-dim transition-all"
            >
              <FiUpload /> <span>Import Excel</span>
            </button>
            <button
              onClick={() => openModal()}
              className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-primary-hover transition-all shadow-md shadow-blue-100"
            >
              <FiPlus /> <span>Tambah</span>
            </button>
          </div>
        }
        searchBar={
          <FilterSearch
            placeholder="Cari anggota..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        }
        genderFilter={
          <FilterToggle
            value={selectedGender}
            onChange={setSelectedGender}
            options={[
              { value: "all", label: "All" },
              { value: "L", label: "L" },
              { value: "P", label: "P" },
            ]}
          />
        }
        filters={
          <>
            <div className="flex-1 min-w-[200px]">
              <FilterSelect
                label="Periode Jabatan"
                value={selectedPeriodeId}
                onChange={(e) => setSelectedPeriodeId(e.target.value)}
              >
                <option value="">Semua Periode</option>
                {periodeList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama_kabinet}
                  </option>
                ))}
              </FilterSelect>
            </div>
            <div className="flex-1 min-w-[200px]">
              <FilterSelect
                label="Filter Divisi"
                value={selectedDivisiId}
                onChange={(e) => setSelectedDivisiId(e.target.value)}
              >
                <option value="semua">Semua Divisi</option>
                {relevantDivisiList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nama_divisi}
                  </option>
                ))}
              </FilterSelect>
            </div>
          </>
        }
      />

      <AnggotaTable
        loading={loadingTable}
        data={anggotaList}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={(val) => {
          setItemsPerPage(val);
          setCurrentPage(1);
        }}
        onPageChange={setCurrentPage}
        onEdit={openModal}
        onDelete={handleDelete}
        showPeriodeBadge={!selectedPeriodeId}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {/* MODAL FORM */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Anggota" : "Tambah Anggota"}
        maxWidth="700px"
      >
        <AnggotaForm
          formData={formData}
          onChange={handleFormChange}
          onFileChange={handleFileChange}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          loading={modalLoading}
          preview={formPreview}
          periodeList={periodeList}
          divisiList={divisiList} // Pass all divisi, form will filter
          jabatanList={jabatanList}
        />
      </Modal>

      {/* MODAL BULK IMPORT */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Import Anggota dari Excel"
        maxWidth="700px"
      >
        <div className="text-center p-4">
          <FiFileText size={48} className="text-slate-300 mx-auto mb-4" />
          {selectedPeriodeId ? (
            <>
              <p className="text-text-body text-sm mb-6 leading-relaxed">
                Data akan dimasukkan ke Periode:{" "}
                <strong>
                  {periodeList.find((p) => p.id == selectedPeriodeId)
                    ?.nama_kabinet || "-"}
                </strong>
                .
                <br />
                Gunakan ID Divisi & ID Jabatan yang valid dari referensi di
                bawah.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
                <div className="border border-border-dim rounded-xl overflow-hidden">
                  <div className="bg-bg-page px-4 py-2 text-[10px] font-bold text-text-muted uppercase border-b border-border-dim">
                    Ref. ID Divisi
                  </div>
                  <div className="max-h-40 overflow-y-auto px-4 py-2">
                    <table className="w-full text-xs">
                      <tbody>
                        {relevantDivisiList.map((d) => (
                          <tr
                            key={d.id}
                            className="border-b border-slate-50 last:border-0"
                          >
                            <td className="py-1 font-bold text-primary w-10">
                              {d.id}
                            </td>
                            <td className="py-1 text-text-body">
                              {d.nama_divisi}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="border border-border-dim rounded-xl overflow-hidden">
                  <div className="bg-bg-page px-4 py-2 text-[10px] font-bold text-text-muted uppercase border-b border-border-dim">
                    Ref. ID Jabatan
                  </div>
                  <div className="max-h-40 overflow-y-auto px-4 py-2">
                    <table className="w-full text-xs">
                      <tbody>
                        {jabatanList.map((j) => (
                          <tr
                            key={j.id}
                            className="border-b border-slate-50 last:border-0"
                          >
                            <td className="py-1 font-bold text-primary w-10">
                              {j.id}
                            </td>
                            <td className="py-1 text-text-body">
                              {j.nama_jabatan}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleDownloadTemplate}
                  className="w-full py-3 bg-bg-card border border-border-dim rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-bg-page transition-all"
                >
                  <FiDownload /> Template
                </button>
                <label className="w-full py-3 bg-primary text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary-hover cursor-pointer shadow-lg shadow-blue-100">
                  <FiUpload /> Upload Excel
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleBulkUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </>
          ) : (
            <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl">
              <FiAlertCircle
                size={24}
                className="text-orange-500 mx-auto mb-2"
              />
              <div className="text-orange-800 font-bold mb-1">
                Pilih Periode Spesifik
              </div>
              <p className="text-orange-700 text-xs">
                Silakan pilih periode kabinet di filter atas terlebih dahulu
                untuk melakukan import.
              </p>
            </div>
          )}
          {modalLoading && (
            <p className="mt-4 text-primary text-xs font-bold animate-pulse">
              Memproses data...
            </p>
          )}
        </div>
      </Modal>
    </PageContainer>
  );
}
