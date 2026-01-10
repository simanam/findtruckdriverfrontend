import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Findtruckdriver - the real-time trucking network. Learn about your rights and responsibilities when using our service.",
  openGraph: {
    title: "Terms of Service | Findtruckdriver",
    description: "Terms of Service for Findtruckdriver - the real-time trucking network operated by Logixtecs Solutions LLC.",
    url: "https://findtruckdriver.com/terms",
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
