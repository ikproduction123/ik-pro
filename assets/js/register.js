import { registerUser } from './auth.js';

console.log("IK-PRO.ID - Register Module Loaded");

const registerForm = document.getElementById('registerForm');
const btnSubmit = document.getElementById('btnSubmit');

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Mencegah reload halaman standar

    // Ambil nilai dari input
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Loading state: ubah teks tombol dan nonaktifkan agar tidak double click
    const originalBtnText = btnSubmit.innerHTML;
    btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mendaftar...';
    btnSubmit.disabled = true;

    // Eksekusi fungsi pendaftaran ke Supabase
    const { data, error } = await registerUser(email, password, name, phone);

    // Kembalikan tombol ke keadaan semula
    btnSubmit.innerHTML = originalBtnText;
    btnSubmit.disabled = false;

    if (error) {
        // Tampilkan error jika gagal
        alert("Gagal mendaftar: " + error.message);
    } else {
        // Notifikasi sukses dan arahkan ke halaman login
        alert("Pendaftaran berhasil! Silakan login untuk melanjutkan.");
        window.location.href = 'login.html';
    }
});
