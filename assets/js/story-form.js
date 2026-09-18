import { supabase } from './supabase.js';
import { getCurrentUser } from './auth.js';

console.log("IK-PRO.ID - Story Form Module Loaded");

const globalLoader = document.getElementById('globalLoader');
const form = document.getElementById('storyForm');
const btnSubmit = document.getElementById('btnSubmit');
const pageTitle = document.getElementById('pageTitle');
const urlParams = new URLSearchParams(window.location.search);
const invId = urlParams.get('inv_id');
const storyId = urlParams.get('story_id');

const backUrl = `stories.html?inv_id=${invId}`;
document.getElementById('btnBackSidebar').href = backUrl;
document.getElementById('btnCancel').href = backUrl;

const initForm = async () => {
    if (!invId) { window.location.href = 'invitations.html'; return; }
    if (storyId) {
        pageTitle.textContent = "Edit Cerita";
        globalLoader.classList.add('show');
        try {
            const { data, error } = await supabase.from('love_stories').select('*').eq('id', storyId).single();
            if (error) throw error;
            if (data) {
                document.getElementById('title').value = data.title;
                document.getElementById('date').value = data.date;
                document.getElementById('story').value = data.story;
            }
        } catch (err) {
            alert("Gagal memuat data cerita.");
        } finally {
            globalLoader.classList.remove('show');
        }
    }
};

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    globalLoader.classList.add('show');
    btnSubmit.disabled = true;

    try {
        const payload = {
            invitation_id: invId,
            title: document.getElementById('title').value.trim(),
            date: document.getElementById('date').value,
            story: document.getElementById('story').value.trim()
        };

        if (storyId) {
            const { error } = await supabase.from('love_stories').update(payload).eq('id', storyId);
            if (error) throw error;
        } else {
            const { error } = await supabase.from('love_stories').insert([payload]);
            if (error) throw error;
        }

        alert("Cerita berhasil disimpan!");
        window.location.href = backUrl;
    } catch (err) {
        console.error(err);
        alert("Gagal menyimpan cerita: " + err.message);
        globalLoader.classList.remove('show');
        btnSubmit.disabled = false;
    }
});

initForm();
