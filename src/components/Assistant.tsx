"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { respond, type AskContext, type Reply } from "@/lib/assistant";
import { getPerfume } from "@/lib/catalog";
import { featuredEntries, getEntry, relatedEntries } from "@/lib/knowledge";
import { matchPerfumes } from "@/lib/match";
import { useAroma } from "@/lib/store";

const LEARN_PROMPT = "وتیور چه بویی دارد؟";

export function Assistant({ quiet = false }: { quiet?: boolean }) {
  const pathname = usePathname();
  const { profile, setProfile, library, compare } = useAroma();
  const [draft, setDraft] = useState("");
  const [reply, setReply] = useState<Reply | null>(null);
  const [chipsOpen, setChipsOpen] = useState(!quiet);
  const replyRef = useRef<HTMLDivElement>(null);
  const pinned = useRef(false);
  const results = useMemo(
    () => (profile ? matchPerfumes(profile, library) : []),
    [profile, library],
  );
  const context = useMemo<AskContext>(() => {
    const slug = pathname.match(/^\/perfume\/([^/]+)/)?.[1];
    const perfume = slug ? getPerfume(decodeURIComponent(slug)) : undefined;
    if (!pathname.startsWith("/compare") || compare.length < 2) return { perfume };
    const left = getPerfume(compare[0]);
    const right = getPerfume(compare[1]);
    if (!left || !right) return { perfume };
    return { perfume, pair: [left, right] };
  }, [pathname, compare]);
  const prompts = promptsFor(pathname, Boolean(profile));

  useEffect(() => {
    if (reply) replyRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [reply]);

  useEffect(() => {
    setChipsOpen(!quiet);
    pinned.current = false;
    const main = document.querySelector("main");
    if (!main) return;
    const onScroll = () => {
      if (pinned.current || quiet) return;
      setChipsOpen(main.scrollTop < 40);
    };
    main.addEventListener("scroll", onScroll, { passive: true });
    return () => main.removeEventListener("scroll", onScroll);
  }, [pathname, quiet]);

  function ask(text: string) {
    const next = respond(text, profile, results, context);
    if (next.profile) setProfile(next.profile);
    setReply(next.reply);
    setDraft("");
    if (next.reply.kind === "refine") {
      document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <div className="vf app border-t border-border bg-background px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
      {reply ? (
        <div ref={replyRef}>
          <Card className="sheet-panel mb-3 max-h-[38dvh] overflow-y-auto overscroll-contain !bg-secondary p-4" aria-live="polite">
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 text-title font-semibold">
                {reply.kind === "learn" || reply.kind === "compare" ? reply.title : "آروما"}
              </p>
              <Button variant="ghost" onClick={() => setReply(null)} className="min-h-11 shrink-0 px-3">
                بستن
              </Button>
            </div>
            <p className="mt-2 text-pretty text-body">{reply.body}</p>
            {reply.kind === "refine" ? (
              <p className="mt-2 text-label text-muted-foreground">فهرست بالا با همین اصلاح چیده شد.</p>
            ) : null}
            {reply.kind === "learn" && reply.href ? (
              <Link
                href={reply.href}
                className="mt-3 inline-flex min-h-11 items-center text-body font-semibold underline-offset-4 outline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
              >
                {reply.hrefLabel}
              </Link>
            ) : null}
            {reply.kind === "compare" ? (
              <Button href={`/compare?a=${reply.a}&b=${reply.b}`} size="lg" className="mt-4 min-h-12 w-full">
                مقایسه این دو
              </Button>
            ) : null}
          </Card>
        </div>
      ) : null}

      {quiet || prompts.length === 0 ? null : chipsOpen ? (
        <div className="rail fade-end -mx-5 flex gap-2 px-5 pb-3" aria-label="پیشنهادهای سریع">
          {prompts.map((prompt) => (
            <Button
              key={prompt}
              type="button"
              variant="outline"
              onClick={() => ask(prompt)}
              className="min-h-11 shrink-0 !rounded-full !bg-card px-4 font-medium"
            >
              {prompt}
            </Button>
          ))}
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          onClick={() => setChipsOpen(true)}
          className="mb-3 min-h-11 px-3 font-medium text-muted-foreground"
        >
          پیشنهادهای سریع
        </Button>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          ask(draft);
        }}
      >
        <label className="sr-only" htmlFor="ask">
          سؤال یا اصلاح پیشنهاد
        </label>
        <Input
          id="ask"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onFocus={() => {
            if (quiet) return;
            pinned.current = true;
            setChipsOpen(true);
          }}
          onBlur={() => {
            pinned.current = false;
          }}
          placeholder={quiet ? "بعد از مقایسه بپرس…" : "بپرس یا پیشنهاد را اصلاح کن"}
          enterKeyHint="send"
          autoComplete="off"
          groupClassName="!h-12"
          endAddon={
            <Button type="submit" size="icon" disabled={!draft.trim()} aria-label="بفرست" className="!size-11">
              <ArrowLeft strokeWidth={2} />
            </Button>
          }
        />
      </form>
    </div>
  );
}

function promptsFor(pathname: string, hasProfile: boolean) {
  if (pathname.startsWith("/compare")) return ["کدوم شیرین‌تره؟", "کدوم برای من بهتره؟"];
  if (pathname.startsWith("/learn")) return learnPrompts(pathname);
  if (pathname.startsWith("/perfume/")) return ["شبیه این چی داری؟", "برای تابستون خوبه؟"];
  if (pathname.startsWith("/brands")) return [];
  if (pathname === "/results" && hasProfile) return ["ارزان‌تر", "خنک‌تر", "ماندگارتر", "متفاوت‌تر"];
  return [LEARN_PROMPT];
}

function learnPrompts(pathname: string) {
  const slug = pathname.match(/^\/learn\/([^/]+)/)?.[1];
  if (!slug) {
    return featuredEntries()
      .slice(0, 2)
      .map((entry) => entry.ask);
  }
  const entry = getEntry(decodeURIComponent(slug));
  if (!entry) return [LEARN_PROMPT];
  const related = relatedEntries(entry)
    .map((item) => item.ask)
    .filter((ask) => ask !== entry.ask)
    .slice(0, 2);
  return related.length > 0
    ? related
    : featuredEntries()
        .filter((item) => item.slug !== entry.slug)
        .slice(0, 2)
        .map((item) => item.ask);
}
