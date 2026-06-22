"use client";

import { useMemo, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpRight, ArrowDownRight, Plus, TrendingUp, TrendingDown, Scale, Search, Wallet, ReceiptText, FileText, Download, CalendarDays, BarChart3 } from "lucide-react";
import { toast } from "sonner";

export default function KeuanganPage() {
  const { kas, pengeluaran, kategoriBiaya, tambahPengeluaran, totalPemasukan, totalPengeluaran, labaRugi } = useErp();

  const [open, setOpen] = useState(false);
  const [qKas, setQKas] = useState("");
  const [filterKas, setFilterKas] = useState("Semua");
  const [qPengeluaran, setQPengeluaran] = useState("");
  const [filterKategori, setFilterKategori] = useState("Semua");

  const [jenisLaporan, setJenisLaporan] = useState("laba_rugi");
  const [periodeAwal, setPeriodeAwal] = useState("");
  const [periodeAkhir, setPeriodeAkhir] = useState("");
  const [laporanGenerated, setLaporanGenerated] = useState(false);

  function getNamaKategori(id: number) {
    return kategoriBiaya.find((k) => k.id_kategori_biaya === id)?.nama_kategori ?? "Tidak diketahui";
  }

  const saldoKas = kas.reduce((total, item) => {
    if (item.jenis === "Masuk") return total + item.jumlah;
    return total - item.jumlah;
  }, 0);

  const kasFiltered = useMemo(() => {
    return kas.filter((item) => {
      const cocokKeyword = `${item.tanggal} ${item.keterangan} ${item.jenis} ${item.id_transaksi ?? ""}`.toLowerCase().includes(qKas.toLowerCase());

      const cocokJenis = filterKas === "Semua" || item.jenis === filterKas;

      return cocokKeyword && cocokJenis;
    });
  }, [kas, qKas, filterKas]);

  const pengeluaranFiltered = useMemo(() => {
    return pengeluaran.filter((item) => {
      const namaKategori = getNamaKategori(item.id_kategori_biaya);

      const cocokKeyword = `${item.tanggal ?? ""} ${item.deskripsi} ${item.karyawan ?? ""} ${namaKategori}`.toLowerCase().includes(qPengeluaran.toLowerCase());

      const cocokKategori = filterKategori === "Semua" || String(item.id_kategori_biaya) === filterKategori;

      return cocokKeyword && cocokKategori;
    });
  }, [pengeluaran, qPengeluaran, filterKategori, kategoriBiaya]);

  const perKategori = kategoriBiaya.map((k) => ({
    id: k.id_kategori_biaya,
    nama: k.nama_kategori,
    total: pengeluaran.filter((p) => p.id_kategori_biaya === k.id_kategori_biaya).reduce((s, p) => s + p.jumlah, 0),
    jumlahTransaksi: pengeluaran.filter((p) => p.id_kategori_biaya === k.id_kategori_biaya).length,
  }));

  const maxKat = Math.max(1, ...perKategori.map((k) => k.total));

  const pengeluaranTerbesar = [...pengeluaran].sort((a, b) => b.jumlah - a.jumlah)[0];

  function inPeriode(tanggal: string) {
    if (!periodeAwal && !periodeAkhir) return true;

    const d = new Date(tanggal);
    if (Number.isNaN(d.getTime())) return true;

    if (periodeAwal && d < new Date(periodeAwal)) return false;
    if (periodeAkhir && d > new Date(periodeAkhir)) return false;

    return true;
  }

  const kasPeriode = kas.filter((item) => inPeriode(item.tanggal));

  const laporanPemasukan = kasPeriode.filter((item) => item.jenis === "Masuk").reduce((s, item) => s + item.jumlah, 0);

  const laporanPengeluaran = kasPeriode.filter((item) => item.jenis === "Keluar").reduce((s, item) => s + item.jumlah, 0);

  const laporanLabaRugi = laporanPemasukan - laporanPengeluaran;

  function generateLaporan() {
    setLaporanGenerated(true);
    toast.success("Laporan keuangan berhasil dibuat");
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Modul Keuangan</h1>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">Kelola kas masuk dari penjualan, catat pengeluaran operasional, dan buat laporan keuangan secara otomatis.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="size-4" />
            Catat Pengeluaran
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

      <Tabs defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard">
            <BarChart3 className="size-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="kas">
            <Wallet className="size-4" />
            Buku Kas
          </TabsTrigger>
          <TabsTrigger value="pengeluaran">
            <ReceiptText className="size-4" />
            Pengeluaran
          </TabsTrigger>
          <TabsTrigger value="laporan">
            <FileText className="size-4" />
            Laporan
          </TabsTrigger>
        </TabsList>

        {/* DASHBOARD */}
        <TabsContent value="dashboard" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="gap-0 p-5">
              <div className="flex items-center gap-2 text-accent">
                <TrendingUp className="size-4" />
                <p className="text-sm font-medium">Total Pemasukan</p>
              </div>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{formatRupiah(totalPemasukan)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Kas masuk otomatis dari transaksi penjualan.</p>
            </Card>

            <Card className="gap-0 p-5">
              <div className="flex items-center gap-2 text-destructive">
                <TrendingDown className="size-4" />
                <p className="text-sm font-medium">Total Pengeluaran</p>
              </div>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{formatRupiah(totalPengeluaran)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Pengeluaran operasional toko.</p>
            </Card>

            <Card className="gap-0 p-5">
              <div className="flex items-center gap-2 text-primary">
                <Wallet className="size-4" />
                <p className="text-sm font-medium">Saldo Kas</p>
              </div>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{formatRupiah(saldoKas)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Selisih kas masuk dan kas keluar.</p>
            </Card>

            <Card className="gap-0 bg-primary p-5 text-primary-foreground">
              <div className="flex items-center gap-2">
                <Scale className="size-4" />
                <p className="text-sm font-medium">Laba / Rugi</p>
              </div>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{formatRupiah(labaRugi)}</p>
              <p className="mt-1 text-xs text-primary-foreground/80">{labaRugi >= 0 ? "Status: Laba" : "Status: Rugi"}</p>
            </Card>
          </div>

          <Card className="border-primary/20 bg-primary/5 p-4">
            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
              <div className="rounded-lg bg-background p-3">
                <p className="font-medium">1. Kas Masuk Otomatis</p>
                <p className="mt-1 text-xs text-muted-foreground">Transaksi penjualan lunas langsung dicatat sebagai pemasukan.</p>
              </div>

              <div className="rounded-lg bg-background p-3">
                <p className="font-medium">2. Pengeluaran Berkategori</p>
                <p className="mt-1 text-xs text-muted-foreground">Biaya seperti sewa, listrik, gaji, dan perlengkapan dicatat per kategori.</p>
              </div>

              <div className="rounded-lg bg-background p-3">
                <p className="font-medium">3. Laporan Otomatis</p>
                <p className="mt-1 text-xs text-muted-foreground">Sistem membantu membuat laporan laba rugi, arus kas, dan neraca sederhana.</p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="overflow-hidden p-0 lg:col-span-2">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-sm font-semibold text-foreground">Ringkasan Buku Kas Terbaru</h2>
                <p className="text-xs text-muted-foreground">Arus kas masuk dan keluar dari aktivitas operasional.</p>
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
                    {kas.slice(0, 5).map((k) => (
                      <TableRow key={k.id_kas}>
                        <TableCell className="whitespace-nowrap text-muted-foreground">{k.tanggal}</TableCell>
                        <TableCell>
                          <span className="text-foreground">{k.keterangan}</span>
                          {k.id_transaksi && <span className="ml-1 text-xs text-muted-foreground">(otomatis dari penjualan)</span>}
                        </TableCell>
                        <TableCell>
                          <BadgeJenisKas jenis={k.jenis} />
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

            <Card className="p-5">
              <h2 className="text-sm font-semibold text-foreground">Pengeluaran per Kategori</h2>

              <div className="mt-4 space-y-4">
                {perKategori.map((k) => (
                  <div key={k.id}>
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
                <p className="text-xs font-medium text-muted-foreground">Pengeluaran terbesar</p>
                {pengeluaranTerbesar ? (
                  <div className="rounded-lg bg-secondary p-3 text-sm">
                    <p className="font-medium text-foreground">{pengeluaranTerbesar.deskripsi}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{getNamaKategori(pengeluaranTerbesar.id_kategori_biaya)}</p>
                    <p className="mt-2 font-semibold text-destructive">{formatRupiah(pengeluaranTerbesar.jumlah)}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Belum ada data pengeluaran.</p>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* BUKU KAS */}
        <TabsContent value="kas" className="mt-4 space-y-4">
          <Card className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Buku Kas</h2>
                <p className="mt-1 text-xs text-muted-foreground">Data kas masuk dari penjualan dan kas keluar dari pengeluaran operasional.</p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={qKas} onChange={(e) => setQKas(e.target.value)} placeholder="Cari kas..." className="pl-9" />
                </div>

                <Select value={filterKas} onValueChange={setFilterKas}>
                  <SelectTrigger className="w-full sm:w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Semua">Semua</SelectItem>
                    <SelectItem value="Masuk">Masuk</SelectItem>
                    <SelectItem value="Keluar">Keluar</SelectItem>
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
                    <TableHead>No. Kas</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kasFiltered.map((k) => (
                    <TableRow key={k.id_kas}>
                      <TableCell className="font-medium">#{k.id_kas}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">{k.tanggal}</TableCell>
                      <TableCell>
                        <span className="text-foreground">{k.keterangan}</span>
                        {k.id_transaksi && <span className="ml-1 text-xs text-muted-foreground">(otomatis dari penjualan #{k.id_transaksi})</span>}
                      </TableCell>
                      <TableCell>
                        <BadgeJenisKas jenis={k.jenis} />
                      </TableCell>
                      <TableCell className={k.jenis === "Masuk" ? "text-right font-medium tabular-nums text-accent" : "text-right font-medium tabular-nums text-destructive"}>
                        {k.jenis === "Masuk" ? "+" : "-"}
                        {formatRupiah(k.jumlah)}
                      </TableCell>
                    </TableRow>
                  ))}

                  {kasFiltered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                        Data kas tidak ditemukan.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* PENGELUARAN */}
        <TabsContent value="pengeluaran" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="p-5">
              <p className="text-xs text-muted-foreground">Total Pengeluaran</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{formatRupiah(totalPengeluaran)}</p>
            </Card>

            <Card className="p-5">
              <p className="text-xs text-muted-foreground">Jumlah Transaksi</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{pengeluaran.length}</p>
            </Card>

            <Card className="p-5">
              <p className="text-xs text-muted-foreground">Pengeluaran Terbesar</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{pengeluaranTerbesar ? formatRupiah(pengeluaranTerbesar.jumlah) : formatRupiah(0)}</p>
            </Card>
          </div>

          <Card className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Data Pengeluaran Operasional</h2>
                <p className="mt-1 text-xs text-muted-foreground">Catatan biaya sewa, listrik, gaji, internet, perlengkapan toko, dan biaya operasional lainnya.</p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={qPengeluaran} onChange={(e) => setQPengeluaran(e.target.value)} placeholder="Cari pengeluaran..." className="pl-9" />
                </div>

                <Select value={filterKategori} onValueChange={setFilterKategori}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Semua">Semua Kategori</SelectItem>
                    {kategoriBiaya.map((k) => (
                      <SelectItem key={k.id_kategori_biaya} value={String(k.id_kategori_biaya)}>
                        {k.nama_kategori}
                      </SelectItem>
                    ))}
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
                    <TableHead>No.</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Dicatat Oleh</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pengeluaranFiltered.map((p) => (
                    <TableRow key={p.id_pengeluaran}>
                      <TableCell className="font-medium">#{p.id_pengeluaran}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">{p.tanggal ?? "-"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{getNamaKategori(p.id_kategori_biaya)}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{p.karyawan ?? "-"}</TableCell>
                      <TableCell className="text-foreground">{p.deskripsi}</TableCell>
                      <TableCell className="text-right font-medium tabular-nums text-destructive">-{formatRupiah(p.jumlah)}</TableCell>
                    </TableRow>
                  ))}

                  {pengeluaranFiltered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                        Data pengeluaran tidak ditemukan.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* LAPORAN */}
        <TabsContent value="laporan" className="mt-4 space-y-4">
          <Card className="p-5">
            <div className="flex items-start gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="size-5" />
              </span>

              <div>
                <h2 className="text-sm font-semibold text-foreground">Generate Laporan Keuangan</h2>
                <p className="mt-1 text-xs text-muted-foreground">Buat laporan laba rugi, arus kas, dan neraca sederhana berdasarkan data kas serta pengeluaran yang sudah tercatat.</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div className="space-y-1.5">
                <Label>Jenis Laporan</Label>
                <Select value={jenisLaporan} onValueChange={setJenisLaporan}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="laba_rugi">Laba Rugi</SelectItem>
                    <SelectItem value="arus_kas">Arus Kas</SelectItem>
                    <SelectItem value="neraca">Neraca Sederhana</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="periode-awal">Periode Awal</Label>
                <Input id="periode-awal" type="date" value={periodeAwal} onChange={(e) => setPeriodeAwal(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="periode-akhir">Periode Akhir</Label>
                <Input id="periode-akhir" type="date" value={periodeAkhir} onChange={(e) => setPeriodeAkhir(e.target.value)} />
              </div>

              <div className="flex items-end">
                <Button className="w-full" onClick={generateLaporan}>
                  <CalendarDays className="size-4" />
                  Generate
                </Button>
              </div>
            </div>
          </Card>

          {laporanGenerated ? (
            <Card className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    {jenisLaporan === "laba_rugi" && "Laporan Laba Rugi"}
                    {jenisLaporan === "arus_kas" && "Laporan Arus Kas"}
                    {jenisLaporan === "neraca" && "Neraca Sederhana"}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Periode: {periodeAwal || "Awal"} sampai {periodeAkhir || "Akhir"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => toast.success("Export PDF berhasil dibuat")}>
                    <Download className="size-4" />
                    PDF
                  </Button>
                  <Button variant="outline" onClick={() => toast.success("Export Excel berhasil dibuat")}>
                    <Download className="size-4" />
                    Excel
                  </Button>
                </div>
              </div>

              <Separator className="my-5" />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-border p-4">
                  <p className="text-xs text-muted-foreground">Total Pemasukan</p>
                  <p className="mt-2 text-xl font-semibold text-accent">{formatRupiah(laporanPemasukan)}</p>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <p className="text-xs text-muted-foreground">Total Pengeluaran</p>
                  <p className="mt-2 text-xl font-semibold text-destructive">{formatRupiah(laporanPengeluaran)}</p>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <p className="text-xs text-muted-foreground">Laba / Rugi</p>
                  <p className={laporanLabaRugi >= 0 ? "mt-2 text-xl font-semibold text-accent" : "mt-2 text-xl font-semibold text-destructive"}>{formatRupiah(laporanLabaRugi)}</p>
                  <Badge variant="secondary" className={laporanLabaRugi >= 0 ? "mt-2 border-accent/30 bg-accent/10 text-accent" : "mt-2 border-destructive/30 bg-destructive/10 text-destructive"}>
                    {laporanLabaRugi >= 0 ? "Laba" : "Rugi"}
                  </Badge>
                </div>
              </div>

              <div className="mt-5 rounded-lg bg-secondary p-4 text-sm text-muted-foreground">
                {jenisLaporan === "laba_rugi" && <p>Laporan laba rugi menampilkan selisih antara total pemasukan dan total pengeluaran dalam periode yang dipilih.</p>}

                {jenisLaporan === "arus_kas" && <p>Laporan arus kas menampilkan arus kas masuk dari penjualan dan arus kas keluar dari pengeluaran operasional.</p>}

                {jenisLaporan === "neraca" && <p>Neraca sederhana menampilkan posisi saldo kas berdasarkan akumulasi pemasukan dan pengeluaran yang tercatat dalam sistem.</p>}
              </div>
            </Card>
          ) : (
            <Card className="p-10 text-center">
              <FileText className="mx-auto size-10 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">Pilih jenis laporan dan periode, lalu klik Generate.</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BadgeJenisKas({ jenis }: { jenis: string }) {
  if (jenis === "Masuk") {
    return (
      <Badge variant="secondary" className="gap-1 border-accent/30 bg-accent/10 text-accent">
        <ArrowUpRight className="size-3" />
        Masuk
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="gap-1 border-destructive/30 bg-destructive/10 text-destructive">
      <ArrowDownRight className="size-3" />
      Keluar
    </Badge>
  );
}

function FormPengeluaran({
  kategoriBiaya,
  onSubmit,
}: {
  kategoriBiaya: { id_kategori_biaya: number; nama_kategori: string }[];
  onSubmit: (data: { tanggal: string; id_kategori_biaya: number; karyawan: string; jumlah: number; deskripsi: string }) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);

  const [tanggal, setTanggal] = useState(today);
  const [idKat, setIdKat] = useState(String(kategoriBiaya[0]?.id_kategori_biaya ?? 1));
  const [karyawan, setKaryawan] = useState(KARYAWAN[0]);
  const [jumlah, setJumlah] = useState("");
  const [deskripsi, setDeskripsi] = useState("");

  function submit() {
    if (!Number(jumlah)) {
      toast.error("Jumlah pengeluaran harus diisi");
      return;
    }

    if (!tanggal) {
      toast.error("Tanggal pengeluaran harus diisi");
      return;
    }

    onSubmit({
      tanggal,
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
          <Label htmlFor="tanggal">Tanggal</Label>
          <Input id="tanggal" type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
        </div>

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
          <Plus className="size-4" />
          Simpan
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
