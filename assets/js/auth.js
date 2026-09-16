/* =========================================================
IK-PRO.ID
SUPABASE AUTH
========================================================= */

/* =========================================================
SUPABASE CONFIG
========================================================= */

const SUPABASE_URL = "https://dxmhyjcahmmxbxtxtgxh.supabase.co";

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4bWh5amNhaG1teGJ4dHh0Z3hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1Njc1MDcsImV4cCI6MjEwNTE0MzUwN30.YjpAwvYxLlqlztAQPL2n95q_7u05Jng1U_ToFSKhSOo";

/* =========================================================
INIT SUPABASE
========================================================= */

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

/* =========================================================
HELPER
========================================================= */

function showMessage(element, message, type = "error") {
    if (!element) return;

    element.textContent = message;

    element.className = `form-message show ${type}`;
}

function hideMessage(element) {
    if (!element) return;

    element.textContent = "";

    element.className = "form-message";
}

function setLoading(button, loading) {
    if (!button) return;

    if (loading) {
        button.disabled = true;

        button.classList.add("loading");
    } else {
        button.disabled = false;

        button.classList.remove("loading");
    }
}

/* =========================================================
PASSWORD SHOW / HIDE
========================================================= */

document.addEventListener("click", function (event) {
    const button = event.target.closest(".password-toggle");

    if (!button) return;

    const targetId = button.dataset.target;

    const input = document.getElementById(targetId);

    if (!input) return;

    if (input.type === "password") {
        input.type = "text";

        button.textContent = "🙈";

        button.setAttribute("aria-label", "Sembunyikan password");
    } else {
        input.type = "password";

        button.textContent = "👁";

        button.setAttribute("aria-label", "Tampilkan password");
    }
});

/* =========================================================
REGISTER
========================================================= */

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("registerName").value.trim();

        const phone = document.getElementById("registerPhone").value.trim();

        const email = document.getElementById("registerEmail").value.trim();

        const password = document.getElementById("registerPassword").value;

        const passwordConfirm = document.getElementById(
            "registerPasswordConfirm"
        ).value;

        const message = document.getElementById("registerMessage");

        const button = document.getElementById("registerButton");

        hideMessage(message);

        /* VALIDASI */

        if (name.length < 3) {
            showMessage(message, "Nama lengkap minimal 3 karakter.");

            return;
        }

        if (phone.length < 8) {
            showMessage(message, "Nomor WhatsApp tidak valid.");

            return;
        }

        if (password.length < 6) {
            showMessage(message, "Password minimal 6 karakter.");

            return;
        }

        if (password !== passwordConfirm) {
            showMessage(message, "Konfirmasi password tidak sama.");

            return;
        }

        setLoading(button, true);

        try {
            /*
             * Membuat akun Supabase Auth
             */

            const { data, error } = await supabaseClient.auth.signUp({
                email: email,

                password: password,

                options: {
                    data: {
                        nama_lengkap: name,

                        nomor_wa: phone
                    }
                }
            });

            if (error) {
                throw error;
            }

            /*
             * Jika email confirmation
             * aktif, user belum memiliki
             * session.
             */

            if (!data.user) {
                throw new Error("Akun gagal dibuat.");
            }

            /*
             * Simpan profile.
             *
             * Jika email confirmation aktif,
             * INSERT profile dapat dilakukan
             * setelah user login pertama kali.
             */

            if (data.session) {
                const { error: profileError } = await supabaseClient
                    .from("profiles")
                    .upsert({
                        id: data.user.id,

                        nama_lengkap: name,

                        nomor_wa: phone,

                        email: email
                    });

                if (profileError) {
                    console.error("Profile error:", profileError);
                }
            }

            /*
             * EMAIL CONFIRMATION AKTIF
             */

            if (!data.session) {
                showMessage(
                    message,
                    "Pendaftaran berhasil! Silakan cek email Anda untuk melakukan konfirmasi akun.",
                    "success"
                );

                registerForm.reset();

                setLoading(button, false);

                return;
            }

            /*
             * BERHASIL LOGIN
             */

            showMessage(
                message,
                "Akun berhasil dibuat. Mengarahkan ke dashboard...",
                "success"
            );

            setTimeout(function () {
                window.location.href = "dashboard/index.html";
            }, 1000);
        } catch (error) {
            console.error(error);

            let errorMessage = "Terjadi kesalahan. Silakan coba lagi.";

            if (
                error.message &&
                error.message.toLowerCase().includes("user already registered")
            ) {
                errorMessage = "Email tersebut sudah terdaftar.";
            } else if (error.message) {
                errorMessage = error.message;
            }

            showMessage(message, errorMessage);

            setLoading(button, false);
        }
    });
}

/* =========================================================
LOGIN
========================================================= */

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();

        const password = document.getElementById("loginPassword").value;

        const message = document.getElementById("loginMessage");

        const button = document.getElementById("loginButton");

        hideMessage(message);

        if (!email || !password) {
            showMessage(message, "Email dan password wajib diisi.");

            return;
        }

        setLoading(button, true);

        try {
            const { data, error } =
                await supabaseClient.auth.signInWithPassword({
                    email: email,

                    password: password
                });

            if (error) {
                throw error;
            }

            if (!data.user) {
                throw new Error("Login gagal.");
            }

            showMessage(
                message,
                "Login berhasil. Mengarahkan ke dashboard...",
                "success"
            );

            setTimeout(function () {
                window.location.href = "dashboard/index.html";
            }, 700);
        } catch (error) {
            console.error(error);

            let errorMessage = "Email atau password salah.";

            if (
                error.message &&
                error.message.toLowerCase().includes("email not confirmed")
            ) {
                errorMessage =
                    "Email Anda belum dikonfirmasi. Silakan cek inbox email Anda.";
            }

            showMessage(message, errorMessage);

            setLoading(button, false);
        }
    });
}

/* =========================================================
SESSION CHECK
========================================================= */

async function checkAuth() {
    const {
        data: { session }
    } = await supabaseClient.auth.getSession();

    return session;
}

/* =========================================================
AUTO REDIRECT
========================================================= */

