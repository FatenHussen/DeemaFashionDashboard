# الموقع — الصورة المصغّرة للمنتج

> **الجمهور:** فريق الموقع  
> **آخر تحديث:** 27 أيلول 2026  
> **الحالة:** للواجهة فقط. الباك يرجع الروابط جاهزة.

قائمة Flutter تستخدم نفس حقول القائمة أدناه (`image` و `thumbnail`). صفحة المنتج على الموقع تختلف: تقرأ `images[].path`.

الروابط كاملة (`https://.../storage/...`). لا تلصقوا `/storage` على رابط يبدأ بـ `http`.

---

## 1) وين

| الشاشة | الحقل |
|--------|--------|
| قائمة المنتجات (الموقع و Flutter) | `image` |
| المصغّرة وحدها، إذا لزم تمييزها عن أول صورة معرض | `thumbnail` |
| صفحة المنتج | `images[].path` |

`images[].url` حقل الأدمن. صفحة الموقع لا تعتمد عليه.

---

## 2) شكل البيانات

قائمة:

```json
{
  "thumbnail": "https://example.com/storage/product/uuid.jpg",
  "image": "https://example.com/storage/product/uuid.jpg",
  "images": ["https://example.com/storage/product/uuid.jpg"]
}
```

صفحة المنتج:

```json
{
  "thumbnail": "https://example.com/storage/product/uuid.jpg",
  "image": "https://example.com/storage/product/uuid.jpg",
  "images": [{ "id": null, "path": "https://example.com/storage/product/uuid.jpg" }]
}
```

| الحالة | `thumbnail` | `image` | `images` |
|--------|-------------|---------|----------|
| مصغّرة فقط، بدون معرض | رابطها | نفس الرابط | عنصر واحد = المصغّرة |
| في معرض | رابط المصغّرة | أول صورة معرض | صور المعرض فقط |
| لا مصغّرة ولا معرض | `null` | `null` | `[]` |

عنصر المصغّرة داخل `images` يجي `id: null`. ارسموا `path` ولا تتعاملوا مع `id` كمعرّف ميديا.

---

## 3) السلوك

- بطاقة القائمة: `<img src={product.image} />`. إذا `image` فاضي، البطاقة بلا صورة.
- صفحة المنتج: ارسموا `images[].path` بالترتيب. إذا المعرض فاضي والمصغّرة موجودة، الباك حاططها داخل `images` فيظهر `path`.
- لا تبنوا المعاينة من ملف مرفوع، ولا تضيفوا `/storage` لرابط مطلق.

```text
https://example.com/storage/product/uuid.jpg   ← استخدموه كما هو
/storage/https://example.com/storage/...       ← غلط
```

---

## 4) Checklist

- [ ] قائمة المنتجات تعرض `image` لمنتج بمصغّرة فقط
- [ ] صفحة المنتج تعرض `images[].path`، بما فيه عنصر المصغّرة عندما لا يوجد معرض
- [ ] ما في لصق `/storage` على رابط يبدأ بـ `http`
- [ ] `images[].id === null` لا يُستخدم كمعرّف صورة
