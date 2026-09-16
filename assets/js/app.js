const burger = document.querySelector(".hamburger");
const menu = document.querySelector(".nav-menu");
const overlay = document.querySelector(".overlay");

burger.addEventListener("click", function () {
    menu.classList.toggle("active");
    burger.classList.toggle("active");
    overlay.classList.add("active");
});

menu.addEventListener("click", function () {
    menu.classList.remove("active");
    burger.classList.toggle("active");
});

overlay.addEventListener("click", function () {
    menu.classList.remove("active");
    burger.classList.toggle("active");
    overlay.classList.remove("active");
});

const counters = document.querySelectorAll(".counter");

const startCounter = () => {
    counters.forEach(counter => {
        const target = +counter.dataset.target;
        const speed = 100;

        const updateCount = () => {
            const count = +counter.innerText;
            const increment = target / speed;

            if (count < target) {
                counter.innerText = Math.ceil(count + increment);
                setTimeout(updateCount, 20);
            } else {
                counter.innerText = target.toLocaleString();
            }
        };

        updateCount();
    });
};

const statsSection = document.querySelector(".stats");

const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
        startCounter();
        observer.disconnect();
    }
});

observer.observe(statsSection);

document.addEventListener("DOMContentLoaded", () => {
    const mainButtons = document.querySelectorAll(".template-main-btn");

    const subButtons = document.querySelectorAll(".template-sub-btn");

    const cards = document.querySelectorAll(".template-card");

    const subTabs = document.getElementById("weddingTabs");

    /* =========================================
       FILTER TEMPLATE
    ========================================= */

    function filterTemplates(category, type = null) {
        cards.forEach(card => {
            const cardCategory = card.dataset.category;

            const cardType = card.dataset.type;

            let show = false;

            if (category === "wedding") {
                show =
                    cardCategory === "wedding" && (!type || cardType === type);
            } else {
                show = cardCategory === category;
            }

            card.style.display = show ? "" : "none";
        });
    }

    /* =========================================
       MAIN CATEGORY
    ========================================= */

    mainButtons.forEach(button => {
        button.addEventListener("click", () => {
            mainButtons.forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            const category = button.dataset.category;

            /* Pernikahan */

            if (category === "wedding") {
                subTabs.style.display = "flex";

                subButtons.forEach(btn => {
                    btn.classList.remove("active");
                });

                subButtons[0].classList.add("active");

                filterTemplates("wedding", "basic");
            } else {
                /* Acara lain */
                subTabs.style.display = "none";

                filterTemplates(category);
            }
        });
    });

    /* =========================================
       SUB CATEGORY
    ========================================= */

    subButtons.forEach(button => {
        button.addEventListener("click", () => {
            subButtons.forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            const type = button.dataset.filter;

            filterTemplates("wedding", type);
        });
    });

    /* =========================================
       ORDER TEMPLATE
    ========================================= */

    const orderButtons = document.querySelectorAll(".template-order");

    orderButtons.forEach(button => {
        button.addEventListener("click", () => {
            const template = button.dataset.template;

            /*
             * Untuk sementara arahkan ke halaman
             * register / order.
             *
             * Nanti bisa diganti menjadi:
             * - login
             * - dashboard
             * - Supabase
             */

            const url = `register.html?template=${encodeURIComponent(template)}`;

            window.location.href = url;
        });
    });

    /* =========================================
       INITIAL FILTER
    ========================================= */

    filterTemplates("wedding", "basic");
});

document.addEventListener("DOMContentLoaded", () => {
    const pricingButtons = document.querySelectorAll(".pricing-button");

    pricingButtons.forEach(button => {
        button.addEventListener("click", event => {
            const url = new URL(button.href, window.location.origin);

            const packageName = url.searchParams.get("package");

            if (packageName) {
                localStorage.setItem("selectedPackage", packageName);
            }
        });
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach(item => {
        const question = item.querySelector(".faq-question");

        question.addEventListener("click", () => {
            const isActive = item.classList.contains("active");

            /*
             * Tutup semua FAQ lainnya
             */

            faqItems.forEach(otherItem => {
                otherItem.classList.remove("active");

                const otherQuestion = otherItem.querySelector(".faq-question");

                otherQuestion.setAttribute("aria-expanded", "false");
            });

            /*
             * Buka FAQ yang diklik
             */

            if (!isActive) {
                item.classList.add("active");

                question.setAttribute("aria-expanded", "true");
            }
        });
    });
});

document.addEventListener("DOMContentLoaded", () => {

    /* ==========================================
       TAHUN OTOMATIS
    ========================================== */

    const footerYear =
        document.getElementById("footerYear");

    if (footerYear) {

        footerYear.textContent =
            new Date().getFullYear();

    }



    /* ==========================================
       BACK TO TOP
    ========================================== */

    const backToTop =
        document.getElementById("backToTop");


    if (!backToTop) return;


    window.addEventListener("scroll", () => {

        if (window.scrollY > 500) {

            backToTop.classList.add("show");

        } else {

            backToTop.classList.remove("show");

        }

    });


    backToTop.addEventListener("click", () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    });

});
