"use client"

import Link from "next/link"
import { useErp } from "@/components/erp-provider"
import { formatRupiah } from "@/lib/erp-data"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Boxes,
  Wallet,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  ArrowRight,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react"

export default function DashboardPage() {
  const { produk, transaksi, produkMenipis, totalPemasukan, saldoKas, labaRugi, kas } = useErp()

  const stats = [
    {
      label: "Total Produk",
      value: produk.length.toString(),
      sub: `${produk.reduce((s, p) => s + p.stok, 0)} unit total stok`,
      icon: Boxes,
      tone: "primary" as const,
    },
    {
      label: "Total Pemasukan",
      value: formatRupiah(totalPemasukan),
      sub: `${transaksi.length} transaksi penjualan`,
      icon: TrendingUp,
      tone: "accent" as const,
    },
    {
      label: "Saldo Kas",
      value: formatRupiah(saldoKas),
      sub: "Pemasukan - pengeluaran",
      icon: Wallet,
      tone: "primary" as const,
    },
    {
      label: "Stok Menipis",
      value: produkMenipis.length.toString(),
      sub: "Produk ≤ stok minimum",
      icon: AlertTriangle,
      tone: produkMenipis.length > 0 ? ("danger" as const) : ("accent" as const),
    },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
            Dashboard Pemilik
          </h1>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            Pantau kondisi stok, penjualan, dan keuangan secara real-time dari satu tempat.
          </p>
        </div>
        <Button render={<Link href="/penjualan" />} nativeButton={false}>
          <ShoppingCart className="size-4" />
          Transaksi Baru
        </Button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label} className="gap-0 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
                <span
                  className={
                    s.tone === "danger"
                      ? "flex size-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive"
                      : s.tone === "accent"
                        ? "flex size-9 items-center justify-center rounded-lg bg-accent/10 text-accent"
                        : "flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"
                  }
                >
                  <Icon className="size-4.5" />
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.sub}</p>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Transaksi terbaru */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Transaksi Terbaru</h2>
            <Link
              href="/penjualan"
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Lihat semua <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="mt-4 space-y-1">
            {transaksi.slice(0, 5).map((t) => (
              <div
                key={t.id_transaksi}
                className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-secondary/60"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <ArrowUpRight className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    #{t.id_transaksi} &middot; {t.pelanggan}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {t.tanggal_transaksi} &middot; {t.items.length} item &middot; {t.metode_bayar}
                  </p>
                </div>
                <p className="text-sm font-semibold text-foreground">{formatRupiah(t.total_harga)}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Notifikasi stok */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Notifikasi Stok</h2>
            <Badge variant="secondary" className="text-[11px]">
              {produkMenipis.length} produk
            </Badge>
          </div>
          <div className="mt-4 space-y-2">
            {produkMenipis.length === 0 && (
              <p className="text-sm text-muted-foreground">Semua stok aman.</p>
            )}
            {produkMenipis.map((p) => (
              <div
                key={p.id_produk}
                className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2"
              >
                <AlertTriangle className="size-4 shrink-0 text-destructive" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground">{p.nama_produk}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Sisa {p.stok} &middot; min. {p.stok_minimum}
                  </p>
                </div>
              </div>
            ))}
            <Button
              render={<Link href="/inventori" />}
              nativeButton={false}
              variant="outline"
              size="sm"
              className="mt-2 w-full"
            >
              Kelola Stok
            </Button>
          </div>
        </Card>
      </div>

      {/* Ringkasan keuangan mini */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold text-foreground">Ringkasan Keuangan</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <MiniFin label="Laba / Rugi" value={formatRupiah(labaRugi)} positive={labaRugi >= 0} />
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground">Aliran Kas Terakhir</p>
            <div className="mt-2 space-y-1.5">
              {kas.slice(0, 3).map((k) => (
                <div key={k.id_kas} className="flex items-center gap-2">
                  {k.jenis === "Masuk" ? (
                    <ArrowUpRight className="size-3.5 text-accent" />
                  ) : (
                    <ArrowDownRight className="size-3.5 text-destructive" />
                  )}
                  <span className="truncate text-[11px] text-muted-foreground">{k.keterangan}</span>
                  <span className="ml-auto text-[11px] font-medium text-foreground">
                    {formatRupiah(k.jumlah)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-between rounded-lg bg-primary p-4 text-primary-foreground">
            <p className="text-xs text-primary-foreground/80">Saldo Kas Saat Ini</p>
            <p className="text-xl font-semibold">{formatRupiah(saldoKas)}</p>
            <Link href="/keuangan" className="mt-2 flex items-center gap-1 text-xs font-medium hover:underline">
              Buka modul keuangan <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}

function MiniFin({ label, value, positive }: { label: string; value: string; positive: boolean }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={
          positive
            ? "mt-2 text-xl font-semibold text-accent"
            : "mt-2 text-xl font-semibold text-destructive"
        }
      >
        {value}
      </p>
    </div>
  )
}
