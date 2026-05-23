"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  X,
  Upload,
  Image as ImageIcon,
  Save,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import API from "@/lib/api";
import { uploadImageToSupabase } from "@/lib/upload";

type Category = {
  _id: string;
  name: string;
  slug: string;
};

type Seller = {
  _id: string;
  name: string;
  code?: string;
};

type Variant = {
  packSize: number;
  packUnit: string;
  mrp: number;
  price: number;
  stock: number;
  lowStockThreshold: number;
  sku: string;
  isDefault: boolean;
  isActive: boolean;
};

export default function AddProductClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    brand: "",
    category: "",
    unit: "kg",
    image: "",
    images: [] as string[],
    featured: false,
    trending: false,
    bestDeal: false,
    isOrganic: false,
    offerEndsAt: "",
    isActive: true,
    discount: 0,
    taxGstPercent: 0,
    taxInclusive: true,
    tags: [] as string[],
    searchKeywords: [] as string[],
    shelfLifeValue: "",
    shelfLifeUnit: "days",
    expiryRequired: true,
    storageInstructions: "",
    sellerId: "",
  });

  const [variants, setVariants] = useState<Variant[]>([
    {
      packSize: 1,
      packUnit: "kg",
      mrp: 0,
      price: 0,
      stock: 0,
      lowStockThreshold: 5,
      sku: "",
      isDefault: true,
      isActive: true,
    },
  ]);

  const [tagInput, setTagInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchSellers();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await API.get("/categories", {
        params: { isActive: "true" },
      });
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error("Fetch categories error:", error);
    }
  };

  const fetchSellers = async () => {
    try {
      const { data } = await API.get("/sellers", {
        params: { isActive: "true", sortBy: "name", sortOrder: "asc" },
      });
      if (data.success) {
        setSellers(data.data || []);
      }
    } catch (error) {
      console.error("Fetch sellers error:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleMainImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImageToSupabase(file);
      if (url) {
        setFormData((prev) => ({ ...prev, image: url }));
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleAdditionalImagesUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadedResults = await Promise.all(
        Array.from(files).map((file) => uploadImageToSupabase(file)),
      );
      const uploadedUrls = uploadedResults.filter(
        (url): url is string => Boolean(url),
      );

      if (!uploadedUrls.length) {
        alert("No images were uploaded. Please try again.");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload images");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (image: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img !== image),
    }));
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        packSize: 1,
        packUnit: "kg",
        mrp: 0,
        price: 0,
        stock: 0,
        lowStockThreshold: 5,
        sku: "",
        isDefault: false,
        isActive: true,
      },
    ]);
  };

  const removeVariant = (index: number) => {
    if (variants.length === 1) {
      alert("At least one variant is required");
      return;
    }
    const newVariants = variants.filter((_, i) => i !== index);
    if (variants[index].isDefault && newVariants.length > 0) {
      newVariants[0].isDefault = true;
    }
    setVariants(newVariants);
  };

  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    const newVariants = [...variants];
    if (field === "isDefault" && value === true) {
      newVariants.forEach((v, i) => {
        v.isDefault = i === index;
      });
    } else {
      (newVariants[index][field] as any) = value;
    }
    setVariants(newVariants);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const addKeyword = () => {
    if (
      keywordInput.trim() &&
      !formData.searchKeywords.includes(keywordInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        searchKeywords: [...prev.searchKeywords, keywordInput.trim()],
      }));
      setKeywordInput("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData((prev) => ({
      ...prev,
      searchKeywords: prev.searchKeywords.filter((k) => k !== keyword),
    }));
  };

  const validateBeforeSubmit = () => {
    if (!formData.sellerId.trim()) {
      alert("Seller is required");
      return false;
    }

    if (!variants.length) {
      alert("At least one variant is required");
      return false;
    }

    const hasDefault = variants.some((v) => v.isDefault);
    if (!hasDefault) {
      alert("Please set one default variant");
      return false;
    }

    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      const label = `Variant ${i + 1}`;

      if (!Number.isFinite(variant.packSize) || variant.packSize <= 0) {
        alert(`${label}: Pack size must be greater than 0`);
        return false;
      }

      if (!Number.isFinite(variant.mrp) || variant.mrp < 0) {
        alert(`${label}: MRP must be 0 or greater`);
        return false;
      }

      if (!Number.isFinite(variant.price) || variant.price < 0) {
        alert(`${label}: Price must be 0 or greater`);
        return false;
      }

      if (!Number.isFinite(variant.stock) || variant.stock < 0) {
        alert(`${label}: Stock must be 0 or greater`);
        return false;
      }

      if (
        !Number.isFinite(variant.lowStockThreshold) ||
        variant.lowStockThreshold < 0
      ) {
        alert(`${label}: Low stock threshold must be 0 or greater`);
        return false;
      }

      if (variant.price > variant.mrp) {
        alert(`${label}: Price cannot be greater than MRP`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateBeforeSubmit()) return;
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        brand: formData.brand,
        category: formData.category,
        unit: formData.unit,
        image: formData.image,
        images: formData.images,
        featured: formData.featured,
        trending: formData.trending,
        bestDeal: formData.bestDeal,
        isOrganic: formData.isOrganic,
        isActive: formData.isActive,
        offerEndsAt: formData.offerEndsAt.trim()
          ? new Date(formData.offerEndsAt).toISOString()
          : null,
        discount: Number(formData.discount),
        tax: {
          gstPercent: Number(formData.taxGstPercent),
          inclusive: formData.taxInclusive,
        },
        tags: formData.tags,
        searchKeywords: formData.searchKeywords,
        shelfLife: formData.shelfLifeValue
          ? {
              value: Number(formData.shelfLifeValue),
              unit: formData.shelfLifeUnit,
            }
          : undefined,
        expiryRequired: formData.expiryRequired,
        storageInstructions: formData.storageInstructions,
        seller: {
          sellerId: formData.sellerId,
        },
        variants: variants.map((variant) => ({
          ...variant,
          packSize: Number(variant.packSize),
          mrp: Number(variant.mrp),
          price: Number(variant.price),
          stock: Number(variant.stock),
          lowStockThreshold: Number(variant.lowStockThreshold),
        })),
      };

      const { data } = await API.post("/products", payload);

      if (data.success) {
        router.push("/admin/products");
      } else {
        alert(data.message || "Failed to create product");
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      alert(error.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Add New Product
              </h1>
              <p className="text-muted-foreground mt-1">
                Create a new product for your inventory
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-card rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  Basic Information
                </h2>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter product name"
                      className="w-full px-4 py-3 rounded-lg border bg-background 
                               focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Brand
                      </label>
                      <input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleChange}
                        placeholder="Enter brand name"
                        className="w-full px-4 py-3 rounded-lg border bg-background 
                                 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border bg-background 
                                 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Describe your product..."
                      className="w-full px-4 py-3 rounded-lg border bg-background 
                               focus:outline-none focus:ring-2 focus:ring-primary/50 transition resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Unit *
                    </label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border bg-background 
                               focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                    >
                      <option value="kg">Kilogram (kg)</option>
                      <option value="g">Gram (g)</option>
                      <option value="litre">Litre</option>
                      <option value="ml">Millilitre (ml)</option>
                      <option value="pcs">Pieces</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Product Variants */}
              <div className="bg-card rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    Product Variants
                  </h2>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg 
                             hover:bg-primary/90 transition flex items-center gap-2 text-sm font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    Add Variant
                  </button>
                </div>

                <div className="space-y-4">
                  {variants.map((variant, index) => (
                    <div
                      key={index}
                      className="border-2 border-dashed rounded-xl p-5 hover:border-primary/50 transition relative bg-muted/20"
                    >
                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full 
                                   hover:bg-red-600 transition shadow-lg"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}

                      <div className="flex items-center gap-3 mb-4">
                        <input
                          type="checkbox"
                          checked={variant.isDefault}
                          onChange={(e) =>
                            updateVariant(index, "isDefault", e.target.checked)
                          }
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <label className="text-sm font-medium">
                          {variant.isDefault ? (
                            <span className="text-primary">
                              Default Variant
                            </span>
                          ) : (
                            "Set as Default"
                          )}
                        </label>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-medium mb-1.5 text-muted-foreground">
                            Pack Size *
                          </label>
                          <input
                            type="number"
                            value={variant.packSize}
                            onChange={(e) =>
                              updateVariant(
                                index,
                                "packSize",
                                Number(e.target.value),
                              )
                            }
                            required
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 rounded-lg border bg-background 
                                     focus:outline-none focus:ring-2 focus:ring-primary/50 transition text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium mb-1.5 text-muted-foreground">
                            Unit *
                          </label>
                          <select
                            value={variant.packUnit}
                            onChange={(e) =>
                              updateVariant(index, "packUnit", e.target.value)
                            }
                            required
                            className="w-full px-3 py-2 rounded-lg border bg-background 
                                     focus:outline-none focus:ring-2 focus:ring-primary/50 transition text-sm"
                          >
                            <option value="kg">kg</option>
                            <option value="g">g</option>
                            <option value="litre">litre</option>
                            <option value="ml">ml</option>
                            <option value="pcs">pcs</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium mb-1.5 text-muted-foreground">
                            SKU
                          </label>
                          <input
                            type="text"
                            value={variant.sku}
                            onChange={(e) =>
                              updateVariant(index, "sku", e.target.value)
                            }
                            placeholder="Optional"
                            className="w-full px-3 py-2 rounded-lg border bg-background 
                                     focus:outline-none focus:ring-2 focus:ring-primary/50 transition text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-medium mb-1.5 text-muted-foreground">
                            MRP *
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">
                              ₹
                            </span>
                            <input
                              type="number"
                              value={variant.mrp}
                              onChange={(e) =>
                                updateVariant(
                                  index,
                                  "mrp",
                                  Number(e.target.value),
                                )
                              }
                              required
                              min="0"
                              step="0.01"
                              className="w-full pl-7 pr-3 py-2 rounded-lg border bg-background 
                                       focus:outline-none focus:ring-2 focus:ring-primary/50 transition text-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium mb-1.5 text-muted-foreground">
                            Price *
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">
                              ₹
                            </span>
                            <input
                              type="number"
                              value={variant.price}
                              onChange={(e) =>
                                updateVariant(
                                  index,
                                  "price",
                                  Number(e.target.value),
                                )
                              }
                              required
                              min="0"
                              step="0.01"
                              className="w-full pl-7 pr-3 py-2 rounded-lg border bg-background 
                                       focus:outline-none focus:ring-2 focus:ring-primary/50 transition text-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium mb-1.5 text-muted-foreground">
                            Stock *
                          </label>
                          <input
                            type="number"
                            value={variant.stock}
                            onChange={(e) =>
                              updateVariant(
                                index,
                                "stock",
                                Number(e.target.value),
                              )
                            }
                            required
                            min="0"
                            className="w-full px-3 py-2 rounded-lg border bg-background 
                                     focus:outline-none focus:ring-2 focus:ring-primary/50 transition text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium mb-1.5 text-muted-foreground">
                            Low Stock
                          </label>
                          <input
                            type="number"
                            value={variant.lowStockThreshold}
                            onChange={(e) =>
                              updateVariant(
                                index,
                                "lowStockThreshold",
                                Number(e.target.value),
                              )
                            }
                            min="0"
                            className="w-full px-3 py-2 rounded-lg border bg-background 
                                     focus:outline-none focus:ring-2 focus:ring-primary/50 transition text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seller Information */}
              <div className="bg-card rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  Seller Information
                </h2>

                <div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Seller *
                    </label>
                    <select
                      name="sellerId"
                      value={formData.sellerId}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border bg-background 
                               focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                    >
                      <option value="">Select Seller</option>
                      {sellers.map((seller) => (
                        <option key={seller._id} value={seller._id}>
                          {seller.name}
                          {seller.code ? ` (${seller.code})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="bg-card rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">4</span>
                  </div>
                  Additional Details
                </h2>

                <div className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Discount (%)
                      </label>
                      <input
                        type="number"
                        name="discount"
                        value={formData.discount}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        placeholder="0"
                        className="w-full px-4 py-3 rounded-lg border bg-background 
                                 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        GST (%)
                      </label>
                      <input
                        type="number"
                        name="taxGstPercent"
                        value={formData.taxGstPercent}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        placeholder="0"
                        className="w-full px-4 py-3 rounded-lg border bg-background 
                                 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <input
                      type="checkbox"
                      name="taxInclusive"
                      checked={formData.taxInclusive}
                      onChange={handleChange}
                      className="w-4 h-4 rounded"
                    />
                    <label className="text-sm font-medium">
                      Tax Inclusive Pricing
                    </label>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Shelf Life
                      </label>
                      <input
                        type="number"
                        name="shelfLifeValue"
                        value={formData.shelfLifeValue}
                        onChange={handleChange}
                        min="0"
                        placeholder="Enter value"
                        className="w-full px-4 py-3 rounded-lg border bg-background 
                                 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Unit
                      </label>
                      <select
                        name="shelfLifeUnit"
                        value={formData.shelfLifeUnit}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border bg-background 
                                 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                      >
                        <option value="days">Days</option>
                        <option value="months">Months</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Storage Instructions
                    </label>
                    <textarea
                      name="storageInstructions"
                      value={formData.storageInstructions}
                      onChange={handleChange}
                      rows={3}
                      placeholder="How should this product be stored?"
                      className="w-full px-4 py-3 rounded-lg border bg-background 
                               focus:outline-none focus:ring-2 focus:ring-primary/50 transition resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <input
                      type="checkbox"
                      name="expiryRequired"
                      checked={formData.expiryRequired}
                      onChange={handleChange}
                      className="w-4 h-4 rounded"
                    />
                    <label className="text-sm font-medium">
                      Expiry Date Required
                    </label>
                  </div>
                </div>
              </div>

              {/* Tags & Keywords */}
              <div className="bg-card rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">5</span>
                  </div>
                  SEO & Search
                </h2>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tags
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                        placeholder="Add a tag and press Enter"
                        className="flex-1 px-4 py-3 rounded-lg border bg-background 
                                 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg 
                                 hover:bg-primary/90 transition font-medium"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 
                                   text-primary rounded-lg text-sm font-medium"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-primary/70 transition"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Search Keywords
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addKeyword();
                          }
                        }}
                        placeholder="Add keywords for better search"
                        className="flex-1 px-4 py-3 rounded-lg border bg-background 
                                 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                      />
                      <button
                        type="button"
                        onClick={addKeyword}
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg 
                                 hover:bg-primary/90 transition font-medium"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.searchKeywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 
                                   text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 
                                   rounded-lg text-sm font-medium"
                        >
                          {keyword}
                          <button
                            type="button"
                            onClick={() => removeKeyword(keyword)}
                            className="hover:text-blue-600 transition"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Images & Status */}
            <div className="space-y-6">
              {/* Product Images */}
              <div className="bg-card rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">Product Images</h2>

                {/* Main Image */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">
                    Main Image
                  </label>
                  <div className="relative">
                    {formData.image ? (
                      <div className="relative group">
                        <img
                          src={formData.image}
                          alt="Main product"
                          className="w-full h-64 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, image: "" }))
                          }
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full 
                                   opacity-0 group-hover:opacity-100 transition shadow-lg"
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
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload main image
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PNG, JPG, WEBP
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleMainImageUpload}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Additional Images */}
                <div>
                  <label className="block text-sm font-medium mb-3">
                    Additional Images
                  </label>
                  <label
                    className="flex flex-col items-center justify-center w-full h-32 
                                  border-2 border-dashed rounded-lg cursor-pointer 
                                  bg-muted/20 hover:bg-muted/40 transition mb-4"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-xs text-muted-foreground">
                        Upload multiple images
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleAdditionalImagesUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`Product ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(img)}
                          className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full 
                                   opacity-0 group-hover:opacity-100 transition shadow-lg"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {uploading && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                      Uploading images...
                    </span>
                  </div>
                )}
              </div>

              {/* Product Status */}
              <div className="bg-card rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">Product Status</h2>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition">
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
                        Product is visible to customers
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleChange}
                      className="w-4 h-4 rounded"
                    />
                    <div>
                      <div className="font-medium text-sm">Featured</div>
                      <div className="text-xs text-muted-foreground">
                        Show on homepage
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition">
                    <input
                      type="checkbox"
                      name="trending"
                      checked={formData.trending}
                      onChange={handleChange}
                      className="w-4 h-4 rounded"
                    />
                    <div>
                      <div className="font-medium text-sm">Trending</div>
                      <div className="text-xs text-muted-foreground">
                        Mark as trending product
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition">
                    <input
                      type="checkbox"
                      name="bestDeal"
                      checked={formData.bestDeal}
                      onChange={handleChange}
                      className="w-4 h-4 rounded"
                    />
                    <div>
                      <div className="font-medium text-sm">Best Deal</div>
                      <div className="text-xs text-muted-foreground">
                        Highlight as best deal
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition">
                    <input
                      type="checkbox"
                      name="isOrganic"
                      checked={formData.isOrganic}
                      onChange={handleChange}
                      className="w-4 h-4 rounded"
                    />
                    <div>
                      <div className="font-medium text-sm">Organic</div>
                      <div className="text-xs text-muted-foreground">
                        Show organic label on product details in the app
                      </div>
                    </div>
                  </label>

                  <div className="pt-2 border-t border-border/60">
                    <label className="block text-sm font-medium mb-2">
                      Offer ends at (optional)
                    </label>
                    <input
                      type="datetime-local"
                      name="offerEndsAt"
                      value={formData.offerEndsAt}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      This product&apos;s own deadline. Shown as &quot;This offer
                      ends in&quot; on the product page and overrides the mega sale
                      timer from Deal Settings. Leave empty to use only the mega
                      sale time (when Deal Settings timer is on).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Actions */}
          <div className="mt-10 border-t pt-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <Link
                  href="/admin/products"
                  className="px-6 py-3 border rounded-lg hover:bg-muted transition font-medium"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-lg 
                           hover:bg-primary/90 transition disabled:opacity-50 font-medium
                           flex items-center gap-2 shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      Create Product
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
