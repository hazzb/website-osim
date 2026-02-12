import React from "react";
import ReactMarkdown from "react-markdown";
import { FiEdit, FiTrash2 } from "react-icons/fi";

/**
 * LayoutSimple - Tampilan Visi Misi sederhana & elegan (VERTIKAL)
 * Sekarang mendukung multiple content blocks dengan admin controls
 */
const LayoutSimple = ({
  contentBlocks = [],
  settings = {},
  isAdmin,
  onEdit,
  onDelete,
}) => {
  if (!contentBlocks || contentBlocks.length === 0) {
    return (
      <div className="text-center py-20 text-slate-400">
        Belum ada konten untuk ditampilkan.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-16">
      {contentBlocks.map((block, index) => (
        <section
          key={block.id}
          className="max-w-4xl mx-auto px-4 relative group"
        >
          {/* Admin Controls */}
          {isAdmin && (
            <div className="absolute top-0 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button
                onClick={() => onEdit(block)}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs shadow-lg"
                title="Edit"
              >
                <FiEdit size={14} />
              </button>
              <button
                onClick={() => onDelete(block.id)}
                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs shadow-lg"
                title="Hapus"
              >
                <FiTrash2 size={14} />
              </button>
            </div>
          )}

          {/* Divider with Title */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-12 bg-slate-300"></div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
              {block.judul}
            </h2>
            <div className="h-px w-12 bg-slate-300"></div>
          </div>

          {/* Optional Image */}
          {block.image_url && (
            <div className="mb-8">
              <img
                src={block.image_url}
                alt={block.judul}
                className="w-full max-h-96 object-cover rounded-2xl shadow-xl"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg md:prose-xl prose-slate mx-auto text-slate-600 leading-relaxed">
            <ReactMarkdown>{block.isi}</ReactMarkdown>
          </div>

          {/* Optional Button */}
          {block.button_text && block.button_link && (
            <div className="text-center mt-8">
              <a
                href={block.button_link}
                className="inline-block px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-blue-600/30 transition-all"
              >
                {block.button_text}
              </a>
            </div>
          )}

          {/* Separator (except for last item) */}
          {index < contentBlocks.length - 1 && (
            <div className="mt-16 border-t border-slate-100"></div>
          )}
        </section>
      ))}
    </div>
  );
};

export default LayoutSimple;
