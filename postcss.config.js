// postcss.config.js
// --- VERSI 2.0 (Menggunakan @tailwindcss/postcss) ---
export default {
  plugins: {
    '@tailwindcss/postcss': {}, // <-- Ganti 'tailwindcss' menjadi '@tailwindcss/postcss'
    autoprefixer: {},
  },
}