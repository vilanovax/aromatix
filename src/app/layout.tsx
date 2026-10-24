import type { Metadata, Viewport } from "next";
import { Providers } from "@/lib/store";
import "./globals.css";
import { vazirmatn } from "./fonts";

export const metadata: Metadata = {
  title: "آروما",
  description: "از یک جملهٔ فارسی تا عطری که در ایران قابل خرید است: سلیقه، مقایسه و قیمت فروشگاه.",
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // The admin theme script writes data-admin-theme before hydration.
    <html lang="fa" dir="rtl" className={vazirmatn.variable} suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
