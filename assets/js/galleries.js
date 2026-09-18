import { supabase } from './supabase.js';
import { getCurrentUser } from './auth.js';

console.log("IK-PRO.ID - Galleries Module Loaded");

const globalLoader = document.getElementById('globalLoader');
const container = document.getElementById('galleryContainer');
const btnAddGallery = document.getElementById('btnAddGallery');
const urlParams = new URLSearchParams(window.location.search);
const invId = urlParams.get('inv_id');

const showLoader = () => globalLoader.classList.add('show');
const hideLoader = () => globalLoader.classList.remove('show');

const loadGalleries = async () => {
    if (!invId) { window.location.href = 'invitations.html'; return; }
    showLoader();
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error("Silakan login kembali.");
        btnAddGallery.href = `gallery-form.html?inv_id=${invId}`;

        const { data, error } = await supabase.from('galleries').select('*').eq('invitation_id', invId).order('created_at', { ascending: false });
        if (error) throw error;

        if (data.length === 0) {
            container.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;"><i class="fa-solid fa-images" style="font-size: 3rem; margin-bottom: 15px;"></i><h3>Belum ada foto galeri</h3><p>Silakan tambahkan foto ke dalam galeri.</p></div>`;
            return;
        }

        let html = '';
        data.forEach(item => {
            html += `
                <div class="data-card">
                    <div style="height: 180px; overflow: hidden; border-radius: 8px; margin-bottom: 15px;">
                        <img src="${item.image_url}" style="width: 100%; height: 100%; object-fit: cover;" alt="Gallery">
                    </div>
                    <div class="data-card-body" style="margin-bottom: 10px;">
                        <p><strong>${item.caption || 'Tanpa keterangan'}</strong></p>
                    </div>
                    <div class="data-card-actions">
                        <button class="btn-danger btn-small btn-delete" data-id="${item.id}" style="width: 100%;"><i class="fa-solid fa-trash"></i> Hapus Foto</button>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    } catch (err) {
        console.error(err);
        container.innerHTML = `<div class="empty-state">Gagal memuat galeri.</div>`;
    } finally {
        hideLoader();
    }
};

container.addEventListener('click', async (e) => {
    const btn = e.target.closest('.btn-delete');
    if (!btn) return;
    if (confirm("Hapus foto ini dari galeri?")) {
        showLoader();
        try {
            const { error } = await supabase.from('galleries').delete().eq('id', btn.dataset.id);
            if (error) throw error;
            loadGalleries();
        } catch (err) {
            alert("Gagal menghapus foto.");
            hideLoader();
        }
    }
});

loadGalleries();
