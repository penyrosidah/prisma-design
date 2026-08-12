"use client"

import { useState } from "react"
import Link from "next/link"
import { ClipboardList, Plus, CheckCircle2, Truck, FileText, CreditCard } from "lucide-react"
import { useErp } from "@/components/erp-provider"
import { formatRupiah, PELANGGAN } from "@/lib/erp-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

const steps = ["Draft", "Confirmed", "Delivery", "Invoice", "Paid"]
function statusVariant(status: string) { return status === "Confirmed" || status === "Paid" ? "default" : status === "Draft" ? "secondary" : "outline" as const }

export default function SalesOrderPage() {
  const { salesOrders, tambahSalesOrder, konfirmasiSalesOrder } = useErp()
  const [open, setOpen] = useState(false)
  const [customer, setCustomer] = useState(PELANGGAN[2])
  const [quantity, setQuantity] = useState("1")
  const total = Number(quantity || 0) * 2350000
  function save(status: "Draft" | "Confirmed") {
    tambahSalesOrder({ tanggal: new Date().toISOString().slice(0, 10), pelanggan: customer, produk: "Printer Epson L3210", jumlah: Number(quantity), total }, status)
    setOpen(false)
    toast.success(status === "Confirmed" ? "Sales Order berhasil dikonfirmasi dan stok telah direservasi." : "Sales Order disimpan sebagai draft.")
  }
  return <div className="mx-auto max-w-6xl space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-medium uppercase tracking-wider text-primary">Penjualan B2B</p><h1 className="mt-1 text-2xl font-semibold tracking-tight">Sales Order</h1><p className="mt-1 text-sm text-muted-foreground">Kelola pesanan pelanggan dari draft sampai pembayaran.</p></div><Dialog open={open} onOpenChange={setOpen}><DialogTrigger render={<Button />}><Plus className="size-4" /> Buat Sales Order</DialogTrigger><DialogContent><DialogHeader><DialogTitle>Buat Sales Order</DialogTitle></DialogHeader><div className="grid gap-4 py-2"><div className="grid gap-2"><Label>Pelanggan</Label><select value={customer} onChange={(e) => setCustomer(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">{PELANGGAN.filter((p) => p !== "Umum").map((p) => <option key={p}>{p}</option>)}</select></div><div className="grid gap-2"><Label>Produk</Label><Input value="Printer Epson L3210" readOnly /></div><div className="grid gap-2"><Label>Jumlah</Label><Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></div><p className="text-sm text-muted-foreground">Total: <span className="font-semibold text-foreground">{formatRupiah(total)}</span></p><div className="flex gap-2"><Button variant="outline" onClick={() => save("Draft")}>Simpan Draft</Button><Button onClick={() => save("Confirmed")}>Konfirmasi</Button></div></div></DialogContent></Dialog></div>
    <Card><CardHeader><CardTitle className="text-base">Daftar Sales Order</CardTitle></CardHeader><CardContent className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="pb-3">Nomor</th><th className="pb-3">Tanggal</th><th className="pb-3">Pelanggan</th><th className="pb-3">Produk</th><th className="pb-3">Total</th><th className="pb-3">Status</th><th className="pb-3" /></tr></thead><tbody>{salesOrders.map((o) => <tr key={o.id} className="border-b last:border-0"><td className="py-3 font-medium">{o.id}</td><td className="py-3 text-muted-foreground">{o.tanggal}</td><td className="py-3">{o.pelanggan}</td><td className="py-3">{o.produk} × {o.jumlah}</td><td className="py-3 font-medium">{formatRupiah(o.total)}</td><td className="py-3"><Badge variant={statusVariant(o.status)}>{o.status}</Badge></td><td className="py-3 text-right">{o.status === "Draft" && <Button size="sm" onClick={() => { konfirmasiSalesOrder(o.id); toast.success("Sales Order berhasil dikonfirmasi dan stok telah direservasi.") }}>Konfirmasi</Button>}</td></tr>)}</tbody></table></CardContent></Card>
    <Card><CardHeader><CardTitle className="text-base">Alur Sales Order</CardTitle></CardHeader><CardContent><div className="flex flex-wrap items-center gap-2">{steps.map((step, i) => <div key={step} className="flex items-center gap-2"><div className="flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium"><span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary">{i + 1}</span>{step}</div>{i < steps.length - 1 && <span className="text-muted-foreground">→</span>}</div>)}</div><p className="mt-4 text-xs text-muted-foreground">Pesanan terkonfirmasi akan mereservasi stok sebelum masuk proses delivery.</p></CardContent></Card>
  </div>
}
