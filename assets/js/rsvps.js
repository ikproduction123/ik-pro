import { supabase } from './supabase.js';
import { getCurrentUser } from './auth.js';

console.log("IK-PRO.ID - RSVPs Module Loaded");

const globalLoader = document.getElementById('globalLoader');
const container = document.getElementById('rsvpContainer');
const urlParams = new URLSearchParams(window.location.search);
const invId = urlParams.get('inv_id');

const showLoader = () => globalLoader.classList.add('show');
const hideLoader = () => globalLoader.classList.remove('show');

const loadRsvps = async () => {
    if (!invId) { window.location.href = 'invitations.html'; return; }
    showLoader();
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error("Silakan login kembali.");

        const { data, error } = await supabase.from('rsvps').select('*').eq('invitation_id', invId).order('created_at', { ascending: false });
        if (error) throw error;

        if (data.length === 0) {
            container.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;"><i class="fa-solid fa-users-slash" style="font-size: 3rem; margin-bottom: 15px;"></i><h3>Belum ada data RSVP</h3><p>Belum ada tamu yang mengisi konfirmasi kehadiran.</p></div>`;
            return;
        }

        let html = '';
        data.forEach(item => {
            let badgeColor = '#e74c3c';
            let statusText = 'Tidak Hadir';
            if (item.status === 'Hadir' || item.status === 'attending' || item.status === 'yes') {
                badgeColor = '#2ecc71';
                statusText = 'Hadir';
            }

            html += `
                <div class="data-card">
                    <div class="data-card-header">
                        <div class="data-card-title">${item.name}</div>
                        <span style="background: ${badgeColor}; color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem;">${statusText}</span>
                    </div>
                    <div class="data-card-body">
                        <p><i class="fa-solid fa-user-group"></i> Jumlah Hadir: <strong>${item.pax || 1} orang</strong></p>
                        ${item.note ? `<p style="margin-top: 8px; font-style: italic; color: var(--gray);">"${item.note}"</p>` : ''}
                    </div>
                    <div class="data-card-actions">
                        <button class="btn-danger btn-small btn-delete" data-id="${item.id}" style="width: 100%;"><i class="fa-solid fa-trash"></i> Hapus RSVP</button>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    } catch (err) {
        console.error(err);
        container.innerHTML = `<div class="empty-state">Gagal memuat data RSVP.</div>`;
    } finally {
        hideLoader();
    }
};

container.addEventListener('click', async (e) => {
    const btn = e.target.closest('.btn-delete');
    if (!btn) return;
    if (confirm("Hapus data RSVP ini?")) {
        showLoader();
        try {
            const { error } = await supabase.from('rsvps').delete().eq('id', btn.dataset.id);
            if (error) throw error;
            loadRsvps();
        } catch (err) {
            alert("Gagal menghapus data.");
            hideLoader();
        }
    }
});

loadRsvps();
