import { cn } from "@/lib/format";
import type { Perfume } from "@/lib/types";

export function Bottle({ perfume, className }: { perfume: Perfume; className?: string }) {
  const juice = perfume.accords[0]?.color ?? "#C4A574";

  return (
    <div className={cn("overflow-hidden bg-[#E3E7E5]", className)} aria-hidden="true">
      <svg viewBox="0 0 120 160" className="h-full w-full">
        <ellipse cx="60" cy="146" rx="28" ry="4" fill="#1C211F" opacity="0.08" />
        {perfume.bottle === "round" ? (
          <Round juice={juice} cap={perfume.cap} />
        ) : (
          <Flacon
            juice={juice}
            cap={perfume.cap}
            x={perfume.bottle === "slim" ? 46 : 36}
            width={perfume.bottle === "slim" ? 28 : 48}
            radius={perfume.bottle === "slim" ? 12 : 8}
          />
        )}
      </svg>
    </div>
  );
}

function Flacon({
  juice,
  cap,
  x,
  width,
  radius,
}: {
  juice: string;
  cap: string;
  x: number;
  width: number;
  radius: number;
}) {
  const capX = x + width * 0.22;
  const capW = width * 0.56;
  return (
    <g>
      <rect x={capX} y="16" width={capW} height="18" rx="2" fill={cap} />
      <rect x={x + 4} y="34" width={width - 8} height="6" rx="1" fill="#F7F8F7" opacity="0.85" />
      <rect x={x} y="40" width={width} height="96" rx={radius} fill="#F7F8F7" stroke="#D5DBD7" />
      <rect x={x + 3} y="78" width={width - 6} height="54" rx={Math.max(radius - 2, 4)} fill={juice} />
      <rect x={x + 6} y="48" width="5" height="72" rx="2" fill="#FFFFFF" opacity="0.45" />
    </g>
  );
}

function Round({ juice, cap }: { juice: string; cap: string }) {
  return (
    <g>
      <rect x="50" y="14" width="20" height="16" rx="2" fill={cap} />
      <rect x="46" y="30" width="28" height="18" rx="6" fill="#F7F8F7" stroke="#D5DBD7" />
      <circle cx="60" cy="96" r="36" fill="#F7F8F7" stroke="#D5DBD7" />
      <path d="M28 104a36 36 0 0 0 64 0 40 18 0 0 1-64 0z" fill={juice} />
      <rect x="40" y="62" width="5" height="48" rx="2" fill="#FFFFFF" opacity="0.4" />
    </g>
  );
}
