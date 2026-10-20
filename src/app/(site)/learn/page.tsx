"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search-input";
import { Separator } from "@/components/ui/separator";
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
      <div className="vf app step-in px-5 pt-6 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <h1 className="text-headline font-bold">دانستنی‌ها</h1>
        <p className="mt-2 text-pretty text-body text-muted-foreground">
          غلظت، ماندگاری، بچ‌کد — کوتاه، وقتی وسط انتخاب گیر می‌کنی.
        </p>

        <div className="mt-5">
          <label htmlFor="learn-q" className="sr-only">
            جستجو در دانستنی‌ها
          </label>
          <SearchInput
            id="learn-q"
            value={query}
            onChange={(value) => {
              setQuery(value);
              setGroup("all");
            }}
            placeholder="بچ‌کد، وتیور، ماندگاری"
            autoComplete="off"
            enterKeyHint="search"
            className="h-12!"
          />
        </div>

        <ul className="mt-4 flex flex-wrap justify-start gap-2" aria-label="دسته‌ها">
          <li>
            <GroupChip
              selected={!searching && group === "all"}
              onClick={() => {
                setGroup("all");
                setQuery("");
              }}
            >
              همه
            </GroupChip>
          </li>
          {KNOWLEDGE_GROUPS.map((item) => (
            <li key={item.id}>
              <GroupChip
                selected={!searching && group === item.id}
                onClick={() => {
                  setGroup(item.id);
                  setQuery("");
                }}
              >
                {item.label}
              </GroupChip>
            </li>
          ))}
        </ul>

        {searching ? (
          <section className="mt-8" aria-label="نتیجهٔ جستجو" aria-live="polite">
            {filtered.length === 0 ? (
              <EmptyState title="چیزی پیدا نشد" description="اسم را ساده‌تر بنویس، یا از دسته‌ها یکی را باز کن." />
            ) : (
              <>
                <h2 className="text-title font-semibold">{faNum(filtered.length)} نتیجه</h2>
                <EntryList entries={filtered} className="mt-3" showGroup />
              </>
            )}
          </section>
        ) : null}

        {browsing ? (
          <>
            <section className="mt-8" aria-labelledby="start-title">
              <h2 id="start-title" className="text-title font-semibold">
                از اینجا شروع کن
              </h2>
              <EntryList entries={featured} className="mt-3" showGroup />
            </section>

            {KNOWLEDGE_GROUPS.map((item) => {
              const rest = entriesInGroup(item.id).filter((entry) => !featuredSlugs.has(entry.slug));
              if (rest.length === 0) return null;
              return (
                <section key={item.id} className="mt-8" aria-labelledby={`group-${item.id}`}>
                  <h2 id={`group-${item.id}`} className="text-title font-semibold">
                    {item.label}
                  </h2>
                  <p className="mt-1 text-label text-muted-foreground">{item.support}</p>
                  <EntryList entries={rest} className="mt-3" />
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
            <p className="mt-1 text-label text-muted-foreground">{activeGroup.support}</p>
            <EntryList entries={entriesInGroup(activeGroup.id)} className="mt-3" />
          </section>
        ) : null}
      </div>
    </Shell>
  );
}

function GroupChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant={selected ? "default" : "outline"}
      size="md"
      aria-pressed={selected}
      onClick={onClick}
      className={cn("min-h-11 rounded-full! px-4 font-medium", !selected && "bg-card!")}
    >
      {children}
    </Button>
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
    <Card className={cn("px-4 py-1", className)}>
      <ul>
        {entries.map((entry, index) => (
          <li key={entry.slug}>
            {index > 0 ? <Separator /> : null}
            <Link
              href={`/learn/${entry.slug}`}
              className="flex min-h-14 items-start gap-3 py-3 outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
            >
              <span className="min-w-0 flex-1 text-start">
                <span className="block text-pretty text-body font-semibold">{entry.title}</span>
                {entry.support ? <span className="mt-1 block text-pretty text-label">{entry.support}</span> : null}
                {showGroup ? (
                  <span className="mt-1 block text-label text-muted-foreground">{groupLabel(entry.group)}</span>
                ) : null}
              </span>
              <ChevronLeft className="mt-1 size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function groupLabel(id: KnowledgeGroup) {
  return KNOWLEDGE_GROUPS.find((item) => item.id === id)?.label ?? id;
}

function hay(entry: { title: string; support: string; aliases: string[] }, q: string) {
  const blob = `${entry.title} ${entry.support} ${entry.aliases.join(" ")}`.toLowerCase();
  return blob.includes(q.toLowerCase());
}
