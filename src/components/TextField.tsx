"use client";

import { useId, useState } from "react";
import { FieldShell } from "@/components/Card";
import { Button } from "@/components/Button";
import { EyeIcon, EyeOffIcon } from "@/components/Icons";
import { toAsciiDigits } from "@/lib/auth/phone";
import { cn } from "@/lib/format";

export function TextField({
  label,
  hint,
  error = false,
  id,
  className,
  type = "text",
  latinDigits = false,
  onChange,
  ...props
}: {
  label: string;
  hint?: string;
  error?: boolean;
  className?: string;
  /** رقم‌های فارسی/عربی را هنگام تایپ به ۰–۹ انگلیسی تبدیل می‌کند. */
  latinDigits?: boolean;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "className">) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const isPassword = type === "password";
  const [revealed, setRevealed] = useState(false);
  const inputType = isPassword ? (revealed ? "text" : "password") : type;

  return (
    <div className={cn("mt-4", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={fieldId} className="text-label text-muted">
          {label}
        </label>
        {hint ? (
          <p id={hintId} className="text-label text-faint">
            {hint}
          </p>
        ) : null}
      </div>
      <FieldShell error={error} className={cn("mt-1.5 ps-3.5", isPassword ? "pe-1" : "pe-3.5")}>
        <input
          id={fieldId}
          type={inputType}
          aria-invalid={error}
          aria-describedby={hintId}
          className="min-h-12 min-w-0 flex-1 bg-transparent text-input outline-none placeholder:text-faint"
          {...props}
          onChange={(event) => {
            if (latinDigits) {
              event.target.value = toAsciiDigits(event.target.value);
            }
            onChange?.(event);
          }}
        />
        {isPassword ? (
          <Button
            type="button"
            variant="quiet"
            shape="pill"
            size="icon"
            aria-label={revealed ? "پنهان کردن رمز" : "نشان دادن رمز"}
            aria-pressed={revealed}
            onClick={() => setRevealed((value) => !value)}
            className="shrink-0 text-muted"
          >
            {revealed ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
          </Button>
        ) : null}
      </FieldShell>
    </div>
  );
}
