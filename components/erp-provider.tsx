"use client"

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import {
  type Produk,
  type TransaksiPenjualan,
  type Kas,
  type Pengeluaran,
  type ItemTransaksi,
  kategoriSeed,
  produkSeed,
  transaksiSeed,
  kasSeed,
  pengeluaranSeed,
  kategoriBiayaSeed,
} from "@/lib/erp-data"

interface BuatTransaksiInput {
  pelanggan: string
  karyawan: string
  metode_bayar: string
  items: ItemTransaksi[]
}

interface TambahPengeluaranInput {
  id_kategori_biaya: number
  karyawan: string
  jumlah: number
  deskripsi: string
}

interface ErpContextValue {
  produk: Produk[]
  transaksi: TransaksiPenjualan[]
  kas: Kas[]
  pengeluaran: Pengeluaran[]
  kategori: typeof kategoriSeed
  kategoriBiaya: typeof kategoriBiayaSeed
  tambahProduk: (p: Omit<Produk, "id_produk">) => void
  tambahStok: (id_produk: number, jumlah: number) => void
  buatTransaksi: (input: BuatTransaksiInput) => TransaksiPenjualan
  tambahPengeluaran: (input: TambahPengeluaranInput) => void
  // turunan
  produkMenipis: Produk[]
  totalPemasukan: number
  totalPengeluaran: number
  saldoKas: number
  labaRugi: number
}

const ErpContext = createContext<ErpContextValue | null>(null)

function tanggalHariIni(): string {
  return new Date().toISOString().slice(0, 10)
}

function waktuSekarang(): string {
  const d = new Date()
  return `${d.toISOString().slice(0, 10)} ${d.toTimeString().slice(0, 5)}`
}

export function ErpProvider({ children }: { children: ReactNode }) {
  const [produk, setProduk] = useState<Produk[]>(produkSeed)
  const [transaksi, setTransaksi] = useState<TransaksiPenjualan[]>(transaksiSeed)
  const [kas, setKas] = useState<Kas[]>(kasSeed)
  const [pengeluaran, setPengeluaran] = useState<Pengeluaran[]>(pengeluaranSeed)

  function tambahProduk(p: Omit<Produk, "id_produk">) {
    setProduk((prev) => [...prev, { ...p, id_produk: Math.max(0, ...prev.map((x) => x.id_produk)) + 1 }])
  }

  function tambahStok(id_produk: number, jumlah: number) {
    setProduk((prev) => prev.map((p) => (p.id_produk === id_produk ? { ...p, stok: p.stok + jumlah } : p)))
  }

  // INTI INTEGRASI: 1 transaksi penjualan -> kurangi stok (Modul Inventori)
  // sekaligus catat kas masuk (Modul Keuangan) secara otomatis.
  function buatTransaksi(input: BuatTransaksiInput): TransaksiPenjualan {
    const total = input.items.reduce((s, i) => s + i.subtotal, 0)
    const idBaru = Math.max(1000, ...transaksi.map((t) => t.id_transaksi)) + 1
    const trx: TransaksiPenjualan = {
      id_transaksi: idBaru,
      pelanggan: input.pelanggan,
      karyawan: input.karyawan,
      tanggal_transaksi: waktuSekarang(),
      items: input.items,
      total_harga: total,
      metode_bayar: input.metode_bayar,
      status_bayar: "Lunas",
    }

    setTransaksi((prev) => [trx, ...prev])

    // Modul Inventori: stok berkurang otomatis
    setProduk((prev) =>
      prev.map((p) => {
        const item = input.items.find((i) => i.id_produk === p.id_produk)
        return item ? { ...p, stok: p.stok - item.jumlah } : p
      }),
    )

    // Modul Keuangan: kas masuk tercatat otomatis
    setKas((prev) => [
      {
        id_kas: Math.max(0, ...prev.map((k) => k.id_kas)) + 1,
        id_transaksi: idBaru,
        tanggal: tanggalHariIni(),
        jenis: "Masuk",
        jumlah: total,
        keterangan: `Penjualan #${idBaru}`,
      },
      ...prev,
    ])

    return trx
  }

  function tambahPengeluaran(input: TambahPengeluaranInput) {
    const kat = kategoriBiayaSeed.find((k) => k.id_kategori_biaya === input.id_kategori_biaya)
    setPengeluaran((prev) => [
      {
        id_pengeluaran: Math.max(0, ...prev.map((p) => p.id_pengeluaran)) + 1,
        id_kategori_biaya: input.id_kategori_biaya,
        karyawan: input.karyawan,
        tanggal: tanggalHariIni(),
        jumlah: input.jumlah,
        deskripsi: input.deskripsi,
      },
      ...prev,
    ])
    // Pengeluaran juga menjadi kas keluar
    setKas((prev) => [
      {
        id_kas: Math.max(0, ...prev.map((k) => k.id_kas)) + 1,
        id_transaksi: null,
        tanggal: tanggalHariIni(),
        jenis: "Keluar",
        jumlah: input.jumlah,
        keterangan: `${kat?.nama_kategori ?? "Pengeluaran"} - ${input.deskripsi}`,
      },
      ...prev,
    ])
  }

  const value = useMemo<ErpContextValue>(() => {
    const produkMenipis = produk.filter((p) => p.stok <= p.stok_minimum)
    const totalPemasukan = kas.filter((k) => k.jenis === "Masuk").reduce((s, k) => s + k.jumlah, 0)
    const totalPengeluaran = kas.filter((k) => k.jenis === "Keluar").reduce((s, k) => s + k.jumlah, 0)
    return {
      produk,
      transaksi,
      kas,
      pengeluaran,
      kategori: kategoriSeed,
      kategoriBiaya: kategoriBiayaSeed,
      tambahProduk,
      tambahStok,
      buatTransaksi,
      tambahPengeluaran,
      produkMenipis,
      totalPemasukan,
      totalPengeluaran,
      saldoKas: totalPemasukan - totalPengeluaran,
      labaRugi: totalPemasukan - totalPengeluaran,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [produk, transaksi, kas, pengeluaran])

  return <ErpContext.Provider value={value}>{children}</ErpContext.Provider>
}

export function useErp() {
  const ctx = useContext(ErpContext)
  if (!ctx) throw new Error("useErp harus dipakai di dalam ErpProvider")
  return ctx
}
