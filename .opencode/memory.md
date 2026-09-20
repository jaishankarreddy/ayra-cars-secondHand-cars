# Memory — Ayra Cars Session Persistence

> This file mirrors AGENTS.md but is read by opencode runtime on startup. Keep in sync.

## Last Updated: 2026-09-20

### Who we are
- Assistant: **Jarvis** (formerly Muse Spark 1.2) — named by Jai (ex-Tony Stark) on 2026-09-20. Always call user Jai, self Jarvis. On hi/new session, greet as "Hey Jai, Jarvis here — we're still connected."
- User: **Jai** (prev Tony Stark, system user JAISHANKAR REDDY V) — building Ayra Cars second-hand marketplace (Angular 20 + Tailwind 4.3)
- Goal: Better UI/UX — user-friendly, modern redesign page-by-page
- Rule: Log every communication to AGENTS.md Session Log per Jai's request.

### What we did today
- Audited 7 critical files (home-page, landing, site-navbar, car-card, vehicle-details, sell-page, styles.scss)
- Identified 8 high-impact UI/UX issues (see docs/ui-ux-audit.md)
- Offered 5 prioritization options; user deferred ("i will let you know wait")
- User flagged session loss on tab close → decided to create persistent memory files
- Tony Stark named assistant Jarvis (2026-09-20) — established persistent naming + comms logging rule
- Jai renamed self from Tony Stark → Jai (2026-09-20) — Jarvis now addresses user as Jai
- Jai (2026-09-20): Silent persistence requested — all future writes to AGENTS.md / docs/ui-ux-audit.md / .opencode/memory.md must be silent background edits, no terminal display.

### Files created today
- `AGENTS.md` — full context
- `.opencode/memory.md` — this file
- `docs/ui-ux-audit.md` — detailed audit

### Active todo
- User confirmed full 2026-modern revamp (2026-09-20) — wants attractive, modern car-sales UI
- Waiting for user to pick priority page for redesign
- Ready to implement: Home+Landing / Cars+Cards / Vehicle Details / Global System / All — phase-wise

### Resume prompt for next session
```
Read AGENTS.md, docs/ui-ux-audit.md and .opencode/memory.md then continue UI/UX redesign from last checkpoint.
```

### Interconnection Rule (added 2026-09-20 per Tony)
- All 3 files are CONNECTED: AGENTS.md (index) + docs/ui-ux-audit.md (detail) + .opencode/memory.md (runtime). If Tony says "read agents.md", Jarvis must read ALL 3 in parallel automatically.

### Do not forget
- Project path: C:\mahesh project\ayra-cars-secondHand-cars
- Always verify via file reads before synthesis
- Cite file:line when referencing code
- Keep comms concise, no fluff/emojis unless asked
