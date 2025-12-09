// src/utils/uploadHelper.js
import { supabase } from "../supabaseClient";

/**
 * Fungsi reusable untuk upload gambar
 * @param {File} file - File objek dari input
 * @param {string} folder - Nama folder di bucket (misal: 'anggota', 'divisi')
 * @param {number} maxSizeMB - Batas ukuran dalam MB (Default 1MB)
 * @returns {Promise<string>} - Mengembalikan URL Publik gambar
 */
export const uploadImage = async (file, folder, maxSizeMB = 1) => {
  return new Promise(async (resolve, reject) => {
    try {
      // 1. Validasi Keberadaan File
      if (!file) return reject("Tidak ada file yang dipilih.");

      // 2. Validasi Tipe File
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/jpg",
      ];
      if (!allowedTypes.includes(file.type)) {
        return reject("Format file tidak valid. Gunakan JPG, PNG, atau WEBP.");
      }

      // 3. Validasi Ukuran File
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        return reject(`Ukuran file terlalu besar. Maksimal ${maxSizeMB} MB.`);
      }

      // 4. Generate Nama Unik
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // 5. Upload ke Supabase
      const { error: uploadError } = await supabase.storage
        .from("logos") // Pastikan nama bucket Anda 'logos'
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 6. Ambil Public URL
      const { data } = supabase.storage.from("logos").getPublicUrl(filePath);

      resolve(data.publicUrl);
    } catch (error) {
      console.error("Upload Error:", error);
      reject(error.message || "Gagal mengupload gambar.");
    }
  });
};
