import React from 'react';
import formStyles from '../admin/AdminForm.module.css';
import FormInput from '../admin/FormInput.jsx';

function DivisiForm({ formData, onChange, onFileChange, onSubmit, onCancel, loading, periodeList }) {
  return (
    <form onSubmit={onSubmit}>
      <div className={formStyles['form-grid']}>
        <FormInput label="Nama Divisi" name="nama_divisi" type="text" value={formData.nama_divisi || ''} onChange={onChange} required span="col-span-3" />
        
        <FormInput label="Periode" name="periode_id" type="select" value={formData.periode_id || ''} onChange={onChange} required span="col-span-3">
            {periodeList.map(p => <option key={p.id} value={p.id}>{p.nama_kabinet}</option>)}
        </FormInput>
        
        <FormInput label="Urutan" name="urutan" type="number" value={formData.urutan || 10} onChange={onChange} span="col-span-3" />
        
        <FormInput label="Logo" name="logo" type="file" onChange={onFileChange} span="col-span-3" />
      </div>
      <div className={formStyles['form-footer']}>
          <button type="button" className="button button-secondary" onClick={onCancel} disabled={loading}>Batal</button>
          <button type="submit" className="button button-primary" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</button>
      </div>
    </form>
  );
}

export default DivisiForm;