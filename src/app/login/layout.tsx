import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Findtruckdriver",
  description: "Sign back into your Findtruckdriver account. Access the live trucking map, update your status, and reconnect with the driver network.",
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Login to Findtruckdriver",
    description: "Welcome back, driver. Sign in to access your account and the live trucking network.",
    url: "https://findtruckdriver.com/login",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
