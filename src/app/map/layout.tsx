import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Map | Findtruckdriver",
  description: "Real-time truck driver map. See who's rolling, waiting, or parked near you. Update your status and help fellow drivers.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Live Trucking Map - Findtruckdriver",
    description: "Real-time visibility for truck drivers. See live locations, status updates, and facility conditions.",
    url: "https://findtruckdriver.com/map",
  },
};

export default function MapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
