"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard,
  Boxes,
  ShoppingCart,
  Wallet,
  Database,
  ClipboardList,
  Truck,
  Settings2,
  FileSpreadsheet,
  Menu,
  X,
  Cpu,
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, desc: "Ringkasan" },
  { href: "/inventori", label: "Inventori", icon: Boxes, desc: "Modul Stok" },
  { href: "/penjualan", label: "Penjualan", icon: ShoppingCart, desc: "Modul POS" },
  { href: "/keuangan", label: "Keuangan", icon: Wallet, desc: "Modul Finance" },
  { href: "/sales-order", label: "Sales Order", icon: ClipboardList, desc: "Penjualan B2B" },
  { href: "/purchase-order", label: "Purchase Order", icon: Truck, desc: "Pengadaan" },
  { href: "/accounting-report", label: "Accounting Report", icon: FileSpreadsheet, desc: "Laporan" },
  { href: "/konfigurasi-erp", label: "Konfigurasi ERP", icon: Settings2, desc: "Pengaturan" },
  { href: "/diagram", label: "Alur & Database", icon: Database, desc: "Diagram" },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Sidebar mobile */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 rounded-md p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent"
              aria-label="Tutup menu"
            >
              <X className="size-5" />
            </button>
            <SidebarContent pathname={pathname} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 lg:px-8">
          <button
            onClick={() => setOpen(true)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary lg:hidden"
            aria-label="Buka menu"
          >
            <Menu className="size-5" />
          </button>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {NAV.find((n) => n.href === pathname)?.label ?? "ERP"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              Prototipe Sistem ERP &middot; CV Prismakita Computer
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
            <span className="flex size-6 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              FR
            </span>
            <span className="hidden text-xs font-medium text-secondary-foreground sm:inline">
              Fahrur Rozi &middot; Pemilik
            </span>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  )
}

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <>
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Cpu className="size-5" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-sidebar-foreground">Prismakita</p>
          <p className="text-[11px] text-sidebar-foreground/60">ERP System</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
          Modul
        </p>
        {NAV.map((item) => {
          const active = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4.5 shrink-0" />
              <span className="flex-1 font-medium">{item.label}</span>
              <span
                className={cn(
                  "text-[10px]",
                  active ? "text-sidebar-primary-foreground/70" : "text-sidebar-foreground/40",
                )}
              >
                {item.desc}
              </span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto px-5 py-4">
        <div className="rounded-lg bg-sidebar-accent/60 p-3">
          <p className="text-[11px] font-medium text-sidebar-foreground/80">Prototipe Akademik</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-sidebar-foreground/50">
            Data hanya simulasi untuk menunjukkan alur antar modul.
          </p>
        </div>
      </div>
    </>
  )
}
