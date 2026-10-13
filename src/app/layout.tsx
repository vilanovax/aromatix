import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import { CatalogBridge } from "@/components/CatalogBridge";
import { AccountProvider } from "@/lib/account";
import { loadCatalog } from "@/lib/catalog-server";
import { loadArticles } from "@/lib/knowledge-server";
import { Providers } from "@/lib/store";
import "./globals.css";

const vazir = Vazirmatn({
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-vazir",
});

export const metadata: Metadata = {
  title: "آروما",
  description: "دستیار انتخاب عطر",
  applicationName: "آروما",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "آروما",
    statusBarStyle: "default",
  },
};

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#E9EDEE",
  interactiveWidget: "resizes-content",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [snapshot, articles] = await Promise.all([loadCatalog(), loadArticles()]);
  return (
    <html lang="fa" dir="rtl" className={vazir.variable}>
      <body>
        <CatalogBridge snapshot={snapshot} articles={articles}>
          <Providers>
            <AccountProvider>{children}</AccountProvider>
          </Providers>
        </CatalogBridge>
      </body>
    </html>
  );
}
