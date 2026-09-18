import { supabase } from './supabase.js';
import { getCurrentUser } from './auth.js';
import { uploadFile, getPublicUrl } from './storage.js';

console.log("IK-PRO.ID - Gallery Form Module Loaded");

const globalLoader = document.getElementById('globalLoader');
const form = document.getElementById('galleryForm');
const btnSubmit = document.getElementById('btnSubmit');
const urlParams = new URLSearchParams(window.location.search);
const invId = urlParams.get('inv_id');

const backUrl = `galleries.html?inv_id=${invId}`;
document.getElementById('btnBackSidebar').href = backUrl;
document.getElementById('btnCancel').href = backUrl;

document.getElementById('image').addEventListener('change', function() {
    const file = this.files[0];
    const preview = document.getElementById('img_preview');
    if (file) {
        preview.src = URL.createObjectURL(file);
        preview.style.display = 'block';
    }
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    globalLoader.classList.add('show');
    btnSubmit.disabled = true;

    try {
        const user = await getCurrentUser();
        const file = document.getElementById('image').files[0];
        const caption = document.getElementById('caption').value.trim();

        const ext = file.name.split('.').pop();
        const path = `${user.id}/${invId}/galleries/img_${Date.now()}.${ext}`;
        const uploadPath = await uploadFile('invitations-asset', path, file);
        const publicUrl = getPublicUrl('invitations-asset', uploadPath);

        const { error } = await supabase.from('galleries').insert([{
            invitation_id: invId,
            image_url: publicUrl,
            caption: caption
        }]);

        if (error) throw error;
        alert("Foto berhasil diunggah!");
        window.location.href = backUrl;
    } catch (err) {
        console.error(err);
        alert("Gagal mengunggah foto: " + err.message);
        globalLoader.classList.remove('show');
        btnSubmit.disabled = false;
    }
});
