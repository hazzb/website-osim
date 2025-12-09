// src/hooks/useAdminTable.js
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";

const PER_PAGE = 10;

export function useAdminTable({
  tableName,
  select = "*",
  defaultOrder = { column: "id", ascending: true },
  searchColumn = "nama",
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Search
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const totalPages = Math.ceil(totalCount / PER_PAGE);

  // Trigger fetch ulang
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Gunakan useCallback agar fungsi ini stabil dan tidak bikin render ulang
  const refreshData = useCallback(() => {
    console.log(`[${tableName}] Refreshing data...`);
    setRefreshTrigger((prev) => prev + 1);
  }, [tableName]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const from = (currentPage - 1) * PER_PAGE;
      const to = from + PER_PAGE - 1;

      console.log(`[${tableName}] Fetching page ${currentPage}...`);

      try {
        let query = supabase
          .from(tableName)
          .select(select, { count: "exact" })
          .range(from, to);

        // Sorting
        // Kita gunakan optional chaining (?.) untuk keamanan
        if (defaultOrder && defaultOrder.column) {
          query = query.order(defaultOrder.column, {
            ascending: defaultOrder.ascending,
          });
        }

        // Searching
        if (searchTerm) {
          query = query.ilike(searchColumn, `%${searchTerm}%`);
        }

        const { data: result, error: err, count } = await query;

        if (err) throw err;

        setData(result || []);
        setTotalCount(count || 0);

        console.log(`[${tableName}] Data fetched:`, result?.length, "rows");
      } catch (err) {
        console.error(`[${tableName}] Error fetching:`, err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // PERBAIKAN FATAL DISINI:
    // Jangan masukkan 'defaultOrder' (object) ke dependency array.
    // Masukkan properti primitif-nya saja (string/boolean).
  }, [
    tableName,
    currentPage,
    searchTerm,
    refreshTrigger,
    select,
    searchColumn,
    defaultOrder.column, // <-- Primitif (Aman)
    defaultOrder.ascending, // <-- Primitif (Aman)
  ]);

  // Fungsi Delete Generic
  const handleDelete = async (id, imagePath = null) => {
    if (!window.confirm("Yakin ingin menghapus data ini?")) return;

    try {
      // setLoading(true); // Opsional: Matikan ini jika bikin UI kedip

      const { error } = await supabase.from(tableName).delete().eq("id", id);
      if (error) throw error;

      if (imagePath) {
        // Hapus gambar jika ada (pastikan path benar)
        // Kadang path full URL, kita perlu ambil path relatifnya
        try {
          const urlObj = new URL(imagePath);
          const path = urlObj.pathname.split(
            "/storage/v1/object/public/logos/"
          )[1];
          if (path) {
            await supabase.storage.from("logos").remove([path]);
          }
        } catch (e) {
          console.warn("Gagal parse image path untuk hapus:", e);
        }
      }

      alert("Data berhasil dihapus.");
      refreshData(); // Refresh otomatis
    } catch (err) {
      console.error("Delete error:", err);
      alert("Gagal menghapus: " + err.message);
    } finally {
      // setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount,
    searchTerm,
    setSearchTerm,
    handleDelete,
    refreshData,
  };
}
