/* =====================================================
IK-PRO.ID
INVITATION FORM
===================================================== */

/* =====================================================
SUPABASE CONFIG
===================================================== */

const SUPABASE_URL =
"https://dxmhyjcahmmxbxtxtgxh.supabase.co";

const SUPABASE_ANON_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4bWh5amNhaG1teGJ4dHh0Z3hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1Njc1MDcsImV4cCI6MjEwNTE0MzUwN30.YjpAwvYxLlqlztAQPL2n95q_7u05Jng1U_ToFSKhSOo";

const supabaseClient =
window.supabase.createClient(
SUPABASE_URL,
SUPABASE_ANON_KEY
);

/* =====================================================
ELEMENTS
===================================================== */

const form =
document.getElementById(
"invitationForm"
);

const titleInput =
document.getElementById(
"title"
);

const slugInput =
document.getElementById(
"slug"
);

const slugPreview =
document.getElementById(
"slugPreview"
);

const formMessage =
document.getElementById(
"formMessage"
);

const saveButton =
document.getElementById(
"saveButton"
);

/* =====================================================
STATE
===================================================== */

let currentUser = null;

let editingInvitationId = null;

/* =====================================================
INIT
===================================================== */

document.addEventListener(
"DOMContentLoaded",
initialize
);

async function initialize() {

/*
 * Pastikan user login
 */

const {
    data: {
        user
    },
    error
} =
    await supabaseClient.auth
        .getUser();


if (error || !user) {

    window.location.href =
        "../login.html";

    return;

}


currentUser = user;


/*
 * Tampilkan profile
 */

await loadProfile(
    user.id
);


/*
 * Cek apakah halaman
 * sedang edit invitation
 */

const params =
    new URLSearchParams(
        window.location.search
    );


editingInvitationId =
    params.get("id");


if (editingInvitationId) {

    await loadInvitation(
        editingInvitationId,
        user.id
    );

}


updateSlugPreview();

}

/* =====================================================
PROFILE
===================================================== */

async function loadProfile(
userId
) {

const {
    data,
    error
} =
    await supabaseClient
        .from("profiles")
        .select(
            "nama_lengkap, email"
        )
        .eq("id", userId)
        .single();


if (error) {

    console.error(
        error
    );

    return;

}


const name =
    data.nama_lengkap ||
    data.email ||
    "User";


document
    .getElementById("userName")
    .textContent = name;


document
    .getElementById("userAvatar")
    .textContent =
        name
            .trim()
            .charAt(0)
            .toUpperCase();

}

/* =====================================================
LOAD INVITATION
===================================================== */

async function loadInvitation(
invitationId,
userId
) {

const {
    data,
    error
} =
    await supabaseClient
        .from("invitations")
        .select(
            "id, slug, title, theme, status, cover_image, music"
        )
        .eq("id", invitationId)
        .eq("user_id", userId)
        .single();


if (error) {

    console.error(
        error
    );

    showMessage(
        "Undangan tidak ditemukan atau Anda tidak memiliki akses.",
        "error"
    );

    return;

}


/*
 * Isi form
 */

titleInput.value =
    data.title || "";


slugInput.value =
    data.slug || "";


document
    .getElementById("theme")
    .value =
        data.theme ||
        "modern-white";


document
    .getElementById("status")
    .value =
        data.status ||
        "draft";


document
    .getElementById("coverImage")
    .value =
        data.cover_image ||
        "";


document
    .getElementById("music")
    .value =
        data.music ||
        "";


document.title =
    "Edit Undangan - IK-PRO.ID";

}

/* =====================================================
SLUG
===================================================== */

slugInput.addEventListener(
"input",
function () {

    let value =
        slugInput.value
            .toLowerCase()
            .trim();


    value =
        value
            .replace(
                /[^a-z0-9]+/g,
                "-"
            )
            .replace(
                /^-+|-+$/g,
                ""
            );


    slugInput.value =
        value;


    updateSlugPreview();

}

);

function updateSlugPreview() {

const slug =
    slugInput.value.trim();


if (!slug) {

    slugPreview.textContent =
        "URL: ik-pro.my.id/...";

    return;

}


slugPreview.textContent =
    `URL: https://ik-pro.my.id/${slug}/`;

}

/* =====================================================
TITLE
===================================================== */

titleInput.addEventListener(
"input",
function () {

    /*
     * Tidak otomatis mengubah slug.
     * Slug sengaja dikontrol user.
     */

}

);

/* =====================================================
FORM SUBMIT
===================================================== */

form.addEventListener(
"submit",
async function (event) {

    event.preventDefault();


    if (!currentUser) {

        showMessage(
            "Session login tidak ditemukan.",
            "error"
        );

        return;

    }


    const title =
        titleInput.value.trim();


    const slug =
        slugInput.value.trim();


    const theme =
        document
            .getElementById("theme")
            .value;


    const status =
        document
            .getElementById("status")
            .value;


    const coverImage =
        document
            .getElementById("coverImage")
            .value
            .trim();


    const music =
        document
            .getElementById("music")
            .value
            .trim();


    /* VALIDASI */

    if (!title) {

        showMessage(
            "Judul undangan wajib diisi.",
            "error"
        );

        return;

    }


    if (!slug) {

        showMessage(
            "Slug URL wajib diisi.",
            "error"
        );

        return;

    }


    if (
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/
            .test(slug)
    ) {

        showMessage(
            "Slug hanya boleh menggunakan huruf kecil, angka, dan tanda strip (-).",
            "error"
        );

        return;

    }


    setLoading(
        true
    );


    try {

        const invitationData = {

            user_id:
                currentUser.id,

            slug:
                slug,

            title:
                title,

            theme:
                theme,

            status:
                status,

            cover_image:
                coverImage || null,

            music:
                music || null

        };


        let result;


        /*
         * EDIT
         */

        if (editingInvitationId) {

            result =
                await supabaseClient
                    .from("invitations")
                    .update(
                        invitationData
                    )
                    .eq(
                        "id",
                        editingInvitationId
                    )
                    .eq(
                        "user_id",
                        currentUser.id
                    )
                    .select()
                    .single();

        }


        /*
         * CREATE
         */

        else {

            result =
                await supabaseClient
                    .from("invitations")
                    .insert(
                        invitationData
                    )
                    .select()
                    .single();

        }


        if (result.error) {

            throw result.error;

        }


        showMessage(
            editingInvitationId
                ? "Undangan berhasil diperbarui."
                : "Undangan berhasil dibuat.",
            "success"
        );


        /*
         * Kembali dashboard
         */

        setTimeout(
            function () {

                window.location.href =
                    "index.html";

            },
            1000
        );


    } catch (error) {

        console.error(
            "Save invitation error:",
            error
        );


        let message =
            "Gagal menyimpan undangan.";


        if (
            error.code ===
            "23505"
        ) {

            message =
                "Slug tersebut sudah digunakan. Silakan gunakan slug lain.";

        }


        showMessage(
            message,
            "error"
        );


        setLoading(
            false
        );

    }

}

);

/* =====================================================
MESSAGE
===================================================== */

function showMessage(
message,
type
) {

formMessage.textContent =
    message;

formMessage.className =
    `form-message show ${type}`;

}

/* =====================================================
LOADING
===================================================== */

function setLoading(
loading
) {

if (loading) {

    saveButton.disabled =
        true;

    saveButton.classList.add(
        "loading"
    );

} else {

    saveButton.disabled =
        false;

    saveButton.classList.remove(
        "loading"
    );

}

}

/* =====================================================
LOGOUT
===================================================== */

document
.getElementById(
"logoutButton"
)
.addEventListener(
"click",
async function () {

        await supabaseClient.auth
            .signOut();

        window.location.href =
            "../login.html";

    }
);

/* =====================================================
MOBILE SIDEBAR
===================================================== */

const menuToggle =
document.getElementById(
"menuToggle"
);

const sidebar =
document.getElementById(
"sidebar"
);

const sidebarOverlay =
document.getElementById(
"sidebarOverlay"
);

menuToggle.addEventListener(
"click",
function () {

    sidebar.classList.toggle(
        "open"
    );

    sidebarOverlay.classList.toggle(
        "show"
    );

}

);

sidebarOverlay.addEventListener(
"click",
function () {

    sidebar.classList.remove(
        "open"
    );

    sidebarOverlay.classList.remove(
        "show"
    );

}

);