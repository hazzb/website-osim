import React from "react";
import ReactMarkdown from "react-markdown";
import { FiEdit, FiTrash2 } from "react-icons/fi";

const LayoutZigZag = ({ contentBlocks = [], isAdmin, onEdit, onDelete }) => {
  if (!contentBlocks || contentBlocks.length === 0) {
    return (
      <div className="p-12 text-center text-slate-400">
        Belum ada konten untuk ditampilkan.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {contentBlocks.map((block, i) => (
        <div
          key={block.id}
          className={`flex flex-col md:flex-row items-center gap-10 p-10 rounded-3xl bg-white border border-slate-200 shadow-lg relative group ${
            i % 2 !== 0 ? "md:flex-row-reverse" : ""
          }`}
        >
          {/* Admin Controls */}
          {isAdmin && (
            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button
                onClick={() => onEdit(block)}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs"
                title="Edit"
              >
                <FiEdit size={14} />
              </button>
              <button
                onClick={() => onDelete(block.id)}
                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs"
                title="Hapus"
              >
                <FiTrash2 size={14} />
              </button>
            </div>
          )}

          {/* Image (if exists) */}
          {block.image_url && (
            <div className="w-full md:w-1/3 shrink-0">
              <img
                src={block.image_url}
                alt={block.judul}
                className="w-full h-64 object-cover rounded-2xl shadow-xl"
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-black text-slate-800 mb-4 leading-tight">
              {block.judul}
            </h3>
            <div className="prose prose-slate max-w-none mb-4">
              <ReactMarkdown>{block.isi}</ReactMarkdown>
            </div>
            {block.button_text && block.button_link && (
              <a
                href={block.button_link}
                className="inline-block mt-4 px-6 py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors"
              >
                {block.button_text}
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LayoutZigZag;
