import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountScreen } from "@/app/account/account-screen";

export const metadata: Metadata = { title: "حساب · آروما" };

export default function AccountPage() {
  return (
    <Suspense>
      <AccountScreen />
    </Suspense>
  );
}
