"use client";

import React from "react";
import tableStyles from "../admin/AdminTable.module.css";
import LoadingState from "../ui/LoadingState.jsx";
import {
  FiEdit,
  FiTrash2,
  FiUser,
  FiInstagram,
  FiChevronLeft,
  FiChevronRight,
  FiMapPin,
} from "react-icons/fi";
import { FaSearch } from "react-icons/fa";

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
  showPeriodeBadge,
  searchTerm,
  setSearchTerm,
}) => {
  const itemsPerPageVal = itemsPerPage || 10;

  if (loading) {
    return <LoadingState message="Memuat data anggota..." />;
  }

  if (!data || data.length === 0) {
    return (
      <div className={tableStyles.tableContainer}>
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th style={{ width: "40px", textAlign: "center" }}>No</th>
              <th style={{ width: "50px", textAlign: "center" }}>Foto</th>
              <th>Nama & Detail</th>
              <th>Divisi & Jabatan</th>
              <th>Periode</th>
              <th>L/P</th>
              <th style={{ textAlign: "right" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan="7"
                style={{
                  textAlign: "center",
                  padding: "4rem 2rem",
                  color: "#64748b",
                }}
              >
                <FaSearch
                  style={{
                    fontSize: "2.5rem",
                    marginBottom: "1rem",
                    opacity: 0.5,
                  }}
                />
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "1.1rem",
                    color: "#475569",
                    marginBottom: "0.5rem",
                  }}
                >
                  {searchTerm
                    ? `Tidak ada anggota yang cocok dengan "${searchTerm}"`
                    : "Tidak ada data anggota."}
                </div>
                <p style={{ margin: 0, fontSize: "0.9rem" }}>
                  {searchTerm
                    ? "Cobalah mencari dengan kata kunci lain atau bersihkan pencarian."
                    : "Coba ganti filter periode atau tambahkan anggota baru."}
                </p>
                {searchTerm && setSearchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="mt-6 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-blue-600 font-bold text-sm shadow-sm hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Reset Pencarian
                  </button>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  const startItem = (currentPage - 1) * itemsPerPageVal + 1;
  const endItem = Math.min(currentPage * itemsPerPageVal, totalItems);

  return (
    <div className={tableStyles.wrapper}>
      <div className={tableStyles.tableContainer}>
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th style={{ width: "40px", textAlign: "center" }}>No</th>
              <th style={{ width: "50px", textAlign: "center" }}>Foto</th>
              <th>Nama & Detail</th>
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
                  <td
                    style={{
                      textAlign: "center",
                      color: "#64748b",
                      fontWeight: 500,
                    }}
                  >
                    {rowNumber}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 mx-auto flex items-center justify-center border border-slate-200">
                      {item.foto_url ? (
                        <img
                          src={item.foto_url}
                          alt={item.nama}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FiUser className="text-slate-400" />
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="font-bold text-slate-800">{item.nama}</div>
                    {item.instagram_username && (
                      <div className="text-[10px] text-blue-500 flex items-center gap-1 mt-0.5 font-semibold">
                        <FiInstagram size={10} /> @
                        {item.instagram_username.replace("@", "")}
                      </div>
                    )}
                    {item.motto && (
                      <div className="text-[10px] text-slate-500 italic mt-0.5">
                        "{item.motto}"
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="text-xs font-semibold text-slate-800">
                      {item.divisi?.nama_divisi || "-"}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                      {item.master_jabatan?.nama_jabatan || "Anggota"}
                      {item.jabatan_di_divisi && ` • ${item.jabatan_di_divisi}`}
                    </div>
                  </td>
                  <td>
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                      {item.periode_jabatan?.nama_kabinet || "-"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        item.jenis_kelamin === "Ikhwan"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-fuchsia-50 text-fuchsia-600"
                      }`}
                    >
                      {item.jenis_kelamin === "Ikhwan" ? "L" : "P"}
                    </span>
                  </td>
                  <td>
                    <div className={tableStyles.actionCell}>
                      <button
                        onClick={() => onEdit(item)}
                        className={`${tableStyles.btnAction} ${tableStyles.btnEdit}`}
                        title="Edit"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className={`${tableStyles.btnAction} ${tableStyles.btnDelete}`}
                        title="Hapus"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={tableStyles.paginationContainer}>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span>Show:</span>
            <select
              value={itemsPerPageVal}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="px-1.5 py-1 rounded bg-slate-50 border border-slate-200 text-slate-700 font-bold outline-none cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <span className="text-xs text-slate-400 border-l border-slate-200 pl-6 h-4 flex items-center">
            <strong>
              {startItem}-{endItem}
            </strong>{" "}
            <span className="mx-1">of</span> <strong>{totalItems}</strong>
          </span>
        </div>

        {totalPages > 1 && (
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold transition-all ${
                currentPage === 1
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-slate-50 text-slate-700"
              }`}
            >
              <FiChevronLeft /> Prev
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold transition-all ${
                currentPage === totalPages
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-slate-50 text-slate-700"
              }`}
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
