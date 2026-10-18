import type { Metadata } from "next";
import Script from "next/script";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "@/components/providers/QueryProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Personal Portfolio Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden">
      <body className="overflow-x-hidden">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
        >
          {`
            (function() {
              try {
                var theme = localStorage.getItem('theme');
                if (!theme) {
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  theme = prefersDark ? 'dark' : 'light';
                }
                document.documentElement.classList.add(theme);
                var locale = localStorage.getItem('locale');
                if (locale === 'en' || locale === 'id') document.documentElement.lang = locale;
              } catch (e) {}
            })();
          `}
        </Script>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <CurrencyProvider>
            <LanguageProvider>
              <AuthProvider>
                  <QueryProvider>
                    {children}
                    <Toaster />
                  </QueryProvider>
              </AuthProvider>
            </LanguageProvider>
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
