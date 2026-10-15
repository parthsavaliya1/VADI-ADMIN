"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";

type Message = {
  _id: string;
  body: string;
  from: string;
  user?: { _id?: string; name?: string; phone?: string };
};

export default function SupportPage() {
  const [rows, setRows] = useState<Message[]>([]);
  const [reply, setReply] = useState<Record<string, string>>({});

  const load = () =>
    API.get("/api/admin/support")
      .then(({ data }) => setRows(data.data || []))
      .catch(() => setRows([]));

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Support messages</h1>
      {rows.map((row) => {
        const userId = row.user?._id || "";
        return (
          <div key={row._id} className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              {row.user?.name || row.user?.phone || "Customer"} · {row.from}
            </p>
            <p className="mt-1">{row.body}</p>
            {row.from === "customer" && userId ? (
              <div className="mt-3 flex gap-2">
                <input
                  className="flex-1 rounded-md border px-3 py-2"
                  placeholder="Reply"
                  value={reply[userId] || ""}
                  onChange={(event) => setReply((current) => ({ ...current, [userId]: event.target.value }))}
                />
                <button
                  type="button"
                  className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
                  onClick={async () => {
                    await API.post(`/api/admin/support/${userId}`, { body: reply[userId] });
                    setReply((current) => ({ ...current, [userId]: "" }));
                    load();
                  }}
                >
                  Send
                </button>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
