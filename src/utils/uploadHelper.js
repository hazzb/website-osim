import { supabase } from "../supabaseClient";
import imageCompression from "browser-image-compression";

/**
 * Upload Image dengan Smart Compression (WebP High Quality)
 * @param {File} file - File asli
 * @param {string} folder - Folder tujuan
 * @param {number} maxSizeMB - Target size (Default 1MB)
 * @returns {Promise<string>} - Public URL
 */
export const uploadImage = async (file, folder, maxSizeMB = 1) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!file) return reject("Tidak ada file yang dipilih.");

      // Validasi tipe file awal
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/jpg",
      ];
      if (!allowedTypes.includes(file.type)) {
        return reject("Format file tidak valid. Gunakan JPG, PNG, atau WEBP.");
      }

      console.log(`Original: ${(file.size / 1024 / 1024).toFixed(2)} MB`);

      // --- KONFIGURASI SMART COMPRESSION ---
      const options = {
        maxSizeMB: maxSizeMB,

        // 1. Resize Dimensi:
        // Untuk Logo/Foto Profil, 1280px sudah sangat tajam (HD).
        // Jangan biarkan 4000px lolos, itu yang bikin size bengkak.
        maxWidthOrHeight: 1280,

        // 2. Gunakan WebP:
        // WebP punya kualitas jauh lebih bagus di ukuran kecil dibanding JPG/PNG
        fileType: "image/webp",

        // 3. Jaga Kualitas:
        // Mulai dari 80%. Library akan menurunkannya pelan-pelan HANYA jika masih > maxSizeMB
        initialQuality: 0.8,

        useWebWorker: true,
      };

      let fileToUpload = file;

      try {
        // Lakukan Kompresi
        const compressedFile = await imageCompression(file, options);

        console.log(
          `Compressed (WebP): ${(compressedFile.size / 1024 / 1024).toFixed(
            2
          )} MB`
        );

        // Gunakan file kompresi (kecuali jika entah kenapa malah jadi lebih besar)
        if (compressedFile.size < file.size) {
          fileToUpload = compressedFile;
        }
      } catch (err) {
        console.warn("Kompresi gagal/dilewati, menggunakan file asli.", err);
      }

      // Validasi Akhir (Hard Limit)
      // Kita beri toleransi sedikit (10%) dari batas yang diminta biar gak strict banget
      const limitBytes = maxSizeMB * 1024 * 1024 * 1.1;

      if (fileToUpload.size > limitBytes) {
        // Jika masih kegedean, kita reject.
        // Tips: Jika logo Anda 0.2MB masih pecah, berarti gambar aslinya terlalu rumit.
        return reject(
          `Gagal mengompres gambar hingga cukup kecil (${maxSizeMB} MB). Coba resize dimensi gambar Anda terlebih dahulu.`
        );
      }

      // --- UPLOAD KE SUPABASE ---
      // Pastikan ekstensi file jadi .webp karena kita convert ke WebP
      const fileExt = "webp";
      const fileName = `${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("logos") // Pastikan nama bucket Anda benar
        .upload(filePath, fileToUpload, {
          contentType: "image/webp", // Pastikan metadata benar
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("logos").getPublicUrl(filePath);

      resolve(data.publicUrl);
    } catch (error) {
      console.error("Upload Error:", error);
      reject(error.message || "Gagal mengupload gambar.");
    }
  });
};
