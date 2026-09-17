/* =====================================================
   IK-PRO.ID
   INVITATION FORM
===================================================== */

/* =====================================================
   SUPABASE CONFIG
===================================================== */

const SUPABASE_URL = "https://dxmhyjcahmmxbxtxtgxh.supabase.co";

const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4bWh5amNhaG1teGJ4dHh0Z3hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1Njc1MDcsImV4cCI6MjEwNTE0MzUwN30.YjpAwvYxLlqlztAQPL2n95q_7u05Jng1U_ToFSKhSOo";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

/* =====================================================
   ELEMENT
===================================================== */

const form = document.getElementById("invitationForm");

const titleInput = document.getElementById("title");

const slugInput = document.getElementById("slug");

const themeInput = document.getElementById("theme");

const statusInput = document.getElementById("status");

const coverImageFile = document.getElementById("coverImageFile");

const coverImage = document.getElementById("coverImage");

const coverPreview = document.getElementById("coverPreview");

const uploadStatus = document.getElementById("uploadStatus");

const slugPreview = document.getElementById("slugPreview");

const musicInput = document.getElementById("music");

const musicPlayer = document.getElementById("musicPlayer");

const musicName = document.getElementById("musicName");

const musicAudio = document.getElementById("musicAudio");

const musicPlayBtn = document.getElementById("musicPlayBtn");

const saveBtn = document.getElementById("saveBtn");

const pageTitle = document.getElementById("pageTitle");

const welcomeText = document.getElementById("welcomeText");

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

let oldCoverPath = null;

let isUploading = false;

/* =====================================================
   MUSIC LIST
===================================================== */

const musicList = {
    "romantic-1": {
        name: "Romantic Piano",
        url: "../assets/music/romantic-1.mp3"
    },

    "romantic-2": {
        name: "Wedding Love",
        url: "../assets/music/romantic-2.mp3"
    },

    "javanese-1": {
        name: "Javanese Romantic",
        url: "../assets/music/javanese-1.mp3"
    },

    "javanese-2": {
        name: "Javanese Traditional",
        url: "../assets/music/javanese-2.mp3"
    },

    "instrumental-1": {
        name: "Romantic Instrumental",
        url: "../assets/music/instrumental-1.mp3"
    }
};

/* =====================================================
   INITIALIZE
===================================================== */

document.addEventListener("DOMContentLoaded", init);

async function init() {
    try {
        const {
            data: { user },
            error
        } = await supabaseClient.auth.getUser();

        if (error || !user) {
            window.location.href = "../login.html";

            return;
        }

        currentUser = user;

        /* LOAD PROFILE */

        const { data: profile } = await supabaseClient
            .from("profiles")
            .select("nama_lengkap,email")
            .eq("id", currentUser.id)
            .single();

        if (profile) {
            welcomeText.textContent = `Halo, ${profile.nama_lengkap || "Pengguna"}`;
        }

        /* CHECK EDIT MODE */

        const params = new URLSearchParams(window.location.search);

        invitationId = params.get("id");

        if (invitationId) {
            pageTitle.textContent = "Edit Undangan";

            await loadInvitation();
        }
    } catch (error) {
        console.error(error);

        alert("Terjadi kesalahan saat memuat halaman.");
    }
}

/* =====================================================
   LOAD INVITATION
===================================================== */

async function loadInvitation() {
    const { data, error } = await supabaseClient
        .from("invitations")
        .select("*")
        .eq("id", invitationId)
        .eq("user_id", currentUser.id)
        .single();

    if (error) {
        console.error(error);

        alert("Data undangan tidak ditemukan.");

        window.location.href = "index.html";

        return;
    }

    /* TITLE */

    titleInput.value = data.title || "The Wedding Of";

    /* SLUG */

    slugInput.value = data.slug || "";

    updateSlugPreview();

    /* THEME */

    themeInput.value = data.theme || "modern-white";

    /* STATUS */

    statusInput.value = data.status || "draft";

    /* COVER */

    if (data.cover_image) {
        coverImage.value = data.cover_image;

        showCoverPreview(data.cover_image);
    }

    /* MUSIC */

    musicInput.value = data.music || "";

    updateMusic();
}

/* =====================================================
   SLUG
===================================================== */

slugInput.addEventListener("input", function () {
    let value = this.value
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-");

    this.value = value;

    updateSlugPreview();
});

function updateSlugPreview() {
    const slug = slugInput.value.trim();

    if (!slug) {
        slugPreview.textContent = "URL: -";

        return;
    }

    slugPreview.textContent = `URL: https://ik-pro.my.id/${slug}/`;
}

/* =====================================================
   COVER PREVIEW
===================================================== */

function showCoverPreview(url) {
    if (!url) {
        coverPreview.innerHTML = "";

        coverPreview.classList.remove("show");

        return;
    }

    coverPreview.innerHTML = `

        <img
            src="${escapeHTML(url)}"
            alt="Cover Image"
        >

        <button
            type="button"
            class="remove-cover"
            id="removeCoverBtn"
            title="Hapus cover"
        >
            <i class="fa-solid fa-trash"></i>
        </button>

    `;

    coverPreview.classList.add("show");

    document
        .getElementById("removeCoverBtn")
        .addEventListener("click", removeCover);
}

/* =====================================================
   SELECT COVER
===================================================== */

coverImageFile.addEventListener("change", async function () {
    const file = this.files[0];

    if (!file) {
        return;
    }

    /* VALIDATE TYPE */

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
        alert("Format harus JPG, PNG atau WebP.");

        this.value = "";

        return;
    }

    /* VALIDATE SIZE */

    if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran gambar maksimal 5 MB.");

        this.value = "";

        return;
    }

    /* LOCAL PREVIEW */

    const localURL = URL.createObjectURL(file);

    showCoverPreview(localURL);

    uploadStatus.textContent = "Gambar dipilih. Akan diupload saat disimpan.";
});

/* =====================================================
   REMOVE COVER
===================================================== */

function removeCover() {
    coverImageFile.value = "";

    coverImage.value = "";

    oldCoverPath = null;

    coverPreview.innerHTML = "";

    coverPreview.classList.remove("show");

    uploadStatus.textContent = "Cover akan dihapus saat undangan disimpan.";
}

/* =====================================================
   UPLOAD COVER
===================================================== */

async function uploadCover(file) {
    if (!file) {
        return null;
    }

    if (!invitationId) {
        throw new Error("Invitation ID belum tersedia.");
    }

    isUploading = true;

    uploadStatus.textContent = "Mengupload cover...";

    /*
       Nama file dibuat unik
    */

    const extension = file.name.split(".").pop().toLowerCase();

    const fileName = `cover-${Date.now()}.${extension}`;

    const filePath = `${currentUser.id}/${invitationId}/cover/${fileName}`;

    const { error } = await supabaseClient.storage
        .from("invitation-assets")
        .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false
        });

    isUploading = false;

    if (error) {
        console.error("Upload error:", error);

        throw error;
    }

    /*
       Ambil public URL
    */

    const { data } = supabaseClient.storage
        .from("invitation-assets")
        .getPublicUrl(filePath);

    uploadStatus.textContent = "Cover berhasil diupload.";

    return {
        url: data.publicUrl,
        path: filePath
    };
}

/* =====================================================
   MUSIC
===================================================== */

musicInput.addEventListener("change", updateMusic);

function updateMusic() {
    const musicId = musicInput.value;

    if (!musicId) {
        musicName.textContent = "Tanpa Musik";

        musicAudio.pause();

        musicAudio.removeAttribute("src");

        musicPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';

        return;
    }

    const selectedMusic = musicList[musicId];

    if (!selectedMusic) {
        return;
    }

    musicName.textContent = selectedMusic.name;

    musicAudio.src = selectedMusic.url;

    musicAudio.load();

    musicPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
}

/* =====================================================
   MUSIC PLAY
===================================================== */

musicPlayBtn.addEventListener("click", async function () {
    if (!musicAudio.src) {
        alert("Silakan pilih musik terlebih dahulu.");

        return;
    }

    if (musicAudio.paused) {
        try {
            await musicAudio.play();

            musicPlayBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        } catch (error) {
            console.error(error);

            alert("File musik belum tersedia.");
        }
    } else {
        musicAudio.pause();

        musicPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    }
});

musicAudio.addEventListener("ended", function () {
    musicPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
});

/* =====================================================
   SAVE FORM
===================================================== */

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (isUploading) {
        return;
    }

    const title = titleInput.value.trim();

    const slug = slugInput.value.trim();

    const theme = themeInput.value;

    const status = statusInput.value;

    const music = musicInput.value;

    /* VALIDATE */

    if (!title) {
        alert("Judul undangan wajib diisi.");

        titleInput.focus();

        return;
    }

    if (!slug) {
        alert("Slug wajib diisi.");

        slugInput.focus();

        return;
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
        alert("Slug hanya boleh berisi huruf kecil, angka, dan tanda -.");

        slugInput.focus();

        return;
    }

    /* DISABLE BUTTON */

    saveBtn.disabled = true;

    saveBtn.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            <span>Menyimpan...</span>
        `;

    try {
        /* =========================================
               CREATE
            ========================================= */

        if (!invitationId) {
            const { data, error } = await supabaseClient
                .from("invitations")
                .insert({
                    user_id: currentUser.id,

                    title,

                    slug,

                    theme,

                    status,

                    music: music || null
                })
                .select()
                .single();

            if (error) {
                throw error;
            }

            invitationId = data.id;

            /*
                   Setelah invitation dibuat,
                   baru upload cover.
                */

            if (coverImageFile.files[0]) {
                const uploaded = await uploadCover(coverImageFile.files[0]);

                await supabaseClient
                    .from("invitations")
                    .update({
                        cover_image: uploaded.url
                    })
                    .eq("id", invitationId)
                    .eq("user_id", currentUser.id);

                coverImage.value = uploaded.url;
            }
        } else {
            /* =========================================
               UPDATE
            ========================================= */
            let coverURL = coverImage.value || null;

            /*
                   Upload cover baru
                */

            if (coverImageFile.files[0]) {
                const uploaded = await uploadCover(coverImageFile.files[0]);

                coverURL = uploaded.url;

                /*
                       Hapus cover lama
                       jika ada
                    */

                if (oldCoverPath) {
                    await supabaseClient.storage
                        .from("invitation-assets")
                        .remove([oldCoverPath]);
                }
            }

            /*
                   Update database
                */

            const { error } = await supabaseClient
                .from("invitations")
                .update({
                    title,

                    slug,

                    theme,

                    status,

                    music: music || null,

                    cover_image: coverURL
                })
                .eq("id", invitationId)
                .eq("user_id", currentUser.id);

            if (error) {
                throw error;
            }
        }

        /* =========================================
               SUCCESS
            ========================================= */

        alert("Undangan berhasil disimpan! 🎉");

        window.location.href = "index.html";
    } catch (error) {
        console.error(error);

        if (error.code === "23505") {
            alert("Slug tersebut sudah digunakan. Silakan gunakan slug lain.");
        } else {
            alert("Gagal menyimpan undangan:\n" + error.message);
        }

        saveBtn.disabled = false;

        saveBtn.innerHTML = `
                <i class="fa-solid fa-floppy-disk"></i>
                <span>Simpan Undangan</span>
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

closeSidebar.addEventListener("click", closeSidebarMenu);

overlay.addEventListener("click", closeSidebarMenu);

function closeSidebarMenu() {
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

window.location.href =
    `couple-form.html?id=${invitationId}`;
