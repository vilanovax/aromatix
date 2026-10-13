import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/app/(site)/login/login-form";

export const metadata: Metadata = { title: "ورود · آروما" };

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
