import { createElement, forwardRef } from "react";
import { cn } from "@/lib/format";

const shadows = {
  none: "",
  card: "shadow-card",
  sheet: "shadow-sheet",
} as const;

type Shadow = keyof typeof shadows;
type CardTag = "div" | "article" | "section" | "li" | "dl";

type CardProps = {
  as?: CardTag;
  shadow?: Shadow;
  bordered?: boolean;
  className?: string;
  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLElement>, "className" | "children">;

export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  { as: Tag = "div", shadow = "none", bordered = true, className, children, ...props },
  ref,
) {
  return createElement(
    Tag,
    {
      ref,
      className: cn(
        "rounded-panel bg-card",
        bordered && "border border-line",
        shadows[shadow],
        className,
      ),
      ...props,
    },
    children,
  );
});

export function fieldShellClass({
  error = false,
  className,
}: {
  error?: boolean;
  className?: string;
} = {}) {
  return cn(
    "flex items-center gap-1 rounded-panel border bg-card p-1 focus-within:border-ink",
    error ? "border-danger" : "border-line",
    className,
  );
}

export function FieldShell({
  as = "div",
  error = false,
  className,
  children,
  ...props
}: {
  as?: "div" | "form";
  error?: boolean;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  return createElement(
    as,
    { className: fieldShellClass({ error, className }), ...props },
    children,
  );
}

export function Note({
  tone = "moss",
  className,
  children,
  ...props
}: {
  tone?: "moss" | "paper";
  className?: string;
  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLParagraphElement>, "className" | "children">) {
  return (
    <p
      className={cn(
        "rounded-control px-3 py-2.5 text-body",
        tone === "moss" ? "bg-moss" : "bg-paper",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}
