import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "@/app/register/register-form";

export const metadata: Metadata = { title: "ثبت‌نام · آروما" };

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
