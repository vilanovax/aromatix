import { cn } from "@/lib/format";
import type { Perfume } from "@/lib/types";

export function ScentMark({ perfume, className }: { perfume: Perfume; className?: string }) {
  const total = perfume.accords.reduce((sum, accord) => sum + accord.strength, 0) || 1;
  const last = Math.max(perfume.accords.length - 1, 1);

  return (
    <div className={cn("relative overflow-hidden bg-[#E3E7E5]", className)} aria-hidden="true">
      <svg viewBox="0 0 160 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
        {perfume.accords.map((accord, index) => {
          const share = accord.strength / total;
          const radius = 20 + share * 36;
          const cx = 42 + (index * 76) / last;
          const cy = 50;
          return <circle key={accord.name} cx={cx} cy={cy} r={radius} fill={accord.color} opacity="0.92" />;
        })}
      </svg>
    </div>
  );
}
