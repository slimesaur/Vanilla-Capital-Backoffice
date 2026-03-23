import { Suspense } from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import { getCompanySettings } from '@/lib/settings';
import Footer from './Footer';

async function FooterWithSettings() {
  noStore();
  const settings = await getCompanySettings();
  return <Footer settings={settings} />;
}

function FooterSkeleton() {
  return (
    <footer
      className="min-h-[140px] w-full bg-primary-600"
      aria-label="Rodapé"
      aria-busy="true"
    />
  );
}

/** Streams footer after settings; layout no longer blocks main + children on Prisma. */
export default function FooterLoader() {
  return (
    <Suspense fallback={<FooterSkeleton />}>
      <FooterWithSettings />
    </Suspense>
  );
}
