"use client";

import { useState } from "react";
import { useErp } from "@/components/erp-provider";
import { formatRupiah } from "@/lib/erp-data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, PackagePlus, Search, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function InventoriPage() {
  const { produk, kategori, tambahProduk, tambahStok } = useErp();
  const [q, setQ] = useState("");
  const [openTambah, setOpenTambah] = useState(false);

  const filtered = produk.filter((p) => `${p.nama_produk} ${p.merk}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Modul Inventori</h1>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">Input data barang dan pantau pergerakan stok. Stok berkurang otomatis saat ada penjualan.</p>
        </div>
        <Dialog open={openTambah} onOpenChange={setOpenTambah}>
          <DialogTrigger render={<Button />}>
            <Plus className="size-4" />
            Tambah Barang
          </DialogTrigger>
          <FormTambahBarang
            kategori={kategori}
            onSubmit={(data) => {
              tambahProduk(data);
              toast.success("Barang berhasil ditambahkan ke inventori");
              setOpenTambah(false);
            }}
          />
        </Dialog>
      </div>

      {/* Pencarian */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama produk atau merk..." className="pl-9" />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50">
                <TableHead>Produk</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Harga Beli</TableHead>
                <TableHead className="text-right">Harga Jual</TableHead>
                <TableHead className="text-center">Stok</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => {
                const menipis = p.stok <= p.stok_minimum;
                const namaKat = kategori.find((k) => k.id_kategori === p.id_kategori)?.nama_kategori;
                return (
                  <TableRow key={p.id_produk}>
                    <TableCell>
                      <p className="font-medium text-foreground">{p.nama_produk}</p>
                      <p className="text-xs text-muted-foreground">{p.merk}</p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{namaKat}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{formatRupiah(p.harga_beli)}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium">{formatRupiah(p.harga_jual)}</TableCell>
                    <TableCell className="text-center">
                      <span className="font-semibold tabular-nums">{p.stok}</span>
                      <span className="text-xs text-muted-foreground"> / min {p.stok_minimum}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      {menipis ? (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="size-3" />
                          Menipis
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="border-accent/30 bg-accent/10 text-accent">
                          Aman
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          tambahStok(p.id_produk, 5);
                          toast.success(`Stok ${p.nama_produk} +5 (barang masuk dari supplier)`);
                        }}
                      >
                        <PackagePlus className="size-3.5" />
                        Barang Masuk
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    Produk tidak ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <p className="text-xs text-muted-foreground">
        Catatan alur: tombol <span className="font-medium text-foreground">Barang Masuk</span> menambah stok (simulasi penerimaan dari supplier), sedangkan setiap transaksi di modul{" "}
        <span className="font-medium text-foreground">Penjualan</span> akan mengurangi stok produk ini secara otomatis.
      </p>
    </div>
  );
}

function FormTambahBarang({
  kategori,
  onSubmit,
}: {
  kategori: { id_kategori: number; nama_kategori: string }[];
  onSubmit: (data: { id_kategori: number; nama_produk: string; merk: string; stok: number; stok_minimum: number; harga_jual: number; harga_beli: number }) => void;
}) {
  const [nama, setNama] = useState("");
  const [merk, setMerk] = useState("");
  const [idKat, setIdKat] = useState<string>(String(kategori[0]?.id_kategori ?? 1));
  const [stok, setStok] = useState("");
  const [stokMin, setStokMin] = useState("");
  const [hargaBeli, setHargaBeli] = useState("");
  const [hargaJual, setHargaJual] = useState("");

  function submit() {
    if (!nama.trim()) {
      toast.error("Nama produk wajib diisi");
      return;
    }
    onSubmit({
      id_kategori: Number(idKat),
      nama_produk: nama.trim(),
      merk: merk.trim() || "-",
      stok: Number(stok) || 0,
      stok_minimum: Number(stokMin) || 0,
      harga_jual: Number(hargaJual) || 0,
      harga_beli: Number(hargaBeli) || 0,
    });
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Input Data Barang</DialogTitle>
        <DialogDescription>Tambahkan produk baru ke basis data inventori terpusat.</DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="nama">Nama Produk</Label>
          <Input id="nama" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="cth. Laptop Acer Aspire 5" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="merk">Merk</Label>
          <Input id="merk" value={merk} onChange={(e) => setMerk(e.target.value)} placeholder="cth. Acer" />
        </div>
        <div className="space-y-1.5">
          <Label>Kategori</Label>
          <Select value={idKat} onValueChange={(v) => setIdKat(v as string)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {kategori.map((k) => (
                <SelectItem key={k.id_kategori} value={String(k.id_kategori)}>
                  {k.nama_kategori}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="stok">Stok Awal</Label>
          <Input id="stok" type="number" value={stok} onChange={(e) => setStok(e.target.value)} placeholder="0" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="stokmin">Stok Minimum</Label>
          <Input id="stokmin" type="number" value={stokMin} onChange={(e) => setStokMin(e.target.value)} placeholder="0" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="hb">Harga Beli</Label>
          <Input id="hb" type="number" value={hargaBeli} onChange={(e) => setHargaBeli(e.target.value)} placeholder="0" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="hj">Harga Jual</Label>
          <Input id="hj" type="number" value={hargaJual} onChange={(e) => setHargaJual(e.target.value)} placeholder="0" />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={submit}>
          <Plus className="size-4" />
          Simpan Barang
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
