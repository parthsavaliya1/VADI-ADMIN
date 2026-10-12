"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Package, FolderTree, AlertCircle, DollarSign } from "lucide-react";
import { useSession } from "next-auth/react";
import API from "@/lib/api";

type Stats = {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCategories: number;
  todayOrders: number;
  pendingOrders: number;
  monthlyRevenue: number;
};

export default function SellerDashboardPage() {
  const { data: session } = useSession();
  const sellerId = session?.user?.role === "seller" ? session.user.id : "";
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sellerId) return;
    API.get("/sellers/me/dashboard", { params: { sellerId } })
      .then(({ data }) => {
        if (data.success) setStats(data.data);
      })
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [sellerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      change: `${stats?.todayOrders || 0} today`,
    },
    {
      title: "Total Revenue",
      value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      change: `₹${(stats?.monthlyRevenue || 0).toLocaleString()} this month`,
    },
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      icon: Package,
      change: "Live in your shop",
    },
    {
      title: "Categories waiting",
      value: stats?.totalCategories || 0,
      icon: FolderTree,
      change: "Waiting for admin approval",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-[#6B7280]">Welcome to your seller panel</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="rounded-xl border border-[#E5E7EB] bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[13px] font-medium text-[#6B7280]">{card.title}</p>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F8EDE6] text-[#B56A45]">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-[1.75rem] font-semibold leading-none tracking-tight text-[#1F2937]">{card.value}</p>
              <p className="mt-2 text-xs text-[#6B7280]">{card.change}</p>
            </div>
          );
        })}
      </div>

      {(stats?.pendingOrders || 0) > 0 ? (
        <div>
          <h2 className="mb-3 text-sm font-semibold">Needs attention</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-5 text-amber-800">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium">Pending Orders</p>
                  <p className="mt-2 text-2xl font-semibold text-amber-700">{stats?.pendingOrders || 0}</p>
                </div>
                <AlertCircle className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold">Quick Links</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <a href="/admin/seller/orders" className="rounded-lg border border-[#E5E7EB] p-4 text-center transition hover:border-[#B56A45]/30 hover:bg-[#F8EDE6]">
            <ShoppingCart className="mx-auto mb-2 h-5 w-5 text-[#B56A45]" />
            <p className="text-sm font-medium">Manage Orders</p>
          </a>
          <a href="/admin/seller/products" className="rounded-lg border border-[#E5E7EB] p-4 text-center transition hover:border-[#B56A45]/30 hover:bg-[#F8EDE6]">
            <Package className="mx-auto mb-2 h-5 w-5 text-[#B56A45]" />
            <p className="text-sm font-medium">Manage Products</p>
          </a>
          <a href="/admin/seller/categories" className="rounded-lg border border-[#E5E7EB] p-4 text-center transition hover:border-[#B56A45]/30 hover:bg-[#F8EDE6]">
            <FolderTree className="mx-auto mb-2 h-5 w-5 text-[#B56A45]" />
            <p className="text-sm font-medium">Categories</p>
          </a>
        </div>
      </div>
    </div>
  );
}
