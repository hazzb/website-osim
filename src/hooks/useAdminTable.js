// src/hooks/useAdminTable.js
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const PER_PAGE = 10;

export function useAdminTable({ tableName, select = '*', defaultOrder = { column: 'id', ascending: true }, searchColumn = 'nama' }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination & Search
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const totalPages = Math.ceil(totalCount / PER_PAGE);

  // Trigger fetch ulang
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const refreshData = () => setRefreshTrigger(prev => prev + 1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const from = (currentPage - 1) * PER_PAGE;
      const to = from + PER_PAGE - 1;

      try {
        let query = supabase
          .from(tableName)
          .select(select, { count: 'exact' })
          .order(defaultOrder.column, { ascending: defaultOrder.ascending })
          .range(from, to);

        if (searchTerm) {
          query = query.ilike(searchColumn, `%${searchTerm}%`);
        }

        const { data: result, error: err, count } = await query;
        
        if (err) throw err;
        setData(result || []);
        setTotalCount(count || 0);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tableName, currentPage, searchTerm, refreshTrigger]);

  // Fungsi Delete Generic
  const handleDelete = async (id, imagePath = null) => {
    if (!window.confirm('Yakin ingin menghapus data ini?')) return;

    try {
      setLoading(true);
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) throw error;

      if (imagePath) {
        const path = imagePath.split('gambar-osim/')[1];
        if (path) await supabase.storage.from('gambar-osim').remove([path]);
      }

      refreshData(); // Refresh tabel otomatis
      alert('Data berhasil dihapus.');
    } catch (err) {
      alert('Gagal menghapus: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    // Pagination
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount,
    // Search
    searchTerm,
    setSearchTerm,
    // Actions
    handleDelete,
    refreshData
  };
}