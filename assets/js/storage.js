import { supabase } from './supabase.js';

console.log("IK-PRO.ID - Storage Module Loaded");

/**
 * Upload file ke Supabase Storage
 * @param {string} bucket - Nama bucket (ex: 'invitations-asset')
 * @param {string} path - Path folder tujuan (ex: 'user-id/inv-id/couple/foto.jpg')
 * @param {File} file - File object dari input type="file"
 * @returns {string} Path file yang berhasil diupload
 */
export const uploadFile = async (bucket, path, file) => {
    try {
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, file, {
                cacheControl: '3600',
                upsert: true // Timpa jika nama file sama
            });

        if (error) throw error;
        return data.path;
    } catch (error) {
        console.error("Upload Error:", error);
        throw error;
    }
};

/**
 * Mendapatkan URL Publik dari sebuah file
 */
export const getPublicUrl = (bucket, path) => {
    const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);
    return data.publicUrl;
};
