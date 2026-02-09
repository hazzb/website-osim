import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiEdit, FiTrash2 } from "react-icons/fi";

const LayoutSplit = ({ data, isAdmin, onEdit, onDelete }) => {
  return (
    <div className="flex flex-col gap-12 md:gap-16">
      {data.map((item) => (
        <div
          key={item.id}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center"
        >
          {/* Bagian Gambar (Hanya tampil jika ada) */}
          {item.image_url && (
            <div className="relative group rounded-3xl overflow-hidden shadow-2xl transition-transform duration-300 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-transparent pointer-events-none z-10"></div>
              <img
                src={item.image_url}
                alt={item.judul}
                className="w-full h-full min-h-[300px] object-cover"
              />
            </div>
          )}

          {/* Bagian Konten (Sekarang polos tanpa border warna) */}
          <div
            className={`flex flex-col ${!item.image_url ? "col-span-2 text-center items-center" : ""}`}
          >
            <h3 className="text-3xl font-extrabold text-slate-800 mb-6 relative inline-block">
              {item.judul}
              <span className="absolute -bottom-2 left-0 w-1/3 h-1.5 bg-blue-500 rounded-full"></span>
            </h3>

            <div
              className={`prose prose-lg text-slate-600 leading-loose ${!item.image_url ? "max-w-3xl" : ""}`}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {item.isi}
              </ReactMarkdown>
            </div>

            {isAdmin && (
              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => onEdit(item)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-semibold"
                >
                  <FiEdit size={16} /> Edit
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-semibold"
                >
                  <FiTrash2 size={16} /> Hapus
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LayoutSplit;
