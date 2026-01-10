import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Findtruckdriver. Learn how we collect, use, and protect your data. We don't sell your data. Your privacy matters.",
  openGraph: {
    title: "Privacy Policy | Findtruckdriver",
    description: "Learn how Findtruckdriver handles your data. We don't sell your information. Location privacy built in.",
    url: "https://findtruckdriver.com/privacy",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
