import type { Metadata, Viewport } from 'next'
import { Inter_Tight } from 'next/font/google'
import Providers from './providers'
import './globals.css'

const interTight = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-inter-tight',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'Vanilla Capital',
  description: 'Consultoria de investimentos e serviços financeiros. Proteção patrimonial, investimentos em ativos mobiliários, leilão de imóveis e consultoria empresarial.',
  icons: {
    icon: '/images/VANILLA FAVICON.png',
  },
}

const THEME_BLOCKING_SCRIPT = `
(function(){
  try {
    var t = localStorage.getItem('vanilla-theme');
    if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    if (t === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  } catch(e) {}
})();
`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={interTight.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BLOCKING_SCRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" href={`/hero/HERO001.png?v=${process.env.NEXT_PUBLIC_HERO_VERSION || '4'}`} as="image" fetchPriority="high" />
      </head>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
