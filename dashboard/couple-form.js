/* =====================================================
   IK-PRO.ID
   COUPLE FORM
===================================================== */

/* =====================================================
   SUPABASE
===================================================== */

const SUPABASE_URL = "https://dxmhyjcahmmxbxtxtgxh.supabase.co";

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4bWh5amNhaG1teGJ4dHh0Z3hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1Njc1MDcsImV4cCI6MjEwNTE0MzUwN30.YjpAwvYxLlqlztAQPL2n95q_7u05Jng1U_ToFSKhSOo";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

/* =====================================================
   ELEMENT
===================================================== */

const coupleForm = document.getElementById("coupleForm");

const saveBtn = document.getElementById("saveBtn");

const welcomeText = document.getElementById("welcomeText");

/* GROOM */

const groomName = document.getElementById("groomName");

const groomFullName = document.getElementById("groomFullName");

const groomFather = document.getElementById("groomFather");

const groomMother = document.getElementById("groomMother");

const groomInstagram = document.getElementById("groomInstagram");

const groomPhoto = document.getElementById("groomPhoto");

const groomPhotoFile = document.getElementById("groomPhotoFile");

const groomPreview = document.getElementById("groomPreview");

const groomUploadStatus = document.getElementById("groomUploadStatus");

/* BRIDE */

const brideName = document.getElementById("brideName");

const brideFullName = document.getElementById("brideFullName");

const brideFather = document.getElementById("brideFather");

const brideMother = document.getElementById("brideMother");

const brideInstagram = document.getElementById("brideInstagram");

const bridePhoto = document.getElementById("bridePhoto");

const bridePhotoFile = document.getElementById("bridePhotoFile");

const bridePreview = document.getElementById("bridePreview");

const brideUploadStatus = document.getElementById("brideUploadStatus");

/* SIDEBAR */

const menuBtn = document.getElementById("menuBtn");

const closeSidebar = document.getElementById("closeSidebar");

const sidebar = document.getElementById("sidebar");

const overlay = document.getElementById("overlay");

const logoutBtn = document.getElementById("logoutBtn");

/* =====================================================
   GLOBAL
===================================================== */

let currentUser = null;

let invitationId = null;

let coupleId = null;

let oldGroomPath = null;

let oldBridePath = null;

/* =====================================================
   INITIALIZE
===================================================== */

document.addEventListener("DOMContentLoaded", init);

async function init() {
    try {
        /* ===============================
           AUTH
        =============================== */

        const {
            data: { user },
            error
        } = await supabaseClient.auth.getUser();

        if (error || !user) {
            window.location.href = "../login.html";

            return;
        }

        currentUser = user;

        /* ===============================
           INVITATION ID
        =============================== */

        const params = new URLSearchParams(window.location.search);

        invitationId = params.get("id");

        if (!invitationId) {
            alert("ID undangan tidak ditemukan.");

            window.location.href = "index.html";

            return;
        }

        /* ===============================
           PROFILE
        =============================== */

        const { data: profile } = await supabaseClient
            .from("profiles")
            .select("nama_lengkap")
            .eq("id", currentUser.id)
            .single();

        if (profile) {
            welcomeText.textContent = `Halo, ${profile.nama_lengkap || "Pengguna"}`;
        }

        /* ===============================
           VERIFY INVITATION
        =============================== */

        const { data: invitation, error: invitationError } =
            await supabaseClient
                .from("invitations")
                .select("id,title,user_id")
                .eq("id", invitationId)
                .eq("user_id", currentUser.id)
                .single();

        if (invitationError || !invitation) {
            alert("Anda tidak memiliki akses ke undangan ini.");

            window.location.href = "index.html";

            return;
        }

        /* ===============================
           LOAD COUPLE
        =============================== */

        await loadCouple();
    } catch (error) {
        console.error(error);

        alert("Gagal memuat data.");
    }
}

/* =====================================================
   LOAD COUPLE
===================================================== */

async function loadCouple() {
    const { data, error } = await supabaseClient
        .from("couples")
        .select("*")
        .eq("invitation_id", invitationId)
        .maybeSingle();

    if (error) {
        console.error("Load couple:", error);

        alert("Gagal mengambil data mempelai.");

        return;
    }

    if (!data) {
        return;
    }

    coupleId = data.id;

    /* GROOM */

    groomName.value = data.groom_name || "";

    groomFullName.value = data.groom_full_name || "";

    groomFather.value = data.groom_father || "";

    groomMother.value = data.groom_mother || "";

    groomInstagram.value = data.groom_instagram || "";

    groomPhoto.value = data.groom_photo || "";

    if (data.groom_photo) {
        showPhotoPreview(groomPreview, data.groom_photo);

        oldGroomPath = getStoragePath(data.groom_photo);
    }

    /* BRIDE */

    brideName.value = data.bride_name || "";

    brideFullName.value = data.bride_full_name || "";

    brideFather.value = data.bride_father || "";

    brideMother.value = data.bride_mother || "";

    brideInstagram.value = data.bride_instagram || "";

    bridePhoto.value = data.bride_photo || "";

    if (data.bride_photo) {
        showPhotoPreview(bridePreview, data.bride_photo);

        oldBridePath = getStoragePath(data.bride_photo);
    }
}

/* =====================================================
   PHOTO PREVIEW
===================================================== */

function showPhotoPreview(element, url) {
    if (!url) {
        return;
    }

    element.innerHTML = `
        <img
            src="${escapeHTML(url)}"
            alt="Foto Mempelai"
        >
    `;
}

/* =====================================================
   GROOM PHOTO
===================================================== */

groomPhotoFile.addEventListener("change", function () {
    const file = this.files[0];

    if (!file) {
        return;
    }

    if (!validateImage(file)) {
        this.value = "";

        return;
    }

    const url = URL.createObjectURL(file);

    showPhotoPreview(groomPreview, url);

    groomUploadStatus.textContent = "Foto siap diupload saat disimpan.";
});

/* =====================================================
   BRIDE PHOTO
===================================================== */

bridePhotoFile.addEventListener("change", function () {
    const file = this.files[0];

    if (!file) {
        return;
    }

    if (!validateImage(file)) {
        this.value = "";

        return;
    }

    const url = URL.createObjectURL(file);

    showPhotoPreview(bridePreview, url);

    brideUploadStatus.textContent = "Foto siap diupload saat disimpan.";
});

/* =====================================================
   VALIDATE IMAGE
===================================================== */

function validateImage(file) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
        alert("Format foto harus JPG, PNG atau WebP.");

        return false;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran foto maksimal 5 MB.");

        return false;
    }

    return true;
}

/* =====================================================
   UPLOAD PHOTO
===================================================== */

async function uploadPhoto(file, type) {
    if (!file) {
        return null;
    }

    const extension = file.name.split(".").pop().toLowerCase();

    const fileName = `${type}-${Date.now()}.${extension}`;

    const filePath = `${currentUser.id}/${invitationId}/${type}/${fileName}`;

    const { error } = await supabaseClient.storage
        .from("invitation-assets")
        .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false
        });

    if (error) {
        console.error("Upload photo error:", error);

        throw error;
    }

    const { data } = supabaseClient.storage
        .from("invitation-assets")
        .getPublicUrl(filePath);

    return {
        url: data.publicUrl,
        path: filePath
    };
}

/* =====================================================
   STORAGE PATH
===================================================== */

function getStoragePath(url) {
    if (!url) {
        return null;
    }

    const marker = "/storage/v1/object/public/invitation-assets/";

    const index = url.indexOf(marker);

    if (index === -1) {
        return null;
    }

    return url.substring(index + marker.length);
}

/* =====================================================
   SAVE
===================================================== */

coupleForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    saveBtn.disabled = true;

    saveBtn.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            <span>Menyimpan...</span>
        `;

    try {
        let groomPhotoURL = groomPhoto.value || null;

        let bridePhotoURL = bridePhoto.value || null;

        /* ===============================
               UPLOAD GROOM
            =============================== */

        if (groomPhotoFile.files[0]) {
            groomUploadStatus.textContent = "Mengupload foto pria...";

            const uploaded = await uploadPhoto(
                groomPhotoFile.files[0],
                "groom"
            );

            groomPhotoURL = uploaded.url;

            /* DELETE OLD */

            if (oldGroomPath) {
                await supabaseClient.storage
                    .from("invitation-assets")
                    .remove([oldGroomPath]);
            }
        }

        /* ===============================
               UPLOAD BRIDE
            =============================== */

        if (bridePhotoFile.files[0]) {
            brideUploadStatus.textContent = "Mengupload foto wanita...";

            const uploaded = await uploadPhoto(
                bridePhotoFile.files[0],
                "bride"
            );

            bridePhotoURL = uploaded.url;

            /* DELETE OLD */

            if (oldBridePath) {
                await supabaseClient.storage
                    .from("invitation-assets")
                    .remove([oldBridePath]);
            }
        }

        /* ===============================
               DATA
            =============================== */

        const payload = {
            invitation_id: invitationId,

            groom_name: groomName.value.trim() || null,

            groom_full_name: groomFullName.value.trim() || null,

            groom_father: groomFather.value.trim() || null,

            groom_mother: groomMother.value.trim() || null,

            groom_photo: groomPhotoURL,

            groom_instagram: groomInstagram.value.trim() || null,

            bride_name: brideName.value.trim() || null,

            bride_full_name: brideFullName.value.trim() || null,

            bride_father: brideFather.value.trim() || null,

            bride_mother: brideMother.value.trim() || null,

            bride_photo: bridePhotoURL,

            bride_instagram: brideInstagram.value.trim() || null
        };

        /* ===============================
               INSERT / UPDATE
            =============================== */

        let result;

        if (coupleId) {
            result = await supabaseClient
                .from("couples")
                .update(payload)
                .eq("id", coupleId)
                .eq("invitation_id", invitationId);
        } else {
            result = await supabaseClient.from("couples").insert(payload);
        }

        if (result.error) {
            throw result.error;
        }

        alert("Data mempelai berhasil disimpan! 🎉");

        window.location.href = `event-form.html?id=${encodeURIComponent(invitationId)}`;
    } catch (error) {
        console.error("Save couple error:", error);

        alert("Gagal menyimpan data mempelai:\n\n" + error.message);

        saveBtn.disabled = false;

        saveBtn.innerHTML = `
                <i class="fa-solid fa-floppy-disk"></i>
                <span>Simpan Mempelai</span>
            `;
    }
});

/* =====================================================
   SIDEBAR
===================================================== */

menuBtn.addEventListener("click", () => {
    sidebar.classList.add("open");

    overlay.classList.add("show");
});

closeSidebar.addEventListener("click", closeMenu);

overlay.addEventListener("click", closeMenu);

function closeMenu() {
    sidebar.classList.remove("open");

    overlay.classList.remove("show");
}

/* =====================================================
   LOGOUT
===================================================== */

logoutBtn.addEventListener("click", async function () {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        alert("Gagal logout.");

        return;
    }

    window.location.href = "../login.html";
});

/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
