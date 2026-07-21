# Admin Legal Documents API

توثيق واجهات إدارة المستندات القانونية (`LegalDocument`) للوحة الأدمن.

## المسار الأساسي

- `/api/admin/legal-documents`

## المصادقة

- يتطلب توكن أدمن: `Authorization: Bearer {token}` (Sanctum، حارس `admin`).

## الصلاحيات (Spatie)

المسار يستخدم `crud.permission:legaldocument`:

| الطلب HTTP | الصلاحية المطلوبة |
|-----------|-------------------|
| `GET` | `legaldocument.view` |
| `POST` | `legaldocument.create` |
| `PUT`/`PATCH` | `legaldocument.update` |
| `DELETE` | `legaldocument.delete` |

---

## 1) قائمة المستندات (Index)

- `GET /api/admin/legal-documents`

### معلمات الاستعلام (Query)

موروثة من `BaseCRUDController` + فلتر التحقق:

| المعامل | نوع | ملاحظات |
|--------|-----|---------|
| `search` | string | اختياري؛ بحث في الحقول المعرّفة في الخدمة (`id`, `key`, `title`, `content`) |
| `sort_field` | string | اختياري؛ مسموح: `id`, `key`, `created_at`, `updated_at` |
| `sort_order` | string | اختياري: `asc` أو `desc` (الافتراضي عند عدم التوافق: `asc`) |
| `page` | integer | اختياري |
| `per_page` | integer | اختياري |
| `key` | string | اختياري؛ تطابق تام مع عمود `key` (فلتر) |

مثال:

- `GET /api/admin/legal-documents?search=privacy&sort_field=created_at&sort_order=desc&page=1&per_page=10`

### شكل الاستجابة (List)

`data` يحتوي على `items` و`pagination` عند تفعيل التصفح في الخدمة.

عنصر القائمة (AllResource) تقريبًا:

```json
{
  "status": true,
  "message": "…",
  "data": {
    "items": [
      {
        "id": 1,
        "key": "privacy_policy",
        "title": "…",
        "content": "…",
        "created_at": "2026-02-15 12:00"
      }
    ],
    "pagination": {
      "current_page": 1,
      "last_page": 1,
      "per_page": 10,
      "total": 1
    }
  }
}
```

> **ملاحظة:** في القائمة، `title` و`content` يعكسان نموذج الـ resource كما يُرجعان من Spatie (عرض/ترجمة حسب السياق).

---

## 2) تفاصيل مستند (Show / Details)

- `GET /api/admin/legal-documents/{legal_document}`

`{legal_document}` هو **معرّف السجل** (`id`).

### شكل الاستجابة (OneResource)

```json
{
  "status": true,
  "message": "…",
  "data": {
    "id": 1,
    "key": "privacy_policy",
    "title": {
      "en": "Privacy Policy",
      "ar": "سياسة الخصوصية"
    },
    "content": {
      "en": "…",
      "ar": "…"
    },
    "created_at": "2026-02-15 12:00",
    "updated_at": "2026-02-15 12:30"
  }
}
```

---

## 3) إنشاء مستند (Store)

- `POST /api/admin/legal-documents`
- `Content-Type: application/json`

### الحقول (JSON)

| الحقل | مطلوب | قواعد التحقق |
|------|-------|--------------|
| `key` | نعم | نص، حتى 255 حرفًا، **فريد** في جدول `legal_documents` |
| `title.en` | نعم | نص |
| `title.ar` | نعم | نص |
| `content.en` | نعم | نص |
| `content.ar` | نعم | نص |

يمكن إرسال نفس البيانات بشكل متداخل يعادل التحقق أعلاه، مثل:

```json
{
  "key": "custom_policy",
  "title": { "en": "Title", "ar": "عنوان" },
  "content": { "en": "English body…", "ar": "النص العربي…" }
}
```

### استجابة النجاح

تُعاد المادة المنشأة بنفس شكل **Show** (OneResource).

---

## 4) تحديث مستند (Update)

- `PUT /api/admin/legal-documents/{legal_document}`
- أو `PATCH /api/admin/legal-documents/{legal_document}`
- `Content-Type: application/json`

### الحقول (كلها اختيارية / جزئية)

| الحقل | قواعد التحقق |
|------|--------------|
| `key` | أحيانًا؛ نص حتى 255؛ **فريد** باستثناء السجل الحالي |
| `title.en` | nullable، نص |
| `title.ar` | nullable، نص |
| `content.en` | nullable، نص |
| `content.ar` | nullable، نص |

### استجابة النجاح

تُعاد المادة المحدثة بنفس شكل **Show** (OneResource).

---

## 5) حذف مستند (Destroy)

- `DELETE /api/admin/legal-documents/{legal_document}`

### استجابة النجاح

`data` عادة يعكس نتيجة الخدمة (مثل `true` حسب `BaseService::delete`).

---

## أخطاء شائعة

- **401**: غير مصدّق كأدمن.
- **403**: لا تملك صلاحية الـ CRUD المناسبة.
- **404**: المستند غير موجود (مثلاً `id` خاطئ).
- **422**: فشل التحقق من الحقول (مثال: `key` مكرر عند الإنشاء/التحديث).

---

## مرجع الكود

- التحكم: `app/Http/Controllers/Admin/LegalDocumentController.php`
- التحقق: `app/Http/Requests/Admin/LegalDocument/*`
- المورد: `app/Http/Resources/LegalDocument/*`
- المسار: `routes/api/admin.php` (`apiResource` + بادئة `api` من تطبيق Laravel)
