import { faNum } from "@/lib/format";
import type { Accord } from "@/lib/types";

export function AccordMark({ accords, labeled = false }: { accords: Accord[]; labeled?: boolean }) {
  const total = accords.reduce((sum, accord) => sum + accord.strength, 0) || 1;
  const label = accords
    .map((accord) => `${accord.name} ${faNum(Math.round((accord.strength / total) * 100))} درصد`)
    .join("، ");

  return (
    <div>
      <div className="flex h-2 gap-0.5" role="img" aria-label={`نسبت آکوردها: ${label}`}>
        {accords.map((accord) => (
          <span
            key={accord.name}
            className="h-full min-w-1 rounded-full"
            style={{ width: `${(accord.strength / total) * 100}%`, background: accord.color }}
          />
        ))}
      </div>
      {labeled ? (
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
          {accords.map((accord) => (
            <li key={accord.name} className="flex items-center gap-1.5 text-[13px] text-[var(--muted)]">
              <span className="size-2 rounded-full" style={{ background: accord.color }} />
              <span className="text-[var(--ink)]">{accord.name}</span>
              <span>{faNum(Math.round((accord.strength / total) * 100))}٪</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
