import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import * as XLSX from "xlsx"; 

// Components
import PageContainer from "../components/ui/PageContainer.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import Modal from "../components/Modal.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import AnggotaForm from "../components/forms/AnggotaForm.jsx"; 
import AnggotaTable from "../components/tables/AnggotaTable.jsx"; 
import { FilterSelect } from "../components/ui/FilterBar.jsx";

// Utils
import { uploadImage } from "../utils/uploadHelper"; 

// Styles & Icons
import tableStyles from "../components/admin/AdminTable.module.css";
import { 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiSearch, 
  FiUpload, 
  FiDownload, 
  FiFileText,
  FiInfo,
  FiAlertCircle
} from "react-icons/fi";

function KelolaAnggota() {
  const { session } = useAuth();

  // --- STATE DATA ---
  const [anggotaList, setAnggotaList] = useState([]);
  const [loadingTable, setLoadingTable] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  // --- FILTER & PAGINATION ---
  const [selectedPeriodeId, setSelectedPeriodeId] = useState(""); 
  const [selectedDivisiId, setSelectedDivisiId] = useState("semua");
  const [searchTerm, setSearchTerm] = useState("");
  
  // PAGINATION STATE (Dinamis)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default 10
  const [totalPages, setTotalPages] = useState(1);

  // --- DROPDOWN DATA ---
  const [periodeList, setPeriodeList] = useState([]);
  const [divisiList, setDivisiList] = useState([]); 
  const [jabatanList, setJabatanList] = useState([]);

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
    return divisiList.filter(d => String(d.periode_id) === String(selectedPeriodeId));
  }, [divisiList, selectedPeriodeId]);

  const formDivisiOptions = useMemo(() => {
    if (!formData.periode_id) return [];
    return divisiList.filter(d => String(d.periode_id) === String(formData.periode_id));
  }, [divisiList, formData.periode_id]);

  // --- FETCH INITIAL DATA ---
  useEffect(() => {
    const fetchDropdowns = async () => {
      const { data: p } = await supabase.from("periode_jabatan").select("*").order("tahun_mulai", { ascending: false });
      setPeriodeList(p || []);
      
      if (p && p.length > 0 && !selectedPeriodeId) {
        const active = p.find(item => item.is_active);
        if (active) setSelectedPeriodeId(active.id);
        else setSelectedPeriodeId(p[0].id);
      }

      const { data: d } = await supabase.from("divisi").select("*").order("nama_divisi");
      setDivisiList(d || []);

      const { data: j } = await supabase.from("master_jabatan").select("*").order("nama_jabatan");
      setJabatanList(j || []);
    };
    fetchDropdowns();
  }, []);

  // --- FETCH TABLE DATA ---
  const fetchAnggota = async () => {
    setLoadingTable(true);
    try {
      let query = supabase
        .from("anggota")
        .select(`
          *,
          divisi (nama_divisi),
          master_jabatan (nama_jabatan),
          periode_jabatan (nama_kabinet)
        `, { count: "exact" });

      if (selectedPeriodeId) query = query.eq("periode_id", selectedPeriodeId);
      if (selectedDivisiId !== "semua") query = query.eq("divisi_id", selectedDivisiId);
      if (searchTerm) query = query.ilike("nama", `%${searchTerm}%`);

      // Pagination Dinamis menggunakan state itemsPerPage
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

  // Re-fetch saat filter / pagination berubah
  useEffect(() => {
    fetchAnggota();
  }, [selectedPeriodeId, selectedDivisiId, searchTerm, currentPage, itemsPerPage]);


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
        foto_url: ""
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
      if (!payload.jabatan_id) payload.jabatan_id = null;

      if (editingId) {
        await supabase.from("anggota").update(payload).eq("id", editingId);
      } else {
        await supabase.from("anggota").insert(payload);
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
    if(!confirm("Yakin hapus anggota ini?")) return;
    try {
      await supabase.from("anggota").delete().eq("id", id);
      fetchAnggota();
    } catch(err) {
      alert(err.message);
    }
  };

  // --- HANDLERS BULK IMPORT ---
  const handleDownloadTemplate = () => {
    if (!selectedPeriodeId) {
      alert("Mohon pilih Periode Kabinet spesifik di filter atas terlebih dahulu.");
      return;
    }

    const templateData = [
      {
        "Nama Lengkap": "Contoh: Budi Santoso",
        "Jenis Kelamin (L/P)": "L",
        "ID Divisi": "1", 
        "ID Jabatan": "2", 
        "Jabatan Spesifik": "Staff Ahli",
        "Motto": "Tetap Semangat",
        "Instagram": "budi_s",
        "Alamat": "Jl. Mawar No 1"
      }
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
            "Nama Jabatan": jab ? jab.nama_jabatan : ""
        });
    }

    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(templateData);
    XLSX.utils.book_append_sheet(wb, ws1, "Form Input Anggota");
    const ws2 = XLSX.utils.json_to_sheet(referenceData);
    ws2['!cols'] = [{ wch: 10 }, { wch: 25 }, { wch: 5 }, { wch: 10 }, { wch: 25 }]; 
    XLSX.utils.book_append_sheet(wb, ws2, "Referensi ID");

    XLSX.writeFile(wb, `Template_Anggota_Periode_${selectedPeriodeId}.xlsx`);
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
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsName = wb.SheetNames[0]; 
        const ws = wb.Sheets[wsName];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) throw new Error("File Excel kosong!");

        const payload = [];
        const periodeName = periodeList.find(p => String(p.id) === String(selectedPeriodeId))?.nama_kabinet;
        
        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          const rowNum = i + 2;

          const divId = row["ID Divisi"];
          const validDiv = relevantDivisiList.find(d => String(d.id) === String(divId));
          
          if (!divId) throw new Error(`Baris ${rowNum}: Kolom 'ID Divisi' kosong.`);
          if (!validDiv) throw new Error(`Baris ${rowNum}: ID Divisi '${divId}' TIDAK VALID untuk Periode '${periodeName}'.`);

          const jabId = row["ID Jabatan"];
          const validJab = jabatanList.find(j => String(j.id) === String(jabId));
          
          if (jabId && !validJab) {
             throw new Error(`Baris ${rowNum}: ID Jabatan '${jabId}' tidak ditemukan.`);
          }

          const jkRaw = row["Jenis Kelamin (L/P)"] || "L";
          const jk = jkRaw.toString().toUpperCase().includes("P") ? "Akhwat" : "Ikhwan";

          payload.push({
            nama: row["Nama Lengkap"] || "Tanpa Nama",
            jenis_kelamin: jk,
            alamat: row["Alamat"],
            motto: row["Motto"],
            instagram_username: row["Instagram"],
            jabatan_di_divisi: row["Jabatan Spesifik"],
            periode_id: parseInt(selectedPeriodeId),
            divisi_id: parseInt(divId),
            jabatan_id: validJab ? parseInt(jabId) : null,
          });
        }

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
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="button button-secondary"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", fontSize:"0.9rem" }}
            >
              <FiUpload /> Import Excel
            </button>
            <button
              onClick={() => openModal()}
              className="button button-primary"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", fontSize:"0.9rem" }}
            >
              <FiPlus /> Tambah
            </button>
          </div>
        }

        searchBar={
          <div style={{ display: 'flex', width: '100%', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ flexShrink: 0, minWidth: '160px' }}>
                <div style={{ position: 'relative' }}>
                    <select
                        value={selectedPeriodeId}
                        onChange={(e) => setSelectedPeriodeId(e.target.value)}
                        style={{ width: '100%', height: '34px', padding: '0 2rem 0 0.8rem', border: '1px solid #cbd5e0', borderRadius: '6px', fontSize: '0.85rem', appearance: 'none', backgroundColor: 'white', cursor: 'pointer', color: '#1e293b', fontWeight: 500 }}
                    >
                        <option value="">Semua Periode</option>
                        {periodeList.map((p) => (
                            <option key={p.id} value={p.id}>{p.nama_kabinet}</option>
                        ))}
                    </select>
                    <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color:'#64748b' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                </div>
            </div>

            <div style={{ position: "relative", flex: 1 }}>
                <FiSearch style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input
                type="text"
                placeholder="Cari nama anggota..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: "100%", padding: "0 0.8rem 0 2rem", height: "34px", border: "1px solid #cbd5e0", borderRadius: "6px", fontSize: "0.85rem", outline: "none" }}
                />
            </div>
          </div>
        }

        filters={
          <div style={{ minWidth: '180px' }}>
            <FilterSelect label="Filter Divisi" value={selectedDivisiId} onChange={(e) => setSelectedDivisiId(e.target.value)}>
                <option value="semua">Semua Divisi</option>
                {relevantDivisiList.map(d => <option key={d.id} value={d.id}>{d.nama_divisi}</option>)}
            </FilterSelect>
          </div>
        }
      />

      {/* COMPONENT TABLE */}
      <AnggotaTable 
        loading={loadingTable}
        data={anggotaList}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems} 
        itemsPerPage={itemsPerPage} // PROP BARU
        onItemsPerPageChange={(val) => { // HANDLER BARU
            setItemsPerPage(val);
            setCurrentPage(1); // Reset ke halaman 1 jika jumlah data per halaman berubah
        }}
        onPageChange={setCurrentPage}
        onEdit={openModal}
        onDelete={handleDelete}
        showPeriodeBadge={!selectedPeriodeId} 
      />

      {/* MODAL FORM & IMPORT TETAP SAMA */}
      {isModalOpen && (
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
            divisiList={formDivisiOptions} 
            jabatanList={jabatanList}
          />
        </Modal>
      )}

      {isBulkModalOpen && (
        <Modal
            isOpen={isBulkModalOpen}
            onClose={() => setIsBulkModalOpen(false)}
            title="Import Anggota dari Excel"
            maxWidth="700px"
        >
            <div style={{ textAlign: 'center', padding: '1rem' }}>
                <FiFileText size={48} color="#64748b" style={{marginBottom: '1rem'}} />
                
                {selectedPeriodeId ? (
                    <>
                        <p style={{ color: '#475569', marginBottom: '1.5rem', lineHeight: '1.6', fontSize: '0.9rem' }}>
                            Data akan dimasukkan ke Periode: <strong>{periodeList.find(p => p.id == selectedPeriodeId)?.nama_kabinet || "-"}</strong>.
                            <br/>
                            Gunakan <strong>ID Divisi</strong> & <strong>ID Jabatan</strong> yang valid (Lihat tabel di bawah).
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                <div style={{ padding: '0.6rem', borderBottom: '1px solid #e2e8f0', background: '#f1f5f9', fontWeight: 600, fontSize:'0.8rem', color:'#475569' }}>
                                    Ref. ID Divisi (Periode Ini)
                                </div>
                                <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                    <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                                        <tbody>
                                            {relevantDivisiList.length > 0 ? relevantDivisiList.map(d => (
                                                <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '6px', fontWeight: 'bold', color:'#3b82f6', width:'40px' }}>{d.id}</td>
                                                    <td style={{ padding: '6px', color:'#334155', textAlign:'left' }}>{d.nama_divisi}</td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan="2" style={{padding:'1rem', color:'#94a3b8', fontSize:'0.8rem'}}>Kosong</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                <div style={{ padding: '0.6rem', borderBottom: '1px solid #e2e8f0', background: '#f1f5f9', fontWeight: 600, fontSize:'0.8rem', color:'#475569' }}>
                                    Ref. ID Jabatan (Master)
                                </div>
                                <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                    <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                                        <tbody>
                                            {jabatanList.length > 0 ? jabatanList.map(j => (
                                                <tr key={j.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '6px', fontWeight: 'bold', color:'#3b82f6', width:'40px' }}>{j.id}</td>
                                                    <td style={{ padding: '6px', color:'#334155', textAlign:'left' }}>{j.nama_jabatan}</td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan="2" style={{padding:'1rem', color:'#94a3b8', fontSize:'0.8rem'}}>Kosong</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <button 
                                onClick={handleDownloadTemplate} 
                                className="button button-secondary"
                                style={{ width: '100%', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}
                            >
                                <FiDownload /> Download Template
                            </button>

                            <label 
                                className="button button-primary" 
                                style={{ width: '100%', justifyContent: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                                <FiUpload /> Upload Excel
                                <input 
                                    type="file" 
                                    accept=".xlsx, .xls"
                                    onChange={handleBulkUpload}
                                    disabled={modalLoading}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>
                    </>
                ) : (
                    <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', padding: '1.5rem', marginTop: '1rem' }}>
                        <div style={{color:'#c2410c', fontWeight:700, fontSize:'1.1rem', marginBottom:'0.5rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}>
                            <FiAlertCircle /> Pilih Periode Spesifik
                        </div>
                        <p style={{ color: '#9a3412', fontSize: '0.9rem', marginBottom:0 }}>
                            Anda sedang melihat <strong>Semua Periode</strong>.<br/>
                            Untuk melakukan Import Excel, Anda harus memilih salah satu <strong>Periode Kabinet</strong> di filter atas agar data masuk ke tempat yang benar.
                        </p>
                    </div>
                )}
                
                {modalLoading && (
                    <p style={{ marginTop: '1rem', color: '#2563eb', fontWeight: 600, fontSize:'0.9rem' }}>
                        Sedang memproses data... Mohon tunggu.
                    </p>
                )}
            </div>
        </Modal>
      )}

    </PageContainer>
  );
}

export default KelolaAnggota;