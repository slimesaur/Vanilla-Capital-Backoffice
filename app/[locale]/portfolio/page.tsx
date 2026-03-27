import { redirect } from 'next/navigation';

export default async function PortfolioIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}#asset-allocation`);
}
