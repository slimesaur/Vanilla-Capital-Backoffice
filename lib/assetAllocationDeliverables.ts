/**
 * Background images for the Asset Allocation deliverables carousel.
 * Files live under `public/portfolio/asset-allocation/deliverables/`.
 */

export const DELIVERABLE_SLIDE_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export type DeliverableSlideId = (typeof DELIVERABLE_SLIDE_ORDER)[number];

const DIR = '/portfolio/asset-allocation/deliverables';

/**
 * Primary basenames (no extension) — match files copied from design (English titles).
 * Slug fallbacks support older or alternate naming.
 */
const IMAGE_BASES_BY_SLIDE: Record<DeliverableSlideId, readonly string[]> = {
  1: ['RETURN ON INVESTMENT', 'retorno-sobre-o-investimento'],
  2: ['OVERSEAS DIVERSIFICATION', 'diversificacao-internacional', 'DIVERSIFICAÇÃO INTERNACIONAL'],
  3: ['WEALTH MANAGEMENT', 'gestao-patrimonial', 'GESTÃO PATRIMONIAL'],
  4: ['WEALTH PROTECTION', 'protecao-patrimonial', 'PROTEÇÃO PATRIMONIAL'],
  5: [
    'PORTFOLIO CONSOLIDATION AND TRANSPARENCY',
    'PORTFOLIO CONSOLIDATION & TRANSPARENCY',
    'consolidacao-e-transparencia',
    'CONSOLIDAÇÃO E TRANSPARÊNCIA',
  ],
  6: ['ALTERNATIVE INVESTMENTS', 'investimentos-alternativos'],
  7: ['CONCIERGE', 'concierge'],
  8: ['MESA BANKING', 'mesa-banking'],
  9: ['NETWORKING', 'hub-de-conexoes', 'HUB DE CONEXÕES'],
};

const EXTENSIONS = ['.png', '.webp', '.jpg', '.jpeg'] as const;

function publicPathForFile(filename: string): string {
  return `${DIR}/${encodeURIComponent(filename)}`;
}

/** Ordered list of URL paths to try for this slide (first hit wins). */
export function deliverableImageCandidates(slideId: DeliverableSlideId): string[] {
  const bases = IMAGE_BASES_BY_SLIDE[slideId];
  const out: string[] = [];
  for (const base of bases) {
    for (const ext of EXTENSIONS) {
      out.push(publicPathForFile(`${base}${ext}`));
    }
  }
  return out;
}
