import React from 'react';
import formStyles from '../admin/AdminForm.module.css';
import FormInput from '../admin/FormInput.jsx';

function PeriodeForm({ formData, onChange, onSubmit, onCancel, loading }) {
  return (
    <form onSubmit={onSubmit}>
      <div className={formStyles['form-grid']}>
        <FormInput 
          label="Nama Kabinet" 
          name="nama_kabinet" 
          type="text" 
          value={formData.nama_kabinet || ''} 
          onChange={onChange} 
          span="col-span-3" 
        />
        <FormInput 
          label="Tahun Mulai" 
          name="tahun_mulai" 
          type="number" 
          value={formData.tahun_mulai || ''} 
          onChange={onChange} 
          required 
          span="col-span-1" 
        />
        <FormInput 
          label="Tahun Selesai" 
          name="tahun_selesai" 
          type="number" 
          value={formData.tahun_selesai || ''} 
          onChange={onChange} 
          required 
          span="col-span-1" 
        />
      </div>
      <div className={formStyles['form-footer']}>
        <button type="button" className="button button-secondary" onClick={onCancel} disabled={loading}>Batal</button>
        <button type="submit" className="button button-primary" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</button>
      </div>
    </form>
  );
}

export default PeriodeForm;