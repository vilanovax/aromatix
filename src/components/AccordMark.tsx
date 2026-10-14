import { faNum } from "@/lib/format";
import type { Accord } from "@/lib/types";

export function AccordMark({
  accords,
  labeled = false,
  names = false,
}: {
  accords: Accord[];
  labeled?: boolean;
  names?: boolean;
}) {
  const ranked = [...accords].sort((a, b) => b.strength - a.strength);
  const total = ranked.reduce((sum, accord) => sum + accord.strength, 0) || 1;
  const label = ranked
    .map((accord) => `${accord.name} ${faNum(Math.round((accord.strength / total) * 100))} درصد`)
    .join("، ");
  const topNames = ranked.slice(0, 3).map((accord) => accord.name);

  return (
    <div>
      <div className="flex h-2 gap-1" role="img" aria-label={`نسبت آکوردها: ${label}`}>
        {ranked.map((accord) => (
          <span
            key={accord.name}
            className="h-full min-w-1 rounded-full"
            style={{ width: `${(accord.strength / total) * 100}%`, background: accord.color }}
          />
        ))}
      </div>
      {names && topNames.length > 0 ? (
        <p className="mt-2 text-label leading-5 text-muted-foreground">{topNames.join("، ")}</p>
      ) : null}
      {labeled ? (
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
          {ranked.map((accord) => (
            <li key={accord.name} className="flex items-center gap-2 text-label text-muted-foreground">
              <span className="size-2 rounded-full" style={{ background: accord.color }} />
              <span className="text-foreground">{accord.name}</span>
              <span>{faNum(Math.round((accord.strength / total) * 100))}٪</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
