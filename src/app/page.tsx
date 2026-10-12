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
        <header>
          <h1 className="text-display font-bold text-balance">چه عطری بهت میاد؟</h1>
          <p className="mt-2.5 max-w-[22rem] text-body text-pretty text-muted">
            موقعیت، رایحه، یا بودجه را بنویس — یا اسم یک عطر آشنا.
          </p>
        </header>

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
              aria-describedby={error ? "wish-error" : undefined}
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
          ) : null}
        </form>

        <ul className="mt-4 flex flex-wrap gap-2" aria-label="نمونه‌ها">
          {EXAMPLES.map((example) => (
            <li key={example}>
              <Chip className="min-h-11 px-3.5" onClick={() => go(example)}>
                {example}
              </Chip>
            </li>
          ))}
        </ul>

        <ButtonLink
          href="/guide"
          variant="quiet"
          shape="panel"
          size="xl"
          className="mt-7 gap-3 border border-line bg-card px-4 py-3"
        >
          <span className="min-w-0 flex-1 text-start">
            <span className="block text-body font-semibold">مطمئن نیستی چه بنویسی؟</span>
            <span className="mt-0.5 block text-label text-muted">چهار سؤال کوتاه؛ حدود یک دقیقه</span>
          </span>
          <ForwardIcon className="size-5 shrink-0 text-muted" />
        </ButtonLink>

        <nav
          aria-label="کاوش"
          className="mt-5 flex flex-col items-start gap-2 text-label text-muted"
        >
          {memory ? (
            <ButtonLink
              href={memory.href}
              variant="quiet"
              size="sm"
              onClick={() => {
                if (memory.nudge) dismissNudge();
              }}
              className="justify-start px-0 text-start text-label text-pretty font-normal text-muted underline-offset-4 hover:underline"
            >
              {memory.sentence}
            </ButtonLink>
          ) : null}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <ButtonLink href="/brands" variant="quiet" className="justify-start px-0 font-normal text-muted">
              برندها
            </ButtonLink>
            <span aria-hidden="true" className="text-line">
              ·
            </span>
            <ButtonLink href="/learn" variant="quiet" className="justify-start px-0 font-normal text-muted">
              دانستنی‌ها
            </ButtonLink>
          </div>
        </nav>
      </div>
    </Shell>
  );
}
