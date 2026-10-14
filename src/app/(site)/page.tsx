"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Shell } from "@/components/Shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { findPerfume, isPerfumeLookup, parseLine } from "@/lib/assistant";
import { findKnowledge } from "@/lib/knowledge";
import { getPerfume } from "@/lib/catalog";
import { computeDna, type DnaProfile } from "@/lib/dna";
import { perfumeHref } from "@/lib/nav";
import { useAroma } from "@/lib/store";
import type { UserPerfume } from "@/lib/types";

const STARTS = [
  { label: "پاییزی", query: "پاییز" },
  { label: "شبیه ساواج", query: "شبیه ساواج" },
  { label: "هدیه", query: "هدیه" },
  { label: "زیر ۳ میلیون", query: "زیر ۳ میلیون" },
  { label: "ماندگار", query: "ماندگار" },
  { label: "تازه و خنک", query: "تازه و خنک" },
] as const;
const NUDGE = "داریم سلیقه‌ات رو بهتر می‌شناسیم. دوست داری چند عطر جدید متناسب با انتخاب‌هات ببینی؟";

function recall(library: Record<string, UserPerfume>, dna: DnaProfile, nudgeReady: boolean) {
  if (nudgeReady) return { href: "/shelf", nudge: true, sentence: NUDGE };

  const rated = Object.entries(library).filter((entry) => entry[1].rating != null && !entry[1].disliked);
  if (rated.length === 1) {
    const perfume = getPerfume(rated[0][0]);
    if (!perfume) return null;
    return {
      href: perfumeHref(perfume.slug, "/"),
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
      href: perfumeHref(perfume.slug, "/"),
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
        router.push(perfumeHref(perfume.slug, "/"));
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
      <div className="vf app flex min-h-full flex-col px-5 pt-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <header>
          <h1 className="text-balance text-display font-bold">چه عطری بهت میاد؟</h1>
          <p className="mt-2 max-w-[22rem] text-pretty text-body text-muted-foreground">
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
          <Input
            id="wish"
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              setError(false);
            }}
            placeholder="مثلاً قرار پاییزی، تا ۵ میلیون"
            enterKeyHint="search"
            autoComplete="off"
            aria-invalid={error || undefined}
            aria-describedby={error ? "wish-error" : undefined}
            groupClassName={error ? "!h-12 ps-4 !border-destructive" : "!h-12 ps-4"}
            endAddon={
              <Button type="submit" size="sm" className="min-h-11">
                پیدا کن
              </Button>
            }
          />
          {error ? (
            <Alert variant="destructive" id="wish-error" className="mt-3">
              اسم یک عطر، یک واژه مثل «وتیور»، یا موقعیت و بودجه را بنویس.
            </Alert>
          ) : null}
        </form>

        {memory ? (
          <Button
            href={memory.href}
            variant="ghost"
            onClick={() => {
              if (memory.nudge) dismissNudge();
            }}
            className="mt-3 !h-auto !justify-start !whitespace-normal px-0 text-start text-label font-normal text-muted-foreground underline-offset-4 hover:underline"
          >
            {memory.sentence}
          </Button>
        ) : null}

        <div className="mt-5">
          <p className="text-label text-muted-foreground">شروع سریع</p>
          <ul className="mt-2 flex flex-wrap gap-2" aria-label="شروع سریع">
            {STARTS.map((item) => (
              <li key={item.label}>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => go(item.query)}
                  className="min-h-11 !rounded-full !bg-card px-4 font-medium"
                >
                  {item.label}
                </Button>
              </li>
            ))}
          </ul>
        </div>

        <Card className="mt-7 p-0">
          <Button
            href="/guide"
            variant="ghost"
            className="!h-auto min-h-14 w-full !justify-between gap-3 !whitespace-normal px-4 py-3 text-start"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-body font-semibold">مطمئن نیستی چه بنویسی؟</span>
              <span className="mt-1 block text-label font-normal text-muted-foreground">چهار سؤال کوتاه؛ حدود یک دقیقه</span>
            </span>
            <ChevronLeft strokeWidth={1.5} />
          </Button>
        </Card>
      </div>
    </Shell>
  );
}
