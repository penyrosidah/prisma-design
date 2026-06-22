"use client"

import { useState } from "react"
import { useErp } from "@/components/erp-provider"
import { formatRupiah, KARYAWAN, PELANGGAN, METODE_BAYAR, type ItemTransaksi, type TransaksiPenjualan } from "@/lib/erp-data"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Minus, Trash2, Receipt, ShoppingCart, CheckCircle2, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function PenjualanPage() {
  const { produk, transaksi, buatTransaksi } = useErp()
  const [cart, setCart] = useState<ItemTransaksi[]>([])
  const [pelanggan, setPelanggan] = useState(PELANGGAN[0])
  const [karyawan, setKaryawan] = useState(KARYAWAN[0])
  const [metode, setMetode] = useState(METODE_BAYAR[0])
  const [nota, setNota] = useState<TransaksiPenjualan | null>(null)

  const total = cart.reduce((s, i) => s + i.subtotal, 0)

  function addToCart(idProduk: number) {
    const p = produk.find((x) => x.id_produk === idProduk)
    if (!p) return
    const inCart = cart.find((i) => i.id_produk === idProduk)
    const qtyInCart = inCart?.jumlah ?? 0
    if (qtyInCart + 1 > p.stok) {
      toast.error(`Stok ${p.nama_produk} tidak mencukupi (sisa ${p.stok})`)
      return
    }
    if (inCart) {
      setCart(cart.map((i) =>
        i.id_produk === idProduk
          ? { ...i, jumlah: i.jumlah + 1, subtotal: (i.jumlah + 1) * i.harga_satuan }
          : i,
      ))
    } else {
      setCart([
        ...cart,
        { id_produk: p.id_produk, nama_produk: p.nama_produk, jumlah: 1, harga_satuan: p.harga_jual, subtotal: p.harga_jual },
      ])
    }
  }

  function changeQty(idProduk: number, delta: number) {
    const p = produk.find((x) => x.id_produk === idProduk)
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.id_produk !== idProduk) return i
          const next = i.jumlah + delta
          if (p && next > p.stok) {
            toast.error(`Stok tidak mencukupi (sisa ${p.stok})`)
            return i
          }
          return { ...i, jumlah: next, subtotal: next * i.harga_satuan }
        })
        .filter((i) => i.jumlah > 0),
    )
  }

  function proses() {
    if (cart.length === 0) {
      toast.error("Keranjang masih kosong")
      return
    }
    const trx = buatTransaksi({ pelanggan, karyawan, metode_bayar: metode, items: cart })
    setNota(trx)
    setCart([])
    toast.success("Transaksi berhasil — stok & kas diperbarui otomatis", {
      description: `Nota #${trx.id_transaksi} dibuat.`,
    })
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Modul Penjualan (POS)</h1>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          Proses transaksi penjualan. Saat transaksi diproses, stok berkurang dan kas masuk tercatat otomatis.
        </p>
      </div>

      <Tabs defaultValue="kasir">
        <TabsList>
          <TabsTrigger value="kasir">
            <ShoppingCart className="size-4" /> Kasir
          </TabsTrigger>
          <TabsTrigger value="riwayat">
            <Receipt className="size-4" /> Riwayat ({transaksi.length})
          </TabsTrigger>
        </TabsList>

        {/* KASIR */}
        <TabsContent value="kasir" className="mt-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            {/* Daftar produk */}
            <div className="lg:col-span-3">
              <Card className="p-5">
                <h2 className="text-sm font-semibold text-foreground">Pilih Produk</h2>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {produk.map((p) => {
                    const habis = p.stok <= 0
                    return (
                      <button
                        key={p.id_produk}
                        disabled={habis}
                        onClick={() => addToCart(p.id_produk)}
                        className="flex items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:border-primary hover:bg-secondary/50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{p.nama_produk}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatRupiah(p.harga_jual)} &middot; stok {p.stok}
                          </p>
                        </div>
                        {habis ? (
                          <Badge variant="destructive">Habis</Badge>
                        ) : (
                          <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Plus className="size-4" />
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </Card>
            </div>

            {/* Keranjang */}
            <div className="lg:col-span-2">
              <Card className="p-5">
                <h2 className="text-sm font-semibold text-foreground">Keranjang Transaksi</h2>

                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Pelanggan</Label>
                      <Select value={pelanggan} onValueChange={(v) => setPelanggan(v as string)}>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PELANGGAN.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Kasir</Label>
                      <Select value={karyawan} onValueChange={(v) => setKaryawan(v as string)}>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {KARYAWAN.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  {cart.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      Belum ada item. Pilih produk di sebelah kiri.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {cart.map((i) => (
                        <div key={i.id_produk} className="flex items-center gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{i.nama_produk}</p>
                            <p className="text-xs text-muted-foreground">{formatRupiah(i.harga_satuan)}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="outline" size="icon" className="size-7" onClick={() => changeQty(i.id_produk, -1)}>
                              <Minus className="size-3" />
                            </Button>
                            <span className="w-6 text-center text-sm tabular-nums">{i.jumlah}</span>
                            <Button variant="outline" size="icon" className="size-7" onClick={() => changeQty(i.id_produk, 1)}>
                              <Plus className="size-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => changeQty(i.id_produk, -i.jumlah)}>
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-1.5">
                    <Label className="text-xs">Metode Bayar</Label>
                    <Select value={metode} onValueChange={(v) => setMetode(v as string)}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {METODE_BAYAR.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2.5">
                    <span className="text-sm font-medium text-secondary-foreground">Total</span>
                    <span className="text-lg font-semibold text-foreground">{formatRupiah(total)}</span>
                  </div>

                  <Button className="w-full" size="lg" onClick={proses} disabled={cart.length === 0}>
                    <CheckCircle2 className="size-4" />
                    Proses & Cetak Nota
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* RIWAYAT */}
        <TabsContent value="riwayat" className="mt-4">
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-foreground">Riwayat Transaksi</h2>
            <div className="mt-4 space-y-2">
              {transaksi.map((t) => (
                <button
                  key={t.id_transaksi}
                  onClick={() => setNota(t)}
                  className="flex w-full items-center gap-3 rounded-lg border border-border px-3 py-3 text-left hover:border-primary hover:bg-secondary/50"
                >
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Receipt className="size-4.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      #{t.id_transaksi} &middot; {t.pelanggan}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t.tanggal_transaksi} &middot; {t.items.length} item &middot; {t.karyawan}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{formatRupiah(t.total_harga)}</p>
                    <Badge variant="secondary" className="border-accent/30 bg-accent/10 text-accent">
                      {t.status_bayar}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Nota */}
      <Dialog open={!!nota} onOpenChange={(o) => !o && setNota(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nota Penjualan</DialogTitle>
          </DialogHeader>
          {nota && (
            <div className="space-y-4">
              <div className="rounded-lg border border-dashed border-border p-4 font-mono text-sm">
                <div className="text-center">
                  <p className="font-semibold">CV PRISMAKITA COMPUTER</p>
                  <p className="text-xs text-muted-foreground">Sragen, Jawa Tengah</p>
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>No: #{nota.id_transaksi}</span>
                  <span>{nota.tanggal_transaksi}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Pelanggan: {nota.pelanggan}</span>
                  <span>Kasir: {nota.karyawan}</span>
                </div>
                <Separator className="my-3" />
                <div className="space-y-1.5">
                  {nota.items.map((i) => (
                    <div key={i.id_produk} className="flex justify-between gap-2">
                      <span className="min-w-0 flex-1 truncate">
                        {i.nama_produk} x{i.jumlah}
                      </span>
                      <span className="tabular-nums">{formatRupiah(i.subtotal)}</span>
                    </div>
                  ))}
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between font-semibold">
                  <span>TOTAL</span>
                  <span className="tabular-nums">{formatRupiah(nota.total_harga)}</span>
                </div>
                <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                  <span>Bayar: {nota.metode_bayar}</span>
                  <span>{nota.status_bayar}</span>
                </div>
                <p className="mt-3 text-center text-xs text-muted-foreground">Terima kasih telah berbelanja</p>
              </div>

              <div className="rounded-lg bg-accent/10 p-3 text-xs text-accent">
                <p className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="size-3.5" />
                  Sinkronisasi otomatis berhasil
                </p>
                <ul className="mt-1.5 space-y-0.5 text-accent/90">
                  <li>&bull; Stok produk berkurang di modul Inventori</li>
                  <li>&bull; Kas masuk {formatRupiah(nota.total_harga)} tercatat di modul Keuangan</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button render={<Link href="/inventori" />} nativeButton={false} variant="outline" className="flex-1">
                  Cek Stok <ArrowRight className="size-3.5" />
                </Button>
                <Button render={<Link href="/keuangan" />} nativeButton={false} className="flex-1">
                  Cek Kas <ArrowRight className="size-3.5" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
