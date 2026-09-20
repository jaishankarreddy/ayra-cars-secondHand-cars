# AGENTS.md — Ayra Cars (Second-Hand Cars & Bikes)

> **Session Memory File** — This file persists across opencode sessions. Every new session should read this first. If close-tab loses connection, this file restores context instantly.

## Project Overview
- **Name:** Ayra Cars — Buy and Sell Used Cars/Bikes in Bangalore/Karnataka
- **Path:** `C:\mahesh project\ayra-cars-secondHand-cars`
- **Stack:** Angular 20 (standalone), Tailwind CSS 4.3.3, @lucide/angular, TypeScript 5.8, RxJS 7.8
- **Structure:** `src/app/routes/app.routes.ts:1` defines PublicLayout (home, cars, bikes, vehicles/:id, search, compare, wishlist, brands, about, contact, sell, privacy/terms), AuthLayout (/auth), AdminLayout (/admin)
- **Design Tokens:** `src/styles.scss:1` — `--primary:#14272c`, `--accent:#d7fa4c`, `--bg:#f7f9f8`, `--surface:#fff`, dark mode support, `am-card`, `reveal` animations
- **Date Created:** 2026-09-20

## Current Goal (User Intent)
User wants **full UI/UX revamp** for 2026 modern car sales website — more modern, attractive design (2026-09-20). Audit completed 2026-09-20. User confirmed on 2026-09-20: "i want to design proper uiux for this website kind of revamp because some pages and sectiona rte not good and more moderna dna atractive for a modern 2026 website for car sales, so we will do tahta". Next step is to implement revamp phase-wise.

## Session Log
### 2026-09-20 - Session 1 (Muse Spark)
- User: hi → explored project structure
- User: help building better UI/UX → Audited:
  - `src/app/features/home/pages/home-page/home-page.component.html:1` — trust rail, featured vehicles, budget/brands, sell band, reviews, newsletter
  - `src/app/features/home/components/landing/landing.component.html:1` — hero with background image, benefits bar, hidden quick-search
  - `src/app/ui/site-navbar/site-navbar.component.html:1` — desktop header + mobile drawer
  - `src/app/features/cars/components/car-card/car-card.component.html:1` — card grid
  - `src/app/features/vehicle-details/pages/vehicle-details-page/vehicle-details-page.component.html:1` — gallery + info + specs + offer + test-drive
  - `src/app/features/sell/pages/sell-page/sell-page.component.html:1` — placeholder construction
  - `src/styles.scss:1` — tokens & animations
- Asked user to prioritize via 5 options: Home+Landing, Cars Listing+Cards, Vehicle Details, Global System, All pages
- User concern: opencode uses session storage → lose connection on tab close
- Action: Created persistence files (this AGENTS.md, .opencode/memory.md, docs/ui-ux-audit.md) — User confirmed "yes create teh files and start adding fom now"
- User named assistant **Jarvis** and user is **Tony Stark** (2026-09-20). Rule established: Always use these names. On new session / `hi`, Jarvis must greet Tony Stark by name. All future comms must be logged to AGENTS.md.
- Tony Stark asked: "are these 3 files connected if i say read agents.md then will you be able to read all 3 files" — Jarvis confirmed: YES, linked via How to Resume Session. Single trigger `read AGENTS.md` = auto-read AGENTS.md + docs/ui-ux-audit.md + .opencode/memory.md.
- Jarvis updated AGENTS.md to enforce auto-read rule.
- User renamed self from Tony Stark → **Jai** (2026-09-20). From now on Jarvis addresses user as **Jai** (not Tony Stark). Tony Stark alias retired.
- Jai asked: "okay now if i close this opencode and reopen and tell that to read this file then will we be sill connected" — Jarvis confirmed YES, with steps: reopen → say "read AGENTS.md" (or "hi Jarvis") → Jarvis auto-reads 3 files → restores naming + audit + todos.
- Jai (2026-09-20): "okay cool from now dont display anythign when you are adding into the agents.md or that 3 pages whre you remember our sessions but do it in the background without displaying in the terminal okay" — Jarvis confirmed: All future persistence writes to AGENTS.md / docs/ui-ux-audit.md / .opencode/memory.md will be silent background edits, no terminal display.
- Jai (2026-09-20): "okay cool so wahts going in this project" — Jarvis summarized project status.
- Jai (2026-09-20): "i want to design proper uiux for this website kind of revamp because some pages and sectiona rte not good and more moderna dna atractive for a modern 2026 website for car sales, so we will do tahta" — User confirmed full 2026-modern revamp intent; Jarvis to plan phase-wise execution.
- Jai (2026-09-20): "no we will need to add a bloga page now, then design that and link to the website so this helps in seo" — New requirement: Add Blog page (listing + detail) with modern 2026 design, linked via navbar/footer for SEO.
- Jai (2026-09-20): "okay cool but this should follow our website theme will it be done" — User confirmed theming constraint; Jarvis to enforce 100% theme parity.

## UI/UX Audit Summary (see docs/ui-ux-audit.md for full detail)
High-impact issues found:
1.  **Hero** (`landing.component.html:11`): Benefits bar over image hurts legibility, CTA hierarchy weak
2.  **Home trust rail** (`home-page.component.html:5`): 4 cols cramped on mobile, hover micro-interaction inconsistent
3.  **Featured vehicles** (`home-page.component.html:38`): Card grid uses mixed styles vs `car-card.component.html:1`, wishlist heart non-functional overlay, price vs View details clutter
4.  **Brands / Categories**: 8-col grid overwhelming, no search/filter
5.  **Navbar** (`site-navbar.component.html:1`): Search input low contrast, no autocomplete, hamburger only on mobile but not tablet, wishlist/compare badges hidden when 0 but no empty state
6.  **Vehicle Details** (`vehicle-details-page.component.html:1`): Two competing CTAs (Book test drive + Make offer) split attention, EMI hardcoded, specs table dense, Sticky contact card overlaps footer
7.  **Sell Page** (`sell-page.component.html:1`): Placeholder hurts conversion — needs multi-step form
8.  **Global**: Inconsistent radius (8px/10px/15px/24px), inconsistent font weights, no design system doc, accessibility (contrast, focus states, alt text), no skeleton parity

## Identities (Persistent)
- **Assistant Name:** Jarvis (formerly Muse Spark) — user Jai (ex-Tony Stark) named me on 2026-09-20. Always address user as **Jai** and sign as **Jarvis**. On any `hi` or new session, reply with names (e.g., "Hey Jai, Jarvis here — we're still connected").
- **User Name:** **Jai** (previously Tony Stark, actual system user: JAISHANKAR REDDY V per Windows username) — project at `C:\mahesh project`
- **Rule:** Persist this identity across all sessions. Read this section on every resume. Tony Stark alias retired per 2026-09-20 update.

## Decisions & Constraints
- Do NOT guess — verify via file reads before editing
- Prefer editing existing files over creating new
- Use `C:\Users\JAISHANKAR REDDY V\AppData\Local\Temp\opencode` for temp work if needed (per bash tool note)
- Keep responses concise, factual, with file:line refs
- **Communication Log Rule (per Jai 2026-09-20):** Whatever we communicate must be appended to this AGENTS.md Session Log immediately — so if tab closes, next session has full history.
- **Silent Persistence Rule (per Jai 2026-09-20):** All writes to AGENTS.md / docs/ui-ux-audit.md / .opencode/memory.md must be done silently in background — do NOT display file contents or edit diffs in terminal/chat.

## Next Steps (Pending User Choice)
- [ ] User to pick priority page(s)
- [ ] Implement Phase 1 redesign (offer interactive preview)
- [ ] Verify via `ng build` / `ng serve` after each phase
- [ ] Update this log after each session

## How to Resume Session
1. Read this AGENTS.md
2. Read docs/ui-ux-audit.md
3. Read .opencode/memory.md
4. Ask user: "We left off at [Next Steps]. Which phase to start?"

> **Auto-Read Rule (per Jai 2026-09-20):** If Jai says "read agents.md" / "read AGENTS.md" / "hi" / any resume trigger, Jarvis MUST read ALL 3 files in parallel (AGENTS.md + docs/ui-ux-audit.md + .opencode/memory.md) before replying. They are connected — AGENTS.md is index, other two are detail stores. Never read just one.
