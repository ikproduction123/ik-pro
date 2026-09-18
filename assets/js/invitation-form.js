import { supabase } from './supabase.js';
import { getCurrentUser } from './auth.js';

console.log("IK-PRO.ID - Invitation Form Module Loaded");

const globalLoader = document.getElementById('globalLoader');
const form = document.getElementById('invitationForm');
const titleInput = document.getElementById('title');
const slugInput = document.getElementById('slug');
const slugPreview = document.getElementById('slugPreview');
const btnSubmit = document.getElementById('btnSubmit');
const pageTitle = document.getElementById('pageTitle');

// Cek apakah ada parameter ID (Mode Edit)
const urlParams = new URLSearchParams(window.location.search);
const editId = urlParams.get('id');
let currentUser = null;

const showLoader = () => globalLoader.classList.add('show');
const hideLoader = () => globalLoader.classList.remove('show');

// Auto-format Slug saat mengetik (lowercase, hilangkan spasi/karakter aneh)
slugInput.addEventListener('input', (e) => {
    let val = e.target.value;
    val = val.toLowerCase()
             .replace(/[^a-z0-9-]/g, '-') // Ganti selain huruf/angka/- dengan strip
             .replace(/-+/g, '-')         // Hindari strip ganda
             .replace(/^-|-$/g, '');      // Hilangkan strip di awal/akhir jika ada (tapi biarkan saat mengetik agar user tidak kesulitan)
    
    // Paksa update input dengan format aman
    // Kita biarkan strip di akhir saat mengetik, jadi replace terakhir hanya saat blur/submit
    slugPreview.textContent = val || '...';
});

// Bersihkan slug saat input kehilangan fokus
slugInput.addEventListener('blur', (e) => {
    let val = e.target.value.replace(/^-|-$/g, '');
    e.target.value = val;
    slugPreview.textContent = val || '...';
});

const initForm = async () => {
    showLoader();
    try {
        currentUser = await getCurrentUser();
        if (!currentUser) {
            window.location.href = '../login.html';
            return;
        }

        // Jika Edit Mode, ambil data
        if (editId) {
            pageTitle.textContent = "Edit Undangan";
            const { data, error } = await supabase
                .from('invitations')
                .select('*')
                .eq('id', editId)
                .single();

            if (error) throw error;
            if (data) {
                titleInput.value = data.title;
                slugInput.value = data.slug;
                slugPreview.textContent = data.slug;
            }
        }
    } catch (error) {
        console.error("Init Error:", error);
        alert("Gagal memuat form: " + error.message);
    } finally {
        hideLoader();
    }
};

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const titleVal = titleInput.value.trim();
    const slugVal = slugInput.value.trim();

    if (!slugVal) {
        alert("URL (Slug) tidak boleh kosong");
        return;
    }

    showLoader();
    const originalBtnText = btnSubmit.innerHTML;
    btnSubmit.innerHTML = 'Menyimpan...';
    btnSubmit.disabled = true;

    try {
        // Cek keunikan slug (Jika buat baru, atau jika edit tapi slug berubah)
        const { data: existingSlug, error: checkError } = await supabase
            .from('invitations')
            .select('id')
            .eq('slug', slugVal)
            .neq('id', editId || '00000000-0000-0000-0000-000000000000') // Abaikan ID milik sendiri
            .maybeSingle();

        if (checkError) throw checkError;
        if (existingSlug) {
            alert(`URL "/${slugVal}/" sudah dipakai orang lain. Silakan pilih URL lain.`);
            return; // Hentikan proses
        }

        const payload = {
            title: titleVal,
            slug: slugVal,
            updated_at: new Date().toISOString()
        };

        if (editId) {
            // Proses UPDATE
            const { error } = await supabase
                .from('invitations')
                .update(payload)
                .eq('id', editId);
            if (error) throw error;
            alert("Perubahan berhasil disimpan.");
        } else {
            // Proses INSERT
            payload.user_id = currentUser.id;
            const { error } = await supabase
                .from('invitations')
                .insert([payload]);
            if (error) throw error;
            alert("Undangan baru berhasil dibuat!");
        }

        // Kembali ke halaman list undangan
        window.location.href = 'invitations.html';

    } catch (error) {
        console.error("Save Error:", error);
        alert("Gagal menyimpan: " + error.message);
    } finally {
        hideLoader();
        btnSubmit.innerHTML = originalBtnText;
        btnSubmit.disabled = false;
    }
});

initForm();
