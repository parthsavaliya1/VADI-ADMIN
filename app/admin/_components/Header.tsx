"use client";

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
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-[#E5E7EB] bg-white px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-[#1F2937] transition hover:bg-[#F7F8FA] md:hidden"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-[15px] font-semibold capitalize text-[#1F2937]">
            {pageTitle}
          </h1>
          <p className="hidden text-xs text-[#6B7280] sm:block">{roleLabel} workspace</p>
        </div>
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpenDropdown(!openDropdown)}
          className={`flex items-center gap-2.5 rounded-lg border px-2 py-1.5 transition
          ${
            openDropdown
              ? "border-[#B56A45]/30 bg-[#F8EDE6]"
              : "border-transparent hover:border-[#E5E7EB] hover:bg-[#F7F8FA]"
          }`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#B56A45] text-sm font-semibold text-white">
            {firstLetter}
          </div>

          <span className="hidden max-w-[10rem] truncate text-sm font-medium text-[#1F2937] sm:block">
            {session?.user?.name}
          </span>

          <ChevronDown
            size={16}
            className={`text-[#6B7280] transition-transform ${
              openDropdown ? "rotate-180" : ""
            }`}
          />
        </button>

        {openDropdown && (
          <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white py-1 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
            <div className="border-b border-[#E5E7EB] px-3 py-2.5">
              <p className="truncate text-sm font-medium text-[#1F2937]">
                {session?.user?.name}
              </p>
              <p className="truncate text-xs text-[#6B7280]">
                {session?.user?.email || roleLabel}
              </p>
            </div>
            <button
              onClick={handleProfileClick}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#1F2937] transition hover:bg-[#F7F8FA]"
            >
              <User size={15} className="text-[#6B7280]" />
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
