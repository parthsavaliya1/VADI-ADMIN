"use client";

import { useSession, signOut } from "next-auth/react";
import { Menu, ChevronDown } from "lucide-react";
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
    pathname === "/admin/dashboard"
      ? "Dashboard"
      : pathname.split("/").pop()?.replace("-", " ");

  const handleProfileClick = () => {
    setOpenDropdown(false);
    router.push("/admin/profile");
  };

  const firstLetter = session?.user?.name?.charAt(0).toUpperCase() || "A";

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setOpen(true)}
          className="md:hidden p-2 rounded-md hover:bg-muted transition"
        >
          <Menu size={20} />
        </button>

        <h1 className="text-lg font-semibold capitalize">{pageTitle}</h1>
      </div>

      {/* Right */}
      <div className="relative" ref={dropdownRef}>
        {/* Profile Button */}
        <button
          onClick={() => setOpenDropdown(!openDropdown)}
          className={`flex items-center gap-3 px-3 py-2 rounded-xl transition
          ${
            openDropdown
              ? "bg-primary/10 ring-2 ring-primary"
              : "hover:bg-muted"
          }`}
        >
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
            {firstLetter}
          </div>

          {/* Name */}
          <span className="hidden sm:block font-medium">
            {session?.user?.name}
          </span>

          {/* Chevron */}
          <ChevronDown
            size={18}
            className={`transition-transform ${
              openDropdown ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown */}
        {openDropdown && (
          <div className="absolute right-0 mt-3 w-56 bg-card border border-border rounded-xl shadow-lg py-2 z-50">
            <button
              onClick={handleProfileClick}
              className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition"
            >
              Profile
            </button>

            <div className="border-t border-border my-2"></div>

            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
