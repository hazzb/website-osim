import React from "react";
import tableStyles from "../admin/AdminTable.module.css";
import LoadingState from "../ui/LoadingState.jsx";
import { FiEdit, FiTrash2, FiUser, FiInstagram, FiChevronLeft, FiChevronRight, FiMapPin } from "react-icons/fi";

const AnggotaTable = ({ 
  loading, 
  data, 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onItemsPerPageChange, 
  onPageChange, 
  onEdit, 
  onDelete,
  showPeriodeBadge 
}) => {

  const itemsPerPageVal = itemsPerPage || 10;

  // 1. Loading State
  if (loading) {
    return <LoadingState message="Memuat data anggota..." />;
  }

  // 2. Empty State
  if (!data || data.length === 0) {
    return (
      <div className={tableStyles.tableContainer}>
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th style={{width:'40px', textAlign:'center'}}>No</th>
              <th style={{width:'50px', textAlign:'center'}}>Foto</th>
              <th>Nama & Detail</th>
              <th>Divisi & Jabatan</th>
              <th>Periode</th>
              <th>L/P</th>
              <th style={{ textAlign: "right" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="7" style={{textAlign:'center', padding:'3rem', color:'#64748b'}}>
                <div style={{fontSize:'2rem', marginBottom:'0.5rem'}}>🕵️</div>
                Tidak ada data anggota.<br/>
                <small>Coba ganti filter periode atau kata kunci pencarian.</small>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  const startItem = (currentPage - 1) * itemsPerPageVal + 1;
  const endItem = Math.min(currentPage * itemsPerPageVal, totalItems);

  // 3. Render Table
  return (
    <div className={tableStyles.wrapper}>
      
      <div className={tableStyles.tableContainer}>
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th style={{width:'40px', textAlign:'center'}}>No</th>
              <th style={{width:'50px', textAlign:'center'}}>Foto</th>
              <th>Nama & Detail</th> {/* Judul Kolom Diubah */}
              <th>Divisi & Jabatan</th>
              <th>Periode</th>
              <th>L/P</th>
              <th style={{ textAlign: "right" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              const rowNumber = (currentPage - 1) * itemsPerPageVal + index + 1;

              return (
                <tr key={item.id}>
                  <td style={{textAlign:'center', color:'#64748b', fontWeight:500}}>
                    {rowNumber}
                  </td>
                  <td style={{textAlign:'center'}}>
                      <div style={{width:'36px', height:'36px', borderRadius:'50%', overflow:'hidden', backgroundColor:'#e2e8f0', margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'center'}}>
                         {item.foto_url ? (
                           <img src={item.foto_url} alt="foto" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                         ) : (
                           <FiUser color="#94a3b8" />
                         )}
                      </div>
                  </td>
                  
                  {/* KOLOM NAMA, MOTTO & ALAMAT (DIGABUNG) */}
                  <td>
                      {/* Nama */}
                      <div style={{fontWeight:600, color:'#1e293b'}}>{item.nama}</div>
                      
                      {/* Instagram */}
                      {item.instagram_username && (
                         <div style={{fontSize:'0.75rem', color:'#3b82f6', display:'flex', alignItems:'center', gap:'4px', marginTop:'2px'}}>
                            <FiInstagram size={10} /> @{item.instagram_username.replace('@','')}
                         </div>
                      )}

                      {/* Motto (Dikembalikan) */}
                      {item.motto && (
                        <div style={{fontSize:'0.75rem', color:'#64748b', fontStyle:'italic', marginTop:'2px'}}>
                           "{item.motto}"
                        </div>
                      )}

                      {/* Alamat (Dikembalikan) */}
                      {item.alamat && (
                        <div style={{fontSize:'0.75rem', color:'#475569', display:'flex', alignItems:'center', gap:'4px', marginTop:'2px'}}>
                           <FiMapPin size={10} /> {item.alamat}
                        </div>
                      )}
                  </td>

                  <td>
                      <div style={{fontSize:'0.85rem', color:'#1e293b', fontWeight:500}}>{item.divisi?.nama_divisi || "-"}</div>
                      <div style={{fontSize:'0.75rem', color:'#64748b'}}>
                          {item.master_jabatan?.nama_jabatan || "Anggota"}
                          {item.jabatan_di_divisi && ` • ${item.jabatan_di_divisi}`}
                      </div>
                  </td>
                  <td>
                      <span style={{fontSize:'0.75rem', backgroundColor:'#eff6ff', color:'#2563eb', padding:'2px 8px', borderRadius:'99px', fontWeight:500, whiteSpace:'nowrap'}}>
                          {item.periode_jabatan?.nama_kabinet || "-"}
                      </span>
                  </td>
                  <td>
                      <span style={{
                          fontSize:'0.75rem', 
                          fontWeight:600, 
                          color: item.jenis_kelamin === 'Ikhwan' ? '#059669' : '#d946ef',
                          backgroundColor: item.jenis_kelamin === 'Ikhwan' ? '#ecfdf5' : '#fdf4ff',
                          padding: '2px 6px',
                          borderRadius: '4px'
                      }}>
                          {item.jenis_kelamin === 'Ikhwan' ? 'L' : 'P'}
                      </span>
                  </td>
                  <td>
                    <div className={tableStyles.actionCell}>
                      <button onClick={() => onEdit(item)} className={`${tableStyles.btnAction} ${tableStyles.btnEdit}`} title="Edit"><FiEdit /></button>
                      <button onClick={() => onDelete(item.id)} className={`${tableStyles.btnAction} ${tableStyles.btnDelete}`} title="Hapus"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PAGINATION (LOGIKA DIPERBAIKI) */}
      <div className={tableStyles.paginationContainer} style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'1rem', padding:'0 0.5rem', flexWrap:'wrap', gap:'1rem'}}>
        
        <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
            <div style={{display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.85rem', color:'#64748b'}}>
              <span>Tampilkan:</span>
              <select 
                  value={itemsPerPageVal} 
                  onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                  style={{
                      padding:'0.3rem', borderRadius:'4px', border:'1px solid #cbd5e0', 
                      fontSize:'0.85rem', color:'#1e293b', cursor:'pointer'
                  }}
              >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
              </select>
            </div>

            <span style={{fontSize:'0.85rem', color:'#64748b', borderLeft:'1px solid #e2e8f0', paddingLeft:'1rem'}}>
              <strong>{startItem}-{endItem}</strong> dari <strong>{totalItems}</strong> data
            </span>
        </div>
        
        {totalPages > 1 && (
          <div className={tableStyles.paginationButtons} style={{display:'flex', gap:'0.5rem'}}>
            <button 
                className={tableStyles.paginationButton} 
                onClick={() => onPageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                style={{
                    display:'flex', alignItems:'center', gap:'4px', padding:'0.4rem 0.8rem', 
                    borderRadius:'6px', border:'1px solid #e2e8f0', background:'white', 
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === 1 ? 0.5 : 1
                }}
            >
                <FiChevronLeft /> Prev
            </button>
            
            <button 
                className={tableStyles.paginationButton} 
                onClick={() => onPageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
                style={{
                    display:'flex', alignItems:'center', gap:'4px', padding:'0.4rem 0.8rem', 
                    borderRadius:'6px', border:'1px solid #e2e8f0', background:'white',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    opacity: currentPage === totalPages ? 0.5 : 1
                }}
            >
                Next <FiChevronRight />
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default AnggotaTable;