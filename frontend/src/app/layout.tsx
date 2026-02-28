import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Reflex L1 — Parametric Micro-Insurance",
  description:
    "Reflex L1 is a micro-insurance platform akin to prediction markets where users can browse and instantly insure themselves against real-world risks.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
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
          {children}
        </Providers>
        <Toaster position="bottom-right" theme="dark" />
      </body>
    </html>
  );
}
