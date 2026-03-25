# Service Card Grid Redesign — Business Requirements Document (BRD)

**Version:** 1.0  
**Status:** Approved for implementation  
**Primary component:** `components/sections/ServiceCardGrid.tsx`  
**Consumers:** All six portfolio service pages via `app/[locale]/portfolio/[slug]/ServicePageClient.tsx`

---

## 1. Executive summary

This document specifies a **visual and typographic refresh** of the portfolio **“why invest / Por que…”** card grid—the four benefit cards that appear below the long-form description on each service page (e.g. Asset Allocation, Retirement Planning).

Today’s grid uses **four heavy navy panels** with cut corners, large icons, and justified body text. That treatment **competes visually** with the **hero** and the **deliverables carousel** (image-led tiles with blue scrim), and it feels more like a dashboard than an institutional narrative.

The redesign moves to a **lighter, editorial** surface: cream or white cards, subtle borders, a **disciplined gold accent**, and **left-aligned** readable body copy. The **information architecture** stays aligned with the existing [Portfolio Rebuild BRD](./BRD_Portfolio_Rebuild.md) and the **Quartzo benchmark** (icon → title → description, four pillars per service).

**Primary UX goals:** scannability, readability in Portuguese and English, and trust through calm, professional presentation—not decorative excess.

---

## 2. Problem statement (current state)

The implementation lives in [`components/sections/ServiceCardGrid.tsx`](../components/sections/ServiceCardGrid.tsx). Observed issues:

| Issue | Detail |
|-------|--------|
| **Visual weight** | Every card uses `bg-primary-600` plus `clip-cut-corners-all`, border, and shadow. Repeated four times, this dominates the middle of the page. |
| **Vertical rhythm** | Large stacked margins (`mb-8` on icon, title, and implied spacing) make cards feel **empty** at some breakpoints relative to content length. |
| **Body typography** | `text-justify` on long Latin text often produces **awkward word spacing** and is generally discouraged for web reading comfort. |
| **Flat hierarchy** | All four cards are **visually equal**. There is no optional focal pillar for the strongest message (unless copy order alone carries that burden). |
| **Relationship to carousel** | The **Portfolio Deliverables Carousel** ([`PortfolioDeliverablesCarousel.tsx`](../components/sections/PortfolioDeliverablesCarousel.tsx)) already uses **strong navy and imagery**. The card grid should **recede** slightly so the page has a clear visual rhythm: hero → narrative → **lighter reasons** → richer deliverables strip. |

The **content model** (four cards, titles, descriptions, icons per `CARD_ICONS` in [`lib/servicesData.ts`](../lib/servicesData.ts)) remains valid. Only **presentation** and **typography rules** change for Phase 1.

---

## 3. Design principles

1. **Light over dark** for this section. Default cards sit on **cream or white** (`secondary-50` / `white`) with a **hairline border** and **minimal shadow** (or none). Avoid full navy fills for the card container.
2. **One accent discipline.** Use **gold** (`accent-400` / `accent-500`) for titles and/or a single structural accent (e.g. left bar or top rule). Body text uses **navy or ink** for readability on light surfaces—not gold body copy at small sizes.
3. **Complement, don’t compete.** This section must read as a **calm bridge** between the white description block and the image-heavy deliverables carousel (where present).
4. **Quartzo-aligned.** Keep a clear **section `h2`**, then scannable pillars. No unnecessary ornament beyond the agreed accent.
5. **Implementation simplicity.** Prefer **Tailwind utilities** already in the design system; **no new dependencies**.

---

## 4. Functional requirements — visual (Phase 1 / MVP)

These requirements are **in scope** for the first implementation pass.

| ID | Requirement | Notes |
|----|-------------|--------|
| **V1** | **Section background** | Retain gentle separation from the description block above, e.g. existing `bg-gradient-to-b from-secondary-50 to-white`, or an equivalent that does not reintroduce a heavy band. |
| **V2** | **Card surface** | **Light** background (`bg-white` and/or `bg-secondary-50`). **1px** border using design tokens such as `border-secondary-200` or `border-primary-200/40`—exact class chosen at build time for contrast on cream. |
| **V3** | **Gold accent** | Apply **one** consistent pattern across all four cards: either **4px left border** in `accent-400` (or `accent-500`), **or** a **short horizontal rule** under the title in gold—not both unless design explicitly wants double accent. |
| **V4** | **Body alignment** | **Remove `text-justify`.** Use **left-aligned** body text. Optional: `text-pretty` where browser support is acceptable for improved wrapping (document in PR if used). |
| **V5** | **Vertical rhythm** | Reduce redundant large margins between icon, title, and body. Target **consistent** internal padding in the `p-6`–`p-8` range (responsive allowed). |
| **V6** | **Icons** | Keep [`BrandIcon`](../components/ui/BrandIcon.tsx) and [`CARD_ICONS`](../lib/servicesData.ts) mapping. **Reduce visual dominance**: smaller size (e.g. 40px vs 48px) and/or ensure **light** variant reads clearly on a **light** card (adjust icon color if current “light” assumes dark card). |
| **V7** | **Titles** | Use **`accent-400` or `accent-500`** for titles, or **`text-ink`** if a more subdued look is chosen—**pick one** per build and apply to all cards. Use **`line-clamp`** only if needed to prevent layout blowouts; document max lines (e.g. 2–3) in implementation notes. |

**Explicitly remove for MVP:** `clip-cut-corners-all` on these cards unless product later requests a subtle corner treatment compatible with light cards (out of MVP scope unless specified).

---

## 5. Functional requirements — layout (Phase 2 / optional backlog)

The following are **documented for future releases** so MVP can ship without scope creep. **Do not block Phase 1** on these.

| ID | Requirement | Notes |
|----|-------------|--------|
| **L1** | **Featured card** | On `lg` breakpoints, the **first** card may span **two columns** (or sit in a full-width row above three compact cards). Content order and copy unchanged. |
| **L2** | **Horizontal rows** | On `lg+`, each pillar may become a **single row**: icon + title + description with **dividers** between rows; **stack vertically** on mobile. |
| **L3** | **Mobile accordion** | Titles always visible; body **expandable**; ideally **one panel open** at a time to shorten scroll. Requires interaction design and extra a11y testing. |

Product / design must **prioritize** Phase 2 items before development.

---

## 6. Responsive behavior

| Breakpoint | Behavior |
|------------|----------|
| **Default (mobile)** | **Single column** (`grid-cols-1`). Full-width cards with comfortable tap targets if any control becomes interactive (Phase 2). |
| **`md`** | **Two columns** (`md:grid-cols-2`), consistent with current grid intent. |
| **`lg`** | **Four columns** (`lg:grid-cols-4`) **unless** Phase 2 featured or horizontal layout overrides the grid definition. |

Gap spacing should remain readable (e.g. `gap-6`–`gap-8`); exact values at implementation discretion within the design system.

---

## 7. Accessibility

- **Contrast:** On light card surfaces, **body text** (typically `text-sm`) must meet **WCAG 2.1 AA** for normal text against the chosen background. **Titles** in gold must also meet contrast rules (large text thresholds apply if title size qualifies).
- **Focus:** Any **interactive** Phase 2 control (accordion trigger) must show a visible **`focus-visible`** ring (e.g. `ring-2 ring-accent-400` with appropriate offset on light background).
- **Headings:** Preserve **`h2`** for the section title and **`h3`** for each card title. Do not skip levels.
- **Color:** Do not rely on color alone for meaning; **icons and titles** carry the primary semantic load.

---

## 8. Content and internationalization

- **MVP:** **No required copy changes.** All strings continue to live under `Portfolio.services.{serviceKey}.cardGridTitle` and `Portfolio.services.{serviceKey}.cards.{1–4}` in [`messages/pt.json`](../messages/pt.json) and [`messages/en.json`](../messages/en.json).
- **Optional later:** Shorten or split card bodies per Marketing / Compliance review; treat as a **separate content ticket** with bilingual updates.

---

## 9. Technical notes (developer handoff)

| Topic | Detail |
|-------|--------|
| **File to modify** | [`components/sections/ServiceCardGrid.tsx`](../components/sections/ServiceCardGrid.tsx) |
| **Import path in app** | `@/landing/components/sections/ServiceCardGrid` (maps to repo root per `tsconfig`) |
| **Props** | Unchanged: `serviceKey`, `cardGridTitle`, `cards[]` with `title` / `description` |
| **Routing / API** | None |
| **Dependencies** | None new |

---

## 10. Acceptance criteria (Phase 1 / MVP)

- [ ] All **six** portfolio slugs render the updated grid with **no horizontal overflow** and no broken layout at `sm`, `md`, and `lg`.
- [ ] Cards are **visibly lighter** than the deliverables carousel section on pages that include it (e.g. Asset Allocation).
- [ ] Body text is **left-aligned** (not justified) in **both** PT and EN.
- [ ] Contrast of title + body on default light theme passes **manual** verification (and Lighthouse where run in CI).
- [ ] **Keyboard:** Tab order remains logical (section → cards; carousel dots unchanged elsewhere).
- [ ] **Icons** remain correct per service via `CARD_ICONS`.

---

## 11. Out of scope

- Changing the **number of cards** (still four per service) or **rewriting** card copy (unless a separate content BRD/ticket).
- Redesigning the **home** [`Services.tsx`](../components/sections/Services.tsx) carousel.
- Replacing **BrandIcon** with a new icon set or custom illustrations.
- **Phase 2** layout variants (featured card, horizontal rows, accordion) until explicitly scheduled.

---

## 12. References

### Internal

- [BRD_Portfolio_Rebuild.md](./BRD_Portfolio_Rebuild.md) — Quartzo benchmark, routing, original card grid intent.
- [`components/sections/ServiceCardGrid.tsx`](../components/sections/ServiceCardGrid.tsx) — current implementation.
- [`components/sections/PortfolioDeliverablesCarousel.tsx`](../components/sections/PortfolioDeliverablesCarousel.tsx) — visual neighbor on Asset Allocation.

### External (guidance)

- [W3C ARIA APG — Carousel pattern](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/) — coexistence with carousels on the same page.
- [web.dev — Carousels](https://web.dev/patterns/web-vitals-patterns/carousels) — performance and animation habits.
- [W3C WAI — Page structure](https://www.w3.org/WAI/tutorials/page-structure/) — headings and regions.

---

## Document history

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-24 | Product / Engineering | Initial BRD from design review and portfolio UX discussion |
