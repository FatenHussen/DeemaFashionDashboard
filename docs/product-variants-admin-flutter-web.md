# متغيّرات المنتج — مو spec نهائي (Dashboard Web + Flutter Web)

> **الجمهور:** فريق الداشبoard (React) · Flutter Web (لوحة الإدارة)  
> **Base API:** `/api/admin` + Admin Bearer token  
> **آخر تحديث:** 2026-08-30  
> **حالة الباك:** جاهز — التعديل على الواجهة فقط

---

## الفهرس

1. [الفكرة العامة](#1-الفكرة-العامة)
2. [تدفق المستخدم (UX)](#2-تدفق-المستخدم-ux)
3. [نموذج إضافة متغيّr — Single select](#3-نموذج-إضافة-متغيّr--single-select)
4. [كارد المتغيّr — التخطيط والحقول](#4-كارد-المتغيّr--التخطيط-والحقول)
5. [قائمة المتغيّrات و SKU](#5-قائمة-المتغيّrات-و-sku)
6. [جلب صفات الفئة](#6-جلب-صفات-الفئة)
7. [توليد SKU — إنجlيزi فقط](#7-توليد-sku--إنجlيزi-فقط)
8. [السعر · الخصm · USD ↔ SYP](#8-السعر--الخصm--usd--syp)
9. [الحفظ والتحديث (API)](#9-الحفظ-والتحديث-api)
10. [Payload · أمثلة](#10-payload--أمثلة)
11. [Checklist](#11-checklist)
12. [مرجع تنفيذ Dashboard Web (React)](#12-مرجع-تنفيذ-dashboard-web-react)
13. [ملاحظات Flutter Web](#13-ملاحظات-flutter-web)

---

## 1) الفكرة العامة

| المفهوم | الشرح |
|---------|--------|
| **متغيّr** | تركيبة **واحدة** من قيم الصفات (لون + مقاس + تصميم…) + SKU + أسعار + كمية |
| **إضافة** | كل select = **قيمة واحدة** → **متغيّr واحد** لكل ضغطة «إضافة» |
| **الباك** | `variants[]` — صف مستقل لكل متغيّr |

### محذوف من الواجهة

- ~~اسم المتغيّr (ar/en)~~ — لا يُرسل ولا يُعرض
- ~~multi-select للمقاسات~~ — **كل الصفات single**
- ~~توليد كروت متعددة دفعة واحدة~~ (Cartesian product)
- ~~الوزن~~ على `product_variants`

---

## 2) تدفق المستخدم (UX)

```
┌─ تبويب المتغيّrات ─────────────────────────────────────┐
│  [تنبيه] إضافة متغير جديد                              │
│          يرجى اختيار الخصائص والقيم لإنشاء متغير جديد   │
├────────────────────────────────────────────────────────┤
│  ┌─ إضافة متغيّr جديد ─────────────────────────────┐   │
│  │  لون ▼   مقاس ▼   تصميم ▼   (single لكل صفة)    │   │
│  │                        [ + إضافة متغيّr جديد ]  │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─ كارد متغيّr 1 ────────────────────────────────┐   │
│  │  ● green · M · تعبان              [متوفر] 🗑  │   │
│  │  [سطر 1: $ · ل.س · خصm · قيمة · بعد الخصm]    │   │
│  │  [سطر 2: كمية · SKU · باركود]                   │   │
│  │  [صور المتغيّr]                                 │   │
│  │                          [ حفظ التغييرات ]      │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─ كارد متغيّr 2 ─ ... ──────────────────────────┐   │
└────────────────────────────────────────────────────────┘
```

| خطوة | ماذا يحدث |
|------|-----------|
| 1 | المستخدم يختار قيم **كل** الصفات (single) |
| 2 | يضغط **«إضافة متغيّr جديد»** → ينزل **كارد واحد** (SKU يُولَّد تلقائياً) |
| 3 | يعبّئ الحقول **داخل الكارد** (كلها اختيارية) |
| 4 | يضغط **«حفظ التغييرات»** على الكارد → `PUT product-variants/{id}` |
| 5 | **لا** تحديث تلقائي عند كل keystroke |

### وضع إنشاء منتج جديد (لم يُحفظ بعد)

- المتغيّrات تُخزَّن في state النموذج
- تُرسل مع **`POST/PUT products/{id}`** عند «إنشاء/حفظ المنتج»
- أو بعد حفظ المنتج: حفظ كل متغيّr من كardه (`PUT product-variants/{id}`)

### وضع تعديل منتج

- متغيّr موجود → **تحديث** بـ `id` (ليس استبدال القائمة كاملة)
- متغيّr جديد بدون `id` → يُنشأ عبر API المنتج أو endpoint المتغيّr

---

## 3) نموذج إضافة متغيّr — Single select

```
┌─ إضافة متغيّr جديد ──────────────────────┐
│  لون      ▼  [ green        ]             │  ← single
│  مقاس     ▼  [ M            ]             │  ← single
│  تصميم    ▼  [ تعبان       ]             │  ← single
│                                           │
│  [ + إضافة متغيّr جديد ]                  │
└───────────────────────────────────────────┘
```

### قواعد

| # | القاعدة |
|---|---------|
| 1 | **كل صفة = dropdown واحد** — لون، مقاس، تصميم… |
| 2 | **لا multi-select** — لا checkboxes |
| 3 | **لا حقول سعر/كمية/SKU** في نموذج الإضافة — **فقط الصفات** |
| 4 | كل ضغطة «إضافة» → **متغيّr واحد** + **كارد واحد** |
| 5 | زر الإضافة **معطّل** حتى تُختار قيمة لـ **كل** صفة |

### تكرار اللون — مسموح ✅

| الحالة | مسموح؟ |
|--------|--------|
| أصفر + L + تعبان | ✅ |
| أصفر + XL + تعبان (نفس اللون، مقاس مختلف) | ✅ |
| أصفر + L + نجوم (نفس اللون والمقاس، شكل مختلف) | ✅ |
| أصفر + L + تعبان **مرة ثانية** (نفس الثلاثة) | ❌ |

**لا تفلتر** خيارات الـ dropdown حسب المتغيّrات الموجودة — امنع التكرار **عند الإضافة فقط**:

```js
function variantSignature(ids) {
  return [...ids].sort((a, b) => a - b).join('-');
}

function isDuplicate(existing, newIds) {
  const sig = variantSignature(newIds);
  return existing.some(
    (v) => variantSignature(v.attributes_values_ids ?? []) === sig
  );
}
```

```dart
bool isDuplicate(List<int> a, List<int> b) {
  final sa = [...a]..sort();
  final sb = [...b]..sort();
  if (sa.length != sb.length) return false;
  for (var i = 0; i < sa.length; i++) {
    if (sa[i] != sb[i]) return false;
  }
  return true;
}
```

### ❌ ممنوع

```js
// multi مقاس → 4 متغيّrات دفعة واحدة
selectedSizes.map((size) => addVariant({ color, size }));

// إخفاء لون مستخدم
colors.filter((c) => !usedColors.includes(c.id));
```

---

## 4) كارد المتغيّr — التخطيط والحقول

### رأس الكارد

- سلسلة نصية للصفات: `green · M · تعبان` (بدون dots ألوان مكررة في الرأس)
- شارة **متوفر / غير نشط**
- زر حذف

### المعلومات الأساسية

**السطر 1** (صف واحد على `xl`):

| # | الواجهة | API | required؟ |
|---|---------|-----|-----------|
| 1 | سعر ($) | `variants[].price` | ❌ nullable |
| 2 | سعر (ل.س) | `variants[].price_syp` | ❌ يُحوَّل لـ `price` |
| 3 | نوع الخصm | `variants[].discount_type` | ❌ افتراضي `none` |
| 4 | قيمة الخصm | `variants[].discount` | ❌ |
| 5 | السعر بعد الخصm | — | readonly |

**السطر 2** (3 حقول):

| # | الواجهة | API |
|---|---------|-----|
| 1 | الكمية | `variants[].quantity` |
| 2 | SKU (+ زر إعادة التوليد) | `variants[].sku` |
| 3 | الباركود | `variants[].barcode` |

**اختياري (shop channel):**

| # | الواجهة | API |
|---|---------|-----|
| — | تكلفة الفرع | `shop_variants[].cost_price` |

**صور المتغيّr:** رفع متعدد، بدون نصوص تنبيه إضافية.

**بدون** `*` أو `required` على أي حقل — **كل الحقول اختيارية** في الكارد.

---

## 5) قائمة المتغيّrات و SKU

- **كارد واحد = متغيّr واحد**
- شريط أدوات: **توليد جميع SKU المفقودة** + إحصائيات (إجمالي / مع SKU / بدون SKU)
- حالة فارغة: «لا توجد متغيّrات بعد»

---

## 6) جلب صفات الفئة

```http
GET /api/admin/category-attributes?category_id={mainCategoryId}
```

| `type` | الواجهة |
|--------|---------|
| `color` | dropdown — **single** (swatch في القائمة فقط) |
| `square` (مقاس) | dropdown — **single** |
| `circle` (تصميم) | dropdown — **single** |

> الصفات تُحمَّل من **الفئة الرئيسية** فور اختيارها (المستويات الفرعية للفئة اختيارية لحفظ المنتج).

---

## 7) توليد SKU — إنجlيزi فقط

| ❌ خطأ | ✅ صح |
|--------|------|
| `PROD-أخضر-XL` | `PROD-GREEN-M` |
| | `PROD-A1B2C3-X7K9M2` (بعد regenerate) |

### قواعد

- **العرض:** `name.ar` (أو `en` حسب لغة الواجهة)
- **SKU:** `name.en` أو `hex` بدون `#` أو `valueId` — **لا** `name.ar`
- **Regenerate:** suffix عشوائي 6 أحرف (`A-Z`, `2-9` بدون O/0/I/1)

```js
function sanitizeSkuBase(productSku) {
  return String(productSku ?? 'VAR').replace(/[^a-zA-Z0-9-]/g, '').toUpperCase() || 'VAR';
}

function generateVariantSku(productSku, attributeValues, colorsLookup) {
  const base = sanitizeSkuBase(productSku);
  const parts = attributeValues.map((v) => skuPart(v, colorsLookup)).filter(Boolean);
  return parts.length ? `${base}-${parts.join('-')}` : base;
}

function regenerateVariantSku(productSku, attributeValues, colorsLookup) {
  const base = sanitizeSkuBase(productSku);
  const parts = attributeValues.map((v) => skuPart(v, colorsLookup)).filter(Boolean);
  const suffix = randomSuffix(6);
  return parts.length ? `${base}-${parts.join('-')}-${suffix}` : `${base}-${suffix}`;
}
```

---

## 8) السعر · الخصm · USD ↔ SYP

```js
const sypRate = currencies.find((c) => c.code === 'SYP')?.exchange_rate ?? 1;
// كتابة $ → يُعبَّى ل.س والعكس
```

| الإرسال | الباك |
|---------|-------|
| `price` | USD ✅ |
| `price_syp` | يُحوَّل لـ USD |
| الاثنان معاً | يعتمد **`price` ($)** |

```js
function priceAfterDiscount(price, discountType, discount) {
  const p = Number(price) || 0;
  const d = Number(discount) || 0;
  if (!p || discountType === 'none' || d <= 0) return p;
  if (discountType === 'percentage') return Math.round((p - p * (d / 100)) * 100) / 100;
  if (discountType === 'fixed') return Math.max(0, p - d);
  return p;
}
```

> إذا `price` فارغ → الباك يأخذ سعر المنتج (أو `0`).

---

## 9) الحفظ والتحديث (API)

### تحديث متغيّr واحد

```http
PUT /api/admin/product-variants/{id}
Content-Type: multipart/form-data  (عند وجود صور)
```

```json
{
  "sku": "PROD-GREEN-M",
  "price": 2300,
  "discount": 10,
  "discount_type": "percentage",
  "quantity": 30,
  "barcode": "0194253404316",
  "attributes_values_ids": [1, 2, 3],
  "is_active": 1,
  "is_trend": 0
}
```

### ضمن المنتج

```http
PUT /api/admin/products/{id}
```

```text
variants[0][id]=15
variants[0][sku]=PROD-GREEN-M
variants[0][price]=2300
variants[0][quantity]=30
variants[0][attributes_values_ids][0]=1
variants[0][attributes_values_ids][1]=2
...
```

### حقول `variants[]` المسموحة (whitelist)

| الحقل | ملاحظة |
|-------|--------|
| `id` | للتحديث فقط |
| `attributes_values_ids[]` | مطلوب للإضافة |
| `sku`, `barcode`, `model` | nullable |
| `price`, `price_syp`, `quantity` | nullable |
| `discount_type`, `discount` | nullable |
| `is_active`, `is_trend` | `0` / `1` |
| `images[]`, `existing_images_ids[]` | صور |

**لا ترسل:** `name.ar`, `name.en`, `shops`, `price_currencies`, `attributes` من GET.

### `shop_variants[]` (sale_channel = shop)

```text
shop_variants[0][shop_id]=5
shop_variants[0][variant_index]=0
shop_variants[0][cost_price]=188000
```

---

## 10) Payload · أمثلة

### متغيّr بحد أدنى — مقبول ✅

```text
variants[0][attributes_values_ids][0]=5
variants[0][attributes_values_ids][1]=12
```

### 3 متغيّrات

```text
variants[0][sku]=PROD-GREEN-L
variants[0][price]=2300
variants[0][quantity]=30
variants[0][discount]=10
variants[0][discount_type]=percentage
variants[0][attributes_values_ids][0]=1
variants[0][attributes_values_ids][1]=2
variants[0][attributes_values_ids][2]=3

variants[1][sku]=PROD-GREEN-M
...
```

---

## 11) Checklist

### الواجهة

- [ ] **Single select** لكل صفة — **مو multi**
- [ ] نموذج الإضافة = **dropdowns فقط** + زر إضافة
- [ ] كل «إضافة» = **متغيّr واحد** + **كارد واحد**
- [ ] **لا** Cartesian product على المقاسات
- [ ] كارد: سطر 1 (أسعار + خصm) · سطر 2 (كمية + SKU + باركود)
- [ ] **كل حقول الكارد اختiارية** — بدون `required` / `*`
- [ ] منع duplicate = **التركيبة الكاملة** فقط
- [ ] **لا فلترة** ألوان/مقاسات من dropdown
- [ ] SKU **إنجlيزi فقط**
- [ ] حفظ الكارد = `PUT product-variants/{id}` (ليس auto-save)
- [ ] تكلفة → `shop_variants[].cost_price` عند `sale_channel=shop`
- [ ] تنبيه التبويب: «إضافة متغير جديد / يرجى اختيار الخصائص والقيم…»
- [ ] **لا** نصوص تنبيه: (اختياري)، شرح الصور المتعددة، تنبيه الفئة الطويل

### API / باك

- [ ] `GET category-attributes?category_id=`
- [ ] `PUT product-variants/{id}`
- [ ] `PUT products/{id}` + `variants[i][id]` للتحديث وليس الاستبدال
- [ ] Colors list: `is_active=1` (ليس `true`)

---

## 12) مرجع تنفيذ Dashboard Web (React)

| ملف | الدور |
|-----|--------|
| `src/pages/dashboard/products/view/product/Create.tsx` | الصفحة الرئيسية · `saveVariantRow` · `existingVariantComboKeys` |
| `src/pages/dashboard/products/components/VariantGeneratorPanel.tsx` | نموذج الإضافة (dropdowns فقط) |
| `src/pages/dashboard/products/components/ProductVariantsCardList.tsx` | القائمة + شريط SKU |
| `src/pages/dashboard/products/components/ProductVariantInlineRow.tsx` | كارد المتغيّr + الحقول |
| `src/pages/dashboard/products/utils/variant-combinations.ts` | SKU · duplicate key · `isAttributeMultiSelect → false` |
| `src/pages/dashboard/products/utils/variant-payload.ts` | whitelist الإرسال |
| `src/pages/dashboard/products/validation/product.validation.ts` | Zod — حقول optional |
| `src/pages/dashboard/colors/api/color.services.ts` | `is_active=1` |

---

## 13) ملاحظات Flutter Web

### Widgets مقترحة

| Widget | وظيفة |
|--------|--------|
| `VariantAddPanel` | `Column` من `DropdownButton` لكل صفة + `FilledButton` إضافة |
| `VariantCardList` | `ListView` من `VariantCard` |
| `VariantCard` | رأس صفات + `Grid` سطرين للحقول + زر حفظ |
| `VariantSkuToolbar` | توليد SKU المفقود + إحصائيات |

### State

```dart
class VariantDraft {
  List<int> attributesValuesIds;
  String? sku;
  double? price;
  double? priceSyp;
  String discountType; // none | percentage | fixed
  double? discount;
  int? quantity;
  String? barcode;
  int? id; // null = جديد
}
```

### Dio / multipart

- نفس حقول `variants[i][…]` في `FormData`
- صور: `variants[i][images][j]` كـ `MultipartFile`

### i18n

| key | ar |
|-----|-----|
| `variantsTabCreateModeTitle` | إضافة متغير جديد |
| `variantsTabCreateModeHint` | يرجى اختيار الخصائص والقيم لإنشاء متغير جديد |
| `variantAddDuplicateCombo` | هذا المتغيّr موجود — غيّر المقاس أو الشكل |

---

## ملخص سريع

```
نموذج إضافة:  لون ▼ + مقاس ▼ + تصميم ▼  (single)
                    ↓ [إضافة]
كارد متغيّr:   $ · ل.س · خصm · كمية · SKU · باركود
                    ↓ [حفظ]
API:           variants[i]  — PUT product-variants/{id} أو ضمن products/{id}
```

**الباك جاهز — الواجهة فقط.**
