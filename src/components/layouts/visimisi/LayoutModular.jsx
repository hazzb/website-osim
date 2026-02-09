import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiEdit, FiTrash2 } from "react-icons/fi";

const LayoutModular = ({ data, isAdmin, onEdit, onDelete }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
      {data.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
        >
          {/* LOGIC: Hanya render wrapper jika gambar ada */}
          {item.image_url && (
            <div className="w-full h-48 overflow-hidden bg-slate-100 border-b border-slate-100">
              <img
                src={item.image_url}
                alt={item.judul}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          )}

          <div className="p-6 flex-1 flex flex-col">
            <h3 className="text-xl font-bold text-slate-800 mb-3 leading-tight">
              {item.judul}
            </h3>

            <div className="text-slate-600 leading-relaxed text-sm prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {item.isi}
              </ReactMarkdown>
            </div>
          </div>

          {isAdmin && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(item)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:text-blue-600 hover:border-blue-500 transition-colors"
                title="Edit Konten"
              >
                <FiEdit /> Edit
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 hover:border-red-400 transition-colors"
                title="Hapus Konten"
              >
                <FiTrash2 /> Hapus
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default LayoutModular;
