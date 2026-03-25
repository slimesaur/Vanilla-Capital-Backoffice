# Deliverables carousel images

PNG files in this folder match the **English asset names** from design (e.g. `RETURN ON INVESTMENT.png`). The app tries each basename below with extensions `.png`, `.webp`, `.jpg`, `.jpeg`, then slug fallbacks (see `lib/assetAllocationDeliverables.ts`).

| Slide | Primary filename (before extension) |
|------|-------------------------------------|
| 1 | `RETURN ON INVESTMENT` |
| 2 | `OVERSEAS DIVERSIFICATION` |
| 3 | `WEALTH MANAGEMENT` |
| 4 | `WEALTH PROTECTION` |
| 5 | `PORTFOLIO CONSOLIDATION AND TRANSPARENCY` (preferred; `&` variant also supported) |
| 6 | `ALTERNATIVE INVESTMENTS` |
| 7 | `CONCIERGE` |
| 8 | `MESA BANKING` |
| 9 | `NETWORKING` |

URLs encode spaces and `&` (e.g. `%26`) automatically.

If every candidate 404s, the slide shows a gradient placeholder.

**Production (`next start`):** after adding or replacing images, **restart** the server. If URLs still return 404, run **`npm run build`** once, then start again (some setups only pick up new `public/` assets after a fresh build).
