"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Boxes, ShoppingCart, Wallet, Truck, ArrowRight, ArrowDown, Database, KeyRound, Link2 } from "lucide-react";

export default function DiagramPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Alur Data &amp; Diagram Database</h1>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">Bagaimana data mengalir antar modul dan bagaimana tabel-tabel saling terhubung dalam satu basis data terpusat.</p>
      </div>

      {/* ALUR DATA ANTAR MODUL */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">1. Alur Data Antar Modul</h2>

        <Card className="p-5 lg:p-8">
          <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-7">
            <FlowNode className="lg:col-span-2" icon={Truck} tone="muted" title="Pengadaan / Supplier" tables={["purchase_order", "detail_po", "supplier"]} note="Barang masuk dari supplier" />
            <Connector />
            <FlowNode icon={Boxes} tone="primary" title="Modul Inventori" tables={["produk", "kategori"]} note="Stok bertambah / berkurang" />
            <Connector />
            <FlowNode icon={ShoppingCart} tone="primary" title="Modul Penjualan" tables={["transaksi_penjualan", "detail_penjualan"]} note="Stok berkurang otomatis" />
          </div>

          <div className="my-2 flex justify-center lg:my-4">
            <ArrowDown className="size-6 text-muted-foreground" />
          </div>

          <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-7">
            <div className="hidden lg:col-span-2 lg:block" />
            <div className="hidden lg:block" />
            <FlowNode icon={Wallet} tone="accent" title="Modul Keuangan" tables={["kas", "pengeluaran", "laporan_keuangan"]} note="Kas masuk dicatat otomatis" />
            <Connector />
            <FlowNode className="lg:col-span-2" icon={Database} tone="muted" title="Laporan & Dashboard" tables={["laporan_keuangan"]} note="Laba rugi & arus kas real-time" />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <FlowExplain num="1" text="Setiap penjualan di modul POS langsung mengurangi jumlah stok produk di modul Inventori." />
            <FlowExplain num="2" text="Nilai total transaksi otomatis dicatat sebagai kas masuk pada modul Keuangan." />
            <FlowExplain num="3" text="Data kas & pengeluaran diakumulasi menjadi laporan laba rugi yang tampil di dashboard pemilik." />
          </div>
        </Card>
      </section>

      {/* DIAGRAM DATABASE */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">2. Diagram Database Sederhana</h2>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <DbGroup
            title="Modul Inventori"
            icon={Boxes}
            tone="primary"
            tables={[
              { nama: "kategori", pk: "id_kategori", cols: ["nama_kategori"] },
              {
                nama: "produk",
                pk: "id_produk",
                fk: ["id_kategori → kategori"],
                cols: ["nama_produk", "merk", "stok", "stok_minimum", "harga_jual", "harga_beli"],
              },
              { nama: "supplier", pk: "id_supplier", cols: ["nama_supplier", "kontak", "alamat"] },
              {
                nama: "purchase_order",
                pk: "id_po",
                fk: ["id_supplier → supplier"],
                cols: ["tanggal_po", "status", "total_nilai"],
              },
              {
                nama: "detail_po",
                pk: "id_detail_po",
                fk: ["id_po → purchase_order", "id_produk → produk"],
                cols: ["jumlah_pesan", "harga_beli"],
              },
            ]}
          />
          <DbGroup
            title="Modul Penjualan"
            icon={ShoppingCart}
            tone="primary"
            tables={[
              { nama: "pelanggan", pk: "id_pelanggan", cols: ["nama_pelanggan", "kontak", "alamat"] },
              { nama: "karyawan", pk: "id_karyawan", cols: ["nama", "jabatan", "kontak"] },
              {
                nama: "transaksi_penjualan",
                pk: "id_transaksi",
                fk: ["id_pelanggan → pelanggan", "id_karyawan → karyawan"],
                cols: ["tanggal_transaksi", "total_harga", "metode_bayar", "status_bayar"],
              },
              {
                nama: "detail_penjualan",
                pk: "id_detail",
                fk: ["id_transaksi → transaksi_penjualan", "id_produk → produk"],
                cols: ["jumlah", "harga_satuan", "subtotal"],
              },
            ]}
          />
          <DbGroup
            title="Modul Keuangan"
            icon={Wallet}
            tone="accent"
            tables={[
              {
                nama: "kas",
                pk: "id_kas",
                fk: ["id_transaksi → transaksi_penjualan"],
                cols: ["tanggal", "jenis", "jumlah", "keterangan"],
              },
              { nama: "kategori_biaya", pk: "id_kategori_biaya", cols: ["nama_kategori"] },
              {
                nama: "pengeluaran",
                pk: "id_pengeluaran",
                fk: ["id_kategori_biaya → kategori_biaya", "id_karyawan → karyawan"],
                cols: ["tanggal", "jumlah", "deskripsi"],
              },
              {
                nama: "laporan_keuangan",
                pk: "id_laporan",
                cols: ["jenis_laporan", "periode_awal", "periode_akhir", "total_pemasukan", "total_pengeluaran", "laba_rugi"],
              },
            ]}
          />
        </div>

        {/* Relasi kunci antar modul */}
        <Card className="mt-4 p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Link2 className="size-4 text-primary" />
            Relasi Kunci yang Menghubungkan Antar Modul
          </h3>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <RelasiItem from="detail_penjualan.id_produk" to="produk.id_produk" desc="Penjualan menarik & mengurangi stok produk (Penjualan ↔ Inventori)" />
            <RelasiItem from="kas.id_transaksi" to="transaksi_penjualan.id_transaksi" desc="Tiap transaksi membuat catatan kas masuk (Penjualan ↔ Keuangan)" />
            <RelasiItem from="detail_po.id_produk" to="produk.id_produk" desc="Pembelian dari supplier menambah stok produk (Pengadaan ↔ Inventori)" />
            <RelasiItem from="pengeluaran.id_kategori_biaya" to="kategori_biaya.id_kategori_biaya" desc="Pengeluaran dikelompokkan per kategori biaya (dalam Keuangan)" />
          </div>
        </Card>
      </section>
    </div>
  );
}

function toneClasses(tone: "primary" | "accent" | "muted") {
  if (tone === "primary") return { box: "border-primary/30 bg-primary/5", icon: "bg-primary/10 text-primary" };
  if (tone === "accent") return { box: "border-accent/30 bg-accent/5", icon: "bg-accent/10 text-accent" };
  return { box: "border-border bg-secondary/50", icon: "bg-secondary text-muted-foreground" };
}

function FlowNode({ icon: Icon, title, tables, note, tone, className }: { icon: React.ElementType; title: string; tables: string[]; note: string; tone: "primary" | "accent" | "muted"; className?: string }) {
  const c = toneClasses(tone);
  return (
    <div className={`flex flex-col rounded-xl border p-4 ${c.box} ${className ?? ""}`}>
      <div className="flex items-center gap-2">
        <span className={`flex size-9 items-center justify-center rounded-lg ${c.icon}`}>
          <Icon className="size-4.5" />
        </span>
        <p className="text-sm font-semibold text-foreground">{title}</p>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{note}</p>
      <div className="mt-3 flex flex-wrap gap-1">
        {tables.map((t) => (
          <span key={t} className="rounded-md bg-card px-1.5 py-0.5 font-mono text-[10px] text-foreground ring-1 ring-border">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function Connector() {
  return (
    <div className="flex items-center justify-center">
      <ArrowRight className="hidden size-6 text-muted-foreground lg:block" />
      <ArrowDown className="size-5 text-muted-foreground lg:hidden" />
    </div>
  );
}

function FlowExplain({ num, text }: { num: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-lg border border-border p-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{num}</span>
      <p className="text-xs leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}

function DbGroup({ title, icon: Icon, tone, tables }: { title: string; icon: React.ElementType; tone: "primary" | "accent" | "muted"; tables: { nama: string; pk: string; fk?: string[]; cols: string[] }[] }) {
  const c = toneClasses(tone);
  return (
    <Card className="gap-0 p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className={`flex size-8 items-center justify-center rounded-lg ${c.icon}`}>
          <Icon className="size-4" />
        </span>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="space-y-3">
        {tables.map((t) => (
          <div key={t.nama} className="overflow-hidden rounded-lg border border-border">
            <div className="border-b border-border bg-secondary/60 px-3 py-1.5">
              <p className="font-mono text-xs font-semibold text-foreground">{t.nama}</p>
            </div>
            <div className="space-y-1 px-3 py-2">
              <div className="flex items-center gap-1.5">
                <KeyRound className="size-3 text-primary" />
                <span className="font-mono text-[11px] font-medium text-foreground">{t.pk}</span>
                <Badge variant="secondary" className="ml-auto h-4 px-1 text-[9px]">
                  PK
                </Badge>
              </div>
              {t.fk?.map((f) => (
                <div key={f} className="flex items-center gap-1.5">
                  <Link2 className="size-3 text-accent" />
                  <span className="font-mono text-[11px] text-muted-foreground">{f}</span>
                  <Badge variant="secondary" className="ml-auto h-4 px-1 text-[9px]">
                    FK
                  </Badge>
                </div>
              ))}
              {t.cols.map((col) => (
                <p key={col} className="pl-4.5 font-mono text-[11px] text-muted-foreground">
                  {col}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function RelasiItem({ from, to, desc }: { from: string; to: string; desc: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-primary">{from}</span>
        <ArrowRight className="size-3 text-muted-foreground" />
        <span className="rounded bg-accent/10 px-1.5 py-0.5 text-accent">{to}</span>
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}
