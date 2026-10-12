import { cn } from "@/lib/format";

type ChipProps = {
  selected?: boolean;
  muted?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function Chip({
  selected,
  muted = false,
  className,
  children,
  ...props
}: ChipProps & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "pressable inline-flex shrink-0 items-center rounded-full text-label leading-none",
        selected
          ? "min-h-11 border border-ink bg-ink px-3.5 text-paper"
          : muted
            ? "quiet min-h-11 border border-transparent px-3 text-muted"
            : "edge min-h-11 border border-line bg-card px-3.5 text-ink",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function MetaChip({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("rounded-full border border-line bg-card px-2.5 py-1 text-label text-muted", className)}>
      {children}
    </span>
  );
}

export function SoftChip({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={cn("rounded-full bg-moss px-2.5 py-1 text-label", className)}>{children}</span>;
}
