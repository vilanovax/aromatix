"use client";

import { useEffect, useId, useState } from "react";
import { BookOpen, Search } from "lucide-react";
import { PerfumePhoto } from "@/components/Bottle";
import { Button } from "@/components/ui/button";
import { suggestQueries, type Suggestion } from "@/lib/suggest";

const PLACEHOLDERS = ["مثلاً ساواج", "مثلاً قرار پاییزی، تا ۵ میلیون", "مثلاً چیزی شبیه خمره"];

const GROUP_LABEL: Record<Suggestion["kind"], string> = {
  perfume: "عطرها",
  reference: "خانوادهٔ بو",
  learn: "واژه‌ها",
  search: "جستجو",
};

export function AskComposer({
  value,
  onChange,
  onAsk,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  onAsk: (value: string) => void;
  error: boolean;
}) {
  const fieldId = useId();
  const [placeholder, setPlaceholder] = useState(0);
  const suggestions = suggestQueries(value);
  const groups = groupSuggestions(suggestions);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const timer = window.setInterval(() => {
      setPlaceholder((current) => (current + 1) % PLACEHOLDERS.length);
    }, 3500);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <form
      className="mt-6"
      onSubmit={(event) => {
        event.preventDefault();
        onAsk(value);
      }}
    >
      <label htmlFor={fieldId} className="sr-only">
        اسم عطر یا چیزی که دنبالش هستی
      </label>
      <div
        className={
          error
            ? "flex items-end gap-2 rounded-field border border-destructive bg-field px-2 shadow-field focus-within:border-transparent focus-within:ring-2 focus-within:ring-ring/60"
            : "flex items-end gap-2 rounded-field border border-input bg-field px-2 shadow-field focus-within:border-transparent focus-within:ring-2 focus-within:ring-ring/60"
        }
      >
        <textarea
          id={fieldId}
          value={value}
          rows={1}
          enterKeyHint="search"
          autoComplete="off"
          placeholder={PLACEHOLDERS[placeholder]}
          aria-invalid={error || undefined}
          aria-describedby={error ? "wish-error" : undefined}
          onChange={(event) => {
            onChange(event.target.value);
            const el = event.target;
            el.style.height = "auto";
            el.style.height = `${el.scrollHeight}px`;
          }}
          onFocus={(event) => {
            event.currentTarget.scrollIntoView({ block: "nearest" });
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onAsk(value);
            }
          }}
          className="max-h-24 min-h-12 w-full flex-1 resize-none bg-transparent py-3 text-body text-foreground outline-none placeholder:text-muted-foreground"
        />
        <Button type="submit" size="sm" className="mb-1 min-h-11 shrink-0">
          بپرس
        </Button>
      </div>

      {groups.length > 0 ? (
        <div className="mt-2 overflow-hidden rounded-surface border border-border bg-card" aria-label="پیشنهادها">
          {groups.map((group) => (
            <div key={group.kind} className="border-b border-border px-2 py-2 last:border-b-0">
              <p className="px-2 text-label text-muted-foreground">{GROUP_LABEL[group.kind]}</p>
              <ul>
                {group.items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onAsk(item.query)}
                      className="flex min-h-11 w-full items-center gap-3 rounded-control px-2 py-1 text-start outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      <SuggestionMark item={item} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-body">{item.title}</span>
                        {item.support ? (
                          <span className="mt-1 block text-pretty text-label text-muted-foreground">{item.support}</span>
                        ) : null}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
    </form>
  );
}

function SuggestionMark({ item }: { item: Suggestion }) {
  if (item.kind === "perfume" && item.perfume) {
    return <PerfumePhoto perfume={item.perfume} sizes="thumb" alt="" className="h-12 w-10 shrink-0 rounded-control" />;
  }
  if (item.kind === "learn") {
    return <BookOpen strokeWidth={1.5} className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />;
  }
  return <Search strokeWidth={1.5} className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />;
}

function groupSuggestions(items: Suggestion[]) {
  const order: Suggestion["kind"][] = ["reference", "perfume", "learn", "search"];
  return order
    .map((kind) => ({ kind, items: items.filter((item) => item.kind === kind) }))
    .filter((group) => group.items.length > 0);
}
