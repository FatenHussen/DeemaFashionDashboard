# الداشبورد — الصورة المصغّرة بعد حفظ المنتج

> **الجمهور:** فريق الداشبورد  
> **آخر تحديث:** 27 أيلول 2026  
> **Base:** `/api/admin` + Admin token  
> **الحالة:** مطبّق في لوحة الأدمن

الرفع ما تغيّر: الحقل يبقى `thumbnail` (ملف صورة في `multipart`).

بعد الحفظ تُرسم الصورة من الرابط الراجع في `GET`، مو من `<input type="file">`. المتصفح يفرّغ حقل الملف دائماً.

---

## 1) وين

| الشاشة | الحقل |
|--------|--------|
| جدول المنتجات | `image` |
| إنشاء / تعديل — خانة الصورة المصغّرة | `thumbnail` |
| إنشاء / تعديل — معرض الصور | `images[].url` |

الروابط كاملة (`https://.../storage/...`). لا تُلصق `/storage` على رابط يبدأ بـ `http`.

---

## 2) الرد

قائمة `GET /api/admin/products`:

```json
{
  "thumbnail": "https://example.com/storage/product/uuid.jpg",
  "image": "https://example.com/storage/product/uuid.jpg",
  "images": ["https://example.com/storage/product/uuid.jpg"]
}
```

تفاصيل `GET /api/admin/products/{id}`:

```json
{
  "thumbnail": "https://example.com/storage/product/uuid.jpg",
  "image": "https://example.com/storage/product/uuid.jpg",
  "images": [{ "id": null, "url": "https://example.com/storage/product/uuid.jpg" }]
}
```

| الحالة | `thumbnail` | `image` | `images` |
|--------|-------------|---------|----------|
| مصغّرة فقط، بدون معرض | رابطها | نفس الرابط | عنصر واحد = المصغّرة (`id: null`) |
| في معرض | رابط المصغّرة | أول صورة معرض | صور المعرض فقط |
| لا مصغّرة ولا معرض | `null` | `null` | `[]` |

عنصر المصغّرة داخل `images` يجي `id: null`. لا يُرسل ضمن `existing_media_ids`. `Number(null)` يساوي `0`، وهذا الرقم ممنوع أيضاً.

---

## 3) السلوك في اللوحة

- خانة الصورة المصغّرة: `<img src={product.thumbnail} />` بعد `GET`. إذا `thumbnail` فاضي، الخانة فاضية. لا تُستخدم صورة المعرض بديلاً عنها.
- ملف جديد قبل الحفظ: معاينة محلية من الملف فقط، وتختفي صورة السيرفر إلى أن يُحفظ.
- جدول المنتجات: `<img src={product.image} />`.
- معرض التعديل: `images[].url`. إذا المعرض فاضي والمصغّرة موجودة، الباك حاططها داخل `images` وتظهر في المعرض. زر الحذف يظهر لصور المعرض ذات `id` موجب فقط.
- تعديل بدون تغيير المصغّرة: لا يُرسل حقل `thumbnail`. القديمة تبقى.
- لتبديلها: يُرسل ملف `thumbnail` الجديد فقط.

```text
POST /api/admin/products
thumbnail=<file>

PUT /api/admin/products/{id}
thumbnail=<file جديد>
```

---

## 4) Checklist

- [x] بعد إنشاء منتج بمصغّرة فقط، الجدول يعرض `image`
- [x] شاشة التعديل تعرض `thumbnail` كصورة، مو حقل ملف فاضي
- [x] ما في لصق `/storage` على رابط يبدأ بـ `http`
- [x] حفظ بدون ملف جديد لا يمسح المصغّرة (لا يُرسل `thumbnail`)
- [x] `images[].id === null` لا يُرسل في `existing_media_ids`
