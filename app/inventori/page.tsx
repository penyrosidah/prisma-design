"use client";

import { useMemo, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, PackagePlus, Search, AlertTriangle, Boxes, PackageCheck, ClipboardCheck, BarChart3, History, Save, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type Produk = {
  id_produk: number;
  id_kategori: number;
  nama_produk: string;
  merk: string;
  stok: number;
  stok_minimum: number;
  harga_jual: number;
  harga_beli: number;
};

type Kategori = {
  id_kategori: number;
  nama_kategori: string;
};

type FormProdukData = {
  id_kategori: number;
  nama_produk: string;
  merk: string;
  stok: number;
  stok_minimum: number;
  harga_jual: number;
  harga_beli: number;
};

type FormBarangMasukData = {
  id_produk: number;
  jumlah: number;
  harga_beli: number;
  supplier: string;
  keterangan: string;
};

type RiwayatBarangMasuk = {
  id: number;
  tanggal: string;
  id_produk: number;
  nama_produk: string;
  jumlah: number;
  harga_beli: number;
  total_nilai: number;
  supplier: string;
  keterangan: string;
};

type RiwayatOpname = {
  id: number;
  tanggal: string;
  total_produk: number;
  total_selisih: number;
};

const SUPPLIER = ["PT Sumber Teknologi Nusantara", "CV Mitra Komputer Jaya", "PT Digital Prima Indonesia", "Toko Grosir Aksesoris IT"];

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

export default function InventoriPage() {
  const { produk, kategori, tambahProduk, tambahStok } = useErp();

  const [q, setQ] = useState("");
  const [filterKategori, setFilterKategori] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [openTambah, setOpenTambah] = useState(false);
  const [openBarangMasuk, setOpenBarangMasuk] = useState(false);
  const [selectedProduk, setSelectedProduk] = useState<Produk | null>(null);

  const [riwayatBarangMasuk, setRiwayatBarangMasuk] = useState<RiwayatBarangMasuk[]>([]);
  const [riwayatOpname, setRiwayatOpname] = useState<RiwayatOpname[]>([]);
  const [stokFisik, setStokFisik] = useState<Record<number, string>>({});
  const [filterOpnameKategori, setFilterOpnameKategori] = useState("all");

  const stokMenipis = produk.filter((p: Produk) => p.stok <= p.stok_minimum);
  const stokHabis = produk.filter((p: Produk) => p.stok <= 0);
  const totalStok = produk.reduce((s: number, p: Produk) => s + p.stok, 0);
  const totalNilaiStok = produk.reduce((s: number, p: Produk) => s + p.stok * p.harga_beli, 0);

  const filtered = useMemo(() => {
    return produk.filter((p: Produk) => {
      const cocokKeyword = `${p.nama_produk} ${p.merk}`.toLowerCase().includes(q.toLowerCase());

      const cocokKategori = filterKategori === "all" || String(p.id_kategori) === filterKategori;

      const menipis = p.stok <= p.stok_minimum;
      const habis = p.stok <= 0;

      const cocokStatus = filterStatus === "all" || (filterStatus === "aman" && !menipis && !habis) || (filterStatus === "menipis" && menipis && !habis) || (filterStatus === "habis" && habis);

      return cocokKeyword && cocokKategori && cocokStatus;
    });
  }, [produk, q, filterKategori, filterStatus]);

  const produkOpname = useMemo(() => {
    return produk.filter((p: Produk) => {
      return filterOpnameKategori === "all" || String(p.id_kategori) === filterOpnameKategori;
    });
  }, [produk, filterOpnameKategori]);

  function getNamaKategori(idKategori: number) {
    return kategori.find((k: Kategori) => k.id_kategori === idKategori)?.nama_kategori ?? "-";
  }

  function handleBarangMasuk(data: FormBarangMasukData) {
    const item = produk.find((p: Produk) => p.id_produk === data.id_produk);

    if (!item) {
      toast.error("Produk tidak ditemukan");
      return;
    }

    tambahStok(data.id_produk, data.jumlah);

    const riwayatBaru: RiwayatBarangMasuk = {
      id: riwayatBarangMasuk.length > 0 ? Math.max(...riwayatBarangMasuk.map((r) => r.id)) + 1 : 1,
      tanggal: getToday(),
      id_produk: data.id_produk,
      nama_produk: item.nama_produk,
      jumlah: data.jumlah,
      harga_beli: data.harga_beli,
      total_nilai: data.jumlah * data.harga_beli,
      supplier: data.supplier,
      keterangan: data.keterangan,
    };

    setRiwayatBarangMasuk((prev) => [riwayatBaru, ...prev]);
    toast.success("Barang masuk berhasil dicatat dan stok diperbarui");
    setOpenBarangMasuk(false);
    setSelectedProduk(null);
  }

  function simpanStockOpname() {
    const hasil = produkOpname.map((p: Produk) => {
      const fisik = Number(stokFisik[p.id_produk] ?? p.stok);
      const selisih = fisik - p.stok;

      return {
        id_produk: p.id_produk,
        nama_produk: p.nama_produk,
        stok_sistem: p.stok,
        stok_fisik: fisik,
        selisih,
      };
    });

    const adaPerubahan = hasil.filter((h) => h.selisih !== 0);

    if (adaPerubahan.length === 0) {
      toast.info("Tidak ada selisih stok yang perlu disesuaikan");
      return;
    }

    adaPerubahan.forEach((item) => {
      tambahStok(item.id_produk, item.selisih);
    });

    const riwayatBaru: RiwayatOpname = {
      id: riwayatOpname.length > 0 ? Math.max(...riwayatOpname.map((r) => r.id)) + 1 : 1,
      tanggal: getToday(),
      total_produk: produkOpname.length,
      total_selisih: adaPerubahan.reduce((s, item) => s + Math.abs(item.selisih), 0),
    };

    setRiwayatOpname((prev) => [riwayatBaru, ...prev]);
    setStokFisik({});
    toast.success("Stock opname berhasil disimpan dan stok sistem diperbarui");
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Modul Inventori</h1>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">Pantau stok real-time, catat barang masuk, kelola data produk, dan lakukan stock opname digital dalam satu sistem terpusat.</p>
        </div>

        <div className="flex gap-2">
          <Dialog open={openBarangMasuk} onOpenChange={setOpenBarangMasuk}>
            <DialogTrigger
              render={
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedProduk(null);
                  }}
                />
              }
            >
              <PackagePlus className="size-4" />
              Barang Masuk
            </DialogTrigger>

            <FormBarangMasuk produk={produk} selectedProduk={selectedProduk} onSubmit={handleBarangMasuk} />
          </Dialog>

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
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard">
            <BarChart3 className="size-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="produk">
            <Boxes className="size-4" />
            Data Barang
          </TabsTrigger>
          <TabsTrigger value="masuk">
            <PackagePlus className="size-4" />
            Barang Masuk
          </TabsTrigger>
          <TabsTrigger value="opname">
            <ClipboardCheck className="size-4" />
            Stock Opname
          </TabsTrigger>
        </TabsList>

        {/* DASHBOARD */}
        <TabsContent value="dashboard" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Total Produk</p>
                  <p className="mt-2 text-2xl font-semibold">{produk.length}</p>
                </div>
                <Boxes className="size-8 text-primary" />
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Total Stok</p>
                  <p className="mt-2 text-2xl font-semibold">{totalStok}</p>
                </div>
                <PackageCheck className="size-8 text-primary" />
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Stok Menipis</p>
                  <p className="mt-2 text-2xl font-semibold text-destructive">{stokMenipis.length}</p>
                </div>
                <AlertTriangle className="size-8 text-destructive" />
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Nilai Stok</p>
                  <p className="mt-2 text-xl font-semibold">{formatRupiah(totalNilaiStok)}</p>
                </div>
                <BarChart3 className="size-8 text-primary" />
              </div>
            </Card>
          </div>

          <Card className="border-primary/20 bg-primary/5 p-4">
            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-4">
              <div className="rounded-lg bg-background p-3">
                <p className="font-medium">1. Stok Real-time</p>
                <p className="mt-1 text-xs text-muted-foreground">Stok berubah otomatis saat barang masuk atau transaksi penjualan.</p>
              </div>

              <div className="rounded-lg bg-background p-3">
                <p className="font-medium">2. Minimum Stok</p>
                <p className="mt-1 text-xs text-muted-foreground">Sistem menandai produk yang mendekati batas minimum.</p>
              </div>

              <div className="rounded-lg bg-background p-3">
                <p className="font-medium">3. Barang Masuk</p>
                <p className="mt-1 text-xs text-muted-foreground">Penerimaan barang dari supplier langsung menambah stok.</p>
              </div>

              <div className="rounded-lg bg-background p-3">
                <p className="font-medium">4. Stock Opname</p>
                <p className="mt-1 text-xs text-muted-foreground">Stok fisik dibandingkan dengan stok sistem secara digital.</p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="overflow-hidden p-0 lg:col-span-2">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-sm font-semibold text-foreground">Notifikasi Stok Menipis</h2>
                <p className="text-xs text-muted-foreground">Produk berikut perlu segera dipantau atau dibuatkan pemesanan.</p>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/50">
                      <TableHead>Produk</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead className="text-center">Stok</TableHead>
                      <TableHead className="text-center">Minimum</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stokMenipis.slice(0, 5).map((p: Produk) => (
                      <TableRow key={p.id_produk}>
                        <TableCell>
                          <p className="font-medium">{p.nama_produk}</p>
                          <p className="text-xs text-muted-foreground">{p.merk}</p>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{getNamaKategori(p.id_kategori)}</TableCell>
                        <TableCell className="text-center font-medium text-destructive">{p.stok}</TableCell>
                        <TableCell className="text-center">{p.stok_minimum}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedProduk(p);
                              setOpenBarangMasuk(true);
                            }}
                          >
                            <PackagePlus className="size-4" />
                            Tambah Stok
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}

                    {stokMenipis.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                          Semua stok masih aman.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="text-sm font-semibold text-foreground">Ringkasan Kategori</h2>

              <div className="mt-4 space-y-3">
                {kategori.map((k: Kategori) => {
                  const jumlahProduk = produk.filter((p: Produk) => p.id_kategori === k.id_kategori).length;

                  const stokKategori = produk.filter((p: Produk) => p.id_kategori === k.id_kategori).reduce((s: number, p: Produk) => s + p.stok, 0);

                  return (
                    <div key={k.id_kategori} className="flex items-center justify-between rounded-lg bg-secondary p-3 text-sm">
                      <div>
                        <p className="font-medium text-foreground">{k.nama_kategori}</p>
                        <p className="text-xs text-muted-foreground">{jumlahProduk} produk</p>
                      </div>
                      <p className="font-semibold tabular-nums">{stokKategori}</p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* DATA BARANG */}
        <TabsContent value="produk" className="mt-4 space-y-4">
          <Card className="p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Data Barang</h2>
                <p className="mt-1 text-xs text-muted-foreground">Kelola produk multi-kategori dan pantau status stok secara real-time.</p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari produk atau merk..." className="pl-9" />
                </div>

                <Select value={filterKategori} onValueChange={setFilterKategori}>
                  <SelectTrigger className="w-full sm:w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    {kategori.map((k: Kategori) => (
                      <SelectItem key={k.id_kategori} value={String(k.id_kategori)}>
                        {k.nama_kategori}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="aman">Aman</SelectItem>
                    <SelectItem value="menipis">Menipis</SelectItem>
                    <SelectItem value="habis">Habis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

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
                  {filtered.map((p: Produk) => {
                    const menipis = p.stok <= p.stok_minimum;
                    const habis = p.stok <= 0;

                    return (
                      <TableRow key={p.id_produk}>
                        <TableCell>
                          <p className="font-medium text-foreground">{p.nama_produk}</p>
                          <p className="text-xs text-muted-foreground">{p.merk}</p>
                        </TableCell>

                        <TableCell className="text-muted-foreground">{getNamaKategori(p.id_kategori)}</TableCell>

                        <TableCell className="text-right tabular-nums text-muted-foreground">{formatRupiah(p.harga_beli)}</TableCell>

                        <TableCell className="text-right tabular-nums font-medium">{formatRupiah(p.harga_jual)}</TableCell>

                        <TableCell className="text-center">
                          <span className="font-semibold tabular-nums">{p.stok}</span>
                          <span className="text-xs text-muted-foreground"> / min {p.stok_minimum}</span>
                        </TableCell>

                        <TableCell className="text-center">
                          <StatusStokBadge habis={habis} menipis={menipis} />
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedProduk(p);
                              setOpenBarangMasuk(true);
                            }}
                          >
                            <PackagePlus className="size-4" />
                            Tambah Stok
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
        </TabsContent>

        {/* BARANG MASUK */}
        <TabsContent value="masuk" className="mt-4 space-y-4">
          <Card className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Barang Masuk dari Supplier</h2>
                <p className="mt-1 text-xs text-muted-foreground">Catat penerimaan barang. Setelah disimpan, stok produk langsung bertambah otomatis.</p>
              </div>

              <Button
                onClick={() => {
                  setSelectedProduk(null);
                  setOpenBarangMasuk(true);
                }}
              >
                <PackagePlus className="size-4" />
                Input Barang Masuk
              </Button>
            </div>
          </Card>

          <Card className="overflow-hidden p-0">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">Riwayat Barang Masuk</h2>
              <p className="text-xs text-muted-foreground">Simulasi riwayat penerimaan barang dari supplier.</p>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead>No.</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Produk</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="text-center">Jumlah</TableHead>
                    <TableHead className="text-right">Harga Beli</TableHead>
                    <TableHead className="text-right">Total Nilai</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {riwayatBarangMasuk.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">#{r.id}</TableCell>
                      <TableCell className="text-muted-foreground">{r.tanggal}</TableCell>
                      <TableCell>
                        <p className="font-medium">{r.nama_produk}</p>
                        <p className="text-xs text-muted-foreground">{r.keterangan}</p>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{r.supplier}</TableCell>
                      <TableCell className="text-center font-medium">+{r.jumlah}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatRupiah(r.harga_beli)}</TableCell>
                      <TableCell className="text-right font-medium tabular-nums">{formatRupiah(r.total_nilai)}</TableCell>
                    </TableRow>
                  ))}

                  {riwayatBarangMasuk.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                        Belum ada riwayat barang masuk.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* STOCK OPNAME */}
        <TabsContent value="opname" className="mt-4 space-y-4">
          <Card className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Stock Opname Digital</h2>
                <p className="mt-1 text-xs text-muted-foreground">Bandingkan stok sistem dengan stok fisik. Selisih akan disesuaikan otomatis saat disimpan.</p>
              </div>

              <div className="flex gap-2">
                <Select value={filterOpnameKategori} onValueChange={setFilterOpnameKategori}>
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    {kategori.map((k: Kategori) => (
                      <SelectItem key={k.id_kategori} value={String(k.id_kategori)}>
                        {k.nama_kategori}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button onClick={simpanStockOpname}>
                  <Save className="size-4" />
                  Simpan Opname
                </Button>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead>Produk</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-center">Stok Sistem</TableHead>
                    <TableHead className="text-center">Stok Fisik</TableHead>
                    <TableHead className="text-center">Selisih</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {produkOpname.map((p: Produk) => {
                    const fisik = Number(stokFisik[p.id_produk] ?? p.stok);
                    const selisih = fisik - p.stok;

                    return (
                      <TableRow key={p.id_produk}>
                        <TableCell>
                          <p className="font-medium">{p.nama_produk}</p>
                          <p className="text-xs text-muted-foreground">{p.merk}</p>
                        </TableCell>

                        <TableCell className="text-muted-foreground">{getNamaKategori(p.id_kategori)}</TableCell>

                        <TableCell className="text-center font-medium">{p.stok}</TableCell>

                        <TableCell className="text-center">
                          <Input
                            type="number"
                            value={stokFisik[p.id_produk] ?? String(p.stok)}
                            onChange={(e) =>
                              setStokFisik((prev) => ({
                                ...prev,
                                [p.id_produk]: e.target.value,
                              }))
                            }
                            className="mx-auto w-24 text-center"
                          />
                        </TableCell>

                        <TableCell className={selisih === 0 ? "text-center font-medium text-muted-foreground" : selisih > 0 ? "text-center font-medium text-accent" : "text-center font-medium text-destructive"}>
                          {selisih > 0 ? `+${selisih}` : selisih}
                        </TableCell>

                        <TableCell className="text-center">
                          {selisih === 0 ? (
                            <Badge variant="secondary" className="gap-1 border-accent/30 bg-accent/10 text-accent">
                              <CheckCircle2 className="size-3" />
                              Sesuai
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Ada Selisih</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2">
              <History className="size-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Riwayat Stock Opname</h2>
            </div>

            <div className="mt-4 space-y-2">
              {riwayatOpname.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                  <div>
                    <p className="font-medium text-foreground">Opname #{r.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.tanggal} · {r.total_produk} produk dicek
                    </p>
                  </div>

                  <Badge variant="secondary">Selisih {r.total_selisih} unit</Badge>
                </div>
              ))}

              {riwayatOpname.length === 0 && <p className="text-sm text-muted-foreground">Belum ada riwayat stock opname.</p>}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <p className="text-xs text-muted-foreground">Catatan alur: barang masuk akan menambah stok, transaksi penjualan akan mengurangi stok, dan stock opname digunakan untuk mencocokkan stok fisik dengan stok sistem.</p>
    </div>
  );
}

function StatusStokBadge({ habis, menipis }: { habis: boolean; menipis: boolean }) {
  if (habis) {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertTriangle className="size-3" />
        Habis
      </Badge>
    );
  }

  if (menipis) {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertTriangle className="size-3" />
        Menipis
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="border-accent/30 bg-accent/10 text-accent">
      Aman
    </Badge>
  );
}

function FormTambahBarang({ kategori, onSubmit }: { kategori: { id_kategori: number; nama_kategori: string }[]; onSubmit: (data: FormProdukData) => void }) {
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

function FormBarangMasuk({ produk, selectedProduk, onSubmit }: { produk: Produk[]; selectedProduk: Produk | null; onSubmit: (data: FormBarangMasukData) => void }) {
  const [idProduk, setIdProduk] = useState<string>(String(selectedProduk?.id_produk ?? produk[0]?.id_produk ?? 1));
  const [jumlah, setJumlah] = useState("");
  const [hargaBeli, setHargaBeli] = useState(String(selectedProduk?.harga_beli ?? produk[0]?.harga_beli ?? 0));
  const [supplier, setSupplier] = useState(SUPPLIER[0]);
  const [keterangan, setKeterangan] = useState("Penerimaan barang dari supplier");

  function submit() {
    if (!Number(jumlah)) {
      toast.error("Jumlah barang masuk wajib diisi");
      return;
    }

    if (Number(jumlah) <= 0) {
      toast.error("Jumlah barang masuk harus lebih dari 0");
      return;
    }

    onSubmit({
      id_produk: Number(idProduk),
      jumlah: Number(jumlah),
      harga_beli: Number(hargaBeli) || 0,
      supplier,
      keterangan: keterangan.trim() || "Penerimaan barang dari supplier",
    });
  }

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Input Barang Masuk</DialogTitle>
        <DialogDescription>Catat barang yang diterima dari supplier. Stok produk akan bertambah otomatis setelah disimpan.</DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Produk</Label>
          <Select
            value={idProduk}
            onValueChange={(v) => {
              setIdProduk(v);
              const p = produk.find((item) => item.id_produk === Number(v));
              if (p) setHargaBeli(String(p.harga_beli));
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {produk.map((p) => (
                <SelectItem key={p.id_produk} value={String(p.id_produk)}>
                  {p.nama_produk}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Supplier</Label>
          <Select value={supplier} onValueChange={setSupplier}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPLIER.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="jumlah-masuk">Jumlah Masuk</Label>
          <Input id="jumlah-masuk" type="number" value={jumlah} onChange={(e) => setJumlah(e.target.value)} placeholder="0" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="harga-beli-masuk">Harga Beli</Label>
          <Input id="harga-beli-masuk" type="number" value={hargaBeli} onChange={(e) => setHargaBeli(e.target.value)} placeholder="0" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ket-masuk">Keterangan</Label>
          <Input id="ket-masuk" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} placeholder="cth. Penerimaan PO supplier" />
        </div>
      </div>

      <DialogFooter>
        <Button onClick={submit}>
          <PackagePlus className="size-4" />
          Simpan Barang Masuk
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
