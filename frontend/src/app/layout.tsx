import "./globals.css";
import { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { VerletBackground } from "@/components/VerletBackground";
import { Toaster } from "sonner";

import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata();
export const dynamic = "force-dynamic";


export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#800020" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.global = window;
              if (!window.process) {
                window.process = { 
                  env: { NODE_DEBUG: false },
                  version: '',
                  nextTick: (cb) => setTimeout(cb, 0),
                  on: () => {},
                  emit: () => {},
                };
              }
            `,
          }}
        />
      </head>
      <body className="bg-transparent text-slate-900 dark:text-slate-100 font-display selection:bg-primary selection:text-white overflow-x-hidden transition-colors duration-500">
        <Providers>
          <VerletBackground />
          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <ErrorBoundary>
              <main className="flex-1">
                {children}
              </main>
            </ErrorBoundary>
            <Footer />
          </div>
        </Providers>
        <Toaster position="bottom-right" theme="dark" />
      </body>
    </html>
  );
}
