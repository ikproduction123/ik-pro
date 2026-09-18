import { supabase } from "./supabase.js";
import { getCurrentUser } from "./auth.js";

console.log("IK-PRO.ID - Event Form Module Loaded");

const globalLoader = document.getElementById("globalLoader");
const form = document.getElementById("eventForm");
const btnSubmit = document.getElementById("btnSubmit");
const pageTitle = document.getElementById("pageTitle");
const btnBackSidebar = document.getElementById("btnBackSidebar");
const btnCancel = document.getElementById("btnCancel");

const urlParams = new URLSearchParams(window.location.search);
const invId = urlParams.get("inv_id");
const eventId = urlParams.get("event_id"); // Jika ada, berarti mode Edit

const showLoader = () => globalLoader.classList.add("show");
const hideLoader = () => globalLoader.classList.remove("show");

const backUrl = `events.html?inv_id=${invId}`;

// Atur tombol kembali
if (btnBackSidebar) btnBackSidebar.href = backUrl;
if (btnCancel) btnCancel.href = backUrl;

const initForm = async () => {
    if (!invId) {
        alert("ID Undangan tidak ditemukan!");
        window.location.href = "invitations.html";
        return;
    }

    showLoader();
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error("Silakan login kembali.");

        if (eventId) {
            pageTitle.textContent = "Edit Acara";
            const { data, error } = await supabase
                .from("events")
                .select("*")
                .eq("id", eventId)
                .single();

            if (error) throw error;

            if (data) {
                document.getElementById("name").value = data.name;
                document.getElementById("date").value = data.date;
                document.getElementById("start_time").value = data.start_time;
                document.getElementById("end_time").value = data.end_time || "";
                document.getElementById("timezone").value =
                    data.timezone || "WIB";
                document.getElementById("location_name").value =
                    data.location_name || "";
                document.getElementById("address").value = data.address || "";
                document.getElementById("google_maps_url").value =
                    data.google_maps_url || "";
            }
        }
    } catch (error) {
        console.error("Init Error:", error);
        alert(error.message);
    } finally {
        hideLoader();
    }
};

form.addEventListener("submit", async e => {
    e.preventDefault();
    showLoader();

    const originalBtnText = btnSubmit.innerHTML;
    btnSubmit.innerHTML = "Menyimpan...";
    btnSubmit.disabled = true;

    try {
        const payload = {
            invitation_id: invId,
            name: document.getElementById("name").value.trim(),
            date: document.getElementById("date").value,
            start_time: document.getElementById("start_time").value,
            end_time: document.getElementById("end_time").value || null,
            timezone: document.getElementById("timezone").value,
            location_name: document
                .getElementById("location_name")
                .value.trim(),
            address: document.getElementById("address").value.trim(),
            google_maps_url: document
                .getElementById("google_maps_url")
                .value.trim(),
            updated_at: new Date().toISOString()
        };

        if (eventId) {
            // Update
            const { error } = await supabase
                .from("events")
                .update(payload)
                .eq("id", eventId);
            if (error) throw error;
        } else {
            // Insert
            const { error } = await supabase.from("events").insert([payload]);
            if (error) throw error;
        }

        alert("Data acara berhasil disimpan!");
        window.location.href = backUrl;
    } catch (error) {
        console.error("Save Error:", error);
        alert("Gagal menyimpan data: " + error.message);
    } finally {
        hideLoader();
        btnSubmit.innerHTML = originalBtnText;
        btnSubmit.disabled = false;
    }
});

initForm();
