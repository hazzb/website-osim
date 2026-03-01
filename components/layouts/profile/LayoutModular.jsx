import React from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { FiEdit, FiTrash2 } from "react-icons/fi";

const ReactMarkdown = dynamic(() => import("react-markdown"), {
  loading: () => <p className="animate-pulse">Memuat konten...</p>,
});
const remarkGfm = dynamic(() => import("remark-gfm"));

const LayoutModular = ({ contentBlocks = [], isAdmin, onEdit, onDelete }) => {
  if (!contentBlocks || contentBlocks.length === 0) {
    return (
      <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
        Belum ada konten untuk ditampilkan.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {contentBlocks.map((block) => (
        <div
          key={block.id}
          className="group p-8 rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50 hover:-translate-y-2 hover:border-blue-500 transition-all duration-300 relative"
        >
          {/* Admin Controls */}
          {isAdmin && (
            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
            <div className="mb-6 -mx-8 -mt-8">
              <Image
                src={block.image_url}
                alt={block.judul}
                width={600}
                height={400}
                className="w-full h-48 object-cover rounded-t-3xl"
              />
            </div>
          )}

          {/* Title */}
          <h3 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">
            {block.judul}
          </h3>

          {/* Content (Markdown) */}
          <div className="prose prose-sm prose-slate max-w-none mb-4">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {block.isi}
            </ReactMarkdown>
          </div>

          {/* Optional Button */}
          {block.button_text && block.button_link && (
            <a
              href={block.button_link}
              className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              {block.button_text}
            </a>
          )}
        </div>
      ))}
    </div>
  );
};

export default LayoutModular;
