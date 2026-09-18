import { supabase } from './supabase.js';

/**
 * Mendaftarkan user baru (Client)
 * Data name dan phone dikirim via metadata agar ditangkap oleh Trigger Database
 */
export const registerUser = async (email, password, name, phone) => {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    name: name,
                    phone: phone
                }
            }
        });
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error("Register Error:", error);
        return { data: null, error };
    }
};

/**
 * Login user
 */
export const loginUser = async (email, password) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error("Login Error:", error);
        return { data: null, error };
    }
};

/**
 * Logout user dan arahkan ke halaman login
 */
export const logoutUser = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Logout Error:", error);
    } else {
        window.location.href = '/login.html';
    }
};

/**
 * Mendapatkan data sesi user saat ini (berguna untuk proteksi halaman)
 */
export const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};

/**
 * Mendapatkan detail profil (termasuk role admin/client) dari tabel profiles
 */
export const getUserProfile = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
            
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error("Get Profile Error:", error);
        return { data: null, error };
    }
};
