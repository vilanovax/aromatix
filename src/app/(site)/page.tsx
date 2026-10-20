"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { AskComposer } from "@/components/AskComposer";
import { Shell } from "@/components/Shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { interpretQuery } from "@/lib/assistant";
import { perfumesMatchingName } from "@/lib/suggest";
import { computeDna } from "@/lib/dna";
import { getPerfume } from "@/lib/catalog";
import { readVisit, type RecentVisit } from "@/lib/recent";
import { useAroma } from "@/lib/store";

const CHIPS = [
  { label: "ساواج", insert: "ساواج" },
  { label: "محل کار", insert: "محل کار" },
  { label: "پاییزی", insert: "پاییزی" },
  { label: "زیر ۳ میلیون", insert: "زیر ۳ میلیون" },
] as const;

export default function HomePage() {
  const router = useRouter();
  const { setProfile, library, ready } = useAroma();
  const dna = computeDna(library, getPerfume);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState(false);
  const [recent, setRecent] = useState<RecentVisit | null>(null);
  const showTaste = ready && (dna.stage === "early" || dna.stage === "dna");

  useEffect(() => {
    setRecent(readVisit());
  }, []);

  function ask(text: string) {
    const intent = interpretQuery(text);
    const named = perfumesMatchingName(text);
    if (named.length > 1 && intent.type !== "results" && intent.type !== "reference" && intent.type !== "learn" && intent.type !== "brand") {
      router.push(`/search?q=${encodeURIComponent(text.trim())}`);
      return;
    }
    if (intent.type === "miss") {
      if (named.length === 1) {
        router.push(`/perfume/${named[0].slug}?from=${encodeURIComponent("/")}`);
        return;
      }
      if (text.trim()) setError(true);
      return;
    }
    if (intent.type === "perfume") {
      const query = new URLSearchParams();
      query.set("from", "/");
      if (intent.similar) query.set("focus", "similar");
      if (intent.occasion) query.set("occasion", intent.occasion);
      if (intent.season) query.set("season", intent.season);
      router.push(`/perfume/${intent.slug}?${query}`);
      return;
    }
    if (intent.type === "reference") {
      const query = new URLSearchParams();
      query.set("from", "/");
      if (intent.occasion) query.set("occasion", intent.occasion);
      if (intent.season) query.set("season", intent.season);
      if (intent.budget != null) query.set("budget", String(intent.budget));
      router.push(`/reference/${intent.id}?${query}`);
      return;
    }
    if (intent.type === "learn") {
      router.push(`/learn/${intent.slug}`);
      return;
    }
    if (intent.type === "brand") {
      router.push(`/brands/${intent.slug}`);
      return;
    }
    setProfile(intent.profile);
    router.push("/results");
  }

  return (
    <Shell>
      <div className="vf app flex min-h-full flex-col px-5 pt-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <header>
          <h1 className="text-balance text-display font-bold">چه عطری بهت میاد؟</h1>
          <p className="mt-2 text-pretty text-body text-muted-foreground">
            اسم یک عطر را بنویس، با سلیقه‌ات مقایسه کن، یا بگو دنبال چه رایحه‌ای هستی.
          </p>
        </header>

        <AskComposer
          value={draft}
          error={error}
          onChange={(value) => {
            setDraft(value);
            setError(false);
          }}
          onAsk={ask}
        />
        {error ? (
          <Alert variant="destructive" id="wish-error" className="mt-3">
            اسم یک عطر، یک واژه مثل وتیور، یا موقعیت و بودجه را بنویس.
          </Alert>
        ) : null}

        <ul className="scroll-quiet mt-3 flex justify-start gap-2 overflow-x-auto pb-1" aria-label="نمونه‌های پرسش">
          {CHIPS.map((item) => (
            <li key={item.label} className="shrink-0">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => {
                  setDraft((current) => appendChip(current, item.insert));
                  setError(false);
                }}
                className="min-h-11 rounded-full! bg-card! px-4 font-medium"
              >
                {item.label}
              </Button>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col gap-2">
          {recent ? (
            <Button
              href={recent.href}
              variant="outline"
              aria-label={`ادامهٔ ${recent.label}`}
              className="min-h-11 w-full justify-between! bg-card! px-4"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="shrink-0 text-label font-normal text-muted-foreground">ادامه</span>
                <span className="truncate">{recent.label}</span>
              </span>
              <ChevronLeft strokeWidth={1.5} aria-hidden="true" />
            </Button>
          ) : null}
          <Button
            href="/guide"
            variant="ghost"
            className="min-h-11 w-full justify-start! whitespace-normal! px-0! text-start font-medium"
          >
            نمی‌دونی از کجا شروع کنی؟ با ۴ سؤال شروع کن
          </Button>
        </div>

        {showTaste ? (
          <Card className="mt-8 p-4">
            <p className="text-pretty text-body">{dna.sentence}</p>
            <Button href="/shelf#for-me" variant="outline" className="mt-3 min-h-11 w-full bg-card!">
              ۳ عطر برای سلیقه‌ات
            </Button>
          </Card>
        ) : null}
      </div>
    </Shell>
  );
}

function appendChip(current: string, piece: string) {
  const text = current.trim();
  if (!text) return piece;
  if (text.includes(piece)) return text;
  return `${text}، ${piece}`;
}
