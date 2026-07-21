# Section API (Admin)

توثيق Endpoints الخاصة بقسم `Section` للأدمن عبر `SectionCrudController`.

## Base Endpoint
- `/api/admin/sections`
- جميع المسارات تتطلب `auth:admin`

---

## Endpoints

### 1) List Sections
- `GET /api/admin/sections`

**Query Params (اختيارية):**
- `search`: بحث عام (حسب السيرفس على الحقول: `id`, `name`)
- `is_active`: `true | false`
- `page`: رقم الصفحة (افتراضي: `1`)
- `per_page`: عدد العناصر (افتراضي: `10`)
- `sort_field`: المتاح حاليًا `id` فقط
- `sort_order`: `asc | desc` (افتراضي: `desc`)

### 2) Create Section
- `POST /api/admin/sections`

### 3) Show Section
- `GET /api/admin/sections/{id}`

### 4) Update Section
- `PUT /api/admin/sections/{id}`

### 5) Delete Section
- `DELETE /api/admin/sections/{id}`

---

## Create Payload

```json
{
  "name": {
    "ar": "قسم البانرات",
    "en": "Banners Section"
  },
  "manual_model": "banner",
  "item_ids": [
    {
      "item_id": 1,
      "link": "https://example.com/offer",
      "order": 1
    },
    {
      "item_id": 2,
      "order": 2
    }
  ]
}
```

## Update Payload

> نفس بنية الإنشاء.  
> في التحديث: `name` اختياري، لكن `manual_model` و `item_ids` مطلوبان.

```json
{
  "name": {
    "ar": "قسم بانرات محدث",
    "en": "Updated Banners Section"
  },
  "manual_model": "banner",
  "item_ids": [
    {
      "item_id": 10,
      "order": 1
    }
  ]
}
```

---

## Validation Rules

### Create
- `name`: required object
- `name.ar`, `name.en`: required string max 255
- `manual_model`: required string ويجب أن تكون ضمن القيم المسموحة في `config/section_items.php`
- `item_ids`: required array + min:1
- `item_ids.*.item_id`: required integer
- `item_ids.*.link`: nullable string max 255
- `item_ids.*.order`: nullable integer >= 0

### Update
- `name`: nullable object
- `name.ar`, `name.en`: nullable string max 255
- `manual_model`: required string (ضمن نفس القيم المسموحة)
- `item_ids`: required array + min:1
- `item_ids.*.item_id`: required integer
- `item_ids.*.link`: nullable string max 255
- `item_ids.*.order`: nullable integer >= 0

### Filter (List)
- `is_active`: nullable boolean

---

## `manual_model` Allowed Values

حسب `config/section_items.php` القيم الحالية:
- `banner`
- `product`
- `shop`
- `brand`
- `recipe`
- `basket`

---

## Important Behavior

- الحقل `item_ids.*.item_type` يتم حقنه تلقائيًا داخل الـ Request اعتمادًا على `manual_model` (لا يلزم إرساله من الفرونت).
- عند `create` أو `update` يتم إعادة مزامنة `sectionItems` بالكامل من `item_ids` المرسلة.

---

## Response Shape (عام)

كل الردود تأتي بهذا الشكل:

```json
{
  "status": true,
  "message": "Success",
  "data": {}
}
```

## List Response (`GET /api/admin/sections`)
- `data.items`: قائمة الأقسام (resource: `AllResource`)
- `data.pagination`: معلومات pagination

العنصر الواحد داخل `items`:

```json
{
  "id": 1,
  "name": {
    "ar": "قسم",
    "en": "Section"
  },
  "type": "manual",
  "manual_model": "banner",
  "filters": null
}
```

## Show / Create / Update Response
- الـ resource المستخدم: `OneResource`
- يشمل:
  - `id`, `name`, `admin_name`, `type`
  - `api` (مثل `api_method`, `filters`, `see_more`, `action`)
  - `manual.manual_model`
  - `items` (إما بيانات API أو `sectionItems` حسب نوع القسم)

---
## Related Admin APIs

- [`Admin Legal Documents API`](./legal-documents-api-admin.md)
