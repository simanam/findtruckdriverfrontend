import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feedback & Feature Requests",
  description: "Submit feature requests, report bugs, or share feedback about Findtruckdriver. Help us build a better trucking network.",
  openGraph: {
    title: "Feedback & Feature Requests | Findtruckdriver",
    description: "Have an idea for Findtruckdriver? Submit feature requests or report bugs. We're listening.",
    url: "https://findtruckdriver.com/feedback",
  },
};

export default function FeedbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
