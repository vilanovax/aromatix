import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" className={vazir.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
