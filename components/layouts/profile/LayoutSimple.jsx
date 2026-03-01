import React from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { FiEdit, FiTrash2 } from "react-icons/fi";

const ReactMarkdown = dynamic(() => import("react-markdown"), {
  loading: () => <p className="animate-pulse">Memuat konten...</p>,
});
const remarkGfm = dynamic(() => import("remark-gfm"));

const LayoutSimple = ({ contentBlocks = [], isAdmin, onEdit, onDelete }) => {
  if (!contentBlocks || contentBlocks.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400">
        Belum ada konten untuk ditampilkan.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-16">
      {contentBlocks.map((block) => (
        <div
          key={block.id}
          className="group relative border-b border-slate-100 pb-16 last:border-0"
        >
          {/* Admin Controls */}
          {isAdmin && (
            <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(block)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit"
              >
                <FiEdit size={16} />
              </button>
              <button
                onClick={() => onDelete(block.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Hapus"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          )}

          <div className="flex flex-col gap-8">
            {block.image_url && (
              <Image
                src={block.image_url}
                alt={block.judul}
                width={800}
                height={400}
                className="w-full h-[400px] object-cover rounded-3xl shadow-lg"
              />
            )}
            <div>
              <h3 className="text-3xl font-extrabold text-slate-800 mb-6 tracking-tight">
                {block.judul}
              </h3>
              <div className="prose prose-lg prose-slate max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {block.isi}
                </ReactMarkdown>
              </div>
              {block.button_text && block.button_link && (
                <div className="mt-8">
                  <a
                    href={block.button_link}
                    className="inline-block px-10 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all"
                  >
                    {block.button_text}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LayoutSimple;
