// === Konfigurasi Sumber Data Google Sheet ===
// Ganti dengan Sheet ID kamu (lihat URL Google Sheet)
const SHEET_ID = "1m3jITIs6dLgWQBrLwt-uKWHbGR8O88s1RNzmGQVwwJo";
// Ganti dengan GID sheet yang berisi data (default 0)
const GID = "0";

// Kolom yang akan dicari dari CSV (pastikan sesuai nama header di Sheet kamu)
const SEARCH_COLUMNS = ["Kecamatan", "Kelurahan", "Kepling", "Kepala Lingkungan", "Alamat", "Catatan"];

// Mapping nama kolom agar urutan tabel rapi (ubah sesuai header Sheet kamu)
const COLUMN_ORDER = ["Kecamatan", "Kelurahan", "Kepling", "Kepala Lingkungan", "Alamat", "Catatan"];
