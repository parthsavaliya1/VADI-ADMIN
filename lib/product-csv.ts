// One row per variant; product_key groups rows into a single create request.
export const productColumns = [
  "name", "description", "brand", "category", "unit", "sellerId", "image", "images",
  "featured", "trending", "bestDeal", "isOrganic", "offerEndsAt", "isActive", "discount",
  "tax.gstPercent", "tax.inclusive", "tags", "searchKeywords", "shelfLife.value",
  "shelfLife.unit", "expiryRequired", "storageInstructions",
] as const;
export const variantColumns = [
  "packSize", "packUnit", "mrp", "price", "stock", "lowStockThreshold", "sku",
  "isDefault", "isActive", "image", "images", "expiresAt",
] as const;
const metadataColumns = ["product_id", "slug", "category_name", "seller_name", "approvalStatus", "rating", "reviewsCount", "createdAt", "updatedAt", "baseProductId", "seller_phone", "seller_email", "seller_city", "seller_area", "variant_id"];
export const csvColumns = ["product_key", ...productColumns, ...variantColumns.map((key) => `variant.${key}`), ...metadataColumns];
type RecordValue = Record<string, unknown>;
export type CsvProduct = RecordValue & { name: string; variants: RecordValue[] };
export type ImportProduct = { key: string; rows: number[]; payload: CsvProduct };
export type CsvPreview = { products: ImportProduct[]; errors: string[]; rowCount: number };

function object(value: unknown): RecordValue {
  return value && typeof value === "object" ? value as RecordValue : {};
}
function get(value: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, part) => object(current)[part], value);
}

// RFC 4180 quoting, embedded newlines, UTF-8 BOM, and strict malformed-file errors.
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = "", quoted = false, closed = false;
  text = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; }
        else { quoted = false; closed = true; }
      } else cell += char;
    } else if (char === "," || char === "\n" || char === "\r") {
      row.push(cell); cell = ""; closed = false;
      if (char !== ",") {
        if (char === "\r" && text[i + 1] === "\n") i++;
        rows.push(row); row = [];
      }
    } else if (char === '"' && !cell && !closed) quoted = true;
    else {
      if (closed || char === '"') throw new Error(`Malformed CSV near record ${rows.length + 1}.`);
      cell += char;
    }
  }
  if (quoted) throw new Error("CSV contains an unclosed quoted field.");
  if (cell || row.length || closed) { row.push(cell); rows.push(row); }
  return rows;
}

// A leading apostrophe prevents spreadsheet formula execution. Import reverses it.
function safeCell(value: unknown): string {
  let text = Array.isArray(value) ? JSON.stringify(value) : String(value ?? "");
  if (/^[\s]*[=+\-@]/.test(text) || /^[\t\r]/.test(text) || text.startsWith("'")) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
export function serializeCsv(rows: unknown[][]): string {
  return "\uFEFF" + rows.map((row) => row.map(safeCell).join(",")).join("\r\n");
}
function importCell(value: string): string {
  return /^'(?:'|[\s]*[=+\-@]|[\t\r])/.test(value) ? value.slice(1) : value;
}

export function exportProducts(products: unknown[]): string {
  const rows: unknown[][] = [csvColumns];
  products.forEach((value, index) => {
    const p = object(value), seller = object(p.seller);
    const variants = Array.isArray(p.variants) && p.variants.length ? p.variants : [{}];
    variants.forEach((v) => {
      const values: RecordValue = {
        product_key: p._id || `product-${index + 1}`,
        ...Object.fromEntries(productColumns.map((key) => [key, get(p, key)])),
        category: get(p.category, "_id") || p.category,
        sellerId: get(seller.sellerId, "_id") || seller.sellerId,
        ...Object.fromEntries(variantColumns.map((key) => [`variant.${key}`, get(v, key)])),
        product_id: p._id, slug: p.slug, category_name: get(p.category, "name"),
        seller_name: seller.sellerName || get(seller.sellerId, "name"),
        seller_phone: get(seller, "contact.phone"), seller_email: get(seller, "contact.email"),
        seller_city: get(seller, "location.city"), seller_area: get(seller, "location.area"),
        variant_id: get(v, "_id"),
        ...Object.fromEntries(["approvalStatus", "rating", "reviewsCount", "createdAt", "updatedAt", "baseProductId"].map((key) => [key, p[key]])),
      };
      rows.push(csvColumns.map((column) => values[column]));
    });
  });
  return serializeCsv(rows);
}

export function templateCsv(): string {
  const product = {
    _id: "new-product-1", name: "Example Almonds", description: "Fresh almonds", brand: "Vadi",
    category: "REPLACE_WITH_CATEGORY_ID", unit: "kg", seller: { sellerId: "REPLACE_WITH_SELLER_ID" },
    image: "", images: [], featured: false, trending: false, bestDeal: false, isOrganic: false,
    offerEndsAt: null, isActive: true, discount: 0, tax: { gstPercent: 0, inclusive: true },
    tags: ["almonds"], searchKeywords: ["dry fruit"], shelfLife: { value: 6, unit: "months" },
    expiryRequired: true, storageInstructions: "Store in a cool, dry place",
    variants: [
      { packSize: 250, packUnit: "g", mrp: 300, price: 250, stock: 50, lowStockThreshold: 5, sku: "ALM-250", isDefault: true, isActive: true, image: "", images: [], expiresAt: null },
      { packSize: 500, packUnit: "g", mrp: 600, price: 480, stock: 25, lowStockThreshold: 5, sku: "ALM-500", isDefault: false, isActive: true, image: "", images: [], expiresAt: null },
    ],
  };
  return exportProducts([product]);
}

export function previewProducts(text: string): CsvPreview {
  const records = parseCsv(text), headers = records.shift()?.map((h) => h.trim()) || [];
  const errors: string[] = [];
  const products: ImportProduct[] = [];
  const groups = new Map<string, { rows: number[]; data: Record<string, string>; variants: RecordValue[] }>();
  if (new Set(headers).size !== headers.length) errors.push("Duplicate column headers are not allowed.");
  for (const header of headers) if (!csvColumns.includes(header)) errors.push(`Unknown column: ${header}`);
  for (const key of ["product_key", "name", "category", "unit", "sellerId", "variant.packSize", "variant.packUnit", "variant.mrp", "variant.price", "variant.stock"]) {
    if (!headers.includes(key)) errors.push(`Missing column: ${key}`);
  }
  if (errors.length) return { products, errors, rowCount: records.length };

  function number(value: string, field: string, fallback?: number, max = Infinity): number {
    if (!value.trim() && fallback !== undefined) return fallback;
    if (!value.trim() || !Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > max) throw new Error(`${field} must be a number from 0 to ${max === Infinity ? "a finite value" : max}.`);
    return Number(value);
  }
  function boolean(value: string, field: string, fallback: boolean): boolean {
    if (!value.trim()) return fallback;
    if (/^(true|1)$/i.test(value)) return true;
    if (/^(false|0)$/i.test(value)) return false;
    throw new Error(`${field} must be true or false (or 1/0).`);
  }
  function list(value: string, field: string): string[] {
    if (!value.trim()) return [];
    let parsed: unknown;
    try { parsed = JSON.parse(value); } catch { throw new Error(`${field} must be a JSON string array, e.g. ["one","two"].`); }
    if (!Array.isArray(parsed) || parsed.some((v) => typeof v !== "string")) throw new Error(`${field} must be a JSON string array.`);
    return parsed;
  }
  function date(value: string, field: string): string | null {
    if (!value.trim()) return null;
    if (!/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2}))?$/.test(value) || !Number.isFinite(Date.parse(value))) throw new Error(`${field} must be YYYY-MM-DD or an ISO timestamp with timezone.`);
    const result = new Date(value).toISOString();
    if (value.length === 10 && result.slice(0, 10) !== value) throw new Error(`${field} is not a valid date.`);
    return result;
  }
  function url(value: string, field: string): string {
    if (!value.trim()) return "";
    try { if (!["https:", "http:"].includes(new URL(value).protocol)) throw new Error(); }
    catch { throw new Error(`${field} must be an http(s) image URL.`); }
    return value;
  }
  let rowCount = 0;
  records.forEach((cells, index) => {
    if (cells.every((cell) => !cell.trim())) return;
    rowCount++;
    const row = index + 2;
    if (cells.length !== headers.length) { errors.push(`Row ${row}: expected ${headers.length} columns, found ${cells.length}.`); return; }
    const data = Object.fromEntries(headers.map((h, i) => [h, importCell(cells[i])]));
    const key = data.product_key.trim();
    if (!key) { errors.push(`Row ${row}: product_key is required.`); return; }
    const group = groups.get(key) || { rows: [], data: {}, variants: [] };
    groups.set(key, group); group.rows.push(row);
    for (const column of productColumns) {
      const value = data[column] || "";
      if (value !== "") {
        if (group.data[column] !== undefined && group.data[column] !== value) errors.push(`Row ${row}: conflicting ${column} for product ${key}.`);
        else group.data[column] = value;
      }
    }
    try {
      const v = (field: string) => data[`variant.${field}`] || "";
      const packSize = number(v("packSize"), "variant.packSize");
      if (packSize <= 0) throw new Error("variant.packSize must be greater than 0.");
      if (!["kg", "g", "litre", "ml", "pcs"].includes(v("packUnit"))) throw new Error("variant.packUnit must be kg, g, litre, ml or pcs.");
      const mrp = number(v("mrp"), "variant.mrp"), price = number(v("price"), "variant.price");
      if (price > mrp) throw new Error("variant.price cannot exceed variant.mrp.");
      group.variants.push({
        packSize, packUnit: v("packUnit"), mrp, price, stock: number(v("stock"), "variant.stock"),
        lowStockThreshold: number(v("lowStockThreshold"), "variant.lowStockThreshold", 5), sku: v("sku"),
        isDefault: boolean(v("isDefault"), "variant.isDefault", false), isActive: boolean(v("isActive"), "variant.isActive", true),
        image: url(v("image"), "variant.image"), images: list(v("images"), "variant.images").map((image) => url(image, "variant.images")),
        expiresAt: date(v("expiresAt"), "variant.expiresAt"),
      });
    } catch (error) { errors.push(`Row ${row}: ${(error as Error).message}`); }
  });
  groups.forEach(({ data, variants, rows }, key) => {
    try {
      const p = (field: string) => data[field] || "";
      for (const field of ["name", "category", "unit", "sellerId"]) if (!p(field).trim()) throw new Error(`${field} is required.`);
      for (const field of ["category", "sellerId"]) if (!/^[a-f\d]{24}$/i.test(p(field))) throw new Error(`${field} must be an existing 24-character ID.`);
      if (!variants.length) throw new Error("At least one valid variant is required.");
      if (variants.filter((v) => v.isDefault).length > 1) throw new Error("Only one variant can be default.");
      if (!variants.some((v) => v.isDefault)) variants[0].isDefault = true;
      const skus = variants.map((v) => v.sku).filter(Boolean);
      if (new Set(skus).size !== skus.length) throw new Error("Variant SKUs must be unique within a product.");
      if (p("shelfLife.unit") && !["days", "months"].includes(p("shelfLife.unit"))) throw new Error("shelfLife.unit must be days or months.");
      const payload: CsvProduct = {
        name: p("name"), description: p("description"), brand: p("brand"), category: p("category"), unit: p("unit"),
        seller: { sellerId: p("sellerId") }, image: url(p("image"), "image"), images: list(p("images"), "images").map((image) => url(image, "images")),
        featured: boolean(p("featured"), "featured", false), trending: boolean(p("trending"), "trending", false),
        bestDeal: boolean(p("bestDeal"), "bestDeal", false), isOrganic: boolean(p("isOrganic"), "isOrganic", false),
        isActive: boolean(p("isActive"), "isActive", true), expiryRequired: boolean(p("expiryRequired"), "expiryRequired", true),
        discount: number(p("discount"), "discount", 0, 100), tax: { gstPercent: number(p("tax.gstPercent"), "tax.gstPercent", 0, 100), inclusive: boolean(p("tax.inclusive"), "tax.inclusive", true) },
        tags: list(p("tags"), "tags"), searchKeywords: list(p("searchKeywords"), "searchKeywords"),
        offerEndsAt: date(p("offerEndsAt"), "offerEndsAt"), storageInstructions: p("storageInstructions"), variants,
      };
      if (p("shelfLife.value")) payload.shelfLife = { value: number(p("shelfLife.value"), "shelfLife.value"), unit: p("shelfLife.unit") || "days" };
      products.push({ key, rows, payload });
    } catch (error) { errors.push(`Product ${key} (rows ${rows.join(", ")}): ${(error as Error).message}`); }
  });
  if (!rowCount) errors.push("The CSV has no product rows.");
  return { products, errors, rowCount };
}
