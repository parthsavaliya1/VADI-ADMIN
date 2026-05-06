"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Phone,
  Mail,
  Calendar,
  Shield,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import API from "@/lib/api";

type User = {
  _id: string;
  name?: string;
  phone: string;
  email?: string;
  profileImage?: string;
  isPhoneVerified: boolean;
  createdAt: string;
  role: string;
  dob?: string;
};

export default function UserDetailClient({ userId }: { userId: string }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await API.get(`/api/admin/users/${userId}`);
        if (data.success) {
          setUser(data.data);
        }
      } catch (error) {
        console.error("Fetch user error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchUser();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Link>
        <div className="text-center">
          <p className="text-muted-foreground">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Users
          </Link>

          <h1 className="text-3xl font-bold">User Details</h1>
          <p className="text-muted-foreground mt-1">View user information</p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-card rounded-xl shadow-sm border p-6">
            <div className="flex items-start gap-6 mb-6">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-primary/10"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-semibold border-4 border-primary/10">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}

              <div className="flex-1">
                <h2 className="text-2xl font-bold">
                  {user.name || "Unnamed User"}
                </h2>
                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.isPhoneVerified
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {user.isPhoneVerified && (
                      <CheckCircle className="h-3.5 w-3.5" />
                    )}
                    {user.isPhoneVerified ? "Verified" : "Not Verified"}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    <Shield className="h-3.5 w-3.5" />
                    {user.role?.toUpperCase() || "USER"}
                  </span>
                </div>
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
              {/* Phone */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                  <Phone className="h-3.5 w-3.5 inline mr-1" />
                  Phone Number
                </label>
                <p className="text-lg font-medium">{user.phone}</p>
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                  <Mail className="h-3.5 w-3.5 inline mr-1" />
                  Email Address
                </label>
                <p className="text-lg font-medium">{user.email || "-"}</p>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                  <Calendar className="h-3.5 w-3.5 inline mr-1" />
                  Date of Birth
                </label>
                <p className="text-lg font-medium">{user.dob || "-"}</p>
              </div>

              {/* Joined Date */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                  <Calendar className="h-3.5 w-3.5 inline mr-1" />
                  Joined On
                </label>
                <p className="text-lg font-medium">
                  {new Date(user.createdAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-card rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Account Status</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">Phone Verification</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.isPhoneVerified
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.isPhoneVerified ? "Verified" : "Pending"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">Account Type</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === "admin"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {user.role?.toUpperCase() || "REGULAR USER"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">Account Age</span>
                <span className="text-sm font-medium">
                  {Math.floor(
                    (Date.now() - new Date(user.createdAt).getTime()) /
                      (1000 * 60 * 60 * 24),
                  )}{" "}
                  days
                </span>
              </div>
            </div>
          </div>

          {/* User ID */}
          <div className="bg-card rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">User ID</h3>
            <p className="text-sm font-mono text-muted-foreground break-all">
              {user._id}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
