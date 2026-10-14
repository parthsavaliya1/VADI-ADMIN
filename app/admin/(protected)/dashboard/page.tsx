"use client";

import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Package,
  Users,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import API from "@/lib/api";

type Slice = { label: string; count: number };

type MonthPoint = {
  label: string;
  users: number;
  orders: number;
  products: number;
  payments: number;
};

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
  charts?: {
    monthly: MonthPoint[];
    usersByRole: Slice[];
    ordersByStatus: Slice[];
    paymentsByStatus: Slice[];
    productsByStatus: Slice[];
  };
};

const SERIES = [
  { key: "users" as const, label: "Users", color: "hsl(var(--primary))" },
  { key: "orders" as const, label: "Orders", color: "hsl(var(--foreground))" },
  { key: "products" as const, label: "Products", color: "hsl(var(--muted-foreground))" },
  { key: "payments" as const, label: "Payments", color: "#D7B59A" },
];

function ActivityChart({ points }: { points: MonthPoint[] }) {
  const max = Math.max(
    1,
    ...points.flatMap((point) => SERIES.map((series) => point[series.key])),
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2">
        {SERIES.map((series) => (
          <span key={series.key} className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: series.color }} />
            {series.label}
          </span>
        ))}
      </div>
      <div className="flex h-52 items-end gap-2 sm:gap-3">
        {points.map((point) => (
          <div key={point.label} className="group flex h-full min-w-0 flex-1 flex-col justify-end">
            <div className="flex h-[calc(100%-1.25rem)] items-end justify-center gap-0.5 sm:gap-1">
              {SERIES.map((series) => (
                <div
                  key={series.key}
                  className="w-1.5 rounded-sm sm:w-2.5"
                  style={{
                    height: `${Math.max((point[series.key] / max) * 100, point[series.key] ? 4 : 0)}%`,
                    backgroundColor: series.color,
                  }}
                  title={`${series.label}: ${point[series.key]}`}
                />
              ))}
            </div>
            <span className="mt-2 text-center text-[11px] text-muted-foreground">{point.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BreakdownChart({ title, items }: { title: string; items: Slice[] }) {
  const max = Math.max(1, ...items.map((item) => item.count));
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <span className="text-xs text-muted-foreground">{total.toLocaleString()} total</span>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No records yet</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                <span className="capitalize text-foreground">{item.label}</span>
                <span className="font-medium text-muted-foreground">{item.count.toLocaleString()}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(item.count / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
      change: `${stats?.totalCategories || 0} categories`,
    },
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      change: "Active users",
    },
  ];

  const alertCards = [
    {
      title: "Pending Orders",
      value: stats?.pendingOrders || 0,
      icon: AlertCircle,
      color: "bg-amber-50 text-amber-800 border-amber-100",
      textColor: "text-amber-700",
    },
    {
      title: "Pending Payments",
      value: stats?.pendingPayments || 0,
      icon: AlertCircle,
      color: "bg-red-50 text-red-800 border-red-100",
      textColor: "text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome to your admin panel
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-[13px] font-medium text-muted-foreground">
                  {card.title}
                </p>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-primary">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-[1.75rem] font-semibold leading-none tracking-tight text-foreground">
                {card.value}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">{card.change}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-foreground">New records</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Users, orders, products, and payments created in the last 6 months
          </p>
        </div>
        {stats?.charts?.monthly?.length ? (
          <ActivityChart points={stats.charts.monthly} />
        ) : (
          <p className="text-sm text-muted-foreground">Chart data is not available yet.</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <BreakdownChart title="Users" items={stats?.charts?.usersByRole || []} />
        <BreakdownChart title="Payments" items={stats?.charts?.paymentsByStatus || []} />
        <BreakdownChart title="Orders" items={stats?.charts?.ordersByStatus || []} />
        <BreakdownChart title="Products" items={stats?.charts?.productsByStatus || []} />
      </div>

      {(stats?.pendingOrders || 0) > 0 || (stats?.pendingPayments || 0) > 0 ? (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Needs attention</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {alertCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={index}
                  className={`${card.color} rounded-xl border p-5`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">{card.title}</p>
                      <p className={`mt-2 text-2xl font-semibold ${card.textColor}`}>
                        {card.value}
                      </p>
                    </div>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Quick Links</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <a
            href="/admin/orders"
            className="rounded-lg border border-border p-4 text-center transition hover:border-primary/30 hover:bg-background"
          >
            <ShoppingCart className="mx-auto mb-2 h-5 w-5 text-primary" />
            <p className="text-sm font-medium">Manage Orders</p>
          </a>
          <a
            href="/admin/products"
            className="rounded-lg border border-border p-4 text-center transition hover:border-primary/30 hover:bg-background"
          >
            <Package className="mx-auto mb-2 h-5 w-5 text-primary" />
            <p className="text-sm font-medium">Manage Products</p>
          </a>
          <a
            href="/admin/users"
            className="rounded-lg border border-border p-4 text-center transition hover:border-primary/30 hover:bg-background"
          >
            <Users className="mx-auto mb-2 h-5 w-5 text-primary" />
            <p className="text-sm font-medium">Manage Users</p>
          </a>
        </div>
      </div>
    </div>
  );
}
