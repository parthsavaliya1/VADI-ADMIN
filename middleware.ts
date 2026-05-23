import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const ADMIN_AREA_PREFIXES = [
  "/admin/dashboard",
  "/admin/products",
  "/admin/categories",
  "/admin/orders",
  "/admin/payments",
  "/admin/users",
  "/admin/drivers",
  "/admin/notifications",
  "/admin/banner",
  "/admin/deal-settings",
  "/admin/home-section-settings",
];

export async function middleware(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return NextResponse.next();
  }

  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret });

  const isDriverDeliveries =
    pathname === "/driver/deliveries" || pathname.startsWith("/driver/deliveries/");
  const isAdminArea = ADMIN_AREA_PREFIXES.some((p) => pathname.startsWith(p));

  if (isDriverDeliveries) {
    if (!token) {
      return NextResponse.redirect(new URL("/driver/login", req.url));
    }
    if (token.role !== "driver") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    return NextResponse.next();
  }

  if (isAdminArea) {
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (token.role === "driver") {
      return NextResponse.redirect(new URL("/driver/deliveries", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/dashboard/:path*",
    "/admin/products/:path*",
    "/admin/categories/:path*",
    "/admin/orders/:path*",
    "/admin/payments/:path*",
    "/admin/users/:path*",
    "/admin/drivers/:path*",
    "/admin/notifications/:path*",
    "/admin/banner/:path*",
    "/admin/deal-settings/:path*",
    "/admin/home-section-settings/:path*",
    "/driver/deliveries",
    "/driver/deliveries/:path*",
  ],
};
