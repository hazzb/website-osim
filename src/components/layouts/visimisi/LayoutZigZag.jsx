import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiEdit, FiTrash2 } from "react-icons/fi";

const LayoutZigZag = ({ data, isAdmin, onEdit, onDelete }) => {
  return (
    <div className="flex flex-col gap-20">
      {data.map((item, index) => (
        <div
          key={item.id}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center"
        >
          {/* LOGIC GAMBAR */}
          {item.image_url && (
            <div
              className={`relative rounded-[30px] overflow-hidden shadow-2xl skew-x-1 hover:skew-x-0 transition-transform duration-500 bg-white p-2 border border-slate-100 ${index % 2 !== 0 ? "md:order-last" : ""}`}
            >
              <img
                src={item.image_url}
                alt={item.judul}
                className="w-full h-full object-cover rounded-[24px]"
              />
            </div>
          )}

          {/* LOGIC CONTENT */}
          {/* Jika tidak ada gambar, tambahkan class fullWidth agar teks di tengah */}
          <div
            className={`flex flex-col ${
              !item.image_url
                ? "col-span-2 text-center items-center max-w-4xl mx-auto"
                : ""
            } ${index % 2 !== 0 && item.image_url ? "md:text-right md:items-end" : ""}`}
          >
            <h2 className="text-4xl font-black text-slate-800 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 inline-block">
              {item.judul}
            </h2>

            <div
              className={`prose prose-lg text-slate-600 text-lg leading-relaxed mb-6 ${index % 2 !== 0 && item.image_url ? "md:text-right" : ""}`}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {item.isi}
              </ReactMarkdown>
            </div>

            {isAdmin && (
              <div
                className={`flex gap-3 mt-2 ${index % 2 !== 0 && item.image_url ? "justify-end" : ""}`}
              >
                <button
                  onClick={() => onEdit(item)}
                  className="text-slate-500 hover:text-blue-600 font-semibold flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <FiEdit /> Edit
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="text-slate-500 hover:text-red-500 font-semibold flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <FiTrash2 /> Hapus
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LayoutZigZag;
