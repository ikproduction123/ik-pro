import { supabase } from "./supabase.js";
import { getCurrentUser, logoutUser } from "./auth.js";

console.log("IK-PRO.ID - Invitations Module Loaded");

const globalLoader = document.getElementById("globalLoader");
const container = document.getElementById("invitationContainer");

const showLoader = () => globalLoader.classList.add("show");
const hideLoader = () => globalLoader.classList.remove("show");

const loadInvitations = async () => {
    showLoader();
    try {
        const user = await getCurrentUser();
        if (!user) {
            window.location.href = "../login.html";
            return;
        }

        const { data, error } = await supabase
            .from("invitations")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) throw error;
        renderInvitations(data);
    } catch (error) {
        console.error("Error mengambil undangan:", error);
        container.innerHTML = `<div class="empty-state">Gagal memuat data: ${error.message}</div>`;
    } finally {
        hideLoader();
    }
};

const renderInvitations = invitations => {
    if (invitations.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fa-solid fa-folder-open" style="font-size: 3rem; margin-bottom: 15px;"></i>
                <h3>Belum ada undangan</h3>
                <p>Mulai dengan membuat undangan digital pertama Anda.</p>
            </div>
        `;
        return;
    }

    let html = "";
    invitations.forEach(inv => {
        const statusBadge =
            inv.status === "published" ? "badge-published" : "badge-draft";
        const url = `https://ik-pro.my.id/${inv.slug}/`;

        html += `
            <div class="data-card">
                <div class="data-card-header">
                    <div class="data-card-title">${inv.title}</div>
                    <span class="data-card-badge ${statusBadge}">${inv.status}</span>
                </div>
                <div class="data-card-body">
                    <p><i class="fa-solid fa-link"></i> <a href="${url}" target="_blank" style="color:var(--primary);text-decoration:underline;">/${inv.slug}</a></p>
                    <p><i class="fa-solid fa-palette"></i> Tema: ${inv.theme}</p>
                </div>
                <div class="data-card-actions" style="flex-wrap: wrap; gap: 8px;">
                    <a href="invitation-form.html?id=${inv.id}" class="btn-outline btn-small"><i class="fa-solid fa-pen"></i> Info</a>
                    <a href="couple-form.html?inv_id=${inv.id}" class="btn-primary btn-small"><i class="fa-solid fa-heart"></i> Mempelai</a>
                    <a href="events.html?inv_id=${inv.id}" class="btn-primary btn-small" style="background-color: var(--secondary); border-color: var(--secondary);"><i class="fa-solid fa-calendar-days"></i> Acara</a>
                    <button class="btn-danger btn-small btn-delete" data-id="${inv.id}"><i class="fa-solid fa-trash"></i> Hapus</button>
                </div>

            </div>
        `;
    });

    container.innerHTML = html;
};

container.addEventListener("click", async e => {
    const deleteBtn = e.target.closest(".btn-delete");
    if (!deleteBtn) return;

    const id = deleteBtn.dataset.id;
    if (
        confirm(
            "Apakah Anda yakin ingin menghapus undangan ini? Semua data terkait (mempelai, acara, galeri) akan ikut terhapus."
        )
    ) {
        showLoader();
        try {
            const { error } = await supabase
                .from("invitations")
                .delete()
                .eq("id", id);
            if (error) throw error;
            loadInvitations();
        } catch (error) {
            console.error("Gagal menghapus:", error);
            alert("Gagal menghapus undangan: " + error.message);
            hideLoader();
        }
    }
});

document
    .getElementById("btnLogoutSidebar")
    ?.addEventListener("click", logoutUser);
document
    .getElementById("btnLogoutMobile")
    ?.addEventListener("click", logoutUser);

loadInvitations();
