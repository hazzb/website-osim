import React from "react";
import { Link } from "react-router-dom";
// Gunakan inline style atau Tailwind karena ini halaman simple
// dan kita ingin meminimalisir dependensi CSS module baru

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-9xl font-extrabold text-slate-200">404</h1>
      <h2 className="text-2xl font-bold text-slate-800 mt-4">
        Halaman Tidak Ditemukan
      </h2>
      <p className="text-slate-500 max-w-md mt-2 mb-8">
        Maaf, halaman yang Anda cari mungkin telah dihapus, dipindahkan, atau
        link yang Anda tuju salah.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
};

export default NotFound;
