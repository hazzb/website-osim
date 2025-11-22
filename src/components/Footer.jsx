import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import styles from './Footer.module.css';

// IMPORT ICONS (Pastikan ini ada)
import { 
  FiSettings, FiHome, FiTarget, FiUsers, FiCalendar, 
  FiMapPin, FiMail, FiPhone, FiInstagram, FiYoutube 
} from "react-icons/fi";
import { FaTiktok } from "react-icons/fa";

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useAuth();
  const isAdmin = !!session;

  const currentYear = new Date().getFullYear();
  const [info, setInfo] = useState(null);

  useEffect(() => {
    const fetchInfo = async () => {
      const { data } = await supabase.from('pengaturan').select('*').eq('id', 1).single();
      if (data) setInfo(data);
    };
    fetchInfo();
  }, []);

  // --- LOGIKA BARU DI SINI ---
  // Daftar halaman yang TIDAK menampilkan footer
  const hideFooterPaths = ['/login', '/pengaturan', '/dashboard'];

  // Jika URL saat ini ada di daftar tersebut, jangan render footer
  if (hideFooterPaths.includes(location.pathname)) {
    return null;
  }
  // ---------------------------

  if (!info) return null;

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        
        {/* KOLOM 1: IDENTITAS & LOGO */}
        <div className={styles.infoSection}>
          
          <div className={styles.logoRow}>
            {info.logo_sekolah_url && <img src={info.logo_sekolah_url} alt="Logo Sekolah" className={styles.logoImg} />}
            {info.logo_osis_url && <img src={info.logo_osis_url} alt="Logo OSIS" className={styles.logoImg} />}
          </div>

          <div className={styles.brandRow}>
            <h3 className={styles.brandName}>{info.nama_organisasi}</h3>
            {isAdmin && (
              <button 
                onClick={() => navigate('/pengaturan')} 
                className={styles.editBtn} 
                title="Pengaturan Footer"
              >
                <FiSettings size={14} />
              </button>
            )}
          </div>

          <p className={styles.schoolName}>{info.nama_sekolah}</p>
          <p className={styles.brandDesc}>{info.deskripsi_singkat}</p>
          
          <div className={styles.socialRow}>
            {info.instagram_url && (
              <a href={info.instagram_url} target="_blank" rel="noreferrer" className={styles.socialIcon} title="Instagram"><FiInstagram size={20} /></a>
            )}
            {info.youtube_url && (
              <a href={info.youtube_url} target="_blank" rel="noreferrer" className={styles.socialIcon} title="YouTube"><FiYoutube size={20} /></a>
            )}
            {info.tiktok_url && (
              <a href={info.tiktok_url} target="_blank" rel="noreferrer" className={styles.socialIcon} title="TikTok"><FaTiktok size={18} /></a>
            )}
          </div>
        </div>

        {/* KOLOM 2: NAVIGASI */}
        <div className={styles.linksSection}>
          <h4 className={styles.columnTitle}>Jelajahi</h4>
          <div className={styles.linkGroup}>
            <Link to="/" className={styles.footerLink}><FiHome size={16} /> Beranda</Link>
            <Link to="/visi-misi" className={styles.footerLink}><FiTarget size={16} /> Visi & Misi</Link>
            <Link to="/anggota" className={styles.footerLink}><FiUsers size={16} /> Daftar Anggota</Link>
            <Link to="/program-kerja" className={styles.footerLink}><FiCalendar size={16} /> Program Kerja</Link>
          </div>
        </div>

        {/* KOLOM 3: KONTAK */}
        <div className={styles.contactSection}>
          <h4 className={styles.columnTitle}>Hubungi Kami</h4>
          <div className={styles.contactItem}><FiMapPin className={styles.contactIcon} /><span>{info.alamat}</span></div>
          <div className={styles.contactItem}><FiMail className={styles.contactIcon} /><span>{info.email}</span></div>
          <div className={styles.contactItem}><FiPhone className={styles.contactIcon} /><span>{info.no_hp}</span></div>
        </div>

      </div>
      
      <div className={styles.copyright}>
        &copy; {currentYear} {info.nama_organisasi}. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;