import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | Findtruckdriver",
  description: "Manage your Findtruckdriver profile. Update your avatar, handle, and view your driving stats.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Your Profile - Findtruckdriver",
    description: "Manage your driver profile and view your stats.",
    url: "https://findtruckdriver.com/profile",
  },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
