import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Findtruckdriver - Built by Drivers, for Drivers",
  description: "Learn about Findtruckdriver - a real-time trucking network built by a former driver. See how we help truckers share parking status, detention times, and spot safety.",
  openGraph: {
    title: "About Findtruckdriver - The Story Behind the App",
    description: "Built by a former driver who knows what it's like to circle a lot at 10pm looking for parking. Learn our story and how we help truckers help each other.",
    url: "https://findtruckdriver.com/about",
  },
  twitter: {
    title: "About Findtruckdriver",
    description: "Built by a former driver. Powered by drivers. Learn the story behind the trucking network.",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
