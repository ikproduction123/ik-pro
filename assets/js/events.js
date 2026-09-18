import { supabase } from './supabase.js';
import { getCurrentUser } from './auth.js';

console.log("IK-PRO.ID - Events List Module Loaded");

const globalLoader = document.getElementById('globalLoader');
const container = document.getElementById('eventContainer');
const btnAddEvent = document.getElementById('btnAddEvent');

const urlParams = new URLSearchParams(window.location.search);
const invId = urlParams.get('inv_id');

const showLoader = () => globalLoader.classList.add('show');
const hideLoader = () => globalLoader.classList.remove('show');

const loadEvents = async () => {
    if (!invId) {
        alert("ID Undangan tidak ditemukan!");
        window.location.href = 'invitations.html';
        return;
    }

    showLoader();
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error("Silakan login kembali.");

        // Set href tombol tambah acara
        btnAddEvent.href = `event-form.html?inv_id=${invId}`;

        // Ambil data acara
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('invitation_id', invId)
            .order('created_at', { ascending: true }); // Urutkan berdasarkan waktu input

        if (error) throw error;
        renderEvents(data);
    } catch (error) {
        console.error("Error:", error);
        container.innerHTML = `<div class="empty-state">Gagal memuat data: ${error.message}</div>`;
    } finally {
        hideLoader();
    }
};

const renderEvents = (events) => {
    if (events.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fa-solid fa-calendar-xmark" style="font-size: 3rem; margin-bottom: 15px;"></i>
                <h3>Belum ada acara</h3>
                <p>Silakan klik Tambah Acara untuk memasukkan jadwal Akad atau Resepsi.</p>
            </div>
        `;
        return;
    }

    let html = '';
    events.forEach(evt => {
        // Format waktu selesai
        const endTime = evt.end_time ? evt.end_time.substring(0,5) : 'Selesai';
        const startTime = evt.start_time ? evt.start_time.substring(0,5) : '';

        html += `
            <div class="data-card">
                <div class="data-card-header">
                    <div class="data-card-title">${evt.name}</div>
                </div>
                <div class="data-card-body">
                    <p><i class="fa-solid fa-calendar"></i> ${evt.date}</p>
                    <p><i class="fa-solid fa-clock"></i> ${startTime} - ${endTime} ${evt.timezone}</p>
                    <p><i class="fa-solid fa-map-location-dot"></i> ${evt.location_name}</p>
                </div>
                <div class="data-card-actions">
                    <a href="event-form.html?inv_id=${invId}&event_id=${evt.id}" class="btn-outline btn-small"><i class="fa-solid fa-pen"></i> Edit</a>
                    <button class="btn-danger btn-small btn-delete" data-id="${evt.id}"><i class="fa-solid fa-trash"></i> Hapus</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
};

// Fungsi Hapus Acara
container.addEventListener('click', async (e) => {
    const deleteBtn = e.target.closest('.btn-delete');
    if (!deleteBtn) return;

    const id = deleteBtn.dataset.id;
    if (confirm("Hapus acara ini dari undangan?")) {
        showLoader();
        try {
            const { error } = await supabase.from('events').delete().eq('id', id);
            if (error) throw error;
            loadEvents();
        } catch (error) {
            console.error("Gagal menghapus:", error);
            alert("Gagal menghapus acara.");
            hideLoader();
        }
    }
});

loadEvents();
