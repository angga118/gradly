import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { GradlyProvider } from "@/lib/store";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://gradly.id"),
  title: {
    default: "Gradly — Foto wisuda hangat, harga bersahabat",
    template: "%s · Gradly",
  },
  description:
    "Gradly memesan jasa foto wisuda dengan program subsidi untuk pemegang SKTM dan penerima KIP-K. Harga hingga 60% lebih murah.",
  keywords: [
    "foto wisuda",
    "jasa fotografi wisuda",
    "subsidi wisuda",
    "SKTM",
    "KIP-K",
    "Gradly",
  ],
  openGraph: {
    title: "Gradly — Foto wisuda hangat, harga bersahabat",
    description:
      "Jasa foto wisuda dengan program subsidi untuk pemegang SKTM dan penerima KIP-K.",
    type: "website",
    locale: "id_ID",
    siteName: "Gradly",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${fraunces.variable} ${dmSans.variable} h-full`}
    >
      <body className="min-h-full">
        <GradlyProvider>{children}</GradlyProvider>
      </body>
    </html>
  );
}
