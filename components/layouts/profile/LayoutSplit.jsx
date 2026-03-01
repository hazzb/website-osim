import React from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { FiEdit, FiTrash2 } from "react-icons/fi";

const ReactMarkdown = dynamic(() => import("react-markdown"), {
  loading: () => <p className="animate-pulse">Memuat konten...</p>,
});
const remarkGfm = dynamic(() => import("remark-gfm"));

const LayoutSplit = ({ contentBlocks = [], isAdmin, onEdit, onDelete }) => {
  if (!contentBlocks || contentBlocks.length === 0) {
    return (
      <div className="p-12 text-center text-slate-400">
        Belum ada konten untuk ditampilkan.
      </div>
    );
  }

  // First block goes to sidebar, rest in scrollable list
  const mainBlock = contentBlocks[0];
  const otherBlocks = contentBlocks.slice(1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_500px] gap-8">
      {/* MAIN BLOCK - Side Column */}
      <section className="bg-slate-900 rounded-[2.5rem] p-12 md:p-16 text-white shadow-2xl flex flex-col justify-center relative group">
        {/* Admin Controls */}
        {isAdmin && mainBlock && (
          <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button
              onClick={() => onEdit(mainBlock)}
              className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors text-xs"
              title="Edit"
            >
              <FiEdit size={14} />
            </button>
            <button
              onClick={() => onDelete(mainBlock.id)}
              className="p-2 bg-red-500/80 backdrop-blur-sm text-white rounded-lg hover:bg-red-500 transition-colors text-xs"
              title="Hapus"
            >
              <FiTrash2 size={14} />
            </button>
          </div>
        )}

        {mainBlock?.image_url && (
          <div className="mb-8 -mx-12 -mt-12">
            <Image
              src={mainBlock.image_url}
              alt={mainBlock.judul}
              width={600}
              height={400}
              className="w-full h-64 object-cover rounded-t-[2.5rem] opacity-30"
            />
          </div>
        )}

        <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight tracking-tight">
          {mainBlock?.judul || "Belum ada judul"}
        </h2>
        <div className="prose prose-invert max-w-none mb-6">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {mainBlock?.isi || ""}
          </ReactMarkdown>
        </div>
        {mainBlock?.button_text && mainBlock?.button_link && (
          <a
            href={mainBlock.button_link}
            className="inline-block mt-4 px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors"
          >
            {mainBlock.button_text}
          </a>
        )}
        <div className="h-1 w-20 bg-blue-500 rounded-full mt-6"></div>
      </section>

      {/* OTHER BLOCKS - Scroll Column */}
      <div className="flex flex-col gap-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
        {otherBlocks.length > 0 ? (
          otherBlocks.map((block) => (
            <div
              key={block.id}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-600 transition-all group relative"
            >
              {/* Admin Controls */}
              {isAdmin && (
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(block)}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs"
                    title="Edit"
                  >
                    <FiEdit size={12} />
                  </button>
                  <button
                    onClick={() => onDelete(block.id)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs"
                    title="Hapus"
                  >
                    <FiTrash2 size={12} />
                  </button>
                </div>
              )}

              <div className="flex gap-6 items-start">
                <div className="flex-1">
                  {block.image_url && (
                    <Image
                      src={block.image_url}
                      alt={block.judul}
                      width={400}
                      height={300}
                      className="w-full h-32 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h4 className="text-lg font-bold text-slate-800 mb-2">
                    {block.judul}
                  </h4>
                  <div className="prose prose-sm prose-slate max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {block.isi}
                    </ReactMarkdown>
                  </div>
                  {block.button_text && block.button_link && (
                    <a
                      href={block.button_link}
                      className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      {block.button_text}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-slate-400">
            Belum ada konten lainnya.
          </div>
        )}
      </div>
    </div>
  );
};

export default LayoutSplit;
