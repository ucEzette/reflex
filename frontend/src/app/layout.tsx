import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Reflex | Parametric Protection Market on Avalanche",
  description:
    "Reflex is a decentralized protection market built on Avalanche. Instantly insure against flight delays, crop failures, and climate risks with 24/7 oracle monitoring.",
  keywords: ["Reflex", "Protection Market", "Parametric Insurance", "Avalanche", "Blockchain Insurance", "Flight Delay Insurance", "DeFi"],
  authors: [{ name: "Reflex Protocol Team" }],
  openGraph: {
    title: "Reflex | Parametric Protection Market on Avalanche",
    description: "Insure your life's edges. Instant payouts, zero claims adjusters, powered by Chainlink.",
    url: "https://reflex.finance",
    siteName: "Reflex",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Reflex Dashboard Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reflex | Parametric Micro-Insurance on Avalanche",
    description: "The first parametric insurance layer for the internet of value. Powered by Avalanche.",
    images: ["/twitter-card.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link
          crossOrigin=""
          href="https://fonts.gstatic.com"
          rel="preconnect"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/@fontsource/open-sauce-sans@5.0.18/index.min.css"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-50 text-slate-900 dark:bg-background-dark dark:text-slate-100 font-display selection:bg-primary selection:text-white overflow-x-hidden transition-colors duration-500">
        <Providers>
          <Navbar />
          <ErrorBoundary>
            <main className="min-h-screen">
              {children}
            </main>
          </ErrorBoundary>
          <Footer />
        </Providers>
        <Toaster position="bottom-right" theme="dark" />
      </body>
    </html>
  );
}
