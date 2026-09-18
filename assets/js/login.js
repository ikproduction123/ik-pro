import { loginUser } from './auth.js';

console.log("IK-PRO.ID - Login Module Loaded");

const loginForm = document.getElementById('loginForm');
const btnSubmit = document.getElementById('btnSubmit');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Mencegah form reload halaman

    // Ambil nilai dari input
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Aktifkan mode loading
    const originalBtnText = btnSubmit.innerHTML;
    btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memeriksa...';
    btnSubmit.disabled = true;

    // Eksekusi fungsi login
    const { data, error } = await loginUser(email, password);

    // Matikan mode loading
    btnSubmit.innerHTML = originalBtnText;
    btnSubmit.disabled = false;

    if (error) {
        // Tampilkan pesan error (misal: password salah atau email tidak ditemukan)
        alert("Gagal masuk: Email atau password salah.");
        console.error(error.message);
    } else {
        // Jika berhasil, arahkan ke dashboard
        // Catatan: Karena kita belum membuat dashboard, ini akan mengarah ke halaman kosong sementara
        window.location.href = 'dashboard/index.html';
    }
});
