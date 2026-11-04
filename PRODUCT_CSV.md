# Product CSV import and export

Open **Admin → Products → Product CSV**.

1. Download **Template** and **Category / seller IDs**.
2. Replace the template category and seller IDs with existing active records.
3. Add one row per variant. Use the same `product_key` for all variants of one product. Product fields may be filled once or repeated identically; variant fields belong on every row.
4. Select **Upload CSV**, fix any validation errors, and review the product/variant counts.
5. Select **Create … new products**. Download the import results to review created, failed, or unconfirmed saves.

**Export CSV** includes all pages matching the current product search, category and status filters, including inactive products when All Status is selected. It includes every variant, including inactive ones.

## Fields

Required product columns: `product_key`, `name`, `category`, `unit`, `sellerId`.

Required variant columns: `variant.packSize`, `variant.packUnit`, `variant.mrp`, `variant.price`, `variant.stock`.

Optional product inputs: `description`, `brand`, `image`, `images`, `featured`, `trending`, `bestDeal`, `isOrganic`, `offerEndsAt`, `isActive`, `discount`, `tax.gstPercent`, `tax.inclusive`, `tags`, `searchKeywords`, `shelfLife.value`, `shelfLife.unit`, `expiryRequired`, `storageInstructions`.

Optional variant inputs: `variant.lowStockThreshold`, `variant.sku`, `variant.isDefault`, `variant.isActive`, `variant.image`, `variant.images`, `variant.expiresAt`.

Export reference columns, ignored on import: `product_id`, `slug`, `category_name`, `seller_name`, `approvalStatus`, `rating`, `reviewsCount`, `createdAt`, `updatedAt`, `baseProductId`, `seller_phone`, `seller_email`, `seller_city`, `seller_area`, `variant_id`. The existing create API generates IDs/slug and initial approval/rating, and copies seller contact/location from the seller record.

## Values and behavior

- Use `true`/`false` or `1`/`0` for flags.
- Use JSON string arrays for `images`, `variant.images`, `tags`, and `searchKeywords`, for example `["organic","fresh"]` in a spreadsheet cell. A text editor must escape quotes according to CSV rules; use the template as a guide.
- Image fields accept existing HTTP/HTTPS image URLs. CSV does not upload local image files.
- Dates accept `YYYY-MM-DD` (UTC midnight) or an ISO timestamp with timezone, e.g. `2027-01-01T12:00:00+05:30`.
- Pack units: `kg`, `g`, `litre`, `ml`, `pcs`. Shelf life units: `days`, `months`.
- Pack size must be positive; prices, stock and low stock thresholds must be nonnegative; price cannot exceed MRP. Discount/GST must be 0–100.
- At most one variant may be default. If none is marked, the first becomes default. Nonempty SKUs must be unique within a product.
- Blank optional flags use the same defaults as product creation. Missing low stock threshold defaults to 5. Missing discount/GST defaults to 0.
- Files use UTF-8, support quoted commas/newlines, and are limited to 10 MB. Downloads include a BOM for Excel. Formula-like text is escaped with an apostrophe and restored by this importer.
- Import creates products using the existing authenticated `/api/admin/products` API; exporting and re-importing creates copies, not updates.
- Schema errors and invalid/inactive category/seller references block all writes. Saves then run per product, so server failures can produce partial success. A network/5xx failure stops further saves because the last product may already have been created. Verify the product list before trying again, and exclude successful products from subsequent uploads.

## Verification

Run from `vadi-admin`:

```sh
node --test tests/product-csv.test.cjs
npx tsc --noEmit --incremental false
npm run build
```

The focused tests compile the utility in memory using the project's existing TypeScript dependency; no additional CSV library or test runner is required.
