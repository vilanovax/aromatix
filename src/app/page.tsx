"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ForwardIcon } from "@/components/Icons";
import { Shell } from "@/components/Shell";
import { findPerfume, isPerfumeLookup, parseLine } from "@/lib/assistant";
import { getPerfume } from "@/lib/catalog";
import { useAroma } from "@/lib/store";
import type { Taste } from "@/lib/types";

const EXAMPLES = ["مهمانی شب زمستون", "محل کار، تابستون", "شبیه ساواج", "۹ پی‌ام"];

function recall(taste: Record<string, Taste>) {
  const liked = Object.entries(taste).filter((entry): entry is [string, Taste] => entry[1] === "like");
  const tried = Object.entries(taste).filter((entry): entry is [string, Taste] => entry[1] === "try");
  const saved = liked.length > 0 ? liked : tried;
  if (saved.length === 0) return null;

  if (saved.length === 1) {
    const perfume = getPerfume(saved[0][0]);
    if (!perfume) return null;
    const verb = saved[0][1] === "like" ? "پسندیدی" : "برای امتحان گذاشتی";
    return {
      href: `/perfume/${perfume.slug}`,
      sentence: `دفعهٔ قبل ${perfume.nameFa} را ${verb}. چیزی شبیه آن می‌خوای؟`,
    };
  }

  const counts = new Map<string, number>();
  for (const [slug, value] of saved) {
    const perfume = getPerfume(slug);
    if (!perfume) continue;
    const weight = value === "like" ? 1 : 0.5;
    for (const accord of perfume.accords) {
      counts.set(accord.name, (counts.get(accord.name) ?? 0) + accord.strength * weight);
    }
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  if (!top) return null;
  return { href: "/shelf", sentence: `رایحهٔ ${top[0]} را بیشتر پسندیدی.` };
}

export default function HomePage() {
  const router = useRouter();
  const { setProfile, taste, ready } = useAroma();
  const memory = ready ? recall(taste) : null;
  const [draft, setDraft] = useState("");
  const [error, setError] = useState(false);

  function go(text: string) {
    if (isPerfumeLookup(text)) {
      const perfume = findPerfume(text);
      if (perfume) {
        router.push(`/perfume/${perfume.slug}`);
        return;
      }
    }
    const profile = parseLine(text);
    if (!profile) {
      setError(true);
      return;
    }
    setProfile(profile);
    router.push("/results");
  }

  return (
    <Shell>
      <div className="flex min-h-full flex-col px-5 pt-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <h1 className="text-display font-bold">چه عطری بهت میاد؟</h1>
        <p className="mt-2.5 text-body text-balance text-muted">
          بگو کجا می‌خوای استفاده کنی، چه بوهایی دوست داری و چقدر می‌خوای هزینه کنی.
        </p>
        {memory ? (
          <Link
            href={memory.href}
            className="pressable quiet mt-4 flex min-h-12 items-center rounded-panel bg-moss px-4 py-3 text-body text-pretty"
          >
            {memory.sentence}
          </Link>
        ) : null}

        <form
          className="mt-6"
          onSubmit={(event) => {
            event.preventDefault();
            go(draft);
          }}
        >
          <label htmlFor="wish" className="sr-only">
            اسم عطر یا توصیف عطری که می‌خواهی
          </label>
          <div
            className={`flex items-center gap-1 rounded-panel border bg-card p-1 ps-3.5 shadow-card focus-within:border-ink ${
              error ? "border-danger" : "border-line"
            }`}
          >
            <input
              id="wish"
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                setError(false);
              }}
              placeholder="مثلاً قرار پاییزی، تا ۵ میلیون"
              enterKeyHint="search"
              autoComplete="off"
              aria-invalid={error}
              aria-describedby={error ? "wish-error" : "wish-hint"}
              className="min-h-12 min-w-0 flex-1 bg-transparent text-input text-ellipsis outline-none placeholder:text-faint focus:text-clip"
            />
            <button
              type="submit"
              className="pressable solid min-h-12 shrink-0 rounded-control bg-ink px-5 text-body leading-none font-semibold text-paper"
            >
              پیدا کن
            </button>
          </div>
          {error ? (
            <p id="wish-error" role="alert" className="mt-2 text-label text-pretty text-danger">
              اسم یک عطر، یا موقعیت، فصل و بودجه را بنویس؛ مثلاً «خمره» یا «محل کار، تابستون».
            </p>
          ) : (
            <p id="wish-hint" className="mt-2 text-label text-pretty text-muted">
              اسم عطر هم می‌تونی بنویسی، یا بگی دنبال چه رایحه‌ای هستی.
            </p>
          )}
        </form>

        <ul className="mt-3 flex flex-wrap gap-2" aria-label="نمونه‌ها">
          {EXAMPLES.map((example) => (
            <li key={example}>
              <button
                type="button"
                onClick={() => go(example)}
                className="pressable edge inline-flex min-h-11 items-center rounded-full border border-line bg-card px-3.5 text-label leading-none"
              >
                {example}
              </button>
            </li>
          ))}
        </ul>

        <Link
          href="/guide"
          className="pressable quiet mt-10 flex min-h-14 items-center gap-3 rounded-panel border border-line bg-card px-4 py-3"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-body font-semibold">مطمئن نیستی چه بنویسی؟</span>
            <span className="mt-0.5 block text-label text-muted">چهار سؤال کوتاه؛ حدود یک دقیقه</span>
          </span>
          <ForwardIcon className="size-5 shrink-0 text-muted" />
        </Link>
      </div>
    </Shell>
  );
}
