# Portfolio Rebuild - Business Requirements Document (BRD)

## Executive Summary

Replace the current unified Portfolio page with six dedicated service pages. Each service gets its own route, a smaller hero with scroll-based blue overlay, and a conversion-focused layout with description + vertical card grid. The header Portfolio link becomes a dropdown; the footer gains a Portfolio column listing all services.

---

## Design Benchmark: Quartzo Capital Real Estate

**Reference:** [Quartzo Capital - Real Estate](https://www.quartzocapital.com.br/real-estate)

The Quartzo Real Estate page is the official UX and structural benchmark for Vanilla Capital service pages. Its format validates and refines the scope:

| Quartzo Section | Vanilla Equivalent |
|-----------------|-------------------|
| **Hero/Banner** | Hero with service image, blue filter (#1A2433), service name as title |
| **Intro heading** (e.g. "Conheça a área de Real Estate da Quartzo Capital") | Description title |
| **Intro paragraphs** (2+ paragraphs) | Long-form description |
| **Card grid title** ("Por que investir em imobiliários") | Per-service card grid title |
| **4 vertical cards** (icon/title/description) | 4 vertical cards per service |

**Key takeaways from Quartzo:**
- Hero is compact (not full-viewport); title centered/left-aligned over image
- Description section uses a clear heading followed by 2 paragraphs
- Card grid uses simple vertical cards: icon/visual → title → description
- Professional, institutional tone; conversion through clarity and trust
- Breadcrumb: Home > Produtos e Serviços > Real Estate (consider for Vanilla: Home > Portfólio > [Service])

---

## Current State

| Component | Current Implementation |
|-----------|------------------------|
| **Portfolio** | Single page at `/[locale]/portfolio` with 6 service cards in a grid |
| **Header** | Direct link to `/portfolio` (no dropdown) |
| **Footer** | 4-column grid: Company (col-span-2), Quick Links, Contact |
| **Services** | Home carousel links to `/portfolio` only |
| **Data** | `lib/servicesData.ts` - 6 services: assets, retirement, patrimonial, auction, aiSolution, consulting |

---

## 1. Routing & Navigation

### 1.1 New Route Structure

| Route | Service |
|-------|---------|
| `/[locale]/portfolio/asset-allocation` | Asset Allocation |
| `/[locale]/portfolio/retirement-planning` | Retirement Planning |
| `/[locale]/portfolio/wealth-protection` | Wealth Protection |
| `/[locale]/portfolio/real-estate-auction` | Real Estate Auction |
| `/[locale]/portfolio/ai-solutions` | AI Solutions for Business |
| `/[locale]/portfolio/business-advisory` | Business Financial Advisory |

**Remove:** `/[locale]/portfolio` as standalone page (redirect to first service or show landing).

### 1.2 Header - Portfolio Dropdown

- Replace Portfolio `<Link>` with a **dropdown** (similar to SignInDropdown).
- Hover/click: show list of 6 service pages.
- Styling: `bg-[#1A2433]`, `text-secondary-200`, hover `text-accent-300`.
- **File:** `components/Navigation/Header.tsx`

### 1.3 Footer - Three Columns

**New layout:**

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| **Portfolio** | **Quick Links** | **Contact** |
| All 6 service page links | Home, About, Contact, Compliance | Phone, email, address, WhatsApp |

Company block (logo, description, CTA) stays as top row or first column.

**File:** `components/Navigation/Footer.tsx`

---

## 2. Service Page Template (Quartzo-aligned)

```
┌─────────────────────────────────────────────────┐
│ HERO (smaller than home, blue overlay 25%→75%)  │
│ Service image + title (AVENIR THIN, off-white)  │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│ DESCRIPTION TITLE (e.g. "Conheça a área...")    │
│ DESCRIPTION (2 paragraphs, long-form)           │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│ CARD GRID TITLE (e.g. "Por que investir...")    │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐            │
│ │ Icon │ │ Icon │ │ Icon │ │ Icon │  Vertical   │
│ │Title │ │Title │ │Title │ │Title │  cards      │
│ │ Desc │ │ Desc │ │ Desc │ │ Desc │             │
│ └──────┘ └──────┘ └──────┘ └──────┘            │
└─────────────────────────────────────────────────┘
```

### 2.1 Hero Section

| Property | Specification |
|----------|---------------|
| **Height** | Smaller than Home (aspect ~21/9 or ~40vh) |
| **Background** | Service image from `public/services images/` |
| **Blue filter** | #1A2433 (primary); opacity 25% → 75% on scroll |
| **Title** | `font-avenir font-thin`, off-white, left-aligned, vertically centered |

### 2.2 Description Section (Quartzo-style)

- **Description title:** Prominent heading
- **Description:** 2 paragraphs minimum, institutional tone
- Max-width container for readability

### 2.3 Card Grid

- **Layout:** `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- **Card:** Vertical (icon on top, title, description). Brand styling: white/cream, rounded, shadow, BrandIcon.
- **File reference:** `public/icons/` (light + dark mode)

---

## 3. Services Content Specification

### 3.1 Asset Allocation

- **Slug:** `asset-allocation`
- **Description Title:** "We help you capture returns in markets we know well."
- **Card Grid Title:** "Por que investir em ativos mobiliários?"
- **Cards:** Vantagem Tributária | Performance e Rentabilidade | Gerenciamento de Risco | Mitigação do conflito de interesses

### 3.2 Retirement Planning

- **Slug:** `retirement-planning`
- **Description Title:** "We preserve the wealth you've worked hard to build."
- **Card Grid Title:** "How to plan my retirement?"
- **Cards:** Diagnóstico e Planejamento de Renda | Planejamento Sucessório | Proteção Patrimonial | Your Time Matters

### 3.3 Wealth Protection

- **Slug:** `wealth-protection`
- **Description Title:** "We protect what matters most."
- **Card Grid Title:** "Who should I look for Wealth Protection?"
- **Cards:** Empresários que buscam Vantagens Tributárias | Proteção contra Riscos Jurídicos | Holding Consolidation | Off-Shore

### 3.4 Real Estate Auction

- **Slug:** `real-estate-auction`
- **Description Title:** "We buy properties below market value."
- **Card Grid Title:** "How to invest in Real Estate Auctions?"
- **Cards:** Identify the Opportunities | Análise Jurídica | Viabilidade Financeira | We go through the complete process

### 3.5 AI Solutions for Business

- **Slug:** `ai-solutions`
- **Description Title:** "We automate your operations and align them with the latest technology."
- **Card Grid Title:** "What can Automation and AI do for my Business?"
- **Cards:** Process Automation | AI Agents | Software House | Sell more using technology

### 3.6 Business Financial Advisory

- **Slug:** `business-advisory`
- **Description Title:** "Strategic guidance for financial and investment decisions."
- **Card Grid Title:** "Some of our experiences:"
- **Cards:** Mergers & Acquisitions | Perito Financeiro em Processo Judicial | Controladoria and Governance | Análise de Viabilidade Econômica

---

## 4. Icon Mapping

Icons: `public/icons/light mode/` and `public/icons/dark mode/`. Use `BrandIcon` with numeric `name` (01–22).

During implementation, visually match BRD descriptions to icon IDs. Current mappings: 01=AI, 08=Assets, 09=Consulting, 13=Patrimonial, 14=Retirement, 22=Auction.

---

## 5. Technical Implementation

### 5.1 Files to Create/Modify

| Action | Path |
|--------|------|
| Create | `app/[locale]/portfolio/[slug]/page.tsx` |
| Create | `app/[locale]/portfolio/[slug]/ServicePageClient.tsx` |
| Create | `components/sections/ServiceHero.tsx` |
| Create | `components/sections/ServiceCardGrid.tsx` |
| Modify | `lib/servicesData.ts` (add slug, card data) |
| Modify | `components/Navigation/Header.tsx` (dropdown) |
| Modify | `components/Navigation/Footer.tsx` (3 columns) |
| Modify | `components/sections/Services.tsx` (link to service pages) |

### 5.2 Translations

Extend `Portfolio` namespace in `messages/pt.json` and `messages/en.json` for each service: `descriptionTitle`, `description`, `cardGridTitle`, `cards.{n}.title`, `cards.{n}.description`.

---

## 6. Open Questions

1. **Icon mapping:** Confirm BRD icon descriptions → icon IDs (01–22).
2. **Footer layout:** Company block above vs. inline with 3 columns.
3. **Portfolio index:** Redirect `/portfolio` or simple landing.
4. **Breadcrumbs:** Add Home > Portfólio > [Service] like Quartzo?
