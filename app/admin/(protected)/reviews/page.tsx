"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";

type Review = {
  _id: string;
  rating: number;
  comment?: string;
  isActive: boolean;
  user?: { name?: string };
  product?: { name?: string };
};

export default function ReviewsPage() {
  const [rows, setRows] = useState<Review[]>([]);

  const load = () =>
    Promise.all([
      API.get("/reviews", { params: { limit: 50, isActive: "true" } }),
      API.get("/reviews", { params: { limit: 50, isActive: "false" } }),
    ])
      .then(([active, hidden]) =>
        setRows([...(active.data.data || []), ...(hidden.data.data || [])]),
      )
      .catch(() => setRows([]));

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Reviews</h1>
      <p className="text-sm text-muted-foreground">Hide a review to remove it from the product page.</p>
      {rows.map((row) => (
        <div key={row._id} className="rounded-xl border border-border bg-card p-4">
          <p className="font-medium">
            {row.product?.name || "Product"} · {row.rating}/5
          </p>
          <p className="text-sm text-muted-foreground">{row.comment || "No comment"}</p>
          <button
            type="button"
            className="mt-3 rounded-md border px-3 py-1.5 text-sm"
            onClick={async () => {
              await API.patch(`/reviews/${row._id}/toggle-active`);
              load();
            }}
          >
            {row.isActive ? "Hide review" : "Show review"}
          </button>
        </div>
      ))}
    </div>
  );
}
