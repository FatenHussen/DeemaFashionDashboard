# Flutter Update Guide — Pages, Sections & Navigation (Aug 2026)

This document is for the **Tikmool Flutter app** team. It summarizes everything shipped in the admin dashboard during **Aug 15–22, 2026** around the **Page Builder**, **category auto-pages**, **section layout/variant split**, **bilingual fields**, and the **storefront navigation menu**.

> **Scope:** Flutter (storefront) only. Admin endpoints are listed only as reference for the response shapes the backend exposes to users.

---

## Table of contents

1. [What changed this week](#1-what-changed-this-week)
2. [User API endpoints](#2-user-api-endpoints)
3. [Bilingual values — critical](#3-bilingual-values--critical)
4. [Dart models](#4-dart-models)
5. [Fetch & parse a CMS page](#5-fetch--parse-a-cms-page)
6. [Render sections on screen](#6-render-sections-on-screen)
7. [Layout + card shape (legacy support)](#7-layout--card-shape-legacy-support)
8. [Section content types & feeds](#8-section-content-types--feeds)
9. [Category auto-pages](#9-category-auto-pages)
10. [Navigation menu (`nav-menu`)](#10-navigation-menu-nav-menu)
11. [See more / action navigation](#11-see-more--action-navigation)
12. [Visibility rules (`show_when`)](#12-visibility-rules-show_when)
13. [Checklist for Flutter devs](#13-checklist-for-flutter-devs)

---

## 1. What changed this week

| Date | Area | Summary for Flutter |
|------|------|---------------------|
| Aug 17 | **Page Builder** | CMS pages are composed of reusable **sections**. Each section has `layout` (slider/list/grid) + `variant` (horizontal/vertical/square card shape), colors, items, optional `see_more` / `action`. |
| Aug 17 | **Category auto-pages** | Every category gets its own CMS page (`is_category_page: true`) seeded with 2 default sections: **subcategories** + **category products**. Open by `page_id` or category slug. |
| Aug 17 | **Layout / variant split** | Old API records used `variant` for section layout. New records send `layout` + `variant`. Flutter **must normalize** (see §7). |
| Aug 19 | **Navigation menu** | New public endpoint `GET /api/user/nav-menu` drives the top bar. Items can point to routes, categories, brands, CMS pages, or external URLs. |
| Aug 19–20 | **Admin preview polish** | Page preview now resolves bilingual `{ ar, en }` names correctly. **Same rule applies in Flutter** — never `toString()` on a Map. |
| Aug 22 | **Translation fix** | Category/subcategory item `name` is `{ ar, en }`, not a plain string. Product items may use string `title`. Always use a translation helper. |

### Backend seeders (ops — not Flutter)

After backend deploy, run once:

```bash
php artisan migrate
php artisan route:clear && php artisan route:cache
php artisan db:seed --class=RolePermissionSeeder
php artisan db:seed --class=CategoryDetailsPageSeeder
php artisan db:seed --class=CategoryPagesBackfillSeeder
php artisan db:seed --class=NavMenuSeeder
```

---

## 2. User API endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/user/pages/{slug}` | Load a CMS page by slug (home, offers, category page slug, …) |
| `GET` | `/api/user/pages/{slug}?{filters}` | Same page with runtime filters (category, brand, shop context) |
| `GET` | `/api/user/nav-menu` | Active navigation bar items, ordered |
| `GET` | `/api/user/categories/{id}` | Category detail (includes `page_id` when a CMS page exists) |

> **Admin preview reference** (same JSON shape, useful for debugging):  
> `GET /api/admin/page-sections/pages/{pageId}/preview`

### Standard response wrapper

```json
{
  "status": true,
  "message": "Success",
  "data": { }
}
```

### Page response shape (`data`)

```json
{
  "page": {
    "id": 18,
    "slug": "category-details",
    "title": "Category Details",
    "filters": {
      "category_id": { "type": "select", "url": "/api/admin/categories" }
    },
    "is_category_page": true,
    "category_id": 5
  },
  "sections": [
    {
      "id": 101,
      "name": { "ar": "الأقسام الفرعية", "en": "Subcategories" },
      "type": "api",
      "position": "before",
      "order": 1,
      "is_default": true,
      "layout": "slider",
      "variant": "square",
      "content_type": "category",
      "background_color": null,
      "background_card_color": null,
      "see_more": { "page_slug": "categories", "params": {} },
      "action": { "page_slug": null },
      "show_when": null,
      "items": [
        {
          "id": 1,
          "name": { "ar": "خضار", "en": "Vegetables" },
          "image_url": "storage/categories/1.jpg",
          "link": "/categories/1"
        }
      ]
    }
  ]
}
```

---

## 3. Bilingual values — critical

Many fields are **either** a plain string **or** `{ "ar": "...", "en": "..." }`:

- `page.title`
- `section.name`
- Category / brand / product `name` inside section items
- Nav menu `title`

### ❌ Wrong (shows `[object Object]` / crashes)

```dart
Text(item['name'].toString()); // NEVER
```

### ✅ Correct — Dart helper

```dart
typedef TranslatedValue = Object?; // String | Map<String, dynamic> | null

String formatTranslated(
  TranslatedValue value, {
  required String locale, // 'ar' or 'en'
  String fallback = '-',
}) {
  if (value == null) return fallback;
  if (value is String) return value.isEmpty ? fallback : value;
  if (value is Map) {
    final ar = value['ar']?.toString();
    final en = value['en']?.toString();
    if (locale.startsWith('ar')) {
      return (ar?.isNotEmpty == true ? ar : en) ?? fallback;
    }
    return (en?.isNotEmpty == true ? en : ar) ?? fallback;
  }
  return fallback;
}

String resolveItemLabel(Map<String, dynamic> item, String locale) {
  return formatTranslated(item['title'], locale: locale, fallback: '') != ''
      ? formatTranslated(item['title'], locale: locale)
      : formatTranslated(item['name'], locale: locale);
}
```

**Rule:** Products often expose a string `title` first; categories expose bilingual `name`. Always try `title` then `name`.

---

## 4. Dart models

```dart
class TranslatedString {
  final String? ar;
  final String? en;

  const TranslatedString({this.ar, this.en});

  factory TranslatedString.fromJson(dynamic json) {
    if (json == null) return const TranslatedString();
    if (json is String) return TranslatedString(en: json, ar: json);
    if (json is Map<String, dynamic>) {
      return TranslatedString(
        ar: json['ar']?.toString(),
        en: json['en']?.toString(),
      );
    }
    return const TranslatedString();
  }

  String label(String locale, {String fallback = '-'}) =>
      formatTranslated({'ar': ar, 'en': en}, locale: locale, fallback: fallback);
}

enum SectionType { api, manual }

enum SectionPosition { before, after }

enum SectionLayout { slider, list, grid }

enum CardShape { horizontal, vertical, square }

class CmsPage {
  final int id;
  final String slug;
  final TranslatedString title;
  final Map<String, dynamic>? filters;
  final bool isCategoryPage;
  final int? categoryId;

  CmsPage({
    required this.id,
    required this.slug,
    required this.title,
    this.filters,
    this.isCategoryPage = false,
    this.categoryId,
  });

  factory CmsPage.fromJson(Map<String, dynamic> json) => CmsPage(
        id: json['id'] as int,
        slug: json['slug']?.toString() ?? '',
        title: TranslatedString.fromJson(json['title']),
        filters: json['filters'] as Map<String, dynamic>?,
        isCategoryPage: json['is_category_page'] == true,
        categoryId: json['category_id'] as int?,
      );
}

class SeeMoreAction {
  final String? pageSlug;
  final dynamic params;

  SeeMoreAction({this.pageSlug, this.params});

  factory SeeMoreAction.fromJson(Map<String, dynamic>? json) {
    if (json == null) return SeeMoreAction();
    return SeeMoreAction(
      pageSlug: json['page_slug']?.toString(),
      params: json['params'],
    );
  }
}

class PageSection {
  final int id;
  final TranslatedString name;
  final SectionType type;
  final SectionPosition position;
  final int order;
  final bool isDefault;
  final SectionLayout layout;
  final CardShape cardShape;
  final String? contentType;
  final String? backgroundColor;
  final String? backgroundCardColor;
  final SeeMoreAction? seeMore;
  final SeeMoreAction? action;
  final Map<String, dynamic>? showWhen;
  final List<Map<String, dynamic>> items;

  PageSection({
    required this.id,
    required this.name,
    required this.type,
    required this.position,
    required this.order,
    required this.layout,
    required this.cardShape,
    required this.items,
    this.isDefault = false,
    this.contentType,
    this.backgroundColor,
    this.backgroundCardColor,
    this.seeMore,
    this.action,
    this.showWhen,
  });

  factory PageSection.fromJson(Map<String, dynamic> json) {
    final normalized = normalizeLayoutAndCardShape(
      layout: json['layout']?.toString(),
      variant: json['variant']?.toString(),
    );

    return PageSection(
      id: json['id'] as int,
      name: TranslatedString.fromJson(json['name']),
      type: json['type'] == 'manual' ? SectionType.manual : SectionType.api,
      position: json['position'] == 'after'
          ? SectionPosition.after
          : SectionPosition.before,
      order: (json['order'] as num?)?.toInt() ?? 0,
      isDefault: json['is_default'] == true,
      layout: normalized.layout,
      cardShape: normalized.cardShape,
      contentType: json['content_type']?.toString(),
      backgroundColor: json['background_color']?.toString(),
      backgroundCardColor: json['background_card_color']?.toString(),
      seeMore: SeeMoreAction.fromJson(json['see_more'] as Map<String, dynamic>?),
      action: SeeMoreAction.fromJson(json['action'] as Map<String, dynamic>?),
      showWhen: json['show_when'] as Map<String, dynamic>?,
      items: (json['items'] as List<dynamic>? ?? [])
          .map((e) => Map<String, dynamic>.from(e as Map))
          .toList(),
    );
  }
}

class CmsPageResponse {
  final CmsPage page;
  final List<PageSection> sections;

  CmsPageResponse({required this.page, required this.sections});

  factory CmsPageResponse.fromJson(Map<String, dynamic> json) {
    final data = json['data'] as Map<String, dynamic>;
    return CmsPageResponse(
      page: CmsPage.fromJson(data['page'] as Map<String, dynamic>),
      sections: (data['sections'] as List<dynamic>? ?? [])
          .map((e) => PageSection.fromJson(e as Map<String, dynamic>))
          .toList()
        ..sort((a, b) {
          final pos = a.position.index.compareTo(b.position.index);
          return pos != 0 ? pos : a.order.compareTo(b.order);
        }),
    );
  }
}
```

---

## 5. Fetch & parse a CMS page

```dart
class PagesApi {
  PagesApi(this._dio);
  final Dio _dio;

  Future<CmsPageResponse> getPageBySlug(
    String slug, {
    Map<String, dynamic>? query,
  }) async {
    final res = await _dio.get('/api/user/pages/$slug', queryParameters: query);
    return CmsPageResponse.fromJson(res.data as Map<String, dynamic>);
  }
}

// Category page — pass category context when the template needs it
final page = await pagesApi.getPageBySlug('category-details', query: {
  'category_id': categoryId,
});
```

**Image URLs:** Items may return relative paths (`storage/...`). Prefix with your `BASE_URL` unless the value already starts with `http`.

---

## 6. Render sections on screen

Suggested widget tree:

```
CmsPageScreen
└── ListView
    └── for each PageSection (sorted by position + order)
        └── SectionHost
            ├── SectionHeader(title, seeMore)
            └── SectionBody(layout, cardShape, items)
                ├── SliderSection   → layout == slider
                ├── ListSection     → layout == list
                └── GridSection     → layout == grid
```

### Section header

```dart
Widget buildSectionHeader(PageSection section, String locale) {
  return Row(
    children: [
      Expanded(
        child: Text(
          section.name.label(locale),
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
        ),
      ),
      if (section.seeMore?.pageSlug != null)
        TextButton(
          onPressed: () => openCmsPage(section.seeMore!.pageSlug!),
          child: Text(locale.startsWith('ar') ? 'عرض الكل' : 'See all'),
        ),
    ],
  );
}
```

### Item card (all layouts)

```dart
Widget buildSectionItemCard(
  Map<String, dynamic> item,
  String locale,
  CardShape shape,
) {
  final label = resolveItemLabel(item, locale);
  final imageUrl = resolveImageUrl(item['image_url'] ?? item['image'] ?? item['icon']);

  return switch (shape) {
    CardShape.horizontal => HorizontalItemCard(label: label, imageUrl: imageUrl),
    CardShape.vertical   => VerticalItemCard(label: label, imageUrl: imageUrl),
    CardShape.square     => SquareItemCard(label: label, imageUrl: imageUrl),
  };
}
```

### Banner / GIF sections

When `content_type == 'banner'` or item `item_type` / `type` is `banner` | `gif`:

- Use wide aspect ratio (`16:6` in admin preview)
- Respect item `link` for tap navigation
- Do not crop GIFs

---

## 7. Layout + card shape (legacy support)

The backend migrated from a single `variant` field to two fields:

| Field | Values | Meaning |
|-------|--------|---------|
| `layout` | `slider`, `list`, `grid` | How the **section** is arranged |
| `variant` | `horizontal`, `vertical`, `square` | **Card** shape inside the section |

### Legacy mapping (must implement)

```dart
class NormalizedLayout {
  final SectionLayout layout;
  final CardShape cardShape;
  const NormalizedLayout(this.layout, this.cardShape);
}

NormalizedLayout normalizeLayoutAndCardShape({
  String? layout,
  String? variant,
}) {
  const layouts = {'slider', 'list', 'grid'};
  const shapes = {'horizontal', 'vertical', 'square'};

  if (layout != null && layouts.contains(layout)) {
    return NormalizedLayout(
      SectionLayout.values.firstWhere((e) => e.name == layout),
      shapes.contains(variant)
          ? CardShape.values.firstWhere((e) => e.name == variant)
          : CardShape.horizontal,
    );
  }

  // Legacy records: variant meant section layout
  switch (variant) {
    case 'horizontal':
      return NormalizedLayout(SectionLayout.slider, CardShape.horizontal);
    case 'vertical':
      return NormalizedLayout(SectionLayout.list, CardShape.horizontal);
    case 'square':
      return NormalizedLayout(SectionLayout.grid, CardShape.square);
    default:
      return NormalizedLayout(SectionLayout.slider, CardShape.horizontal);
  }
}
```

---

## 8. Section content types & feeds

Automatic (`type: api`) sections are filled server-side. Flutter only renders `items[]`.

| `content_type` | Typical use | Notes |
|----------------|-------------|-------|
| `category` | Subcategories strip | Item `name` is `{ar,en}` |
| `product` | Product feeds | Item `title` often a string; may include `price`, `price_formatted` |
| `shop` | Stores | Filtered by `is_restaurant: 0` in admin |
| `restaurant` | Restaurants | Same shop source, `is_restaurant: 1` |
| `brand` | Brands | |
| `recipe` | Recipes | |
| `basket` | Baskets | |
| `banner` | Manual banners | Usually `type: manual`, wide cards |
| `schedule-basket` | Scheduled baskets | Filter: `schedule_days` = 7/15/30 |
| `suggested_products` | Suggested products | No extra filters |
| `suggested_shops` | Suggested shops | |
| `suggested_baskets` | Suggested baskets | |

### Product feed filter types (auto sections)

When admin configures product feeds, `filters.type` may be:

`new`, `trend`, `top_rated`, `offers`, `latest_flash_sale`, `recommended`, `for_you`, `search_based`

### Shop feed filter types

`nearby`, `offers`, `active`, `top_rated`, `free_delivery`

Shop kind filter: `store`, `restaurant`, `service_provider`

---

## 9. Category auto-pages

Every category (root or nested) gets an auto CMS page:

| Property | Value |
|----------|-------|
| `is_category_page` | `true` |
| `category_id` | linked category id |
| Default sections | 1) Subcategories (`content_type: category`) 2) Products (`content_type: product`, full category tree) |
| Title | Follows category name — updates when category is renamed |
| Slug | Backend-generated; do not hardcode |

### Opening a category page in Flutter

```dart
// Option A — from category list/detail (preferred)
if (category.pageId != null) {
  context.push('/cms/page/${category.pageId}');
}

// Option B — by slug from nav or deep link
pagesApi.getPageBySlug(categoryPageSlug, query: {'category_id': category.id});
```

### Default section flags

`is_default: true` means the section was seeded automatically. Flutter treats it like any other section — no special UI required.

---

## 10. Navigation menu (`nav-menu`)

### Endpoint

`GET /api/user/nav-menu` → active items only, sorted by `order`.

### Item types

| `type` | Navigate using | Target field |
|--------|----------------|--------------|
| `route` | Built-in screen | `route_key` |
| `category` | Category / its CMS page | `category_id` |
| `brand` | Brand page | `brand_id` |
| `page` | CMS page | `page_id` / `target.slug` |
| `url` | External browser | `url` (+ `open_in_new_tab`) |

### Route keys (fixed screens)

```dart
enum AppRouteKey {
  home,
  categories,
  brands,
  shops,
  baskets,
  points,
  help,
  subscriptions,
}
```

### Dart model (minimal)

```dart
class NavMenuItem {
  final int id;
  final TranslatedString title;
  final String type; // route | category | brand | page | url
  final String? routeKey;
  final int? categoryId;
  final int? brandId;
  final int? pageId;
  final String? url;
  final String? icon;
  final bool openInNewTab;

  NavMenuItem.fromJson(Map<String, dynamic> json)
      : id = json['id'] as int,
        title = TranslatedString.fromJson(json['title']),
        type = json['type']?.toString() ?? 'route',
        routeKey = json['route_key']?.toString(),
        categoryId = json['category_id'] as int?,
        brandId = json['brand_id'] as int?,
        pageId = json['page_id'] as int?,
        url = json['url']?.toString(),
        icon = json['icon']?.toString(),
        openInNewTab = json['open_in_new_tab'] == true;

  void navigate(BuildContext context, String locale) {
    switch (type) {
      case 'route':
        openRouteKey(context, routeKey ?? 'home');
      case 'category':
        openCategory(context, categoryId!);
      case 'brand':
        openBrand(context, brandId!);
      case 'page':
        openCmsPageById(context, pageId!);
      case 'url':
        launchUrl(url!, newTab: openInNewTab);
    }
  }
}
```

---

## 11. See more / action navigation

```dart
void handleSeeMore(SeeMoreAction? seeMore, Map<String, dynamic>? pageFilters) {
  if (seeMore?.pageSlug == null) return;
  final params = seeMore!.params;
  // Merge page runtime filters (e.g. category_id) with see_more.params
  openCmsPage(seeMore.pageSlug!, query: mergeParams(pageFilters, params));
}
```

`action.page_slug` works the same way for tapping the whole section header/body.

---

## 12. Visibility rules (`show_when`)

Sections may include `show_when: { "category_id": 5 }` so they appear only in matching context.

Flutter should filter **client-side** when the page is loaded with a context the backend did not pre-filter:

```dart
bool sectionIsVisible(PageSection section, Map<String, dynamic> runtimeFilters) {
  final when = section.showWhen;
  if (when == null || when.isEmpty) return true;
  for (final entry in when.entries) {
    if (runtimeFilters[entry.key]?.toString() != entry.value?.toString()) {
      return false;
    }
  }
  return true;
}
```

On category auto-pages, `category_id` is implicit — the backend usually resolves this before responding.

---

## 13. Checklist for Flutter devs

- [ ] Add `formatTranslated()` and **never** call `.toString()` on name/title objects
- [ ] Implement `normalizeLayoutAndCardShape()` for legacy + new API records
- [ ] Build 3 section layouts: `slider`, `list`, `grid`
- [ ] Build 3 card shapes: `horizontal`, `vertical`, `square`
- [ ] Support wide banner/GIF items (`content_type: banner`)
- [ ] Load home + dynamic CMS pages by slug
- [ ] Open category CMS pages via `category.page_id` or slug + `category_id` query
- [ ] Integrate `GET /api/user/nav-menu` in the top bar
- [ ] Handle `see_more` / `action` page navigation
- [ ] Prefix relative `image_url` values with API base URL
- [ ] Sort sections: `before` sections first, then `after`; within each group sort by `order`
- [ ] Apply section `background_color` / `background_card_color` when non-null
- [ ] Test Arabic locale: category names, section titles, nav menu labels

---

## Related admin docs (reference)

- [Page Builder admin guide](./page-builder-admin-guide.md)
- [Section API admin](./section-api-admin.md)
- [Navigation menu admin guide](./nav-menu-admin-guide.md)
- [Frontend changes 2026-06-04](../FRONTEND_CHANGES_2026_06_04.md) (products, shops, prices)

---

*Last updated: 2026-08-22 — reflects Page Builder, category auto-pages, nav menu, and bilingual translation fixes.*
