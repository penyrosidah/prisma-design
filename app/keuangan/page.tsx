"use client";

import { useState } from "react";
import { useErp } from "@/components/erp-provider";
import { formatRupiah, KARYAWAN } from "@/lib/erp-data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpRight, ArrowDownRight, Plus, TrendingUp, TrendingDown, Scale } from "lucide-react";
import { toast } from "sonner";

export default function KeuanganPage() {
  const { kas, pengeluaran, kategoriBiaya, tambahPengeluaran, totalPemasukan, totalPengeluaran, labaRugi } = useErp();
  const [open, setOpen] = useState(false);

  // pengeluaran per kategori
  const perKategori = kategoriBiaya.map((k) => ({
    nama: k.nama_kategori,
    total: pengeluaran.filter((p) => p.id_kategori_biaya === k.id_kategori_biaya).reduce((s, p) => s + p.jumlah, 0),
  }));
  const maxKat = Math.max(1, ...perKategori.map((k) => k.total));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Modul Keuangan</h1>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">Kas masuk dari penjualan tercatat otomatis. Catat pengeluaran operasional per kategori di sini.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="size-4" /> Catat Pengeluaran
          </DialogTrigger>
          <FormPengeluaran
            kategoriBiaya={kategoriBiaya}
            onSubmit={(data) => {
              tambahPengeluaran(data);
              toast.success("Pengeluaran tercatat & kas keluar diperbarui");
              setOpen(false);
            }}
          />
        </Dialog>
      </div>

      {/* Laporan laba rugi ringkas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="gap-0 p-5">
          <div className="flex items-center gap-2 text-accent">
            <TrendingUp className="size-4" />
            <p className="text-sm font-medium">Total Pemasukan</p>
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{formatRupiah(totalPemasukan)}</p>
        </Card>
        <Card className="gap-0 p-5">
          <div className="flex items-center gap-2 text-destructive">
            <TrendingDown className="size-4" />
            <p className="text-sm font-medium">Total Pengeluaran</p>
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{formatRupiah(totalPengeluaran)}</p>
        </Card>
        <Card className="gap-0 bg-primary p-5 text-primary-foreground">
          <div className="flex items-center gap-2">
            <Scale className="size-4" />
            <p className="text-sm font-medium">Laba / Rugi</p>
          </div>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{formatRupiah(labaRugi)}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Buku kas */}
        <Card className="overflow-hidden p-0 lg:col-span-2">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">Buku Kas</h2>
            <p className="text-xs text-muted-foreground">Arus kas masuk &amp; keluar</p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kas.map((k) => (
                  <TableRow key={k.id_kas}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{k.tanggal}</TableCell>
                    <TableCell>
                      <span className="text-foreground">{k.keterangan}</span>
                      {k.id_transaksi && <span className="ml-1 text-xs text-muted-foreground">(otomatis)</span>}
                    </TableCell>
                    <TableCell>
                      {k.jenis === "Masuk" ? (
                        <Badge variant="secondary" className="gap-1 border-accent/30 bg-accent/10 text-accent">
                          <ArrowUpRight className="size-3" /> Masuk
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1 border-destructive/30 bg-destructive/10 text-destructive">
                          <ArrowDownRight className="size-3" /> Keluar
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className={k.jenis === "Masuk" ? "text-right font-medium tabular-nums text-accent" : "text-right font-medium tabular-nums text-destructive"}>
                      {k.jenis === "Masuk" ? "+" : "-"}
                      {formatRupiah(k.jumlah)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Pengeluaran per kategori */}
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-foreground">Pengeluaran per Kategori</h2>
          <div className="mt-4 space-y-4">
            {perKategori.map((k) => (
              <div key={k.nama}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{k.nama}</span>
                  <span className="font-medium text-foreground">{formatRupiah(k.total)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(k.total / maxKat) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Pengeluaran terbaru</p>
            {pengeluaran.slice(0, 4).map((p) => (
              <div key={p.id_pengeluaran} className="flex items-center justify-between gap-2 text-sm">
                <span className="min-w-0 truncate text-foreground">{p.deskripsi}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">{formatRupiah(p.jumlah)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function FormPengeluaran({ kategoriBiaya, onSubmit }: { kategoriBiaya: { id_kategori_biaya: number; nama_kategori: string }[]; onSubmit: (data: { id_kategori_biaya: number; karyawan: string; jumlah: number; deskripsi: string }) => void }) {
  const [idKat, setIdKat] = useState(String(kategoriBiaya[0]?.id_kategori_biaya ?? 1));
  const [karyawan, setKaryawan] = useState(KARYAWAN[0]);
  const [jumlah, setJumlah] = useState("");
  const [deskripsi, setDeskripsi] = useState("");

  function submit() {
    if (!Number(jumlah)) {
      toast.error("Jumlah pengeluaran harus diisi");
      return;
    }
    onSubmit({
      id_kategori_biaya: Number(idKat),
      karyawan,
      jumlah: Number(jumlah),
      deskripsi: deskripsi.trim() || "Pengeluaran operasional",
    });
  }

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Catat Pengeluaran Operasional</DialogTitle>
        <DialogDescription>Pengeluaran dikelompokkan per kategori dan otomatis mengurangi saldo kas.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Kategori Biaya</Label>
          <Select value={idKat} onValueChange={(v) => setIdKat(v as string)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {kategoriBiaya.map((k) => (
                <SelectItem key={k.id_kategori_biaya} value={String(k.id_kategori_biaya)}>
                  {k.nama_kategori}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="jml">Jumlah</Label>
          <Input id="jml" type="number" value={jumlah} onChange={(e) => setJumlah(e.target.value)} placeholder="0" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="desk">Deskripsi</Label>
          <Input id="desk" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} placeholder="cth. Tagihan listrik Juni" />
        </div>
        <div className="space-y-1.5">
          <Label>Dicatat oleh</Label>
          <Select value={karyawan} onValueChange={(v) => setKaryawan(v as string)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KARYAWAN.map((x) => (
                <SelectItem key={x} value={x}>
                  {x}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={submit}>
          <Plus className="size-4" /> Simpan
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
