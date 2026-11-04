const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

// Compile in memory so tests need no extra runner or generated files.
const filename = path.resolve(__dirname, "../lib/product-csv.ts");
const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
}).outputText;
const moduleInstance = new Module(filename, module);
moduleInstance._compile(compiled, filename);
const { parseCsv, serializeCsv, previewProducts, exportProducts, templateCsv, csvColumns } = moduleInstance.exports;

const category = "1234567890abcdef12345678", sellerId = "abcdef123456789012345678";
function fixture() {
  return {
    _id: "product-1", name: "Almonds, premium", description: 'Line one\nLine "two" — બદામ',
    brand: "Vadi", category: { _id: category, name: "Nuts" }, unit: "kg",
    seller: { sellerId: { _id: sellerId, name: "Shop" }, sellerName: "Shop", contact: { phone: "+919876543210", email: "shop@example.com" }, location: { city: "Surat", area: "Market" } },
    image: "https://example.com/cover.jpg", images: ["https://example.com/front.jpg", "https://example.com/back.jpg"],
    featured: true, trending: false, bestDeal: true, isOrganic: true, isActive: false,
    offerEndsAt: "2027-01-01T12:00:00.000Z", discount: 10, tax: { gstPercent: 5, inclusive: false },
    tags: ["dry, fruit", '"special"'], searchKeywords: ["almonds", "બદામ"], shelfLife: { value: 6, unit: "months" },
    expiryRequired: false, storageInstructions: "Keep cool", approvalStatus: "approved", rating: 4.5, reviewsCount: 3,
    variants: [
      { _id: "v1", packSize: 250, packUnit: "g", mrp: 300, price: 250, stock: 0, lowStockThreshold: 0, sku: "ALM-250", isDefault: true, isActive: true, image: "https://example.com/250.jpg", images: ["https://example.com/250.jpg", "https://example.com/back.jpg"], expiresAt: "2027-06-01T00:00:00.000Z" },
      { _id: "v2", packSize: 500, packUnit: "g", mrp: 600, price: 480, stock: 25, lowStockThreshold: 5, sku: "ALM-500", isDefault: false, isActive: false, image: "", images: [], expiresAt: null },
    ],
  };
}
function editCsv(mutator) {
  const rows = parseCsv(exportProducts([fixture()]));
  const column = (name) => rows[0].indexOf(name);
  mutator(rows, column);
  return serializeCsv(rows);
}

test("all creation fields and two variants survive export/import", () => {
  const source = fixture();
  const result = previewProducts(exportProducts([source]));
  assert.deepEqual(result.errors, []);
  assert.equal(result.products.length, 1);
  const payload = result.products[0].payload;
  for (const field of ["name", "description", "brand", "unit", "image", "images", "featured", "trending", "bestDeal", "isOrganic", "isActive", "offerEndsAt", "discount", "tax", "tags", "searchKeywords", "shelfLife", "expiryRequired", "storageInstructions"]) assert.deepEqual(payload[field], source[field], field);
  assert.equal(payload.category, category);
  assert.deepEqual(payload.seller, { sellerId });
  assert.deepEqual(payload.variants, source.variants.map(({ _id, ...variant }) => variant));
  assert.equal(payload._id, undefined);
  assert.equal(payload.approvalStatus, undefined);
});
test("RFC quoting, CRLF, BOM, Unicode, trailing cells", () => {
  const rows = [["hello, world", 'a "quote"', "multi\r\nline", "બદામ", ""]];
  assert.deepEqual(parseCsv(serializeCsv(rows)), rows);
  assert.deepEqual(parseCsv("a,b\r\n1,\r\n"), [["a", "b"], ["1", ""]]);
});
test("spreadsheet formulas and literal apostrophes round trip safely", () => {
  for (const value of ["=HYPERLINK(1)", "+test", "-test", "@test", "  =test", "\ttest", "'plain", "''=test"]) {
    const product = fixture(); product.name = value;
    const csv = exportProducts([product]);
    assert.ok(csv.includes(`"'${value.replace(/"/g, '""')}"`));
    assert.equal(previewProducts(csv).products[0].payload.name, value);
  }
});
test("groups multiple products and noncontiguous variant rows", () => {
  const second = fixture(); second._id = "product-2"; second.name = "Second product";
  const rows = parseCsv(exportProducts([fixture(), second]));
  [rows[2], rows[3]] = [rows[3], rows[2]];
  const result = previewProducts(serializeCsv(rows));
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.products.map((p) => p.payload.variants.length), [2, 2]);
});
test("continuation rows can omit product data", () => {
  const csv = editCsv((rows, col) => { for (let i = 1; i < col("variant.packSize"); i++) rows[2][i] = ""; });
  assert.deepEqual(previewProducts(csv).errors, []);
});
test("conflicting shared product data is rejected", () => {
  const csv = editCsv((rows, col) => { rows[2][col("name")] = "Different"; });
  assert.match(previewProducts(csv).errors.join(" "), /conflicting name/);
});
test("invalid numbers, flags, JSON arrays, IDs, URLs and dates are rejected", () => {
  for (const [field, value] of [["variant.packSize", "0"], ["variant.stock", "-1"], ["variant.price", "301"], ["variant.mrp", "Infinity"], ["variant.stock", ""], ["variant.packUnit", "box"], ["featured", "yes"], ["tags", "one,two"], ["images", '[1]'], ["sellerId", "bad"], ["discount", "101"], ["tax.gstPercent", "101"], ["image", "javascript:alert(1)"], ["offerEndsAt", "2027-02-30"], ["variant.expiresAt", "tomorrow"]]) {
    const csv = editCsv((rows, col) => { rows[1][col(field)] = value; if (!field.startsWith("variant.")) rows[2][col(field)] = value; });
    assert.ok(previewProducts(csv).errors.length > 0, `${field}: ${value}`);
  }
});
test("default variant rules and duplicate SKU validation", () => {
  let csv = editCsv((rows, col) => { rows[2][col("variant.isDefault")] = "true"; });
  assert.match(previewProducts(csv).errors.join(" "), /Only one/);
  csv = editCsv((rows, col) => { rows[1][col("variant.isDefault")] = "false"; });
  assert.equal(previewProducts(csv).products[0].payload.variants[0].isDefault, true);
  csv = editCsv((rows, col) => { rows[2][col("variant.sku")] = rows[1][col("variant.sku")]; });
  assert.match(previewProducts(csv).errors.join(" "), /SKUs must be unique/);
});
test("malformed quotes, duplicate/missing/unknown headers, and bad widths", () => {
  assert.throws(() => parseCsv('a\n"unclosed'), /unclosed/);
  assert.throws(() => parseCsv('a\n"closed"oops'), /Malformed/);
  for (const mutate of [(r) => { r[0][1] = r[0][0]; }, (r) => { r[0][0] = "unknown"; }, (r) => { r[1].pop(); }]) {
    const rows = parseCsv(exportProducts([fixture()])); mutate(rows);
    assert.ok(previewProducts(serializeCsv(rows)).errors.length > 0);
  }
});
test("empty CSV and headers-only CSV have errors", () => {
  assert.ok(previewProducts("").errors.length > 0);
  assert.match(previewProducts(serializeCsv([csvColumns])).errors.join(" "), /no product rows/);
});
test("template includes every column and creates two variants after IDs are supplied", () => {
  const csv = templateCsv().replaceAll("REPLACE_WITH_CATEGORY_ID", category).replaceAll("REPLACE_WITH_SELLER_ID", sellerId);
  assert.deepEqual(parseCsv(csv)[0], csvColumns);
  const preview = previewProducts(csv);
  assert.deepEqual(preview.errors, []);
  assert.equal(preview.products[0].payload.variants.length, 2);
});
