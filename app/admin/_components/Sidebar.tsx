"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Shield,
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  CreditCard,
  Percent,
  FolderTree,
  BellRing,
  Image as ImageIcon,
  Timer,
  LayoutGrid,
  Palette,
  Store,
  Truck,
  X,
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  setOpen: (value: boolean) => void;
}

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const firstLetter = session?.user?.name?.charAt(0).toUpperCase() || "A";
  const isSeller = session?.user?.role === "seller";

  const sellerItems = [
    { name: "Dashboard", href: "/admin/seller", icon: LayoutDashboard },
    { name: "My products", href: "/admin/seller/products", icon: Package },
    { name: "Categories", href: "/admin/seller/categories", icon: FolderTree },
    { name: "My orders", href: "/admin/seller/orders", icon: ShoppingCart },
    { name: "Earnings", href: "/admin/seller/earnings", icon: CreditCard },
  ];

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Products",
      href: "/admin/products",
      icon: Package,
    },
    {
      name: "Categories", // 👈 ADD THIS
      href: "/admin/categories",
      icon: FolderTree,
    },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: ShoppingCart,
    },
    {
      name: "Payments",
      href: "/admin/payments",
      icon: CreditCard,
    },
    {
      name: "Payment rules",
      href: "/admin/commission",
      icon: Percent,
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      name: "Sellers",
      href: "/admin/sellers",
      icon: Store,
    },
    {
      name: "Staff",
      href: "/admin/drivers",
      icon: Truck,
    },
    {
      name: "Notifications",
      href: "/admin/notifications",
      icon: BellRing,
    },
    {
      name: "Banner",
      href: "/admin/banner",
      icon: ImageIcon,
    },
    {
      name: "Deal Settings",
      href: "/admin/deal-settings",
      icon: Timer,
    },
    {
      name: "Home sections",
      href: "/admin/home-section-settings",
      icon: LayoutGrid,
    },
    {
      name: "Theme",
      href: "/admin/theme-settings",
      icon: Palette,
    },
  ];

  return (
    <>
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-[#1F2937]/40 md:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 flex h-full w-[min(17.5rem,88vw)] flex-col border-r border-border bg-card transition-transform duration-300 md:static md:w-64 md:translate-x-0
        ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border px-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
              {isSeller ? <Store size={18} /> : <Shield size={18} />}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight text-foreground">
                VADI
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {isSeller ? "Seller" : "Admin"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-background md:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {(isSeller ? sellerItems : navItems).map((item) => {
            const href = item.href.split("#")[0];
            const isActive = href === "/admin/seller" || href === "/admin/dashboard"
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] transition-colors
                ${
                  isActive
                    ? "bg-primary font-medium text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon size={17} strokeWidth={isActive ? 2.25 : 1.75} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-primary">
              {firstLetter}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {session?.user?.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {session?.user?.email}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
