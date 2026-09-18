import { supabase } from './supabase.js';

console.log("IK-PRO.ID - Public Invitation Viewer Loaded");

const urlParams = new URLSearchParams(window.location.search);

// Ekstrak slug dari URL Path Vercel (contoh: /anisa-bagas/)
const pathSegments = window.location.pathname.split('/').filter(Boolean);
const invSlug = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : null;

const coverScreen = document.getElementById('coverScreen');
const invContainer = document.getElementById('invContainer');
const btnOpenInvitation = document.getElementById('btnOpenInvitation');

// Tangkap nama tamu dari parameter ?to=Nama-Tamu
const guestParam = urlParams.get('to');
if (guestParam) {
    const formattedGuestName = decodeURIComponent(guestParam).replace(/-/g, ' ');
    document.getElementById('guestName').textContent = formattedGuestName;
    document.getElementById('rsvpName').value = formattedGuestName;
    document.getElementById('wishName').value = formattedGuestName;
}

btnOpenInvitation.addEventListener('click', () => {
    coverScreen.style.opacity = '0';
    setTimeout(() => {
        coverScreen.style.display = 'none';
        invContainer.style.display = 'block';
    }, 500);
});

let globalInvitationId = null;

const loadPublicData = async () => {
    if (!invSlug || invSlug === 'invitation.html') {
        alert("Link undangan tidak valid atau tidak ditemukan!");
        return;
    }

    try {
        // 1. Ambil Data Utama Undangan Berdasarkan Slug
        const { data: inv, error: invError } = await supabase
            .from('invitations')
            .select('*')
            .eq('slug', invSlug)
            .single();
            
        if (invError) throw invError;
        
        globalInvitationId = inv.id;

        document.title = `Pernikahan ${inv.title} - IK-PRO.ID`;
        document.getElementById('mainCoupleTitle').textContent = inv.title;
        if (inv.banner_url) {
            document.getElementById('heroSection').style.backgroundImage = `url('${inv.banner_url}')`;
        }

        // 2. Ambil Data Mempelai
        const { data: couples } = await supabase.from('couples').select('*').eq('invitation_id', globalInvitationId);
        if (couples && couples.length > 0) {
            const groom = couples.find(c => c.gender === 'male' || c.role === 'groom') || couples[0];
            const bride = couples.find(c => c.gender === 'female' || c.role === 'bride') || couples[1] || couples[0];

            if (groom) {
                document.getElementById('groomFullName').textContent = groom.name;
                document.getElementById('groomParents').textContent = `Putra dari ${groom.parents || '-'}`;
                if (groom.photo_url) document.getElementById('groomImg').src = groom.photo_url;
            }
            if (bride) {
                document.getElementById('brideFullName').textContent = bride.name;
                document.getElementById('brideParents').textContent = `Putri dari ${bride.parents || '-'}`;
                if (bride.photo_url) document.getElementById('brideImg').src = bride.photo_url;
            }
            document.getElementById('coverCoupleNames').textContent = `${groom?.name?.split(' ')[0]} & ${bride?.name?.split(' ')[0]}`;
        }

        // 3. Ambil Data Acara
        const { data: events } = await supabase.from('events').select('*').eq('invitation_id', globalInvitationId);
        const eventsContainer = document.getElementById('eventsContainer');
        if (events && events.length > 0) {
            let html = '';
            events.forEach(evt => {
                html += `
                    <div class="event-card">
                        <h3 style="color: var(--primary, #d4af37); margin-bottom: 10px;"><i class="fa-solid fa-calendar-check"></i> ${evt.name}</h3>
                        <p><i class="fa-solid fa-calendar"></i> ${evt.date}</p>
                        <p><i class="fa-solid fa-clock"></i> ${evt.start_time?.substring(0,5)} - ${evt.end_time ? evt.end_time.substring(0,5) : 'Selesai'} ${evt.timezone || ''}</p>
                        <p><i class="fa-solid fa-location-dot"></i> <strong>${evt.location_name}</strong></p>
                        <p style="font-size: 0.85rem; color: #666; margin-top: 5px;">${evt.address}</p>
                        ${evt.google_maps_url ? `<a href="${evt.google_maps_url}" target="_blank" class="btn-outline btn-small" style="display:inline-block; margin-top:10px;"><i class="fa-solid fa-map"></i> Buka Google Maps</a>` : ''}
                    </div>
                `;
            });
            eventsContainer.innerHTML = html;
        }

        // 4. Ambil Data Love Stories
        const { data: stories } = await supabase.from('love_stories').select('*').eq('invitation_id', globalInvitationId).order('date', { ascending: true });
        const storiesContainer = document.getElementById('storiesContainer');
        if (stories && stories.length > 0) {
            let html = '';
            stories.forEach(st => {
                html += `
                    <div style="background: white; border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin-bottom: 15px; text-align: left;">
                        ${st.image_url ? `<img src="${st.image_url}" style="width:100%; height:150px; object-fit:cover; border-radius:6px; margin-bottom:10px;" alt="Story">` : ''}
                        <h4 style="color: var(--primary);">${st.title} <span style="font-size:0.75rem; color:#888; font-weight:normal;">(${st.date})</span></h4>
                        <p style="font-size:0.9rem; margin-top:5px; color:#555;">${st.story}</p>
                    </div>
                `;
            });
            storiesContainer.innerHTML = html;
        } else {
            document.getElementById('storySectionWrapper').style.display = 'none';
        }

        // 5. Ambil Data Galeri
        const { data: galleries } = await supabase.from('galleries').select('*').eq('invitation_id', globalInvitationId);
        const galleryContainer = document.getElementById('galleryContainer');
        if (galleries && galleries.length > 0) {
            let html = '';
            galleries.forEach(g => {
                html += `<div class="gallery-item"><img src="${g.image_url}" alt="Gallery"></div>`;
            });
            galleryContainer.innerHTML = html;
        } else {
            document.getElementById('gallerySectionWrapper').style.display = 'none';
        }

        // 6. Ambil Ucapan
        loadWishesPublic(globalInvitationId);

    } catch (err) {
        console.error("Gagal memuat undangan:", err);
    }
};

const loadWishesPublic = async (invId) => {
    const { data: wishes } = await supabase.from('wishes').select('*').eq('invitation_id', invId).order('created_at', { ascending: false });
    const listContainer = document.getElementById('wishesListContainer');
    if (wishes && wishes.length > 0) {
        let html = '';
        wishes.forEach(w => {
            html += `
                <div class="wish-box">
                    <strong>${w.name}</strong>
                    <p style="margin: 5px 0 0 0; font-size: 0.9rem; color: #444;">"${w.message || w.wish}"</p>
                </div>
            `;
        });
        listContainer.innerHTML = html;
    } else {
        listContainer.innerHTML = `<p style="color: #888; font-size: 0.9rem;">Belum ada ucapan.</p>`;
    }
};

// Submit RSVP
document.getElementById('rsvpForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!globalInvitationId) return;
    try {
        const payload = {
            invitation_id: globalInvitationId,
            name: document.getElementById('rsvpName').value.trim(),
            status: document.getElementById('rsvpStatus').value,
            pax: parseInt(document.getElementById('rsvpPax').value) || 1
        };
        const { error } = await supabase.from('rsvps').insert([payload]);
        if (error) throw error;
        alert("Konfirmasi kehadiran berhasil dikirim. Terima kasih!");
    } catch (err) {
        alert("Gagal mengirim RSVP: " + err.message);
    }
});

// Submit Ucapan
document.getElementById('wishForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!globalInvitationId) return;
    try {
        const payload = {
            invitation_id: globalInvitationId,
            name: document.getElementById('wishName').value.trim(),
            message: document.getElementById('wishMessage').value.trim()
        };
        const { error } = await supabase.from('wishes').insert([payload]);
        if (error) throw error;
        alert("Ucapan & doa berhasil dikirim!");
        document.getElementById('wishMessage').value = '';
        loadWishesPublic(globalInvitationId);
    } catch (err) {
        alert("Gagal mengirim ucapan: " + err.message);
    }
});

loadPublicData();
