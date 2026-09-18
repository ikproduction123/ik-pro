import { supabase } from './supabase.js';
import { getCurrentUser } from './auth.js';

console.log("IK-PRO.ID - Wishes Module Loaded");

const globalLoader = document.getElementById('globalLoader');
const container = document.getElementById('wishContainer');
const urlParams = new URLSearchParams(window.location.search);
const invId = urlParams.get('inv_id');

const showLoader = () => globalLoader.classList.add('show');
const hideLoader = () => globalLoader.classList.remove('show');

const loadWishes = async () => {
    if (!invId) { window.location.href = 'invitations.html'; return; }
    showLoader();
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error("Silakan login kembali.");

        // Sesuaikan nama tabel jika di database Anda bernama 'guestbook' atau 'wishes'
        const { data, error } = await supabase.from('wishes').select('*').eq('invitation_id', invId).order('created_at', { ascending: false });
        if (error) throw error;

        if (data.length === 0) {
            container.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;"><i class="fa-solid fa-comment-slash" style="font-size: 3rem; margin-bottom: 15px;"></i><h3>Belum ada ucapan</h3><p>Belum ada tamu yang mengirimkan ucapan atau doa.</p></div>`;
            return;
        }

        let html = '';
        data.forEach(item => {
            html += `
                <div class="data-card">
                    <div class="data-card-header">
                        <div class="data-card-title">${item.name}</div>
                        <span style="font-size: 0.75rem; color: var(--gray);">${new Date(item.created_at).toLocaleDateString('id-ID')}</span>
                    </div>
                    <div class="data-card-body">
                        <p style="font-style: italic; background: #f9f9f9; padding: 10px; border-radius: 6px;">"${item.message || item.wish}"</p>
                    </div>
                    <div class="data-card-actions">
                        <button class="btn-danger btn-small btn-delete" data-id="${item.id}" style="width: 100%;"><i class="fa-solid fa-trash"></i> Hapus Ucapan</button>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    } catch (err) {
        console.error(err);
        container.innerHTML = `<div class="empty-state">Gagal memuat daftar ucapan.</div>`;
    } finally {
        hideLoader();
    }
};

container.addEventListener('click', async (e) => {
    const btn = e.target.closest('.btn-delete');
    if (!btn) return;
    if (confirm("Hapus ucapan ini?")) {
        showLoader();
        try {
            const { error } = await supabase.from('wishes').delete().eq('id', btn.dataset.id);
            if (error) throw error;
            loadWishes();
        } catch (err) {
            alert("Gagal menghapus ucapan.");
            hideLoader();
        }
    }
});

loadWishes();
