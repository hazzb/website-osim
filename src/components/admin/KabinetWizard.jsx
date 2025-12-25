import React, { useState } from "react";
import { supabase } from "../../supabaseClient";
import Modal from "../Modal";
import FormInput from "./FormInput";
import { FiArrowRight, FiArrowLeft, FiCheck, FiTrash2, FiLayers, FiStar, FiGrid, FiPlus } from "react-icons/fi";

// TEMPLATE DATA
const BPH_TEMPLATE = { 
  nama_divisi: "Badan Pengurus Harian", 
  tipe: "Inti", 
  deskripsi: "Berisi Ketua, Wakil, Sekretaris, dan Bendahara." 
};

const COMMON_DIVISIONS = [
  { nama_divisi: "Divisi Keagamaan", tipe: "Umum", deskripsi: "Mengurus kegiatan rohani dan PHBI." },
  { nama_divisi: "Divisi Humas", tipe: "Umum", deskripsi: "Hubungan masyarakat dan publikasi media." },
  { nama_divisi: "Divisi IT & Multimedia", tipe: "Umum", deskripsi: "Dokumentasi, desain, dan konten kreatif." },
  { nama_divisi: "Divisi Kesenian", tipe: "Umum", deskripsi: "Mengembangkan minat bakat seni." },
  { nama_divisi: "Divisi Olahraga", tipe: "Umum", deskripsi: "Mengurus kegiatan olahraga dan classmeeting." },
  { nama_divisi: "Divisi Kebersihan", tipe: "Umum", deskripsi: "Menjaga kebersihan dan lingkungan sekolah." },
];

export default function KabinetWizard({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // --- STATE PERIODE ---
  const [periodeData, setPeriodeData] = useState({
    nama_kabinet: "",
    tahun_mulai: new Date().getFullYear(),
    tahun_selesai: new Date().getFullYear() + 1,
    motto_kabinet: "",
    is_active: true // Default langsung aktif
  });

  // --- STATE DIVISI ---
  // Default: BPH sudah terpilih
  const [selectedDivisions, setSelectedDivisions] = useState([
    { ...BPH_TEMPLATE, selected: true }
  ]);

  // --- HANDLERS ---
  const handlePeriodeChange = (e) => {
    setPeriodeData({ ...periodeData, [e.target.name]: e.target.value });
  };

  // Toggle untuk Divisi Umum
  const toggleDivision = (template) => {
    const exists = selectedDivisions.find(d => d.nama_divisi === template.nama_divisi);
    if (exists) {
      setSelectedDivisions(selectedDivisions.filter(d => d.nama_divisi !== template.nama_divisi));
    } else {
      setSelectedDivisions([...selectedDivisions, { ...template, selected: true }]);
    }
  };

  // Tambah Divisi Custom (Manual)
  const addCustomDivision = () => {
    const name = prompt("Masukkan Nama Divisi Baru:");
    if (name) {
      if (selectedDivisions.some(d => d.nama_divisi.toLowerCase() === name.toLowerCase())) {
        alert("Divisi ini sudah ada!");
        return;
      }
      setSelectedDivisions([...selectedDivisions, { 
        nama_divisi: name, 
        tipe: "Umum", 
        deskripsi: "Divisi tambahan manual", 
        selected: true 
      }]);
    }
  };

  // --- FINAL SUBMIT ---
  const handleFinish = async () => {
    if (loading) return;
    setLoading(true);
    
    try {
      // 1. Matikan periode aktif yang lama (Opsional, agar rapi)
      await supabase.from("periode_jabatan").update({ is_active: false }).neq("id", 0);

      // 2. Buat Periode Baru
      const { data: periode, error: errPeriode } = await supabase
        .from("periode_jabatan")
        .insert(periodeData)
        .select()
        .single();

      if (errPeriode) throw errPeriode;

      // 3. Buat Divisi (Batch Insert)
      // Kita map urutan: BPH selalu no 1, sisanya mengikuti
      const divisionsPayload = selectedDivisions.map((div, index) => ({
        nama_divisi: div.nama_divisi,
        deskripsi: div.deskripsi,
        tipe: div.tipe,
        urutan: index + 1,
        periode_id: periode.id
      }));

      const { error: errDivisi } = await supabase
        .from("divisi")
        .insert(divisionsPayload);

      if (errDivisi) throw errDivisi;

      alert("🎉 Kabinet berhasil dibentuk!");
      onSuccess(); 
      onClose();   
    } catch (err) {
      alert("Gagal: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER ---
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Wizard Setup Kabinet" maxWidth="700px">
      
      {/* STEPPER */}
      <div style={{ display: 'flex', marginBottom: '2rem', alignItems: 'center', justifyContent: 'center' }}>
        <StepIndicator num={1} active={step >= 1} />
        <StepLine active={step >= 2} />
        <StepIndicator num={2} active={step >= 2} />
        <StepLine active={step >= 3} />
        <StepIndicator num={3} active={step >= 3} />
      </div>

      {/* --- STEP 1: IDENTITAS --- */}
      {step === 1 && (
        <div style={{animation: 'fadeIn 0.3s'}}>
          <h3 style={styles.heading}>Langkah 1: Identitas Kabinet</h3>
          <p style={styles.subheading}>Tentukan nama dan masa bakti kabinet baru.</p>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            <FormInput label="Nama Kabinet" name="nama_kabinet" value={periodeData.nama_kabinet} onChange={handlePeriodeChange} placeholder="Contoh: Kabinet Pembaharu" required />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <FormInput label="Tahun Mulai" name="tahun_mulai" type="number" value={periodeData.tahun_mulai} onChange={handlePeriodeChange} span={6} />
              <FormInput label="Tahun Selesai" name="tahun_selesai" type="number" value={periodeData.tahun_selesai} onChange={handlePeriodeChange} span={6} />
            </div>
            <FormInput label="Motto" name="motto_kabinet" value={periodeData.motto_kabinet} onChange={handlePeriodeChange} placeholder="Slogan singkat..." />
          </div>
        </div>
      )}

      {/* --- STEP 2: SUSUNAN DIVISI --- */}
      {step === 2 && (
        <div style={{animation: 'fadeIn 0.3s'}}>
          <h3 style={styles.heading}>Langkah 2: Susunan Struktur</h3>
          <p style={styles.subheading}>Pilih divisi mana saja yang ada di periode ini.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight:'400px', overflowY:'auto', paddingRight:'5px' }}>
            
            {/* GROUP 1: INTI (BPH) */}
            <div>
              <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'0.5rem', color:'#b45309'}}>
                 <FiStar fill="#b45309" /> 
                 <span style={{fontWeight:700, fontSize:'0.9rem'}}>PENGURUS INTI (WAJIB)</span>
              </div>
              
              <div style={{
                 padding: '1rem', border: '2px solid #fcd34d', background:'#fffbeb',
                 borderRadius: '8px', display:'flex', alignItems:'center', gap:'1rem'
              }}>
                 <div style={{background:'#f59e0b', color:'white', borderRadius:'50%', padding:'4px'}}><FiCheck size={16}/></div>
                 <div>
                    <div style={{fontWeight:700, color:'#78350f'}}>Badan Pengurus Harian (BPH)</div>
                    <div style={{fontSize:'0.8rem', color:'#92400e'}}>Otomatis berisi jabatan Ketua, Wakil, Sekretaris, Bendahara.</div>
                 </div>
              </div>
            </div>

            {/* GROUP 2: DIVISI UMUM */}
            <div>
              <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'0.5rem', color:'#0f172a'}}>
                 <FiGrid /> 
                 <span style={{fontWeight:700, fontSize:'0.9rem'}}>DIVISI / SEKBID (PILIH)</span>
              </div>

              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.8rem'}}>
                {COMMON_DIVISIONS.map((template) => {
                  const isSelected = selectedDivisions.find(d => d.nama_divisi === template.nama_divisi);
                  return (
                    <div key={template.nama_divisi} onClick={() => toggleDivision(template)}
                      style={{
                        padding: '0.8rem', 
                        border: isSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                        borderRadius: '8px', 
                        backgroundColor: isSelected ? '#eff6ff' : 'white',
                        cursor: 'pointer', transition:'all 0.2s',
                        display: 'flex', flexDirection:'column', gap:'0.5rem'
                      }}
                    >
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
                         <span style={{fontWeight:'600', color: isSelected ? '#1e40af' : '#334155', fontSize:'0.9rem'}}>{template.nama_divisi}</span>
                         {isSelected && <FiCheck color="#3b82f6" size={16} />}
                      </div>
                      <span style={{fontSize:'0.75rem', color:'#64748b', lineHeight:'1.2'}}>{template.deskripsi}</span>
                    </div>
                  );
                })}
              </div>

              {/* LIST CUSTOM */}
              {selectedDivisions.filter(d => d.tipe === 'Umum' && !COMMON_DIVISIONS.find(c => c.nama_divisi === d.nama_divisi)).length > 0 && (
                 <div style={{marginTop:'1rem'}}>
                    <span style={{fontSize:'0.8rem', fontWeight:600, color:'#64748b'}}>Divisi Tambahan:</span>
                    <div style={{display:'flex', flexWrap:'wrap', gap:'0.5rem', marginTop:'0.5rem'}}>
                        {selectedDivisions.filter(d => d.tipe === 'Umum' && !COMMON_DIVISIONS.find(c => c.nama_divisi === d.nama_divisi)).map((custom, idx) => (
                            <div key={idx} style={{background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:'20px', padding:'4px 12px', fontSize:'0.85rem', display:'flex', alignItems:'center', gap:'6px', color:'#1e3a8a'}}>
                               {custom.nama_divisi}
                               <button onClick={() => setSelectedDivisions(selectedDivisions.filter(x => x.nama_divisi !== custom.nama_divisi))} style={{border:'none', background:'none', cursor:'pointer', display:'flex'}}><FiTrash2 size={12} color="#ef4444"/></button>
                            </div>
                        ))}
                    </div>
                 </div>
              )}

              <button onClick={addCustomDivision} style={{ width:'100%', marginTop:'1rem', padding: '0.8rem', border: '1px dashed #94a3b8', color: '#64748b', background: '#f8fafc', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                 <FiPlus /> Buat Divisi Lain Manual
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- STEP 3: KONFIRMASI --- */}
      {step === 3 && (
        <div style={{ textAlign: 'center', animation: 'fadeIn 0.3s' }}>
          <div style={{ width:'70px', height:'70px', background:'#ecfdf5', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem' }}>
            <FiLayers size={36} color="#10b981" />
          </div>
          <h3 style={styles.heading}>Konfirmasi Pembuatan</h3>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>
            Sistem akan membuat <strong>{periodeData.nama_kabinet}</strong> dan mengatur struktur organisasi secara otomatis.
          </p>
          
          <div style={{ background:'#f8fafc', padding:'1.5rem', borderRadius:'12px', textAlign:'left', border:'1px solid #e2e8f0' }}>
             <div style={{marginBottom:'1rem', display:'flex', justifyContent:'space-between', borderBottom:'1px solid #e2e8f0', paddingBottom:'0.5rem'}}>
                <span style={{color:'#64748b'}}>Total Divisi</span>
                <span style={{fontWeight:700}}>{selectedDivisions.length} Unit</span>
             </div>
             <div style={{marginBottom:'1rem', display:'flex', justifyContent:'space-between', borderBottom:'1px solid #e2e8f0', paddingBottom:'0.5rem'}}>
                <span style={{color:'#64748b'}}>Status</span>
                <span style={{fontWeight:700, color:'#10b981'}}>Langsung Aktif</span>
             </div>
             <div>
                <span style={{color:'#64748b', display:'block', marginBottom:'0.5rem'}}>Daftar Unit:</span>
                <div style={{display:'flex', flexWrap:'wrap', gap:'6px'}}>
                    {selectedDivisions.map((d, i) => (
                        <span key={i} style={{fontSize:'0.75rem', background: d.tipe==='Inti'?'#fef3c7':'#e2e8f0', color: d.tipe==='Inti'?'#92400e':'#475569', padding:'2px 8px', borderRadius:'12px', border: d.tipe==='Inti'?'1px solid #fcd34d':'1px solid #cbd5e0'}}>
                            {d.nama_divisi}
                        </span>
                    ))}
                </div>
             </div>
          </div>
        </div>
      )}

      {/* --- FOOTER --- */}
      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
        {step > 1 ? (
          <button onClick={() => setStep(step - 1)} className="button button-secondary" style={{display:'flex', alignItems:'center', gap:'6px'}}>
            <FiArrowLeft /> Kembali
          </button>
        ) : <div/>}

        {step < 3 ? (
          <button 
            onClick={() => {
                if(step === 1 && !periodeData.nama_kabinet) return alert("Nama kabinet wajib diisi!");
                setStep(step + 1);
            }} 
            className="button button-primary"
            style={{display:'flex', alignItems:'center', gap:'6px'}}
          >
            Lanjut <FiArrowRight />
          </button>
        ) : (
          <button 
            onClick={handleFinish} 
            className="button"
            disabled={loading}
            style={{ backgroundColor: '#10b981', color: 'white', border:'none', display:'flex', alignItems:'center', gap:'6px', padding:'0.6rem 1.5rem', fontSize:'1rem' }}
          >
            {loading ? "Memproses..." : <>Buat Kabinet Sekarang <FiCheck /></>}
          </button>
        )}
      </div>
    </Modal>
  );
}

// Sub-components untuk styling
const StepIndicator = ({ num, active }) => (
  <div style={{
    width: '32px', height: '32px', borderRadius: '50%',
    backgroundColor: active ? '#3b82f6' : '#f1f5f9',
    color: active ? 'white' : '#94a3b8',
    border: active ? 'none' : '1px solid #cbd5e0',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 'bold', fontSize: '0.9rem', zIndex: 2, transition: 'all 0.3s'
  }}>
    {num}
  </div>
);

const StepLine = ({ active }) => (
  <div style={{
    width: '60px', height: '4px',
    backgroundColor: active ? '#3b82f6' : '#e2e8f0',
    margin: '0 4px', borderRadius: '2px', transition: 'all 0.3s'
  }} />
);

const styles = {
  heading: { margin: '0 0 0.5rem 0', color: '#1e293b', fontSize: '1.25rem', fontWeight: 700 },
  subheading: { margin: '0 0 1.5rem 0', color: '#64748b', fontSize: '0.95rem' }
};