# Dashboard — Deema Fashion · Colors, Visual Identity & Logo

> **Purpose:** Configure the admin dashboard and `GET /user/settings` so the website, mobile app, and notifications match the **Deema Fashion** brand.
>
> **Endpoint:** `GET /api/user/settings` (public — no auth required)
>
> **Replace `{SITE_URL}`** with your live store domain, e.g. `https://deema-fashion.com` or your staging URL.

---

## 1) Brand name

| Language | Display name | Usage |
|----------|--------------|--------|
| English  | **Deema Fashion** | Page title, navbar, footer, auth screens, copyright |
| Arabic   | **ديمة فاشن** | Same surfaces in RTL |

**Tagline (reference — web copy, not a settings field today)**

| EN | Everything you love, delivered with a smile. Fresh finds, great deals, and a little joy in every basket. |
| AR | كل ما تحبه، يصلك بابتسامة. عروض رائعة وفرحة صغيرة في كل سلة. |

---

## 2) Logo assets & URLs

Logos are served from the website `public/images/shared/` folder. Use these **full URLs** in the dashboard (emails, push notifications, CMS, app config, etc.).

| Asset | Role | Relative path | Full URL |
|-------|------|---------------|----------|
| **Primary icon** | Navbar, footer lockup, favicon, auth, loader, push notifications | `/images/shared/favicon.png` | `{SITE_URL}/images/shared/favicon.png` |
| **Horizontal logo** | Marketing, wide headers, print | `/images/shared/logo.png` | `{SITE_URL}/images/shared/logo.png` |
| **Footer logo** | Footer / dark backgrounds | `/images/shared/logo-footer.png` | `{SITE_URL}/images/shared/logo-footer.png` |
| **App icon** | PWA, square avatars, small badges | `/images/shared/logo-icon.png` | `{SITE_URL}/images/shared/logo-icon.png` |

### Recommended dashboard values

| Field (suggested) | Value |
|-------------------|--------|
| Site / app name | `Deema Fashion` |
| Site / app name (AR) | `ديمة فاشن` |
| Logo URL (primary) | `{SITE_URL}/images/shared/favicon.png` |
| Logo URL (wide) | `{SITE_URL}/images/shared/logo.png` |
| Favicon URL | `{SITE_URL}/images/shared/favicon.png` |
| Notification icon | `{SITE_URL}/images/shared/favicon.png` |

### Logo usage rules

- **Navbar & footer:** icon (`favicon.png`) + wordmark — do not stretch the icon.
- **Minimum clear space:** at least half the icon height on all sides.
- **Backgrounds:** icon works on white, cream (`#EAD8C7`), surface (`#F7F5F2`), and dark espresso (`#1A1412`). Use `logo-footer.png` on very dark footers if contrast is low.
- **Do not** recolor the logo file; brand chocolate & sage come from the palette below.
- **Format:** PNG with transparency preferred.
- **Butterfly accent:** use highlight sage (`#A9B07A`) for the butterfly mark when rendering vector lockups.

---

## 3) Color palette — dashboard settings

Set these in the dashboard **App Settings → Colors** (mapped to `data.color` and `data.dark_color` in the API).

### Full brand system (design reference)

| Role | Hex | Name | Usage |
|------|-----|------|--------|
| Primary | `#5A3A2E` | Chocolate brown | Brand, headers, primary buttons, logo |
| Secondary | `#8B5E4A` | Terracotta | Sections, secondary CTAs, highlights |
| Accent | `#D4B39A` | Warm sand | Soft fills, key decorative elements |
| Background | `#EAD8C7` | Soft cream | Marketing page washes (use sparingly in admin) |
| Surface | `#F7F5F2` | Linen | Cards, admin canvas, content areas |
| Highlight | `#A9B07A` | Sage olive | Butterfly, emphasis, variety |
| Text | `#1F1F1F` | Charcoal | Primary text & icons |

### Light mode — `data.color`

| Dashboard field | API key | Hex | Name | Usage |
|-----------------|---------|-----|------|--------|
| Main color | `main_color` | `#5A3A2E` | Chocolate brown | Primary buttons, links, navbar accents, badges |
| Second color | `second_color` | `#8B5E4A` | Terracotta | Gradients, hover, secondary CTAs |
| Text color | `text_color` | `#1F1F1F` | Charcoal | Body text on light backgrounds |

### Dark mode — `data.dark_color`

| Dashboard field | API key | Hex | Name | Usage |
|-----------------|---------|-----|------|--------|
| Main color | `main_color` | `#D4B39A` | Warm sand | Primary actions (readable on dark) |
| Second color | `second_color` | `#A9B07A` | Sage olive | Gradient partner, secondary accents |
| Text color | `text_color` | `#F7F5F2` | Linen | Body text on dark backgrounds |

### Supporting accents (CSS / design reference — optional in dashboard)

| Token | Hex | Usage |
|-------|-----|--------|
| Accent sand | `#D4B39A` | Premium soft fills, dark-mode primary |
| Highlight sage | `#A9B07A` | Butterfly, emphasis chips |
| Primary dark | `#3F291F` | Hover / pressed primary |
| Gradient start | `#5A3A2E` | Brand → cream washes |
| Gradient mid | `#8B5E4A` | Sections |
| Gradient end | `#F7F5F2` | Surface fade |
| Success | `#16a34a` | Order success, stock available |
| Error | `#EF4444` | Errors, destructive actions |

### Light mode backgrounds (reference)

| Surface | Hex |
|---------|-----|
| Page canvas (admin) | `#F7F5F2` |
| Marketing wash | `#EAD8C7` |
| Card | `#FFFFFF` |
| Brand whisper tint | `#EDE0D8` |

### Dark mode backgrounds (reference)

| Surface | Hex |
|---------|-----|
| Page canvas | `#1A1412` |
| Secondary surface | `#2A1F1C` |
| Card | `#2A1F1C` |
| Brand tint | `#3F291F` |

### Button styles (brand board)

| Style | Fill | Text / stroke |
|-------|------|----------------|
| Primary | `#5A3A2E` | White |
| Secondary | `#EAD8C7` | `#5A3A2E` |
| Outline | Transparent | `#5A3A2E` border + text |

---

## 4) API payload example

After dashboard save, `GET /api/user/settings` should return (minimum for brand):

```json
{
  "status": true,
  "message": "OK",
  "data": {
    "color": {
      "main_color": "#5A3A2E",
      "second_color": "#8B5E4A",
      "text_color": "#1F1F1F"
    },
    "dark_color": {
      "main_color": "#D4B39A",
      "second_color": "#A9B07A",
      "text_color": "#F7F5F2"
    }
  }
}
```

---

## 5) Visual identity summary

### Personality

- **Warm, grounded, and fashion-soft** — chocolate + cream with a sage butterfly accent.
- **Primary brown** carries authority; **sage** adds life without competing.
- **Neutral linen/white canvases** in the admin — brand color is for actions and accents, not full-page washes (reserve cream washes for marketing).

### Typography & wordmark

- Wordmark: **Deema Fashion** / **ديمة فاشن**
- Logo mark: DF monogram + sage butterfly
- UI font: system / project default sans-serif — no custom dashboard font field required.

### Buttons & CTAs

- Primary: `main_color` background, white text
- Hover: darker chocolate (`#3F291F` light / slightly deeper sand on dark)
- Secondary: soft cream fill or terracotta / sage accent

### What to avoid

| Don't use | Reason |
|-----------|--------|
| Magenta `#C720A4` / pink `#FF1493` | Previous Deema palette — retired |
| Orange `#FF6B00` / cyan defaults | Old TickMart palette — conflicts with Deema |
| Full cream page backgrounds in admin | Reduces density/readability; use linen `#F7F5F2` |
| Random third brand color | Breaks chocolate → terracotta → sage system |

---

## 6) Web implementation note

The website may still force `main_color` / `second_color` from static brand tokens until settings are updated. Once the values above are saved in production:

1. Confirm `GET /user/settings` returns the Deema earth hex values.
2. Remove or relax any frontend override if desired.

Dashboard theme sources of truth:

- `src/theme/theme-config.ts` — MUI-style primary/secondary scales
- `src/global.css` — Tailwind CSS variables (`--primary`, `--secondary`, `--highlight`, …)

---

## 7) Quick copy-paste — dashboard form

```
Brand name (EN):     Deema Fashion
Brand name (AR):     ديمة فاشن

Logo URL:            {SITE_URL}/images/shared/favicon.png
Wide logo URL:       {SITE_URL}/images/shared/logo.png
Favicon URL:         {SITE_URL}/images/shared/favicon.png

Light main_color:    #5A3A2E
Light second_color:  #8B5E4A
Light text_color:    #1F1F1F

Dark main_color:     #D4B39A
Dark second_color:   #A9B07A
Dark text_color:     #F7F5F2
```

---

## 8) مرجع سريع — الداشبورد (عربي)

| الحقل | القيمة |
|-------|--------|
| اسم المتجر (EN) | Deema Fashion |
| اسم المتجر (AR) | ديمة فاشن |
| رابط الشعار | `{SITE_URL}/images/shared/favicon.png` |
| اللون الرئيسي (فاتح) | `#5A3A2E` |
| اللون الثانوي (فاتح) | `#8B5E4A` |
| لون النص (فاتح) | `#1F1F1F` |
| اللون الرئيسي (داكن) | `#D4B39A` |
| اللون الثانوي (داكن) | `#A9B07A` |
| لون النص (داكن) | `#F7F5F2` |

**ملاحظة:** لا تستخدم ألوان TickMart البرتقالية أو الهوية الوردية القديمة — الهوية الحالية **Deema Fashion** بالبني الشوكولاتي والكريمي مع لمسة الزيتوني.

---

*Last updated: November 2026 · Source: Deema Fashion visual identity boards + dashboard theme (`theme-config.ts`, `global.css`)*
