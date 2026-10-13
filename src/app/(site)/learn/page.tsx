"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FieldShell } from "@/components/Card";
import { Chip } from "@/components/Chip";
import { ForwardIcon } from "@/components/Icons";
import { Shell } from "@/components/Shell";
import { cn, faNum } from "@/lib/format";
import {
  KNOWLEDGE_GROUPS,
  entriesInGroup,
  featuredEntries,
  findKnowledge,
  publishedEntries,
  type KnowledgeEntry,
  type KnowledgeGroup,
} from "@/lib/knowledge";
import { formatShamsi } from "@/lib/jalali";

export default function LearnIndexPage() {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<KnowledgeGroup | "all">("all");
  const q = query.trim();
  const searching = q.length > 0;
  const filtered = useMemo(() => {
    if (!searching) return [];
    const match = findKnowledge(q);
    if (match) return [match];
    return publishedEntries()
      .filter((entry) => hay(entry, q))
      .sort((a, b) => a.sort - b.sort);
  }, [q, searching]);
  const featured = featuredEntries();
  const featuredSlugs = new Set(featured.map((entry) => entry.slug));
  const browsing = !searching && group === "all";
  const activeGroup = group === "all" ? null : KNOWLEDGE_GROUPS.find((item) => item.id === group);

  return (
    <Shell back={{ href: "/", label: "شروع" }}>
      <div className="step-in px-5 pt-6 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <h1 className="text-headline font-bold">دانستنی‌ها</h1>
        <p className="mt-2 max-w-[22rem] text-pretty text-body text-muted">
          غلظت، ماندگاری، بچ‌کد — کوتاه، وقتی وسط انتخاب گیر می‌کنی.
        </p>

        <div className="mt-5">
          <label htmlFor="learn-q" className="sr-only">
            جستجو در دانستنی‌ها
          </label>
          <FieldShell className="ps-3.5 pe-1.5">
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
              className="min-h-12 min-w-0 flex-1 bg-transparent text-input outline-none placeholder:text-faint"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="پاک کردن جستجو"
                className="pressable quiet flex size-10 shrink-0 items-center justify-center rounded-control text-muted outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
              >
                <ClearIcon className="size-4" />
              </button>
            ) : null}
          </FieldShell>
        </div>

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
          <section className="mt-8" aria-labelledby="result-title" aria-live="polite">
            <h2 id="result-title" className="text-title font-semibold">
              {filtered.length > 0
                ? `${faNum(filtered.length)} نتیجه`
                : "چیزی پیدا نشد"}
            </h2>
            {filtered.length === 0 ? (
              <p className="mt-3 max-w-[22rem] text-pretty text-body text-muted">
                این را هنوز نداریم. اسم را ساده‌تر بنویس، یا از دسته‌ها یکی را باز کن.
              </p>
            ) : (
              <EntryList entries={filtered} className="mt-3.5" showGroup />
            )}
          </section>
        ) : null}

        {browsing ? (
          <>
            <section className="mt-8" aria-labelledby="start-title">
              <h2 id="start-title" className="text-title font-semibold">
                از اینجا شروع کن
              </h2>
              <ul className="mt-3.5 flex flex-col gap-2">
                {featured.map((entry) => (
                  <li key={entry.slug}>
                    <Link
                      href={`/learn/${entry.slug}`}
                      className="pressable quiet flex min-h-[4.5rem] items-center gap-3 rounded-panel bg-moss px-4 py-3.5 pe-3 outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
                    >
                      <span className="min-w-0 flex-1 text-start">
                        <span className="block text-pretty text-body font-semibold">{entry.title}</span>
                        <span className="mt-1 block text-label text-muted">
                          {faNum(entry.minutes)} دقیقه
                          <span className="mx-1.5 text-faint">·</span>
                          {formatShamsi(entry.publishedOn)}
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
                  <h2 id={`group-${item.id}`} className="text-title font-semibold">
                    {item.label}
                  </h2>
                  <p className="mt-1 text-label text-muted">{item.support}</p>
                  <EntryList entries={rest} className="mt-3.5" />
                </section>
              );
            })}
          </>
        ) : null}

        {!searching && activeGroup ? (
          <section className="mt-8" aria-labelledby="group-title">
            <h2 id="group-title" className="text-title font-semibold">
              {activeGroup.label}
            </h2>
            <p className="mt-1 text-label text-muted">{activeGroup.support}</p>
            <EntryList entries={entriesInGroup(activeGroup.id)} className="mt-3.5" />
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
            className="pressable quiet flex min-h-14 items-center gap-3 px-4 py-3.5 pe-3 outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
          >
            <span className="min-w-0 flex-1 text-start">
              <span className="block text-pretty text-body font-semibold">{entry.title}</span>
              <span className="mt-0.5 block text-label text-muted">
                {showGroup ? (
                  <>
                    {groupLabel(entry.group)}
                    <span className="mx-1.5 text-faint">·</span>
                  </>
                ) : null}
                {formatShamsi(entry.publishedOn)}
                <span className="mx-1.5 text-faint">·</span>
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

function ClearIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" aria-hidden="true">
      <path
        d="M6 6l8 8M14 6l-8 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function groupLabel(id: KnowledgeGroup) {
  return KNOWLEDGE_GROUPS.find((item) => item.id === id)?.label ?? id;
}

function hay(entry: { title: string; support: string; aliases: string[] }, q: string) {
  const blob = `${entry.title} ${entry.support} ${entry.aliases.join(" ")}`.toLowerCase();
  return blob.includes(q.toLowerCase());
}
