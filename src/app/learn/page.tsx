"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Chip } from "@/components/Chip";
import { ForwardIcon } from "@/components/Icons";
import { Shell } from "@/components/Shell";
import { cn, faNum } from "@/lib/format";
import {
  KNOWLEDGE_GROUPS,
  entriesInGroup,
  featuredEntries,
  findKnowledge,
  knowledge,
  type KnowledgeEntry,
  type KnowledgeGroup,
} from "@/lib/knowledge";

export default function LearnIndexPage() {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<KnowledgeGroup | "all">("all");
  const q = query.trim();
  const searching = q.length > 0;
  const filtered = useMemo(() => {
    if (!searching) return [];
    const match = findKnowledge(q);
    if (match) return [match];
    return knowledge.filter((entry) => hay(entry, q));
  }, [q, searching]);
  const featured = featuredEntries();
  const featuredSlugs = new Set(featured.map((entry) => entry.slug));
  const browsing = !searching && group === "all";

  return (
    <Shell back={{ href: "/", label: "شروع" }}>
      <div className="step-in px-5 pt-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <h1 className="text-display font-bold">دانستنی‌ها</h1>
        <p className="mt-2 max-w-[20rem] text-pretty text-body text-muted">
          غلظت، ماندگاری، بچ‌کد — کوتاه، وقتی وسط انتخاب گیر می‌کنی.
        </p>

        <label htmlFor="learn-q" className="sr-only">
          جستجو در دانستنی‌ها
        </label>
        <input
          id="learn-q"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setGroup("all");
          }}
          placeholder="بچ‌کد، وتیور، ماندگاری"
          autoComplete="off"
          enterKeyHint="search"
          className="mt-5 min-h-12 w-full rounded-panel border border-line bg-card px-3.5 text-input outline-none placeholder:text-faint focus:border-ink"
        />

        <ul className="mt-3.5 flex flex-wrap gap-2" aria-label="دسته‌ها">
          <li>
            <Chip
              selected={!searching && group === "all"}
              onClick={() => {
                setGroup("all");
                setQuery("");
              }}
            >
              همه
            </Chip>
          </li>
          {KNOWLEDGE_GROUPS.map((item) => (
            <li key={item.id}>
              <Chip
                selected={!searching && group === item.id}
                onClick={() => {
                  setGroup(item.id);
                  setQuery("");
                }}
              >
                {item.label}
              </Chip>
            </li>
          ))}
        </ul>

        {searching ? (
          <section className="mt-8" aria-labelledby="result-title">
            <h2 id="result-title" className="text-title font-semibold">
              {filtered.length > 0 ? "نتیجه" : "چیزی پیدا نشد"}
            </h2>
            {filtered.length === 0 ? (
              <p className="mt-3 text-pretty text-body text-muted">
                این را هنوز نداریم. اسم را ساده‌تر بنویس، یا از دسته‌ها یکی را باز کن.
              </p>
            ) : (
              <EntryList entries={filtered} className="mt-3" showGroup />
            )}
          </section>
        ) : null}

        {browsing ? (
          <>
            <section className="mt-8" aria-labelledby="start-title">
              <h2 id="start-title" className="text-title font-semibold">
                از اینجا شروع کن
              </h2>
              <ul className="mt-3 flex flex-col gap-2">
                {featured.map((entry) => (
                  <li key={entry.slug}>
                    <Link
                      href={`/learn/${entry.slug}`}
                      className="pressable quiet flex min-h-[4.5rem] items-center gap-3 rounded-panel bg-moss px-4 py-3.5"
                    >
                      <span className="min-w-0 flex-1 text-start">
                        <span className="block text-body font-semibold text-pretty">{entry.title}</span>
                        <span className="mt-1 block text-label text-muted">
                          {faNum(entry.minutes)} دقیقه
                          <span className="mx-1.5 text-faint">·</span>
                          {groupLabel(entry.group)}
                        </span>
                      </span>
                      <ForwardIcon className="size-5 shrink-0 text-muted" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {KNOWLEDGE_GROUPS.map((item) => {
              const rest = entriesInGroup(item.id).filter((entry) => !featuredSlugs.has(entry.slug));
              if (rest.length === 0) return null;
              return (
                <section key={item.id} className="mt-9" aria-labelledby={`group-${item.id}`}>
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 id={`group-${item.id}`} className="text-title font-semibold">
                      {item.label}
                    </h2>
                    <p className="text-label text-muted">{item.support}</p>
                  </div>
                  <EntryList entries={rest} className="mt-3" />
                </section>
              );
            })}
          </>
        ) : null}

        {!searching && group !== "all" ? (
          <section className="mt-8" aria-labelledby="group-title">
            <h2 id="group-title" className="text-title font-semibold">
              {KNOWLEDGE_GROUPS.find((item) => item.id === group)?.label}
            </h2>
            <p className="mt-1 text-label text-muted">
              {KNOWLEDGE_GROUPS.find((item) => item.id === group)?.support}
            </p>
            <EntryList entries={entriesInGroup(group)} className="mt-3" />
          </section>
        ) : null}
      </div>
    </Shell>
  );
}

function EntryList({
  entries,
  className,
  showGroup = false,
}: {
  entries: KnowledgeEntry[];
  className?: string;
  showGroup?: boolean;
}) {
  return (
    <ul className={cn("overflow-hidden rounded-panel border border-line bg-card divide-y divide-line", className)}>
      {entries.map((entry) => (
        <li key={entry.slug}>
          <Link
            href={`/learn/${entry.slug}`}
            className="pressable quiet flex min-h-14 items-center gap-3 px-4 py-3.5"
          >
            <span className="min-w-0 flex-1 text-start">
              <span className="block text-body font-medium text-pretty">{entry.title}</span>
              <span className="mt-0.5 block text-label text-muted">
                {showGroup ? (
                  <>
                    {groupLabel(entry.group)}
                    <span className="mx-1.5 text-faint">·</span>
                  </>
                ) : null}
                {entry.support}
              </span>
            </span>
            <ForwardIcon className="size-5 shrink-0 text-muted" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function groupLabel(id: KnowledgeGroup) {
  return KNOWLEDGE_GROUPS.find((item) => item.id === id)?.label ?? id;
}

function hay(entry: { title: string; support: string; aliases: string[] }, q: string) {
  const blob = `${entry.title} ${entry.support} ${entry.aliases.join(" ")}`.toLowerCase();
  return blob.includes(q.toLowerCase());
}
