import Link from "next/link";
import { forwardRef } from "react";
import { cn } from "@/lib/format";

const variants = {
  solid: "solid bg-ink text-paper disabled:bg-line disabled:text-muted",
  edge: "edge border border-line bg-card text-ink",
  quiet: "quiet",
} as const;

const shapes = {
  control: "rounded-control",
  panel: "rounded-panel",
  pill: "rounded-full",
} as const;

const sizes = {
  sm: "min-h-9 px-3 text-label leading-none",
  md: "min-h-11 px-4 text-body leading-none font-medium",
  lg: "min-h-12 px-5 text-body leading-none font-semibold",
  xl: "min-h-14 px-4 text-body",
  icon: "grid size-11 shrink-0 place-items-center",
  "icon-panel": "grid size-12 shrink-0 place-items-center",
} as const;

type Tone = keyof typeof variants;
type Shape = keyof typeof shapes;
type Size = keyof typeof sizes;

type Shared = {
  variant?: Tone;
  shape?: Shape;
  size?: Size;
  className?: string;
  children?: React.ReactNode;
};

export function buttonClass({
  variant = "solid",
  shape = "panel",
  size = "lg",
  className,
}: Shared = {}) {
  return cn(
    "pressable inline-flex items-center justify-center",
    variants[variant],
    shapes[shape],
    sizes[size],
    className,
  );
}

export const Button = forwardRef<
  HTMLButtonElement,
  Shared & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className">
>(function Button({ variant, shape, size, className, type = "button", ...props }, ref) {
  return (
    <button ref={ref} type={type} className={buttonClass({ variant, shape, size, className })} {...props} />
  );
});

export function ButtonLink({
  href,
  variant,
  shape,
  size,
  className,
  ...props
}: Shared &
  Omit<React.ComponentProps<typeof Link>, "className" | "href"> & {
    href: string;
  }) {
  return <Link href={href} className={buttonClass({ variant, shape, size, className })} {...props} />;
}
