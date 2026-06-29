import React from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { FiEdit, FiTrash2 } from "react-icons/fi";

const ReactMarkdown = dynamic(() => import("react-markdown"), {
  loading: () => <p className="animate-pulse">Memuat konten...</p>,
});
const remarkGfm = dynamic(() => import("remark-gfm"));

const LayoutZigZag = ({ contentBlocks = [], isAdmin, onEdit, onDelete }) => {
  if (!contentBlocks || contentBlocks.length === 0) {
    return (
      <div className="py-12 text-center text-text-muted">
        Belum ada konten untuk ditampilkan.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-24">
      {contentBlocks.map((block, index) => (
        <div
          key={block.id}
          className={`flex flex-col ${
            index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
          } gap-12 items-center group relative`}
        >
          {/* Admin Controls */}
          {isAdmin && (
            <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button
                onClick={() => onEdit(block)}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-primary shadow-lg text-xs"
              >
                <FiEdit size={14} /> Edit
              </button>
              <button
                onClick={() => onDelete(block.id)}
                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-lg text-xs"
              >
                <FiTrash2 size={14} />
              </button>
            </div>
          )}

          {/* Media Side */}
          <div className="w-full md:w-1/2">
            {block.image_url ? (
              <div className="relative">
                <Image
                  src={block.image_url}
                  alt={block.judul}
                  width={800}
                  height={600}
                  className="w-full aspect-[4/3] object-cover rounded-[2rem] shadow-2xl shadow-slate-200"
                />
                <div className="absolute -inset-4 border-2 border-primary-border rounded-[2.5rem] -z-10"></div>
              </div>
            ) : (
              <div className="w-full aspect-[4/3] bg-border-dim rounded-[2rem] flex items-center justify-center text-slate-300">
                Gambar tidak tersedia
              </div>
            )}
          </div>

          {/* Content Side */}
          <div className="w-full md:w-1/2">
            <h3 className="text-3xl md:text-4xl font-black text-text-main mb-6 tracking-tight leading-tight">
              {block.judul}
            </h3>
            <div className="prose prose-lg prose-slate max-w-none mb-8">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {block.isi}
              </ReactMarkdown>
            </div>
            {block.button_text && block.button_link && (
              <a
                href={block.button_link}
                className="inline-flex items-center gap-3 px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover hover:-translate-y-1 transition-all shadow-lg shadow-blue-500/20"
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
