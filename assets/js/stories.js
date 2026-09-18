import { supabase } from './supabase.js';
import { getCurrentUser } from './auth.js';

console.log("IK-PRO.ID - Stories Module Loaded");

const globalLoader = document.getElementById('globalLoader');
const container = document.getElementById('storyContainer');
const btnAddStory = document.getElementById('btnAddStory');
const urlParams = new URLSearchParams(window.location.search);
const invId = urlParams.get('inv_id');

const showLoader = () => globalLoader.classList.add('show');
const hideLoader = () => globalLoader.classList.remove('show');

const loadStories = async () => {
    if (!invId) { window.location.href = 'invitations.html'; return; }
    showLoader();
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error("Silakan login kembali.");
        btnAddStory.href = `story-form.html?inv_id=${invId}`;

        const { data, error } = await supabase.from('love_stories').select('*').eq('invitation_id', invId).order('date', { ascending: true });
        if (error) throw error;

        if (data.length === 0) {
            container.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;"><i class="fa-solid fa-book-open" style="font-size: 3rem; margin-bottom: 15px;"></h3><h3>Belum ada cerita</h3><p>Tambahkan kronologi kisah cinta Anda.</p></div>`;
            return;
        }

        let html = '';
        data.forEach(item => {
            html += `
                <div class="data-card">
                    <div class="data-card-header">
                        <div class="data-card-title">${item.title}</div>
                        <span style="font-size: 0.8rem; color: var(--gray);"><i class="fa-solid fa-calendar"></i> ${item.date}</span>
                    </div>
                    <div class="data-card-body">
                        <p>${item.story}</p>
                    </div>
                    <div class="data-card-actions">
                        <a href="story-form.html?inv_id=${invId}&story_id=${item.id}" class="btn-outline btn-small"><i class="fa-solid fa-pen"></i> Edit</a>
                        <button class="btn-danger btn-small btn-delete" data-id="${item.id}"><i class="fa-solid fa-trash"></i> Hapus</button>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    } catch (err) {
        console.error(err);
        container.innerHTML = `<div class="empty-state">Gagal memuat cerita.</div>`;
    } finally {
        hideLoader();
    }
};

container.addEventListener('click', async (e) => {
    const btn = e.target.closest('.btn-delete');
    if (!btn) return;
    if (confirm("Hapus cerita ini?")) {
        showLoader();
        try {
            const { error } = await supabase.from('love_stories').delete().eq('id', btn.dataset.id);
            if (error) throw error;
            loadStories();
        } catch (err) {
            alert("Gagal menghapus cerita.");
            hideLoader();
        }
    }
});

loadStories();
