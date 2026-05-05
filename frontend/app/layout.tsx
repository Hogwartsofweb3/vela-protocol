import type { Metadata } from "next";
import { Outfit, Inter, JetBrains_Mono } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";

// Load wallet providers client-side only — prevents SSR crashes on Vercel
// during static page generation (wallet adapters access browser APIs at init time)
const Providers = dynamic(
  () => import("./components/providers").then((m) => m.Providers),
  { ssr: false }
);

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vela Protocol | High-Yield RWAs",
  description:
    "One token. Every RWA yield on Solana, auto-compounded. Access institutional grade yield natively on-chain.",
  openGraph: {
    title: "Vela Protocol",
    description: "One token. Every RWA yield on Solana, auto-compounded.",
    url: "https://velaprotocol.xyz",
    siteName: "Vela Protocol",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vela Protocol",
    description: "One token. Every RWA yield on Solana, auto-compounded.",
    creator: "@velaprotocol",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
