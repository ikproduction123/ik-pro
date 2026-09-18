// Menggunakan ES Module build dari Supabase CDN
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm";

/* 
  PENTING: 
  Ganti nilai SUPABASE_URL dan SUPABASE_ANON_KEY di bawah ini 
  dengan data dari dashboard Supabase Anda (Settings -> API).
  JANGAN PERNAH memasukkan 'service_role' secret key di sini.
*/
const SUPABASE_URL = "https://ihaorhpugbjlhzsblwhd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloYW9yaHB1Z2JqbGh6c2Jsd2hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3MTczODksImV4cCI6MjEwNTI5MzM4OX0.SWm_xCh89zmri9vTxpRZ0YPEYNDbJ7t8DiLXYtb24O0";

// Inisialisasi Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("IK-PRO.ID - Supabase Client Initialized");
