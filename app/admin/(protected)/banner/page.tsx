"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import API from "@/lib/api";
import { uploadImageToSupabase } from "@/lib/upload";

type BannerItem = {
  _id: string;
  title: string;
  image: string;
  sortOrder: number;
  isActive: boolean;
};

export default function BannerPage() {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/api/admin/banners");
      setBanners(data.data || []);
    } catch (error) {
      console.error("Failed to fetch banners:", error);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageToSupabase(file, "banner");
      if (url) setImage(url);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!image) return;
    setCreating(true);
    try {
      await API.post("/api/admin/banners", {
        title: title.trim(),
        image,
        sortOrder: Number(sortOrder),
        isActive,
      });
      setTitle("");
      setImage("");
      setSortOrder(0);
      setIsActive(true);
      fetchBanners();
    } catch (error) {
      console.error("Failed to create banner:", error);
      alert("Failed to create banner");
    } finally {
      setCreating(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    try {
      await API.delete(`/api/admin/banners/${id}`);
      fetchBanners();
    } catch {
      alert("Failed to delete banner");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Banner</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload dynamic home banners using Bunny CDN
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="bg-card border rounded-xl p-4 md:p-6 space-y-4"
      >
        <div>
          <label className="text-sm font-medium block mb-2">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border bg-background"
            placeholder="Home offer banner"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">Image URL *</label>
          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-lg border bg-background"
            placeholder="https://cdn.example.com/banner.jpg"
          />
          <label className="mt-3 inline-flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer text-sm hover:bg-muted/40">
            <Upload className="h-4 w-4" />
            Upload banner image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploading}
            />
          </label>
          {uploading && (
            <p className="text-xs text-blue-600 mt-2">Uploading to Bunny...</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-2">Sort Order</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-lg border bg-background"
            />
          </div>
          <label className="flex items-center gap-2 mt-8">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Active
          </label>
        </div>

        <button
          type="submit"
          disabled={creating || uploading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground disabled:opacity-60"
        >
          {creating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Add Banner
            </>
          )}
        </button>
      </form>

      <div className="bg-card border rounded-xl p-4 md:p-6">
        <h2 className="text-lg font-semibold">Banner List</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground mt-4">Loading...</p>
        ) : banners.length === 0 ? (
          <p className="text-sm text-muted-foreground mt-4">No banners found</p>
        ) : (
          <div className="mt-4 space-y-3">
            {banners.map((banner) => (
              <div
                key={banner._id}
                className="border rounded-lg p-3 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={banner.image}
                    alt={banner.title || "banner"}
                    className="w-24 h-14 rounded object-cover border"
                  />
                  <div>
                    <p className="font-medium">{banner.title || "Untitled"}</p>
                    <p className="text-xs text-muted-foreground">
                      Sort: {banner.sortOrder} | {banner.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onDelete(banner._id)}
                  className="p-2 text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
