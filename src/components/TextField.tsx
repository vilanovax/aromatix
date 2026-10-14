"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
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
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <Label htmlFor={fieldId}>{label}</Label>
        {hint ? (
          <p id={hintId} className="text-label text-muted-foreground">
            {hint}
          </p>
        ) : null}
      </div>
      <Input
        id={fieldId}
        type={inputType}
        aria-invalid={error || undefined}
        aria-describedby={hintId}
        className={isPassword ? undefined : "!h-12"}
        groupClassName={isPassword ? "!h-12 pe-1" : undefined}
        endAddon={
          isPassword ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={revealed ? "پنهان کردن رمز" : "نشان دادن رمز"}
              aria-pressed={revealed}
              onClick={() => setRevealed((value) => !value)}
              className="!size-11"
            >
              {revealed ? <EyeOff strokeWidth={1.5} /> : <Eye strokeWidth={1.5} />}
            </Button>
          ) : undefined
        }
        {...props}
        onChange={(event) => {
          if (latinDigits) {
            event.target.value = toAsciiDigits(event.target.value);
          }
          onChange?.(event);
        }}
      />
    </div>
  );
}
