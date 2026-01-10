import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Findtruckdriver - Connect with Drivers & Facilities",
  description: "Real-time truck driver visibility, facility coordination, and weather alerts. Join the network to see who's rolling, waiting, or parked near you.",
  metadataBase: new URL('https://findtruckdriver.com'),
  applicationName: 'Findtruckdriver',
  keywords: ['truck driver', 'logistics', 'shipping', 'transportation', 'driver map', 'trucking app'],
  authors: [{ name: 'Findtruckdriver Team' }],
  openGraph: {
    title: 'Findtruckdriver - The Live Trucking Network',
    description: 'Real-time visibility for truck drivers and facilities. See live locations, weather alerts, and status updates.',
    url: 'https://findtruckdriver.com',
    siteName: 'Findtruckdriver',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Findtruckdriver',
    description: 'Real-time visibility for truck drivers and facilities.',
    creator: '@findtruckdriver',
  },
};

import { Navbar } from "@/components/layout/Navbar";
import { GlobalMapLayer } from "@/components/map/GlobalMapLayer";

// ... existing imports

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
