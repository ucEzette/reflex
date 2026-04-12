import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";
import { Toaster } from "sonner";
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata();
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#131318" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link crossOrigin="" href="https://fonts.gstatic.com" rel="preconnect" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700;800&family=Inter:wght@400;700&display=swap"
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
      <body className="bg-background text-on-surface font-body overflow-x-hidden">
        <GlobalErrorBoundary>
          <Providers>
            <div className="noise-overlay pointer-events-none fixed inset-0 z-[100] opacity-[0.02] mix-blend-overlay"></div>
            <div className="relative z-10 flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </Providers>
        </GlobalErrorBoundary>
        <Toaster position="bottom-right" theme="dark" />
      </body>
    </html>
  );
}
