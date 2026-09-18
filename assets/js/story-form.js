import { supabase } from './supabase.js';
import { getCurrentUser } from './auth.js';
import { uploadFile, getPublicUrl } from './storage.js';

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

// Preview Gambar saat dipilih
document.getElementById('image').addEventListener('change', function() {
    const file = this.files[0];
    const preview = document.getElementById('img_preview');
    if (file) {
        preview.src = URL.createObjectURL(file);
        preview.style.display = 'block';
    }
});

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
                
                if (data.image_url) {
                    const preview = document.getElementById('img_preview');
                    preview.src = data.image_url;
                    preview.style.display = 'block';
                }
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
        const user = await getCurrentUser();
        const imageFile = document.getElementById('image').files[0];
        let imageUrl = null;

        // Jika user mengunggah foto baru
        if (imageFile) {
            const ext = imageFile.name.split('.').pop();
            const path = `${user.id}/${invId}/stories/story_${Date.now()}.${ext}`;
            const uploadPath = await uploadFile('invitations-asset', path, imageFile);
            imageUrl = getPublicUrl('invitations-asset', uploadPath);
        } else if (storyId) {
            // Pertahankan foto lama jika dalam mode edit dan tidak mengganti foto
            const { data: oldData } = await supabase.from('love_stories').select('image_url').eq('id', storyId).single();
            if (oldData) imageUrl = oldData.image_url;
        }

        const payload = {
            invitation_id: invId,
            title: document.getElementById('title').value.trim(),
            date: document.getElementById('date').value,
            story: document.getElementById('story').value.trim(),
            image_url: imageUrl
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
