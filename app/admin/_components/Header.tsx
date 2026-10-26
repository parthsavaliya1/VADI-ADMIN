"use client";

import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { Menu, ChevronDown, User, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface HeaderProps {
  setOpen: (value: boolean) => void;
}

export default function Header({ setOpen }: HeaderProps) {
  const { data: session } = useSession();
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Dynamic title
  const pageTitle =
    pathname === "/admin/dashboard" || pathname === "/admin/seller"
      ? "Dashboard"
      : pathname.startsWith("/admin/seller/products")
        ? "My products"
        : pathname.startsWith("/admin/seller/orders")
          ? "My orders"
          : pathname === "/admin/profile"
            ? "Profile"
            : pathname.split("/").pop()?.replace("-", " ");

  const handleProfileClick = () => {
    setOpenDropdown(false);
    router.push("/admin/profile");
  };

  const firstLetter = session?.user?.name?.charAt(0).toUpperCase() || "A";
  const roleLabel = session?.user?.role === "seller" ? "Seller" : "Admin";

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-foreground transition hover:bg-background md:hidden"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>

        <Image src="/vadi-logo.png" alt="VADI Fresh" width={500} height={500} className="h-10 w-10 shrink-0 object-contain md:hidden" />
        <div className="min-w-0">
          <h1 className="truncate text-[15px] font-semibold capitalize text-foreground">
            {pageTitle}
          </h1>
          <p className="hidden text-xs text-muted-foreground sm:block">{roleLabel} workspace</p>
        </div>
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpenDropdown(!openDropdown)}
          className={`flex items-center gap-2.5 rounded-lg border px-2 py-1.5 transition
          ${
            openDropdown
              ? "border-primary/30 bg-secondary"
              : "border-transparent hover:border-border hover:bg-background"
          }`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
            {firstLetter}
          </div>

          <span className="hidden max-w-[10rem] truncate text-sm font-medium text-foreground sm:block">
            {session?.user?.name}
          </span>

          <ChevronDown
            size={16}
            className={`text-muted-foreground transition-transform ${
              openDropdown ? "rotate-180" : ""
            }`}
          />
        </button>

        {openDropdown && (
          <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
            <div className="border-b border-border px-3 py-2.5">
              <p className="truncate text-sm font-medium text-foreground">
                {session?.user?.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {session?.user?.email || roleLabel}
              </p>
            </div>
            <button
              onClick={handleProfileClick}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground transition hover:bg-background"
            >
              <User size={15} className="text-muted-foreground" />
              Profile
            </button>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
