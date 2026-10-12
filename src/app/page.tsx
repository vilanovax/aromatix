"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/Button";
import { FieldShell } from "@/components/Card";
import { Chip } from "@/components/Chip";
import { ForwardIcon } from "@/components/Icons";
import { Shell } from "@/components/Shell";
import { findPerfume, isPerfumeLookup, parseLine } from "@/lib/assistant";
import { findKnowledge } from "@/lib/knowledge";
import { getPerfume } from "@/lib/catalog";
import { computeDna, type DnaProfile } from "@/lib/dna";
import { useAroma } from "@/lib/store";
import type { UserPerfume } from "@/lib/types";

const EXAMPLES = ["مهمانی شب زمستون", "محل کار، تابستون", "شبیه ساواج", "۹ پی‌ام"];
const NUDGE = "داریم سلیقه‌ات رو بهتر می‌شناسیم. دوست داری چند عطر جدید متناسب با انتخاب‌هات ببینی؟";

function recall(library: Record<string, UserPerfume>, dna: DnaProfile, nudgeReady: boolean) {
  if (nudgeReady) return { href: "/shelf", nudge: true, sentence: NUDGE };

  const rated = Object.entries(library).filter((entry) => entry[1].rating != null && !entry[1].disliked);
  if (rated.length === 1) {
    const perfume = getPerfume(rated[0][0]);
    if (!perfume) return null;
    return {
      href: `/perfume/${perfume.slug}`,
      nudge: false,
      sentence: `دفعهٔ قبل ${perfume.nameFa} را تجربه کردی. چیزی شبیه آن می‌خوای؟`,
    };
  }
  if (rated.length > 1 && (dna.stage === "early" || dna.stage === "dna")) {
    return { href: "/shelf", nudge: false, sentence: dna.sentence };
  }
  if (rated.length > 1) {
    return { href: "/shelf", nudge: false, sentence: "چند عطر را تجربه کردی." };
  }

  const wanted = Object.entries(library).filter(
    (entry) => entry[1].wanted && !entry[1].owned && !entry[1].disliked && entry[1].rating == null,
  );
  if (rated.length === 0 && wanted.length === 1) {
    const perfume = getPerfume(wanted[0][0]);
    if (!perfume) return null;
    return {
      href: `/perfume/${perfume.slug}`,
      nudge: false,
      sentence: `دفعهٔ قبل ${perfume.nameFa} را برای امتحان گذاشتی. چیزی شبیه آن می‌خوای؟`,
    };
  }
  if (rated.length === 0 && wanted.length > 1) {
    return { href: "/shelf", nudge: false, sentence: "چند عطر را برای امتحان گذاشتی." };
  }
  return null;
}

export default function HomePage() {
  const router = useRouter();
  const { setProfile, library, ready, nudgeSeen, dismissNudge } = useAroma();
  const dna = computeDna(library, getPerfume);
  const memory = ready ? recall(library, dna, dna.validCount >= 6 && !nudgeSeen) : null;
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
    const lesson = findKnowledge(text);
    if (lesson) {
      router.push(`/learn/${lesson.slug}`);
      return;
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
          <ButtonLink
            href={memory.href}
            variant="quiet"
            shape="panel"
            size="lg"
            onClick={() => {
              if (memory.nudge) dismissNudge();
            }}
            className="mt-4 justify-start bg-moss px-4 py-3 text-pretty font-normal"
          >
            {memory.sentence}
          </ButtonLink>
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
          <FieldShell error={error} className="ps-3.5 shadow-card">
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
            <Button type="submit" shape="control" size="lg" className="shrink-0">
              پیدا کن
            </Button>
          </FieldShell>
          {error ? (
            <p id="wish-error" role="alert" className="mt-2 text-label text-pretty text-danger">
              اسم یک عطر، یک واژه مثل «وتیور»، یا موقعیت و بودجه را بنویس.
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
              <Chip className="min-h-11 px-3.5" onClick={() => go(example)}>
                {example}
              </Chip>
            </li>
          ))}
        </ul>

          <ButtonLink
            href="/learn"
            variant="quiet"
            className="mt-8 justify-start px-1 font-normal text-muted"
          >
            دانستنی‌ها — غلظت، ماندگاری، بچ‌کد
          </ButtonLink>

          <ButtonLink
            href="/guide"
            variant="quiet"
            shape="panel"
            size="xl"
            className="mt-4 gap-3 border border-line bg-card px-4 py-3"
          >
          <span className="min-w-0 flex-1 text-start">
            <span className="block text-body font-semibold">مطمئن نیستی چه بنویسی؟</span>
            <span className="mt-0.5 block text-label text-muted">چهار سؤال کوتاه؛ حدود یک دقیقه</span>
          </span>
          <ForwardIcon className="size-5 shrink-0 text-muted" />
        </ButtonLink>
      </div>
    </Shell>
  );
}
