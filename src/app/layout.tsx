import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0ea5e9" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "FindTruckDriver — Trucking News, Tips & Driver Lifestyle",
    template: "%s | FindTruckDriver",
  },
  description: "Your source for trucking industry news, driver lifestyle tips, product reviews, regulations, and real-time driver tools. By truckers, for truckers.",
  metadataBase: new URL('https://findtruckdriver.com'),
  applicationName: 'FindTruckDriver',
  keywords: [
    'trucking news',
    'truck driver tips',
    'trucking industry',
    'driver lifestyle',
    'trucking regulations',
    'truck driver blog',
    'CDL tips',
    'trucker community',
    'truck parking',
    'detention time',
    'truck stop reviews',
    'logistics news',
    'transportation industry',
    'trucking products',
    'driver health',
    'ELD compliance',
  ],
  authors: [{ name: 'FindTruckDriver Team' }],
  creator: 'FindTruckDriver',
  publisher: 'FindTruckDriver',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: 'transportation',
  openGraph: {
    title: 'FindTruckDriver — Trucking News, Tips & Driver Lifestyle',
    description: 'Your source for trucking industry news, driver lifestyle tips, product reviews, regulations, and real-time driver tools.',
    url: 'https://findtruckdriver.com',
    siteName: 'FindTruckDriver',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FindTruckDriver — Trucking News & Driver Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FindTruckDriver — Trucking News, Tips & Driver Lifestyle',
    description: 'Your source for trucking industry news, driver lifestyle tips, product reviews, and real-time driver tools.',
    creator: '@findtruckdriver',
    images: ['/og-image.png'],
  },
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
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/icons/safari-pinned-tab.svg', color: '#0ea5e9' },
    ],
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: 'https://findtruckdriver.com',
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
};

// JSON-LD Structured Data
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: 'FindTruckDriver',
      description: 'Trucking industry news, driver lifestyle tips, product reviews, and real-time driver tools.',
      url: 'https://findtruckdriver.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://findtruckdriver.com/search?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      name: 'FindTruckDriver',
      url: 'https://findtruckdriver.com',
      logo: 'https://findtruckdriver.com/icons/FTD_LOGO.png',
      sameAs: [
        'https://twitter.com/findtruckdriver',
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="alternate" type="application/rss+xml" title="FindTruckDriver Blog" href="/feed.xml" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-slate-200 bg-slate-950`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
