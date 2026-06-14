# Frontend Update Guide (2026-06-04)

This document summarizes the API and data-model changes introduced in this update and what the frontend (React Web) must do.

## 1) Product: Restaurant Flag
- A new boolean field `is_restaurant` is available on product responses.
- Source is derived from the product category (restaurant category => true).
- Use this flag to adjust UI logic for restaurant products.

### Where it appears
- Admin product detail response
- Admin product list response
- User product detail response
- User product list response

### Expected behavior
- If `is_restaurant` is true, you should still render the product normally, even if some fields are null.

## 2) Restaurant Product Variants (Minimal Variant)
When a product is a restaurant product:
- Backend auto-creates a minimal `ProductVariant`.
- This variant has only:
  - `product_id`
  - `is_active = true`
  - `attributes_values_ids = []`
- Other fields like `sku`, `model`, `barcode`, etc. may be null.

### Frontend behavior
- Do not require variant fields for restaurant products.
- If variants array is empty (or contains only a minimal variant), do not block rendering.
- Be tolerant of null values.

## 3) Shops <-> Categories (Many-to-Many)
Shops can now be linked to multiple categories, and categories can link to multiple shops.

### Admin dashboard
- A shop accepts `category_ids` on create/update.
- Send `category_ids` as an array of category IDs.
- Example payload:
  {
    "category_ids": [1, 2, 5]
  }

### User responses
- Shop list and shop detail responses include `categories`.
- `categories` is an array of objects: { id, name }
- Data source uses the new shop-category relation if available.

### Shop filtering
- Shop filtering by `category_id` now checks:
  - Direct shop-category assignments OR
  - Product-category relationships (legacy fallback)

## 4) Prices are Float Across the System
All price-related values are now treated as float.

### Frontend implications
- Do not cast to integer in the UI.
- Keep decimals as entered.
- Use proper formatting (two decimals) only for display.

### Validation
- Accept decimal input for all price fields.
- Example: 12.50, 9.99, 0.75.

## 5) Product Brand ID is Nullable
- `brand_id` on product is now nullable.
- Frontend should allow product creation without brand.
- When brand is not set, product responses may return null for brand.

## 6) API Fields to Expect (Quick Reference)
### Product (User/Admin)
- `is_restaurant: boolean`

### Shop (User)
- `categories: [{ id, name }]`

### Shop (Admin)
- Accepts `category_ids: number[]`

## 7) UI Notes
- For restaurant products, do not enforce full product data.
- Always render products even if some fields are null.
- Ensure price inputs accept decimals.
- Ensure brand selection can be cleared or left empty.

---
If you need a more detailed payload example for any specific endpoint, ask and I will add it here.
