import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppNav } from "@/components/layout/app-nav";
import { Logo } from "@/components/layout/logo";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: { default: "Hireboard", template: "%s · Hireboard" },
  description: "A compact applicant tracking system for small recruiting teams.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // Browser extensions (e.g. job-board helpers) inject attributes on <html>
    // before hydration; this only silences attribute mismatches on this element.
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:shadow"
        >
          Skip to content
        </a>
        <ToastProvider>
          <div className="min-h-dvh lg:flex">
            <aside className="hidden w-56 shrink-0 border-r border-line px-3 py-4 lg:block">
              <div className="sticky top-4">
                <div className="px-2.5 pb-5">
                  <Logo />
                </div>
                <AppNav orientation="vertical" />
              </div>
            </aside>

            <header className="sticky top-0 z-30 border-b border-line bg-canvas/95 backdrop-blur lg:hidden">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-2.5">
                <Logo />
                <AppNav orientation="horizontal" />
              </div>
            </header>

            <main id="main" className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
              <div className="mx-auto max-w-6xl">{children}</div>
            </main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
