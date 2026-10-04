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
| Arabic   | **ديما فاشن** | Same surfaces in RTL |

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
| Site / app name (AR) | `ديما فاشن` |
| Logo URL (primary) | `{SITE_URL}/images/shared/favicon.png` |
| Logo URL (wide) | `{SITE_URL}/images/shared/logo.png` |
| Favicon URL | `{SITE_URL}/images/shared/favicon.png` |
| Notification icon | `{SITE_URL}/images/shared/favicon.png` |

### Logo usage rules

- **Navbar & footer:** icon (`favicon.png`) + wordmark gradient text — do not stretch the icon.
- **Minimum clear space:** at least half the icon height on all sides.
- **Backgrounds:** icon works on white, light gray, and dark plum (`#1a0f1e`). Use `logo-footer.png` on very dark footers if contrast is low.
- **Do not** recolor the logo file; brand magenta comes from the palette below.
- **Format:** PNG with transparency preferred.

---

## 3) Color palette — dashboard settings

Set these in the dashboard **App Settings → Colors** (mapped to `data.color` and `data.dark_color` in the API).

### Light mode — `data.color`

| Dashboard field | API key | Hex | Name | Usage |
|-----------------|---------|-----|------|--------|
| Main color | `main_color` | `#c720a4` | Brand magenta | Primary buttons, links, navbar accents, badges |
| Second color | `second_color` | `#ff1493` | Deep pink | Gradients, hover, secondary CTAs, highlights |
| Text color | `text_color` | `#2a2a2a` | Charcoal | Body text on light backgrounds |

### Dark mode — `data.dark_color`

| Dashboard field | API key | Hex | Name | Usage |
|-----------------|---------|-----|------|--------|
| Main color | `main_color` | `#ff1493` | Deep pink | Primary actions (inverted vs light) |
| Second color | `second_color` | `#c720a4` | Brand magenta | Gradient partner, secondary accents |
| Text color | `text_color` | `#f5f5f5` | Off-white | Body text on dark backgrounds |

### Supporting accents (CSS / design reference — optional in dashboard)

| Token | Hex | Usage |
|-------|-----|--------|
| Gold accent | `#c5a572` | Premium highlights, trust badges, secondary emphasis |
| Plum accent | `#6b2d5c` | Deep brand shade, dark UI depth |
| Gradient start | `#a020f0` | Wordmark & hero gradients (top) |
| Gradient end | `#ff1493` | Wordmark & hero gradients (bottom) |
| Success | `#16a34a` | Order success, stock available |
| Error | `#EF4444` | Errors, destructive actions |

### Light mode backgrounds (reference)

| Surface | Hex |
|---------|-----|
| Page canvas | `#ffffff` |
| Secondary surface | `#f4f6f9` |
| Card | `#ffffff` |
| Brand whisper tint | `#f5f3f7` |

### Dark mode backgrounds (reference)

| Surface | Hex |
|---------|-----|
| Page canvas | `#1a0f1e` |
| Secondary surface | `#221428` |
| Card | `#1e1224` |
| Brand tint | `#2a1528` |

---

## 4) API payload example

After dashboard save, `GET /api/user/settings` should return (minimum for brand):

```json
{
  "status": true,
  "message": "OK",
  "data": {
    "color": {
      "main_color": "#c720a4",
      "second_color": "#ff1493",
      "text_color": "#2a2a2a"
    },
    "dark_color": {
      "main_color": "#ff1493",
      "second_color": "#c720a4",
      "text_color": "#f5f5f5"
    }
  }
}
```

---

## 5) Visual identity summary

### Personality

- **Fashion-forward**, warm, and approachable — not corporate orange/blue defaults.
- **Magenta + pink** = energy and style; **gold** = premium touches (deals, trust).
- **Neutral gray/white canvases** — brand color is reserved for actions and accents, not full-page washes.

### Typography & wordmark

- Wordmark: **Deema Fashion** / **ديما فاشن**
- Gradient text (marketing): `#a020f0` → `#ff1493` (top to bottom)
- UI font: system / project default sans-serif — no custom dashboard font field required.

### Buttons & CTAs

- Primary: `main_color` background, white text
- Hover: slightly darker magenta (`#a8188a` light / `#c720a4` dark)
- Secondary: outline or `second_color` accent

### What to avoid

| Don't use | Reason |
|-----------|--------|
| Orange `#FF6B00` / cyan defaults | Old TickMart palette — conflicts with Deema |
| Full magenta page backgrounds | Reduces readability; use neutral canvas |
| Random third brand color | Breaks gradient system |

---

## 6) Web implementation note

The website currently **forces** `main_color` and `second_color` from static brand tokens (`src/shared/lib/brandColors.ts`) until the dashboard is updated. Once the values above are saved in production:

1. Confirm `GET /user/settings` returns the Deema hex values.
2. Remove or relax the frontend override in `useThemeFromApi.ts` if desired.

---

## 7) Quick copy-paste — dashboard form

```
Brand name (EN):     Deema Fashion
Brand name (AR):     ديما فاشن

Logo URL:            {SITE_URL}/images/shared/favicon.png
Wide logo URL:       {SITE_URL}/images/shared/logo.png
Favicon URL:         {SITE_URL}/images/shared/favicon.png

Light main_color:    #c720a4
Light second_color:  #ff1493
Light text_color:    #2a2a2a

Dark main_color:     #ff1493
Dark second_color:   #c720a4
Dark text_color:     #f5f5f5
```

---

## 8) مرجع سريع — الداشبورد (عربي)

| الحقل | القيمة |
|-------|--------|
| اسم المتجر (EN) | Deema Fashion |
| اسم المتجر (AR) | ديما فاشن |
| رابط الشعار | `{SITE_URL}/images/shared/favicon.png` |
| اللون الرئيسي (فاتح) | `#c720a4` |
| اللون الثانوي (فاتح) | `#ff1493` |
| لون النص (فاتح) | `#2a2a2a` |
| اللون الرئيسي (داكن) | `#ff1493` |
| اللون الثانوي (داكن) | `#c720a4` |
| لون النص (داكن) | `#f5f5f5` |

**ملاحظة:** لا تستخدم ألوان TickMart البرتقالية القديمة — الهوية الحالية **Deema Fashion** بالمagenta والوردي.

---

*Last updated: August 2026 · Source: Deema Fashion web app (`src/index.css`, `src/shared/lib/brandColors.ts`, `public/images/shared/`)*
