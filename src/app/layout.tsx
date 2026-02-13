import type { Metadata, Viewport } from 'next'
import { Inter, DM_Mono } from 'next/font/google'
import './globals.css'
import { ClientLayout } from '@/components/ClientLayout'
import { OrganizationJsonLd, WebsiteJsonLd } from '@/components/seo/JsonLd'
import { Providers } from './providers'

// Force all pages to use dynamic rendering (wagmi/Circle requires browser APIs)
export const dynamicMode = 'force-dynamic'
export const revalidate = 0

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans'
})

const dmMono = DM_Mono({ 
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-mono'
})

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://kindred.app'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Maat | Trust Layer for Everything',
    template: '%s | Maat',
  },
  description: 'The trust layer for everything. Stake tokens to review, predict project rankings, build reputation, and earn rewards through the first decentralized reputation protocol.',
  keywords: [
    'web3 reviews',
    'defi reviews',
    'crypto reputation',
    'blockchain trust',
    'staking platform',
    'prediction market',
    'project rankings',
    'kindred protocol',
    'decentralized reviews',
    'token staking',
  ],
  authors: [{ name: 'Maat Protocol', url: BASE_URL }],
  creator: 'Maat',
  publisher: 'Maat',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
    shortcut: '/logo.jpg',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'Maat',
    title: 'Maat | Trust Layer for Everything',
    description: 'The trust layer for everything. Stake tokens to review, predict project rankings, build reputation, and earn rewards.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Maat - Trust Layer for Everything',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Maat | Trust Layer for Everything',
    description: 'The trust layer for everything. Decentralized reputation protocol.',
    images: ['/og-image.png'],
    creator: '@MaatProtocol',
    site: '@MaatProtocol',
  },
  alternates: {
    canonical: BASE_URL,
  },
  category: 'technology',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0b' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&display=swap" 
          rel="stylesheet" 
        />
        {/* Structured Data for Search Engines */}
        <OrganizationJsonLd />
        <WebsiteJsonLd />
      </head>
      <body className={`${inter.variable} ${dmMono.variable} font-sans`}>
        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  )
}
