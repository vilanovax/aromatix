"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, ButtonLink } from "@/components/Button";
import { Card, FieldShell } from "@/components/Card";
import { Chip } from "@/components/Chip";
import { SendIcon } from "@/components/Icons";
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
    <div className="border-t border-line bg-paper px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
      {reply ? (
        <div ref={replyRef}>
          <Card
            bordered={false}
            shadow="sheet"
            className="scroll-quiet sheet-panel mb-3 max-h-[38dvh] overflow-y-auto overscroll-contain bg-moss p-4"
            aria-live="polite"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 text-title font-semibold">
                {reply.kind === "learn" || reply.kind === "compare" ? reply.title : "آروما"}
              </p>
              <Button
                variant="quiet"
                shape="pill"
                size="sm"
                onClick={() => setReply(null)}
                className="shrink-0 -me-1 px-3 py-2 text-body text-muted outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
              >
                بستن
              </Button>
            </div>
            <p className="mt-2 text-pretty text-body">{reply.body}</p>
            {reply.kind === "refine" ? (
              <p className="mt-2 text-label text-muted">فهرست بالا با همین اصلاح چیده شد.</p>
            ) : null}
            {reply.kind === "learn" && reply.href ? (
              <Link
                href={reply.href}
                className="mt-3.5 inline-flex min-h-11 items-center text-body font-semibold leading-none underline-offset-4 outline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-ink"
              >
                {reply.hrefLabel}
              </Link>
            ) : null}
            {reply.kind === "compare" ? (
              <ButtonLink
                href={`/compare?a=${reply.a}&b=${reply.b}`}
                shape="control"
                size="lg"
                className="mt-3.5 w-full outline-offset-2 focus-visible:outline-2 focus-visible:outline-paper"
              >
                مقایسه این دو
              </ButtonLink>
            ) : null}
          </Card>
        </div>
      ) : null}

      {quiet || prompts.length === 0 ? null : chipsOpen ? (
        <div className="rail fade-end -mx-5 flex gap-2 px-5 pb-3" aria-label="پیشنهادهای سریع">
          {prompts.map((prompt) => (
            <Chip key={prompt} className="px-3.5" onClick={() => ask(prompt)}>
              {prompt}
            </Chip>
          ))}
        </div>
      ) : (
        <Button
          variant="quiet"
          shape="pill"
          size="sm"
          onClick={() => setChipsOpen(true)}
          className="mb-2.5 min-h-9 px-3 text-muted outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
        >
          پیشنهادهای سریع
        </Button>
      )}

      <FieldShell
        as="form"
        className="ps-3.5 shadow-card"
        onSubmit={(event) => {
          event.preventDefault();
          ask(draft);
        }}
      >
        <label className="sr-only" htmlFor="ask">
          سؤال یا اصلاح پیشنهاد
        </label>
        <input
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
          className="min-h-12 min-w-0 flex-1 bg-transparent text-input outline-none placeholder:text-faint"
        />
        <Button
          type="submit"
          shape="control"
          size="icon"
          disabled={!draft.trim()}
          aria-label="بفرست"
          className="outline-offset-2 focus-visible:outline-2 focus-visible:outline-paper"
        >
          <SendIcon className="size-5" />
        </Button>
      </FieldShell>
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
