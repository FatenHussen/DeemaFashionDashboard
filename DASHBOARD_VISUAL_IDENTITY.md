# Dashboard — Deema Fashion Visual Identity

> **For the dashboard team.** Audited from `DeemaDashboard` on **24 Nov 2026**.  
> Source: `src/global.css`, `src/theme/theme-config.ts`, `src/theme/core/palette.ts`, `src/shared/ui/button.tsx`.  
> Storefront / Flutter brands: [`FLUTTER_VISUAL_IDENTITY.md`](./FLUTTER_VISUAL_IDENTITY.md) · [`DASHBOARD_BRAND_IDENTITY.md`](./DASHBOARD_BRAND_IDENTITY.md)  
> Cart / delivery admin: [`DASHBOARD_CART.md`](./DASHBOARD_CART.md)

**Admin product name:** Deema Fashion / ديما فاشن — never TikMart in titles, nav, or login.

Two layers:

1. **Admin chrome** — colors hard-coded in the dashboard app (this file).  
2. **Storefront settings** — colors admins save for web/Flutter via App Settings (section 8).

---

## 1) Brand sheet (same as storefront)

| Role | Hex | Admin use |
|------|-----|-----------|
| **Primary** | `#5A3A2E` | Contained buttons, active tabs, links, focus |
| **Secondary** | `#8B5E4A` | Secondary contained / soft accents |
| **Accent (warm)** | `#D4B39A` | Soft chips, muted labels in dark |
| **Background** | `#EAD8C7` | Neutral / muted wash |
| **Surface** | `#F7F5F2` | Page canvas (light) |
| **Highlight** | `#A9B07A` | `--highlight` token; storefront second color |
| **Text** | `#1F1F1F` | Body on light |

Do **not** ship teal `#00aed1`, orange `#FFA000`, or magenta `#c720a4` / `#ff1493`.

---

## 2) Admin CSS tokens (`global.css`)

RGB channels → Tailwind `rgb(var(--…))`.

### Light (`:root`)

| Token | RGB | Hex |
|-------|-----|-----|
| `--background` | `247 245 242` | `#F7F5F2` |
| `--foreground` | `31 31 31` | `#1F1F1F` |
| `--card` | `255 255 255` | `#FFFFFF` |
| `--border` / `--input` | `212 198 184` | `#D4C6B8` |
| `--muted` | `234 216 199` | `#EAD8C7` |
| `--muted-foreground` | `90 58 46` | `#5A3A2E` |
| `--primary` | `90 58 46` | `#5A3A2E` |
| `--primary-foreground` | `255 255 255` | `#FFFFFF` |
| `--secondary` | `139 94 74` | `#8B5E4A` |
| `--secondary-foreground` | `255 255 255` | `#FFFFFF` |
| `--highlight` | `169 176 122` | `#A9B07A` |
| `--accent-warm` | `212 179 154` | `#D4B39A` |

### Dark (`.dark`)

| Token | RGB | Hex |
|-------|-----|-----|
| `--background` | `26 20 18` | `#1A1412` |
| `--foreground` | `247 245 242` | `#F7F5F2` |
| `--card` | `42 31 28` | `#2A1F1C` |
| `--border` / `--input` | `90 70 60` | `#5A463C` |
| `--muted` | `63 41 31` | `#3F291F` |
| `--muted-foreground` | `212 179 154` | `#D4B39A` |
| `--primary` | `212 179 154` | `#D4B39A` |
| `--primary-foreground` | `42 27 21` | `#2A1B15` |
| `--secondary` | `169 176 122` | `#A9B07A` |
| `--secondary-foreground` | `26 20 18` | `#1A1412` |
| `--highlight` | `169 176 122` | `#A9B07A` |
| `--accent-warm` | `212 179 154` | `#D4B39A` |

### Radius

| Token | Value |
|-------|--------|
| `--radius-sm` | `6px` |
| `--radius-md` | `10px` |
| `--radius-lg` | `14px` |
| `--radius-xl` | `18px` |
| `--radius-2xl` | `24px` |

Buttons / pills in UI: typically `rounded-lg` (~10–14).

### Shadows

| Token | Light |
|-------|--------|
| `--shadow-sm` … `--shadow-xl` | Soft neutral elevation |
| `--shadow-primary-sm` | `0 2px 8px rgba(90,58,46,0.18)` |
| `--shadow-primary-md` | `0 4px 14px rgba(90,58,46,0.22)` |

Dark primary shadows use Accent tan @ ~28–32% alpha.

---

## 3) MUI / theme-config palette

`themeConfig.palette` (Minimal shell):

| Key | main | light | dark | contrastText |
|-----|------|-------|------|--------------|
| **primary** | `#5A3A2E` | `#B08978` | `#3F291F` | `#FFFFFF` |
| **secondary** | `#8B5E4A` | `#C49A86` | `#6A4637` | `#FFFFFF` |
| **success** | `#22C55E` | … | … | white |
| **warning** | `#FFAB00` | … | … | `#1C252E` |
| **error** | `#FF5630` | … | … | white |
| **info** | `#00B8D9` | … | … | white |

Backgrounds (`palette.ts`):

| Mode | default | paper | neutral |
|------|---------|-------|---------|
| Light | `#F7F5F2` | `#FFFFFF` | `#EAD8C7` |
| Dark | `#1A1412` | `#2A1F1C` | `#3F291F` |

Text: light `#1F1F1F` · dark `#F7F5F2`.

---

## 4) Typography (admin)

| Role | Font |
|------|------|
| Primary UI | **Public Sans Variable** |
| Secondary / display | **Barlow** (400–800) |
| Optional packs | DM Sans · Inter · Nunito Sans |

Storefront / Flutter use **Cairo** (+ Cormorant for EN brand). Admin does **not** need Cairo unless building a storefront preview.

---

## 5) Buttons (`shared/ui/button.tsx`)

| Variant | Primary look |
|---------|----------------|
| **contained** | `bg-primary` + white (light) / deep brown on tan (dark); soft shadow |
| **outlined** | Primary border ~70%, hover `primary/10` |
| **text** | Primary text, hover wash |
| **soft** | `primary/10` fill |

Sizes: small `h-8` · medium `h-9` · large `h-10`. Radius: `rounded-lg`. Weight: `font-medium`.

Secondary contained uses `--secondary` (clay / sage in dark).

---

## 6) Layout chrome

- Canvas: `--background` (cream / warm charcoal).
- Cards / tables: `--card` + `--border`.
- Active filter chips / nav: `bg-primary text-primary-foreground`.
- Hover rows: `hover:bg-muted/30` or `hover:bg-primary/5`.
- Mode storage key: `theme-mode` (light / dark / system).

Keep brand browns on **actions and accents**, not full-page solid fills.

---

## 7) What dashboard configures for the storefront

Admins set customer-facing brand via **Settings** → colors (feeds `GET /api/user/settings`).

### Recommended save values

| Field | Hex | Notes |
|-------|-----|--------|
| Light `main_color` | `#5A3A2E` | Primary CTA on web/app |
| Light `second_color` | `#A9B07A` | **Highlight** — contrast CTAs (cart proceed), not clay brown |
| Light `text_color` | `#1F1F1F` | |
| Dark `main_color` | `#D4B39A` | |
| Dark `second_color` | `#A9B07A` | |
| Dark `text_color` | `#F7F5F2` | |

Name: **Deema Fashion** / **ديما فاشن**.  
Logos: `{SITE_URL}/images/shared/logo.png` · `favicon.png` · `logo-footer.png`.  
Contact email: `info@deemafashion.com`.

Full form cheat-sheet: [`DASHBOARD_BRAND_IDENTITY.md`](./DASHBOARD_BRAND_IDENTITY.md).

---

## 8) Labels vs API keys

API keys may still say `tikmart_*`. **UI copy** must say Deema Fashion / المنصة.

| API key | Dashboard label |
|---------|-----------------|
| `tikmart_min_order_amount` | Platform (Deema) minimum order |
| `tikmart_delivery_min_hours` | Platform min delivery hours |
| `tikmart_delivery_max_hours` | Platform max delivery hours |

---

## 9) Checklist

- [x] Login / document title / nav = Deema Fashion
- [x] Admin theme primary `#5A3A2E` (light) / `#D4B39A` (dark)
- [x] No TikMart colors or logos in chrome
- [ ] Storefront settings: light `second_color` = `#A9B07A` (admin-saved via App Settings)
- [x] Delivery settings labels use Deema / platform wording
- [x] Public Sans (+ Barlow) for admin UI

**Dashboard chrome follows this file; customer apps follow storefront settings + Flutter/web identity docs.**
