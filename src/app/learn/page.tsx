"use client";

import { useMemo, useState } from "react";
import { ButtonLink } from "@/components/Button";
import { Chip } from "@/components/Chip";
import { ForwardIcon } from "@/components/Icons";
import { Shell } from "@/components/Shell";
import { faNum } from "@/lib/format";
import {
  KNOWLEDGE_GROUPS,
  entriesInGroup,
  featuredEntries,
  findKnowledge,
  knowledge,
  type KnowledgeGroup,
} from "@/lib/knowledge";

export default function LearnIndexPage() {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<KnowledgeGroup | "all">("all");
  const hit = query.trim() ? findKnowledge(query) : null;
  const filtered = useMemo(() => {
    const q = query.trim();
    if (q) {
      const match = findKnowledge(q);
      return match ? [match] : knowledge.filter((entry) => hay(entry, q));
    }
    if (group === "all") return knowledge;
    return entriesInGroup(group);
  }, [query, group]);

  return (
    <Shell composer back={{ href: "/", label: "شروع" }}>
      <div className="px-5 pt-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <h1 className="text-display font-bold">دانستنی‌ها</h1>
        <p className="mt-2.5 max-w-[22rem] text-pretty text-body text-muted">
          واژه‌هایی که وسط انتخاب گیرت می‌اندازد، همین‌جا. برای فهمیدن لازم نیست صفحه عوض کنی.
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
          className="mt-5 min-h-12 w-full rounded-panel border border-line bg-card px-3.5 text-input outline-none placeholder:text-faint focus:border-ink"
        />

        <ul className="mt-4 flex flex-wrap gap-2" aria-label="دسته‌ها">
          <li>
            <Chip selected={group === "all" && !query} onClick={() => { setGroup("all"); setQuery(""); }}>
              همه
            </Chip>
          </li>
          {KNOWLEDGE_GROUPS.map((item) => (
            <li key={item.id}>
              <Chip
                selected={group === item.id && !query}
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

        {!query && group === "all" ? (
          <section className="mt-8" aria-labelledby="start-title">
            <h2 id="start-title" className="text-title font-semibold">
              از کجا شروع کنیم؟
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {featuredEntries().map((entry) => (
                <li key={entry.slug}>
                  <EntryLink slug={entry.slug} title={entry.title} support={`${faNum(entry.minutes)} دقیقه`} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-8" aria-labelledby="list-title">
          <h2 id="list-title" className="text-title font-semibold">
            {query ? (hit || filtered.length ? "نتیجه" : "چیزی پیدا نشد") : group === "all" ? "همهٔ مدخل‌ها" : KNOWLEDGE_GROUPS.find((item) => item.id === group)?.label}
          </h2>
          {query && filtered.length === 0 ? (
            <p className="mt-3 text-pretty text-body text-muted">این را هنوز نداریم. اسم را ساده‌تر بنویس، یا از دسته‌ها یکی را باز کن.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {filtered.map((entry) => (
                <li key={entry.slug}>
                  <EntryLink slug={entry.slug} title={entry.title} support={entry.support} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Shell>
  );
}

function EntryLink({ slug, title, support }: { slug: string; title: string; support: string }) {
  return (
    <ButtonLink
      href={`/learn/${slug}`}
      variant="quiet"
      shape="panel"
      className="w-full gap-3 border border-line bg-card px-4 py-3 font-normal"
    >
      <span className="min-w-0 flex-1 text-start">
        <span className="block text-body font-semibold">{title}</span>
        <span className="mt-0.5 block text-label text-muted">{support}</span>
      </span>
      <ForwardIcon className="size-5 shrink-0 text-muted" />
    </ButtonLink>
  );
}

function hay(entry: { title: string; support: string; aliases: string[] }, q: string) {
  const blob = `${entry.title} ${entry.support} ${entry.aliases.join(" ")}`.toLowerCase();
  return blob.includes(q.toLowerCase());
}
