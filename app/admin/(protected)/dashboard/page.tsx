"use client";

import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import API from "@/lib/api";

type Stats = {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  totalCategories: number;
  todayOrders: number;
  pendingOrders: number;
  pendingPayments: number;
  monthlyRevenue: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get("/api/admin/stats");
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error("Fetch stats error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
      color: "bg-blue-100 text-blue-600",
      change: `${stats?.todayOrders || 0} today`,
    },
    {
      title: "Total Revenue",
      value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "bg-green-100 text-green-600",
      change: `₹${(stats?.monthlyRevenue || 0).toLocaleString()} this month`,
    },
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "bg-purple-100 text-purple-600",
      change: `${stats?.totalCategories || 0} categories`,
    },
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "bg-orange-100 text-orange-600",
      change: "Active users",
    },
  ];

  const alertCards = [
    {
      title: "Pending Orders",
      value: stats?.pendingOrders || 0,
      icon: AlertCircle,
      color: "bg-yellow-100 text-yellow-800",
      textColor: "text-yellow-600",
    },
    {
      title: "Pending Payments",
      value: stats?.pendingPayments || 0,
      icon: AlertCircle,
      color: "bg-red-100 text-red-800",
      textColor: "text-red-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome to your admin panel
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-card rounded-xl shadow-sm border p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    {card.title}
                  </p>
                  <p className="text-2xl md:text-3xl font-bold mt-2">
                    {card.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{card.change}</p>
            </div>
          );
        })}
      </div>

      {/* Alerts */}
      {(stats?.pendingOrders || 0) > 0 || (stats?.pendingPayments || 0) > 0 ? (
        <div>
          <h2 className="text-lg font-semibold mb-4">Alerts & Attention</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {alertCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={index}
                  className={`${card.color} rounded-xl p-6 border-2 border-current`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{card.title}</p>
                      <p
                        className={`text-2xl font-bold mt-2 ${card.textColor}`}
                      >
                        {card.value}
                      </p>
                    </div>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Quick Actions */}
      <div className="bg-card rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/orders"
            className="p-4 rounded-lg border hover:bg-muted transition text-center"
          >
            <ShoppingCart className="h-6 w-6 mx-auto text-primary mb-2" />
            <p className="font-medium">Manage Orders</p>
          </a>
          <a
            href="/admin/products"
            className="p-4 rounded-lg border hover:bg-muted transition text-center"
          >
            <Package className="h-6 w-6 mx-auto text-primary mb-2" />
            <p className="font-medium">Manage Products</p>
          </a>
          <a
            href="/admin/users"
            className="p-4 rounded-lg border hover:bg-muted transition text-center"
          >
            <Users className="h-6 w-6 mx-auto text-primary mb-2" />
            <p className="font-medium">Manage Users</p>
          </a>
        </div>
      </div>
    </div>
  );
}
