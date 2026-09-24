# Go-Live Audit — Ayra Cars

**Date:** 2026-09-24 (updated; first version 2026-09-23)
**By:** Jarvis (for Jai)
**Scope:** everything still pending before `ayracars.in` goes live, plus login/OTP/notifications roadmap.

---

## 1. Fixed ✅ (code side — done)

| # | Item | Fix |
|---|------|-----|
| 1 | Misleading copy (consignment vs same-day/doorstep promises) | Rewrote 10 spots to consignment framing (`home.data.ts`, hero, why-choose-us, sell band heading, seller testimonial, blog quote). Terms page was already honest — site is now consistent. |
| 2 | Backend ran without `JWT_SECRET` in prod | `server.js` refuses to start in `NODE_ENV=production` without it; admin login reuses the single const. |
| 3 | Angular version mismatch | All `@angular/*` on 20.3.27. |
| 4 | Production build | `ng build --configuration production` passes with zero errors. Left: pre-existing unused-icon warnings (cosmetic) + bundle budget warning (lazy routes keep real load small). |
| 5 | SEO foundations | `public/robots.txt` (blocks `/admin/`, `/auth/`), `public/sitemap.xml` (10 core URLs), `og:image`, JSON-LD `AutoDealer` in `index.html`. Per-route titles/meta/OG via `seo-title.strategy.ts`. |
| 6 | Empty brand dropdowns | New **Brands** admin section (CRUD table, Car/Bike split) feeding all dropdowns + filters; rename cascades, delete blocked while in use; 30-brand seed; case-safe matching everywhere. |
| 7 | Admin sessions | JWT `12h → 30d` + `GET /api/admin/me` validation once per page load; guard async. |
| 8 | Fullscreen gallery overlap | `.fs-overlay` z-90 → z-2000 (above marquee/navbar, below toasts). |
| 9 | Auth abuse protection (2026-09-24) | `express-rate-limit`: 30 req/15 min on login/register/Google/admin-login/password-change; 60 req/15 min on public lead forms + compare. |
| 10 | Noisy backend logs (2026-09-24) | Removed verbose `[Wishlist]` debug logs; central error handler kept. |

---

## 2. Still for Jai to do (manual / server-side) 🔧

- [ ] **Server `.env`** — `MONGODB_URI` (Atlas), strong `JWT_SECRET`, Cloudinary keys, `CLIENT_ORIGIN=https://ayracars.in`, `GOOGLE_CLIENT_ID`, `NODE_ENV=production`.
- [ ] **Seed + rotate admin** — run `node src/seed/seed.js` on prod (seeds admin + 30 brands), log in, **change the `admin9986` password immediately**, create real admin logins via Admins page.
- [ ] **DNS + hosting** — frontend `ayracars.in`, API `api.ayracars.in` (in `environment.prod.ts`), HTTPS both.
- [ ] **Google OAuth console** — add `https://ayracars.in` to Authorized JavaScript origins.
- [ ] **Smoke test on live URLs** — Admins CRUD, Brands, Bulk Upload (manual + Excel + ZIP), sell-request flow, phone + Google login, wishlist, compare (max 4).
- [ ] **Prod data** — opening stock via Bulk Upload; testimonials/FAQs have static fallbacks.
- [ ] Optional — clear ~22 unused Lucide imports (NG8113, cosmetic).

---

## 3. Google login — status & to-do 🟢 (mostly done)

**Done:** GSI One Tap + "Continue with Google" (`login.page`), backend ID-token verify (`POST /api/auth/google`), account linking.
**To-do:** authorized origin in Google console; test on real domain (One Tap is origin-sensitive); prompt for mobile number after first Google sign-in (today `phone: ''`, sellers need a contact number).

---

## 4. OTP phone login — status & recommendation 📲 (not built yet)

**Today:** phone + **password** only. No OTP flow.
**Recommendation for a just-starting Indian marketplace:**

| Provider | Why |
|----------|-----|
| **Firebase Authentication (start here)** | Free 10k verifications/month, no DLT hassle, drop-in web SDK |
| **MSG91 (scale here)** | Indian leader, DLT built-in, OTP + WhatsApp + email one panel, cheap domestic SMS |
| **2Factor.in** | OTP-only API, very cheap, startup-friendly |
| Twilio Verify | Global standard, costlier in India — skip for now |

**Plan:** Firebase Auth phone sign-in → exchange token for Ayra JWT via new `POST /api/auth/firebase` (mirrors Google endpoint). Move to MSG91 at volume. **DLT registration mandatory** for direct-SMS routes. Build ~1–2 days when ready.

---

## 5. Notifications — status & recommendation 🔔

**Today:** in-app admin bell (lead counts), toast system. No buyer-facing notifications.
**Rollout order:** 1) **Email** (Resend to start, SES at scale) — offer/test-drive/sell-request mails. 2) **WhatsApp** (MSG91 / Interakt) — lead alerts, test-drive reminders. 3) **Push** via FCM — later, with repeat buyers. SMS only as fallback.

---

## 6. Other pending / nice-to-have 📋

- Dynamic OG tags + sitemap per vehicle (needs SSR — post-launch SEO upgrade).
- Mobile-number prompt after Google sign-in (§3).
- Consignment payout ledger UI (payouts currently tracked offline).
- EMI calculator on cards (helper kept, UI parked earlier).
