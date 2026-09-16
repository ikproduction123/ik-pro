/* =====================================================
IK-PRO.ID
CLIENT DASHBOARD
===================================================== */

/* =====================================================
SUPABASE CONFIG
===================================================== */

const SUPABASE_URL = "https://dxmhyjcahmmxbxtxtgxh.supabase.co";

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4bWh5amNhaG1teGJ4dHh0Z3hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1Njc1MDcsImV4cCI6MjEwNTE0MzUwN30.YjpAwvYxLlqlztAQPL2n95q_7u05Jng1U_ToFSKhSOo";

/* =====================================================
INIT SUPABASE
===================================================== */

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

/* =====================================================
ELEMENTS
===================================================== */

const userName = document.getElementById("userName");

const welcomeName = document.getElementById("welcomeName");

const userAvatar = document.getElementById("userAvatar");

const invitationList = document.getElementById("invitationList");

const emptyState = document.getElementById("emptyState");

const totalInvitations = document.getElementById("totalInvitations");

const activeInvitations = document.getElementById("activeInvitations");

const draftInvitations = document.getElementById("draftInvitations");

/* =====================================================
INITIALIZE
===================================================== */

document.addEventListener("DOMContentLoaded", initializeDashboard);

async function initializeDashboard() {
    try {
        /*
         * Ambil user yang sedang login
         */

        const {
            data: { user },
            error
        } = await supabaseClient.auth.getUser();

        if (error || !user) {
            window.location.href = "../login.html";

            return;
        }

        /*
         * Ambil profile
         */

        await loadProfile(user.id);

        /*
         * Ambil undangan
         */

        await loadInvitations(user.id);
    } catch (error) {
        console.error("Dashboard error:", error);
    }
}

/* =====================================================
LOAD PROFILE
===================================================== */

async function loadProfile(userId) {
    const { data, error } = await supabaseClient
        .from("profiles")
        .select("nama_lengkap, email")
        .eq("id", userId)
        .single();

    if (error) {
        console.error("Profile error:", error);

        /*
         * Fallback menggunakan
         * metadata Auth
         */

        const {
            data: { user }
        } = await supabaseClient.auth.getUser();

        const name = user?.user_metadata?.nama_lengkap || user?.email || "User";

        displayUser(name);

        return;
    }

    displayUser(data.nama_lengkap || data.email || "User");
}

/* =====================================================
DISPLAY USER
===================================================== */

function displayUser(name) {
    userName.textContent = name;

    welcomeName.textContent = name;

    /*
     * Ambil huruf pertama
     */

    const firstLetter = name.trim().charAt(0).toUpperCase();

    userAvatar.textContent = firstLetter || "?";
}

/* =====================================================
LOAD INVITATIONS
===================================================== */

async function loadInvitations(userId) {
    const { data, error } = await supabaseClient
        .from("invitations")
        .select("id, slug, title, theme, status, cover_image, created_at")
        .eq("user_id", userId)
        .order("created_at", {
            ascending: false
        });

    if (error) {
        console.error("Invitation error:", error);

        showEmptyState();

        return;
    }

    const invitations = data || [];

    /*
     * Statistik
     */

    totalInvitations.textContent = invitations.length;

    activeInvitations.textContent = invitations.filter(
        invitation => invitation.status === "active"
    ).length;

    draftInvitations.textContent = invitations.filter(
        invitation => invitation.status === "draft"
    ).length;

    /*
     * Tidak ada undangan
     */

    if (invitations.length === 0) {
        showEmptyState();

        return;
    }

    emptyState.style.display = "none";

    invitationList.style.display = "grid";

    renderInvitations(invitations);
}

/* =====================================================
RENDER INVITATIONS
===================================================== */

function renderInvitations(invitations) {
    invitationList.innerHTML = "";

    invitations.forEach(invitation => {
        const card = document.createElement("article");

        card.className = "invitation-card";

        const statusClass = getStatusClass(invitation.status);

        const statusText = getStatusText(invitation.status);

        const themeName = formatTheme(invitation.theme);

        card.innerHTML = `

            <div class="invitation-top">

                <div class="invitation-theme">
                    💌
                </div>

                <span
                    class="status ${statusClass}"
                >
                    ${statusText}
                </span>

            </div>


            <h3>
                ${escapeHTML(invitation.title || "Undangan")}
            </h3>


            <p class="invitation-meta">

                Tema:
                ${escapeHTML(themeName)}

                <br>

                Link:
                /${escapeHTML(invitation.slug)}/

            </p>


            <div
                class="invitation-actions"
            >

                <button
                    class="view-button"
                    data-action="view"
                    data-slug="${escapeHTML(invitation.slug)}"
                >
                    Lihat
                </button>


                <button
                    data-action="edit"
                    data-id="${escapeHTML(invitation.id)}"
                >
                    Edit
                </button>


                <button
                    data-action="copy"
                    data-slug="${escapeHTML(invitation.slug)}"
                >
                    Salin Link
                </button>

            </div>

        `;

        invitationList.appendChild(card);
    });
}

/* =====================================================
EMPTY STATE
===================================================== */

function showEmptyState() {
    invitationList.innerHTML = "";

    invitationList.style.display = "none";

    emptyState.style.display = "block";
}

/* =====================================================
STATUS
===================================================== */

function getStatusClass(status) {
    if (status === "active") {
        return "active";
    }

    if (status === "expired") {
        return "expired";
    }

    return "draft";
}

function getStatusText(status) {
    if (status === "active") {
        return "Aktif";
    }

    if (status === "expired") {
        return "Expired";
    }

    return "Draft";
}

/* =====================================================
THEME
===================================================== */

function formatTheme(theme) {
    if (!theme) {
        return "Modern White";
    }

    return theme
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

/* =====================================================
ESCAPE HTML
===================================================== */

function escapeHTML(value) {
    const div = document.createElement("div");

    div.textContent = value ?? "";

    return div.innerHTML;
}

/* =====================================================
BUTTON ACTION
===================================================== */

invitationList.addEventListener("click", async function (event) {
    const button = event.target.closest("button");

    if (!button) return;

    const action = button.dataset.action;

    /*
     * LIHAT
     */

    if (action === "view") {
        const slug = button.dataset.slug;

        window.open(`../${encodeURIComponent(slug)}/`, "_blank");
    }

    /*
     * EDIT
     */

    if (action === "edit") {
        const id = button.dataset.id;

        /*
         * Halaman editor akan kita
         * buat pada tahap berikutnya.
         */

        window.location.href = `invitation-form.html?id=${encodeURIComponent(
            id
        )}`;
    }

    /*
     * COPY LINK
     */

    if (action === "copy") {
        const slug = button.dataset.slug;

        const url = `${window.location.origin}/${slug}/`;

        try {
            await navigator.clipboard.writeText(url);

            const originalText = button.textContent;

            button.textContent = "✓ Tersalin";

            setTimeout(function () {
                button.textContent = originalText;
            }, 1500);
        } catch (error) {
            console.error(error);

            alert("Gagal menyalin link.");
        }
    }
});

/* =====================================================
CREATE INVITATION
===================================================== */

function createInvitation() {
    /*
     * Halaman ini akan kita buat
     * setelah dashboard.
     */

    window.location.href = "invitation-form.html";
}

document
    .getElementById("createInvitationButton")
    .addEventListener("click", createInvitation);

document
    .getElementById("emptyCreateButton")
    .addEventListener("click", createInvitation);

/* =====================================================
LOGOUT
===================================================== */

document
    .getElementById("logoutButton")
    .addEventListener("click", async function () {
        const button = this;

        button.disabled = true;

        const { error } = await supabaseClient.auth.signOut();

        if (error) {
            console.error(error);

            alert("Gagal keluar dari akun.");

            button.disabled = false;

            return;
        }

        window.location.href = "../login.html";
    });

/* =====================================================
MOBILE SIDEBAR
===================================================== */

const menuToggle = document.getElementById("menuToggle");

const sidebar = document.getElementById("sidebar");

const sidebarOverlay = document.getElementById("sidebarOverlay");

menuToggle.addEventListener("click", function () {
    sidebar.classList.toggle("open");

    sidebarOverlay.classList.toggle("show");
});

sidebarOverlay.addEventListener("click", function () {
    sidebar.classList.remove("open");

    sidebarOverlay.classList.remove("show");
});
