import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { GlobalMapLayer } from "@/components/map/GlobalMapLayer";

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
    default: "Findtruckdriver - Real-Time Trucking Network",
    template: "%s | Findtruckdriver",
  },
  description: "Real-time truck driver visibility and coordination. See who's rolling, waiting, or parked near you. Truckers helping truckers - anonymous, free, and built by drivers.",
  metadataBase: new URL('https://findtruckdriver.com'),
  applicationName: 'Findtruckdriver',
  keywords: [
    'truck driver',
    'trucking app',
    'truck driver map',
    'trucker app',
    'truck parking',
    'detention time',
    'truck stop',
    'logistics',
    'shipping',
    'transportation',
    'driver network',
    'trucker community',
    'real-time trucking',
    'driver status',
  ],
  authors: [{ name: 'Findtruckdriver Team' }],
  creator: 'Findtruckdriver',
  publisher: 'Findtruckdriver',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: 'transportation',
  openGraph: {
    title: 'See Who\'s Out There With You | Findtruckdriver',
    description: 'You\'re not alone on the road. Real-time visibility for truck drivers - see who\'s rolling, waiting, or parked near you. Truckers helping truckers.',
    url: 'https://findtruckdriver.com',
    siteName: 'Findtruckdriver',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Findtruckdriver - See Who\'s Out There With You',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'See Who\'s Out There With You | Findtruckdriver',
    description: 'You\'re not alone on the road. Real-time visibility for truck drivers - see who\'s rolling, waiting, or parked near you.',
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
  },
};

// JSON-LD Structured Data
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Findtruckdriver',
  description: 'Real-time truck driver visibility and coordination network. See who\'s rolling, waiting, or parked near you.',
  url: 'https://findtruckdriver.com',
  applicationCategory: 'TransportApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  author: {
    '@type': 'Organization',
    name: 'Findtruckdriver',
    url: 'https://findtruckdriver.com',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '100',
  },
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
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-slate-200 bg-slate-950`}
      >
        <Navbar />
        <GlobalMapLayer />
        <div className="relative z-10 w-full h-full min-h-screen pointer-events-none">
          {/* Pages verify their own pointer-events-auto where needed */}
          {children}
        </div>
      </body>
    </html>
  );
}
