import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join the Map | Findtruckdriver",
  description: "Create your free account and join the live trucking network. Pick your status, customize your avatar, and start helping fellow drivers in under 2 minutes.",
  openGraph: {
    title: "Join Findtruckdriver - Get on the Map",
    description: "Join thousands of drivers sharing real-time status updates. Free account, anonymous handle, instant access to the live trucking network.",
    url: "https://findtruckdriver.com/join",
  },
  twitter: {
    title: "Join Findtruckdriver",
    description: "Create your free account. Pick your status. Get on the map. Help fellow truckers.",
  },
};

export default function JoinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
