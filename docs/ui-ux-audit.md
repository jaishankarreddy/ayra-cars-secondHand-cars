# UI/UX Audit — Ayra Cars

**Date:** 2026-09-20  
**Auditor:** Muse Spark (opencode)  
**Scope:** Public pages (home, landing/hero, navbar, car cards, vehicle details, sell) + global tokens

---

## 1. Global Design System (`src/styles.scss:1`)

**Findings:**
- Tokens are solid: `--primary:#14272c`, `--accent:#d7fa4c`, `--bg:#f7f9f8`. Dark mode defined but not toggled in UI (`src/styles.scss:34`).
- Shadows and animations well defined (`am-card`, `reveal`, `am-shimmer`).
- **Issues:**
  - No typography scale doc — `Poppins` used inline via `font-['Poppins',...]` everywhere (repeated string). Should be CSS variable `--font-heading`.
  - Radius inconsistency: 6px / 8px / 9px / 10px / 12px / 15px / 20px / 24px across pages.
  - No spacing scale adherence — arbitrary `px-[5vw]`, `px-[18px]`, `gap-[60px]` mixed.
  - Focus states missing: buttons/inputs have no `focus-visible` ring → accessibility fail.

**Recommend:**
- Centralize fonts in `styles.scss:59` (`--font-sans`, `--font-heading`), remove inline `font-['Poppins']`.
- Fix radius to 4 values: 8px (chips), 12px (cards), 16px (sections), 999px (pills).
- Add `*:focus-visible { outline: 2px solid var(--accent); outline-offset:2px }`.

---

## 2. Site Navbar (`src/app/ui/site-navbar/site-navbar.component.html:1`, `.scss`, `.ts`)

**Findings:**
- Desktop: Left logo+nav, spacer, search+actions. Mobile drawer with overlay.
- **Issues:**
  - Search (`site-navbar.component.html:25`) — `placeholder="Search vehicle, brand..."` low contrast, no autocomplete dropdown, submit arrow only visible when query non-empty (discoverability 0).
  - Nav links: "Find a Vehicle" vs "Sell Your Vehicle" — inconsistent casing/verb.
  - Wishlist/compare badges (`site-navbar.component.html:44`) use `[hidden]` not `*ngIf` — still in DOM, screen-reader noisy.
  - No active state styling verified on `/brands` etc. — `navActive()` depends on URL but may not highlight on sub-routes (`/vehicles/:id`).
  - Mobile: drawer not trapped focus, no ESC handling observed, `logout` button outside semantic nav.
  - Performance: No debounce on search input (`onSearchInput`).

**Recommend:**
- Add live search dropdown (5 results, vehicle thumbnail, brand, price) with debounce 300ms.
- Fix badge: `@if (count>0) <span>` + `aria-label="3 items in wishlist"`.
- Add `aria-current="page"` for active link.
- Debounce search, add clear (X) button when focused.

---

## 3. Landing / Hero (`src/app/features/home/components/landing/landing.component.html:1`, `.scss`, `.ts`)

**Findings:**
- Hero bg image (`landing.component.html:12`) with inline `--hero-mobile-image`, benefits bar bottom 4 cols, hidden quick-search form (`hidden` attr on section:31).
- **Issues:**
  - Benefits bar (`landing.component.html:22`) has 4 items with white icon circles over image — text is `text-white` → fails contrast on light part of image.
  - Hero CTAs: "Browse vehicles" (lime) vs "Sell with us" (white/transparent) — second CTA has poor contrast (`bg-white/70`).
  - Trust badge (`landing.component.html:14`) `Verified vehicles...` pill uses `bg-white/64` — blends into image.
  - Quick-search (`landing.component.html:31`) hidden entirely — dead code? `searchType`, `searchBrand`, `budgetOptions` logic exists but never shown.
  - No scroll indicator, no social proof near fold.

**Recommend:**
- Add `backdrop-blur` + `bg-[#10262d]/40` under benefits bar for legibility.
- Make primary CTA larger (18px, shadow), secondary as ghost with solid border.
- Either unhide + redesign quick-search as floating glass card (like CARS24) or delete dead code.
- Add `min-h-[620px]` consistency and `background-position: center 30%`.

---

## 4. Home Page (`src/app/features/home/pages/home-page/home-page.component.html:1`)

**Sections audited:**
- Trust rail (5), Featured vehicles (38), Budget section (88), Brands (91), Category (109), Sell band (112), Why band hidden (124), Reviews (157), Newsletter (198)

**Issues:**
- Trust rail (`home-page.component.html:6`) — 4-col grid → 2-col on 800px, but gap 3 on 480px too tight; icon 40px → 34px jump feels jarring.
- Featured vehicles (`home-page.component.html:63`): 
  - Vehicle tile inconsistent with `car-card.component.html:1` — home uses ad-hoc tile vs reusable card. Duplicate styles.
  - Heart icon (`home-page.component.html:67`) absolutely positioned but no click handler — wishlist dead.
  - Price row has `View details` underline + arrow but whole card is `<a>` — nested interactive confusing for a11y.
  - Loading skeleton (`home-page.component.html:48`) uses inline styles, no shimmer.
- Brands (`home-page.component.html:99`) — 8-col grid, 4-col on tablet, no search; logo `h-12` may stretch SVGs.
- Sell band (`home-page.component.html:112`) — `sell-grid` class not in Tailwind, likely custom SCSS; `min-h-[260px]` weak visual weight.
- Reviews (`home-page.component.html:166`) — opening quote `&ldquo;` 35px looks decorative, star rating uses `&#9733;` not SVG, no verified buyer badge.
- Newsletter (`home-page.component.html:198`) — bg image `/above_footer_banner.png` with fallback `#062e35`; buttons 12px `min-h-12` but secondary has `border-2 border-white/80` low contrast on busy image.

**Recommend:**
- Unify featured vehicles to reuse `<app-car-card>` — single source of truth.
- Fix card: remove inner heart button from `<a>` wrapper or make card `<article>` with separate link.
- Brands: add horizontal scroll on mobile + "Search brand" input.
- Reviews: use real SVG stars, add date + verified check.
- Newsletter: add `bg-black/30 overlay` + `backdrop-blur` for text legibility.

---

## 5. Car Card (`src/app/features/cars/components/car-card/car-card.component.html:1`)

**Findings:**
- Well-structured: image 4/3, gradient overlay, featured badge, wishlist/compare round buttons, brand+district, model, price, 3-spec grid, footer, View Details ripple.
- **Issues:**
  - Two floating buttons (wishlist top:3, compare top:12) overlap gradient — touch target 36px ok but stacking dense on mobile.
  - Spec grid (`car-card.component.html:70`) — `border border-border bg-surface-2` for each spec — heavy chrome, competes with card border.
  - Footer `year · owners · mileage` (`car-card.component.html:88`) — using `·` separator, but no ` | ` fallback for wrapping.
  - Tilt directive `appTilt` may cause jank on low-end mobiles.
  - No `out of stock / sold` overlay.
  - No lazy-load placeholder blur.

**Recommend:**
- Combine wishlist/compare into bottom action row or hover-only (desktop) + always visible on mobile.
- Simplify specs: icon + value without bordered mini-cards (like home tile: single row).
- Add `image` fallback + `blur` placeholder via `ngOptimizedImage`.

---

## 6. Vehicle Details (`src/app/features/vehicle-details/pages/vehicle-details-page/vehicle-details-page.component.html:1`)

**Findings:**
- Breadcrumbs (11), hero 2-col (gallery + info panel 24), specs tables (181), offer form (216), test-drive sticky card (264).
- **Issues:**
  - Breadcrumbs chew space (`gap-1.5 text-[13px]`), no schema JSON-LD.
  - Price row (`vehicle-details-page.component.html:40`) shows strikethrough `price*1.12` fake 6% off → trust risk if not real.
  - EMI `₹27,512/month` (`vehicle-details-page.component.html:48`) hardcoded — should compute from price.
  - Details grid (`vip-details-grid`) — 6 items 2-col? Not responsive spec. Icons monochrome `text-[#26343B]` low contrast.
  - Contact row (`vip-contact-row:99`) two buttons: dark "Book test drive" + lime "Make offer" — equal weight → user paradox of choice.
  - "Get in Touch" card (`sc-card-touch:111`) repeats contact — redundant with `vip-contact-row` + sticky footer `app-sticky-contact-card:343`.
  - Spec tables (`spec-tables:181`) 2 columns side-by-side — on <900px likely stacked poorly (needs check in SCSS).
  - Offer form (`vehicle-details-page.component.html:232`) uses manual `(input)` setters — should use Reactive Forms + validation (phone 10-digit, not type text).
  - Test drive card (`td-sticky-card:264`) sticky but no `top` offset for navbar.

**Recommend:**
- Single primary CTA: "Book Test Drive" (primary dark), secondary as link "Make an offer" — or AB test.
- Compute EMI: `price * 0.85*0.09/12` etc., show "EMI calculator" modal.
- Make specs accordion on mobile.
- Form: add Angular `FormControl` + zod, show inline errors, disable until valid.
- Add image gallery counter + fullscreen lightbox.

---

## 7. Sell Page (`src/app/features/sell/pages/sell-page/sell-page.component.html:1`)

**Findings:**
- Centered construction placeholder, icon + h1 + 3 benefits + 2 CTAs.
- **Issues:**
  - Entire revenue stream (seller) is placeholder → major business gap.
  - No form, no lead capture beyond "Contact Us Instead".
  - Benefits icons decorative, no proof (testimonials, stats).

**Recommend:**
- Phase 1: Build 3-step lead form (Vehicle details → Owner/contact → Valuation) even if backend stubbed to `/contact`.
- Store in local state, show instant estimate range.
- Add trust: "500+ vehicles sold via Ayra in BLR" + 4.8★ Google.

---

## 8. Cross-Cutting UX

- **Empty/Loading/Error states:** Home has naive skeleton; details has shimmer; cars/bikes listing? Not audited but likely missing `No vehicles found` with filters reset CTA.
- **Compare/Wishlist:** No max limit UX (compare limit 3-4?).
- **SEO:** Routes have `seo` data good; but no dynamic OG tags per vehicle.
- **Performance:** No `ngOptimizedImage`, `loading=lazy` but no priority for hero.
- **Mobile:** Breakpoints arbitrary (`max-[800px]`, `max-[480px]`, `max-[700px]`) — should standardize 640/768/1024.
- **Accessibility:** No skip-to-content, no `alt` verification, lucide icons without `aria-hidden`.

---

## Priority Matrix (Proposed)

| Priority | Page | Effort | Impact |
|----------|------|--------|--------|
| P0 | Hero + Home trust rail + reuse CarCard | S | High — first impression |
| P0 | Navbar search + mobile drawer | S | High — navigation |
| P1 | Vehicle Details CTA hierarchy + forms | M | High — conversion |
| P1 | Sell placeholder → lead form | M | High — leads |
| P2 | Brands & Category polish | S | Medium |
| P2 | Global tokens + radius + focus states | S | Medium |

---

## Next Actions
- User to pick priority from matrix.
- Implement per phase with `ng build` verification.
- Update AGENTS.md log after each phase.

