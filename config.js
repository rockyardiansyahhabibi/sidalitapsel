// === Konfigurasi ===
// Sumber untuk infografis sinkron (jumlah kecamatan/kelurahan)
const SHEET_ID = "1m3jITIs6dLgWQBrLwt-uKWHbGR8O88s1RNzmGQVwwJo";
const GID = "0";

// Master tabel (ubah sesuai URL)
const CAMAT   = { SHEET_ID: "1m3jITIs6dLgWQBrLwt-uKWHbGR8O88s1RNzmGQVwwJo", GID: "0" };
const LURAH   = { SHEET_ID: "1m3jITIs6dLgWQBrLwt-uKWHbGR8O88s1RNzmGQVwwJo", GID: "0" };
const KEPLING = { SHEET_ID: "1m3jITIs6dLgWQBrLwt-uKWHbGR8O88s1RNzmGQVwwJo", GID: "0" };

// Endpoint form Apps Script (isi saat sudah deploy)
const SUBMIT_ENDPOINT = "";

// Konten beranda yang bisa diedit cepat
const PROFIL_TAPSEL = [
  "Ibu kota: Sipirok",
  "Karakter wilayah: pegunungan Bukit Barisan, lembah, dan aliran Sungai Batang Toru",
  "Kekuatan: agrikultur, energi, budaya Mandailing/Angkola",
  "Komitmen layanan: BerAKHLAK — berorientasi pelayanan, akuntabel, kompeten, harmonis, loyal, adaptif, kolaboratif"
];

const QUICK_LINKS = [
  { text: "Website Pemkab (isi link)", href: "#" },
  { text: "PPID (isi link)", href: "#" },
  { text: "Whistleblowing/LAKIP (isi link)", href: "#" },
  { text: "Kontak Bagian Tata Pemerintahan", href: "#" }
];
