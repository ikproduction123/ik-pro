import { supabase } from './supabase.js';
import { getCurrentUser } from './auth.js';
import { uploadFile, getPublicUrl } from './storage.js';

console.log("IK-PRO.ID - Couple Form Module Loaded");

const globalLoader = document.getElementById('globalLoader');
const form = document.getElementById('coupleForm');
const btnSubmit = document.getElementById('btnSubmit');

const urlParams = new URLSearchParams(window.location.search);
const invId = urlParams.get('inv_id');

let currentUser = null;
let existingCoupleId = null; 
let existingBridePhoto = null;
let existingGroomPhoto = null;

const showLoader = () => globalLoader.classList.add('show');
const hideLoader = () => globalLoader.classList.remove('show');

// Helper untuk preview gambar lokal sebelum upload
const setupImagePreview = (inputId, previewId) => {
    document.getElementById(inputId).addEventListener('change', function() {
        const file = this.files[0];
        const preview = document.getElementById(previewId);
        if (file) {
            preview.src = URL.createObjectURL(file);
            preview.style.display = 'block';
        }
    });
};

setupImagePreview('bride_photo', 'bride_preview');
setupImagePreview('groom_photo', 'groom_preview');

const initForm = async () => {
    if (!invId) {
        alert("ID Undangan tidak ditemukan!");
        window.location.href = 'invitations.html';
        return;
    }

    showLoader();
    try {
        currentUser = await getCurrentUser();
        if (!currentUser) throw new Error("Silakan login kembali.");

        // Ambil data couple jika sudah ada
        const { data, error } = await supabase
            .from('couples')
            .select('*')
            .eq('invitation_id', invId)
            .maybeSingle(); // maybeSingle tidak melempar error jika data kosong (0 baris)

        if (error) throw error;

        if (data) {
            // Mode EDIT
            existingCoupleId = data.id;
            
            document.getElementById('bride_short_name').value = data.bride_short_name || '';
            document.getElementById('bride_full_name').value = data.bride_full_name || '';
            document.getElementById('bride_father').value = data.bride_father || '';
            document.getElementById('bride_mother').value = data.bride_mother || '';
            document.getElementById('bride_instagram').value = data.bride_instagram || '';
            
            document.getElementById('groom_short_name').value = data.groom_short_name || '';
            document.getElementById('groom_full_name').value = data.groom_full_name || '';
            document.getElementById('groom_father').value = data.groom_father || '';
            document.getElementById('groom_mother').value = data.groom_mother || '';
            document.getElementById('groom_instagram').value = data.groom_instagram || '';

            existingBridePhoto = data.bride_photo;
            existingGroomPhoto = data.groom_photo;

            if (existingBridePhoto) {
                const preview = document.getElementById('bride_preview');
                preview.src = existingBridePhoto;
                preview.style.display = 'block';
            }
            if (existingGroomPhoto) {
                const preview = document.getElementById('groom_preview');
                preview.src = existingGroomPhoto;
                preview.style.display = 'block';
            }
        }
    } catch (error) {
        console.error("Init Error:", error);
        alert(error.message);
    } finally {
        hideLoader();
    }
};

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoader();
    
    const originalBtnText = btnSubmit.innerHTML;
    btnSubmit.innerHTML = 'Menyimpan...';
    btnSubmit.disabled = true;

    try {
        const brideFile = document.getElementById('bride_photo').files[0];
        const groomFile = document.getElementById('groom_photo').files[0];

        let finalBridePhoto = existingBridePhoto;
        let finalGroomPhoto = existingGroomPhoto;

        const bucketName = 'invitations-asset';

        // Upload foto bride jika ada
        if (brideFile) {
            const ext = brideFile.name.split('.').pop();
            const path = `${currentUser.id}/${invId}/couple/bride_${Date.now()}.${ext}`;
            const uploadPath = await uploadFile(bucketName, path, brideFile);
            finalBridePhoto = getPublicUrl(bucketName, uploadPath);
        }

        // Upload foto groom jika ada
        if (groomFile) {
            const ext = groomFile.name.split('.').pop();
            const path = `${currentUser.id}/${invId}/couple/groom_${Date.now()}.${ext}`;
            const uploadPath = await uploadFile(bucketName, path, groomFile);
            finalGroomPhoto = getPublicUrl(bucketName, uploadPath);
        }

        const payload = {
            invitation_id: invId,
            bride_short_name: document.getElementById('bride_short_name').value.trim(),
            bride_full_name: document.getElementById('bride_full_name').value.trim(),
            bride_father: document.getElementById('bride_father').value.trim(),
            bride_mother: document.getElementById('bride_mother').value.trim(),
            bride_instagram: document.getElementById('bride_instagram').value.trim(),
            bride_photo: finalBridePhoto,
            groom_short_name: document.getElementById('groom_short_name').value.trim(),
            groom_full_name: document.getElementById('groom_full_name').value.trim(),
            groom_father: document.getElementById('groom_father').value.trim(),
            groom_mother: document.getElementById('groom_mother').value.trim(),
            groom_instagram: document.getElementById('groom_instagram').value.trim(),
            groom_photo: finalGroomPhoto,
            updated_at: new Date().toISOString()
        };

        if (existingCoupleId) {
            // Update jika sudah ada
            const { error } = await supabase.from('couples').update(payload).eq('id', existingCoupleId);
            if (error) throw error;
        } else {
            // Insert jika belum ada
            const { error } = await supabase.from('couples').insert([payload]);
            if (error) throw error;
        }

        alert("Data mempelai berhasil disimpan!");
        window.location.href = 'invitations.html';

    } catch (error) {
        console.error("Save Error:", error);
        alert("Gagal menyimpan data: " + error.message);
    } finally {
        hideLoader();
        btnSubmit.innerHTML = originalBtnText;
        btnSubmit.disabled = false;
    }
});

initForm();
