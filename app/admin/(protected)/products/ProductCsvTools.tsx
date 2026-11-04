"use client";

import { useRef, useState } from "react";
import axios from "axios";
import { Download, Upload, Loader2 } from "lucide-react";
import API from "@/lib/api";
import { exportProducts, previewProducts, serializeCsv, templateCsv, type CsvPreview } from "@/lib/product-csv";

type Props = { filters: Record<string, string>; onImported: () => void };
type Result = { key: string; name: string; status: "created" | "failed" | "unknown"; message: string };
const buttonClass = "inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed";

function download(filename: string, csv: string) {
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = filename;
  document.body.appendChild(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Export every page, retaining the same filters as the product list.
async function fetchAll(path: string, filters: Record<string, string> = {}): Promise<unknown[]> {
  const rows: unknown[] = [];
  let page = 1;
  while (true) {
    const { data } = await API.get(path, { params: { ...filters, page, limit: 100, sortBy: "_id", sortOrder: "asc" } });
    if (!data.success || !Array.isArray(data.data)) throw new Error(data.message || "Could not load CSV data.");
    rows.push(...data.data);
    const pages = data.pagination?.pages;
    if (pages === undefined || page >= pages) break;
    if (!data.data.length) throw new Error("The catalog changed during export. Please export again.");
    page++;
  }
  return rows;
}

export default function ProductCsvTools({ filters, onImported }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState("");
  const [preview, setPreview] = useState<CsvPreview | null>(null);
  const [filename, setFilename] = useState("");
  const [message, setMessage] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [attempted, setAttempted] = useState(false);
  const running = useRef(false);

  async function readFile(file?: File) {
    if (!file) return;
    setPreview(null); setResults([]); setAttempted(false); setMessage(""); setFilename(file.name);
    if (!/\.csv$/i.test(file.name)) { setMessage("Choose a .csv file."); return; }
    if (file.size > 10 * 1024 * 1024) { setMessage("CSV files must be 10 MB or smaller. Split larger files into batches."); return; }
    setBusy("Reading CSV");
    try { setPreview(previewProducts(await file.text())); }
    catch (error) { setMessage((error as Error).message); }
    finally { setBusy(""); }
  }

  async function exportCsv() {
    setBusy("Exporting products"); setMessage("");
    try {
      const products = await fetchAll("/api/admin/products", filters);
      download(`vadi-products-${new Date().toISOString().slice(0, 10)}.csv`, exportProducts(products));
      setMessage(`Exported ${products.length} products with all variants.`);
    } catch (error) { setMessage(axios.isAxiosError(error) ? error.response?.data?.message || error.message : (error as Error).message); }
    finally { setBusy(""); }
  }

  async function downloadReferences() {
    setBusy("Loading category and seller IDs"); setMessage("");
    try {
      const [categories, sellers] = await Promise.all([fetchAll("/api/admin/categories"), fetchAll("/api/admin/sellers")]);
      const rows = [["type", "id", "name", "active"]];
      for (const [type, entries] of [["category", categories], ["seller", sellers]] as const) {
        for (const entry of entries) {
          const item = entry as { _id: string; name: string; isActive: boolean };
          rows.push([type, item._id, item.name, String(item.isActive)]);
        }
      }
      download("vadi-category-seller-ids.csv", serializeCsv(rows));
    } catch (error) { setMessage((error as Error).message); }
    finally { setBusy(""); }
  }

  async function importCsv() {
    if (!preview || preview.errors.length || attempted || running.current) return;
    running.current = true; setResults([]); setMessage("");
    const completed: Result[] = [];
    try {
      setBusy("Checking category and seller IDs");
      const [categories, sellers] = await Promise.all([
        fetchAll("/api/admin/categories", { isActive: "true" }),
        fetchAll("/api/admin/sellers", { isActive: "true" }),
      ]);
      const categoryIds = new Set(categories.map((item) => (item as { _id: string })._id));
      const sellerIds = new Set(sellers.map((item) => (item as { _id: string })._id));
      const errors: string[] = [];
      for (const product of preview.products) {
        if (!categoryIds.has(String(product.payload.category))) errors.push(`Product ${product.key}: category does not exist or is inactive.`);
        if (!sellerIds.has(String((product.payload.seller as { sellerId: string }).sellerId))) errors.push(`Product ${product.key}: seller does not exist or is inactive.`);
      }
      if (errors.length) { setPreview({ ...preview, errors }); return; }
      setAttempted(true);
      for (const [index, product] of preview.products.entries()) {
        setBusy(`Creating product ${index + 1} of ${preview.products.length}`);
        try {
          const { data } = await API.post("/api/admin/products", product.payload);
          if (!data.success) throw new Error(data.message || "Product creation failed.");
          completed.push({ key: product.key, name: product.payload.name, status: "created", message: data.data?._id || "Created" });
        } catch (error) {
          // A lost response may follow a successful save: stop to prevent accidental duplicates.
          const uncertain = axios.isAxiosError(error) && (!error.response || error.response.status >= 500);
          completed.push({ key: product.key, name: product.payload.name, status: uncertain ? "unknown" : "failed", message: axios.isAxiosError(error) ? error.response?.data?.message || error.message : (error as Error).message });
          if (uncertain) {
            setMessage("Import stopped because the last save could not be confirmed. Check the product list before uploading again. Remaining products were not submitted.");
            setResults([...completed]); break;
          }
        }
        setResults([...completed]);
      }
    } catch (error) {
      setMessage(`Import could not start: ${(error as Error).message}`);
    } finally {
      setBusy(""); running.current = false;
      if (completed.some((result) => result.status === "created" || result.status === "unknown")) onImported();
    }
  }

  return (
    <section aria-label="Product CSV import and export" className="rounded-xl border bg-card p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="font-semibold">Product CSV</h2><p className="text-sm text-muted-foreground">Create products with variants, or export all products matching the current filters.</p></div>
        <div className="flex flex-wrap gap-2">
          <button disabled={!!busy} className={buttonClass} onClick={() => download("vadi-product-template.csv", templateCsv())}><Download className="h-4 w-4" />Template</button>
          <button disabled={!!busy} className={buttonClass} onClick={downloadReferences}>Category / seller IDs</button>
          <button disabled={!!busy} className={buttonClass} onClick={exportCsv}><Download className="h-4 w-4" />Export CSV</button>
          <button disabled={!!busy} className={buttonClass} onClick={() => input.current?.click()}><Upload className="h-4 w-4" />Upload CSV</button>
          <input ref={input} type="file" accept=".csv,text/csv" aria-label="Upload product CSV" className="hidden" disabled={!!busy} onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; void readFile(file); }} />
        </div>
      </div>
      <details className="text-sm text-muted-foreground">
        <summary className="cursor-pointer font-medium">CSV format and all supported fields</summary>
        <div className="mt-2 space-y-2">
          <p>Use the template headers. Each row creates one variant; repeat the same product_key for every variant of a product. Fill product fields on the first row; later rows may leave them blank or repeat identical values. Each product needs name, category ID, unit, seller ID and at least one variant with packSize, packUnit, mrp, price and stock. Pack units: kg, g, litre, ml, pcs.</p>
          <p>Includes description, brand, cover and gallery images, featured/trending/best deal/organic/active flags, offer deadline, discount, GST and tax inclusion, tags, search keywords, shelf life, expiry requirement, storage instructions, and each variant’s SKU, default/active flags, low stock threshold, images and expiry date.</p>
          <p>Use true/false (or 1/0) for flags. Use JSON arrays such as [&quot;tag one&quot;,&quot;tag two&quot;] for tags, searchKeywords and images. Images must be existing http(s) URLs. Dates: YYYY-MM-DD or ISO timestamps with timezone. Only one variant may be default; the first becomes default if none is marked.</p>
          <p>Import creates new products. It does not update existing products. Exported IDs, slug, category/seller names and contact details, approval status, rating, review counts, timestamps and baseProductId are reference columns and are ignored on import. The server generates IDs and slug, sets initial approval/rating, and takes seller details from the selected seller. Re-importing an export creates copies. Use active sellers and existing categories from the ID download.</p>
          <p>Downloads include a UTF-8 BOM for Excel. Spreadsheet formula text is prefixed with an apostrophe for safety and restored on import. Maximum upload size: 10 MB.</p>
        </div>
      </details>
      {busy && <p role="status" className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" />{busy}</p>}
      {message && <p role="status" className="text-sm whitespace-pre-wrap">{message}</p>}
      {preview && <div className="space-y-3">
        <p className="text-sm font-medium">{filename}: {preview.rowCount} variant rows, {preview.products.length} products{preview.errors.length ? `, ${preview.errors.length} errors` : " — ready to import"}.</p>
        {preview.errors.length > 0 ? <div role="alert" className="max-h-64 overflow-auto rounded-lg border border-red-200 p-3 text-sm text-red-700"><p className="font-semibold">Fix all errors and upload again. No products have been created.</p><ul className="list-disc pl-5">{preview.errors.map((error, i) => <li key={i}>{error}</li>)}</ul></div> : <>
          <div className="max-h-64 overflow-auto rounded-lg border"><table className="w-full text-left text-sm"><thead><tr><th className="p-2">Product key</th><th className="p-2">Name</th><th className="p-2">Variants</th></tr></thead><tbody>{preview.products.map((product) => <tr key={product.key}><td className="p-2">{product.key}</td><td className="p-2">{product.payload.name}</td><td className="p-2">{product.payload.variants.length}</td></tr>)}</tbody></table></div>
          <button disabled={!!busy || attempted} onClick={importCsv} className={`${buttonClass} bg-primary text-primary-foreground`}>Create {preview.products.length} new products</button>
        </>}
      </div>}
      {results.length > 0 && <div aria-live="polite" className="space-y-2 text-sm">
        <p>{results.filter((r) => r.status === "created").length} created, {results.filter((r) => r.status === "failed").length} failed, {results.filter((r) => r.status === "unknown").length} unconfirmed, {(preview?.products.length || 0) - results.length} remaining.</p>
        <button className={buttonClass} onClick={() => download("vadi-import-results.csv", serializeCsv([["product_key", "name", "status", "message"], ...results.map((r) => [r.key, r.name, r.status, r.message])]))}>Download import results</button>
        <ul className="max-h-48 overflow-auto space-y-1">{results.map((result) => <li key={result.key}>{result.name} ({result.key}): {result.status} — {result.message}</li>)}</ul>
        {!busy && <p>Review results before uploading another file. Exclude products already created to avoid duplicates.</p>}
      </div>}
    </section>
  );
}
