import { getCurrentUser, getUserProfile, logoutUser } from './auth.js';

console.log("IK-PRO.ID - Dashboard Module Loaded");

// DOM Elements
const userNameDisplay = document.getElementById('userNameDisplay');
const btnLogoutSidebar = document.getElementById('btnLogoutSidebar');
const btnLogoutMobile = document.getElementById('btnLogoutMobile');
const globalLoader = document.getElementById('globalLoader');

// Fungsi kontrol loader
const showLoader = () => globalLoader.classList.add('show');
const hideLoader = () => globalLoader.classList.remove('show');

// Fungsi inisialisasi Dashboard
const initDashboard = async () => {
    showLoader();
    try {
        // 1. Cek apakah ada sesi user (Proteksi Halaman)
        const user = await getCurrentUser();
        
        if (!user) {
            // Jika belum login, tendang ke halaman login
            window.location.href = '../login.html';
            return;
        }

        // 2. Ambil data profil dari database public.profiles
        const { data: profile, error } = await getUserProfile(user.id);

        if (error) {
            console.error("Gagal mengambil profil:", error);
            userNameDisplay.textContent = "Client";
        } else if (profile) {
            // Tampilkan nama di Topbar (ambil nama depan saja jika panjang)
            const firstName = profile.name.split(' ')[0];
            userNameDisplay.textContent = firstName;
        }

        // TODO di langkah selanjutnya: Ambil statistik (Total Undangan, RSVP) dari database

    } catch (err) {
        console.error("Error saat init dashboard:", err);
    } finally {
        hideLoader();
    }
};

// Event Listeners untuk Logout
if(btnLogoutSidebar) btnLogoutSidebar.addEventListener('click', logoutUser);
if(btnLogoutMobile) btnLogoutMobile.addEventListener('click', logoutUser);

// Jalankan saat file dimuat
initDashboard();
