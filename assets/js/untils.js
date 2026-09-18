/**
 * Utility Functions untuk IK-PRO.ID
 * File ini akan memuat fungsi-fungsi bantuan (format tanggal, URL, dll)
 */

console.log("IK-PRO.ID - Core Utils Loaded");

// Fungsi bantuan untuk membaca URL parameters (Persiapan untuk fitur tamu)
const getQueryParam = (param) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
};
