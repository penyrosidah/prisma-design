// ============================================================
// Tipe data mengikuti ERD CV Prismakita Computer
// ============================================================

export interface Kategori {
  id_kategori: number
  nama_kategori: string
}

export interface Produk {
  id_produk: number
  id_kategori: number
  nama_produk: string
  merk: string
  stok: number
  stok_minimum: number
  harga_jual: number
  harga_beli: number
}

export interface ItemTransaksi {
  id_produk: number
  nama_produk: string
  jumlah: number
  harga_satuan: number
  subtotal: number
}

export interface TransaksiPenjualan {
  id_transaksi: number
  pelanggan: string
  karyawan: string
  tanggal_transaksi: string
  items: ItemTransaksi[]
  total_harga: number
  metode_bayar: string
  status_bayar: string
}

export interface Kas {
  id_kas: number
  id_transaksi: number | null
  tanggal: string
  jenis: "Masuk" | "Keluar"
  jumlah: number
  keterangan: string
}

export interface KategoriBiaya {
  id_kategori_biaya: number
  nama_kategori: string
}

export interface Pengeluaran {
  id_pengeluaran: number
  id_kategori_biaya: number
  karyawan: string
  tanggal: string
  jumlah: number
  deskripsi: string
}

// ============================================================
// Data awal (seed) — mensimulasikan basis data terpusat
// ============================================================

export const kategoriSeed: Kategori[] = [
  { id_kategori: 1, nama_kategori: "Laptop" },
  { id_kategori: 2, nama_kategori: "Komputer / PC" },
  { id_kategori: 3, nama_kategori: "Monitor" },
  { id_kategori: 4, nama_kategori: "Printer" },
  { id_kategori: 5, nama_kategori: "Aksesoris" },
]

export const produkSeed: Produk[] = [
  { id_produk: 1, id_kategori: 1, nama_produk: "Laptop ASUS Vivobook 14", merk: "ASUS", stok: 8, stok_minimum: 3, harga_jual: 7850000, harga_beli: 7100000 },
  { id_produk: 2, id_kategori: 1, nama_produk: "Laptop Lenovo IdeaPad Slim 3", merk: "Lenovo", stok: 2, stok_minimum: 3, harga_jual: 6500000, harga_beli: 5900000 },
  { id_produk: 3, id_kategori: 2, nama_produk: "PC Rakitan Office Core i3", merk: "Custom", stok: 5, stok_minimum: 2, harga_jual: 4750000, harga_beli: 4100000 },
  { id_produk: 4, id_kategori: 3, nama_produk: 'Monitor LG 24" IPS', merk: "LG", stok: 12, stok_minimum: 4, harga_jual: 1650000, harga_beli: 1380000 },
  { id_produk: 5, id_kategori: 4, nama_produk: "Printer Epson L3210", merk: "Epson", stok: 6, stok_minimum: 3, harga_jual: 2350000, harga_beli: 2050000 },
  { id_produk: 6, id_kategori: 5, nama_produk: "Mouse Wireless Logitech M170", merk: "Logitech", stok: 25, stok_minimum: 10, harga_jual: 145000, harga_beli: 105000 },
  { id_produk: 7, id_kategori: 5, nama_produk: "Keyboard Mechanical Rexus", merk: "Rexus", stok: 4, stok_minimum: 5, harga_jual: 385000, harga_beli: 295000 },
  { id_produk: 8, id_kategori: 5, nama_produk: "Flashdisk SanDisk 64GB", merk: "SanDisk", stok: 30, stok_minimum: 10, harga_jual: 95000, harga_beli: 68000 },
]

export const kategoriBiayaSeed: KategoriBiaya[] = [
  { id_kategori_biaya: 1, nama_kategori: "Sewa Tempat" },
  { id_kategori_biaya: 2, nama_kategori: "Tagihan Listrik" },
  { id_kategori_biaya: 3, nama_kategori: "Gaji Karyawan" },
  { id_kategori_biaya: 4, nama_kategori: "Perlengkapan Toko" },
]

export const transaksiSeed: TransaksiPenjualan[] = [
  {
    id_transaksi: 1001,
    pelanggan: "Umum",
    karyawan: "Rinda",
    tanggal_transaksi: "2026-06-21 10:24",
    items: [
      { id_produk: 4, nama_produk: 'Monitor LG 24" IPS', jumlah: 1, harga_satuan: 1650000, subtotal: 1650000 },
      { id_produk: 6, nama_produk: "Mouse Wireless Logitech M170", jumlah: 2, harga_satuan: 145000, subtotal: 290000 },
    ],
    total_harga: 1940000,
    metode_bayar: "Tunai",
    status_bayar: "Lunas",
  },
  {
    id_transaksi: 1002,
    pelanggan: "Budi Santoso",
    karyawan: "Peni",
    tanggal_transaksi: "2026-06-21 13:05",
    items: [{ id_produk: 5, nama_produk: "Printer Epson L3210", jumlah: 1, harga_satuan: 2350000, subtotal: 2350000 }],
    total_harga: 2350000,
    metode_bayar: "Transfer",
    status_bayar: "Lunas",
  },
]

export const kasSeed: Kas[] = [
  { id_kas: 1, id_transaksi: 1001, tanggal: "2026-06-21", jenis: "Masuk", jumlah: 1940000, keterangan: "Penjualan #1001" },
  { id_kas: 2, id_transaksi: 1002, tanggal: "2026-06-21", jenis: "Masuk", jumlah: 2350000, keterangan: "Penjualan #1002" },
  { id_kas: 3, id_transaksi: null, tanggal: "2026-06-20", jenis: "Keluar", jumlah: 1500000, keterangan: "Sewa Tempat - Juni" },
]

export const pengeluaranSeed: Pengeluaran[] = [
  { id_pengeluaran: 1, id_kategori_biaya: 1, karyawan: "Dita", tanggal: "2026-06-20", jumlah: 1500000, deskripsi: "Sewa tempat bulan Juni" },
  { id_pengeluaran: 2, id_kategori_biaya: 2, karyawan: "Dita", tanggal: "2026-06-19", jumlah: 420000, deskripsi: "Tagihan listrik PLN" },
]

export const KARYAWAN = ["Rinda", "Peni", "Dita"]
export const PELANGGAN = ["Umum", "Budi Santoso", "Toko Maju Jaya", "Universitas Siber Asia"]
export const METODE_BAYAR = ["Tunai", "Transfer", "QRIS"]

export function formatRupiah(n: number): string {
  return "Rp " + n.toLocaleString("id-ID")
}
