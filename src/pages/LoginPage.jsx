// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // 1. Impor Supabase
import { useNavigate } from 'react-router-dom'; // 2. Impor useNavigate

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // 3. Siapkan fungsi navigasi

  // 4. Ubah fungsi ini menjadi 'async'
  const handleLogin = async (e) => {
    e.preventDefault(); // Mencegah halaman refresh
    setLoading(true);

    try {
      // 5. Ini adalah fungsi inti Supabase Auth
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      // 6. Tangani jika ada error dari Supabase (misal: password salah)
      if (error) throw error;

      // 7. Jika berhasil:
      alert('Login Berhasil!');
      navigate('/'); // 8. Arahkan pengguna kembali ke halaman Beranda
      
    } catch (error) {
      // 9. Tampilkan pesan error kepada pengguna
      alert(error.error_description || error.message);
    } finally {
      // 10. Apapun yang terjadi (sukses atau gagal), hentikan loading
      setLoading(false);
    }
  };

  // --- Styling (tidak ada perubahan dari sebelumnya) ---
  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '300px',
    margin: '50px auto'
  };
  const inputStyle = {
    padding: '10px',
    margin: '5px 0 15px 0',
    fontSize: '1em'
  };
  const buttonStyle = {
    padding: '10px',
    fontSize: '1em',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    cursor: 'pointer'
  };

  return (
    <div>
      <h2>Login Admin</h2>
      <form style={formStyle} onSubmit={handleLogin}>
        <label htmlFor="email">Email:</label>
        <input 
          style={inputStyle}
          type="email" 
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <label htmlFor="password">Password:</label>
        <input 
          style={inputStyle}
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <button 
          style={buttonStyle} 
          type="submit" 
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;