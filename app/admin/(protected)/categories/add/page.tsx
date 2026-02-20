"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X, Loader2, Save } from "lucide-react";
import Link from "next/link";
import API from "@/lib/api";
import { uploadImageToSupabase } from "@/lib/upload";

export default function AddCategoryClient() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    image: "",
    sortOrder: 0,
    showOnHome: true,
    isActive: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const url = await uploadImageToSupabase(file);
      if (url) {
        setFormData((prev) => ({
          ...prev,
          image: url,
        }));
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await API.post("/categories", {
        ...formData,
        sortOrder: Number(formData.sortOrder),
      });

      if (data.success) {
        router.push("/admin/categories");
      } else {
        alert(data.message || "Failed to create category");
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      alert(error.response?.data?.message || "Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/categories"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Categories
          </Link>

          <h1 className="text-3xl font-bold">Add New Category</h1>
          <p className="text-muted-foreground mt-1">
            Create a new category for your products
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-card rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-6">Basic Information</h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter category name"
                  className="w-full px-4 py-3 rounded-lg border bg-background 
                             focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Sort Order
                </label>
                <input
                  type="number"
                  name="sortOrder"
                  value={formData.sortOrder}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 rounded-lg border bg-background 
                             focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-card rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Category Image</h2>

            {formData.image ? (
              <div className="relative group">
                <img
                  src={formData.image}
                  alt="Category"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      image: "",
                    }))
                  }
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full 
                             opacity-0 group-hover:opacity-100 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label
                className="flex flex-col items-center justify-center w-full h-64 
                           border-2 border-dashed rounded-lg cursor-pointer 
                           bg-muted/20 hover:bg-muted/40 transition"
              >
                <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  Click to upload category image
                </p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            )}

            {uploading && (
              <div className="mt-4 flex items-center gap-2 text-blue-600 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading image...
              </div>
            )}
          </div>

          {/* Status Section */}
          <div className="bg-card rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Category Status</h2>

            <div className="space-y-4">
              <label className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 rounded"
                />
                <div>
                  <div className="font-medium text-sm">Active</div>
                  <div className="text-xs text-muted-foreground">
                    Category is visible to customers
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  name="showOnHome"
                  checked={formData.showOnHome}
                  onChange={handleChange}
                  className="w-4 h-4 rounded"
                />
                <div>
                  <div className="font-medium text-sm">Show on Home Page</div>
                  <div className="text-xs text-muted-foreground">
                    Display category on homepage
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex justify-between pt-6 border-t">
            <Link
              href="/admin/categories"
              className="px-6 py-3 border rounded-lg hover:bg-muted transition font-medium"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading || uploading}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-lg 
                         hover:bg-primary/90 transition disabled:opacity-50 
                         font-medium flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Create Category
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
