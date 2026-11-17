/* =====================================================================
   ⚙️ PENGATURAN — satu-satunya file yang perlu kamu edit.
   ===================================================================== */
window.GB_CONFIG = {
  // URL Web App Apps Script (berakhiran /exec)
  API_URL: 'https://script.google.com/macros/s/AKfycbyU73uP6mu0fYY_kAbNsbLh1lCLgnmhAKV04rIfQtjs1k7ftQYvkeIIn9l4032iBdmPuQ/exec',

  // Foto latar untuk layar tamu (laptop/tablet).
  // Taruh file foto di folder "foto" (di dalam scan-app), lalu tulis namanya di sini.
  // Contoh: FOTO: ['foto/1.jpg', 'foto/2.jpg', 'foto/3.jpg'],
  // Biarkan kosong [] untuk memakai latar animasi tanpa foto.
  FOTO: ['foto/1-berdua.jpg', 'foto/2-payung.jpg', 'foto/3-lentera.jpg', 'foto/4-pelaminan.jpg', 'foto/5-payung-duduk.jpg', 'foto/6-siluet.jpg'],

  // Lama setiap foto tampil sebelum berganti (detik), bila foto lebih dari satu
  FOTO_GANTI_DETIK: 8,

  // Titik fokus foto: 'center 35%' = tengah, agak ke atas (wajah biasanya di atas).
  // Bisa diganti 'center top', 'center center', 'left center', dll.
  FOTO_POSISI: 'center 35%',

  // Tata letak foto: 'otomatis' (foto tegak → foto di kiri & teks di kanan; foto melebar → layar penuh),
  // 'samping' (selalu foto di kiri), atau 'penuh' (selalu layar penuh)
  FOTO_TATA: 'otomatis'
};
