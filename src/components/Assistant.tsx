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
import { matchPerfumes } from "@/lib/match";
import { useAroma } from "@/lib/store";

const LEARN_PROMPT = "وتیور چه بویی دارد؟";

export function Assistant() {
  const pathname = usePathname();
  const { profile, setProfile, library, compare } = useAroma();
  const [draft, setDraft] = useState("");
  const [reply, setReply] = useState<Reply | null>(null);
  const [chipsOpen, setChipsOpen] = useState(true);
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
    setChipsOpen(true);
    pinned.current = false;
    const main = document.querySelector("main");
    if (!main) return;
    const onScroll = () => {
      if (pinned.current) return;
      setChipsOpen(main.scrollTop < 40);
    };
    main.addEventListener("scroll", onScroll, { passive: true });
    return () => main.removeEventListener("scroll", onScroll);
  }, [pathname]);

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
    <div className="border-t border-line bg-paper px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      {reply ? (
        <div ref={replyRef}>
        <Card
          shadow="sheet"
          className="scroll-quiet sheet-panel mb-3 max-h-[38dvh] overflow-y-auto overscroll-contain p-4"
          aria-live="polite"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-label font-semibold">
              {reply.kind === "learn" || reply.kind === "compare" ? reply.title : "آروما"}
            </p>
            <Button variant="quiet" shape="pill" size="sm" onClick={() => setReply(null)} className="-me-2 text-muted">
              بستن
            </Button>
          </div>
          <p className="mt-1.5 text-body">{reply.body}</p>
          {reply.kind === "refine" ? (
            <p className="mt-2 text-label text-muted">فهرست بالا با همین اصلاح چیده شد.</p>
          ) : null}
          {reply.kind === "learn" && reply.href ? (
            <Link
              href={reply.href}
              className="mt-3 inline-flex min-h-10 items-center text-body leading-none font-medium underline-offset-4 hover:underline"
            >
              {reply.hrefLabel}
            </Link>
          ) : null}
          {reply.kind === "compare" ? (
            <ButtonLink
              href={`/compare?a=${reply.a}&b=${reply.b}`}
              shape="control"
              size="md"
              className="mt-3"
            >
              مقایسه این دو
            </ButtonLink>
          ) : null}
        </Card>
        </div>
      ) : null}
      {chipsOpen ? (
        <div className="rail fade-end -mx-4 flex gap-1.5 px-4 pb-2.5">
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
          className="mb-2 min-h-8 px-2 text-muted"
        >
          پیشنهادهای سریع
        </Button>
      )}
      <FieldShell
        as="form"
        className="ps-3 shadow-card"
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
            pinned.current = true;
            setChipsOpen(true);
          }}
          onBlur={() => {
            pinned.current = false;
          }}
          placeholder="بپرس یا پیشنهاد را اصلاح کن"
          enterKeyHint="send"
          className="min-h-11 min-w-0 flex-1 bg-transparent text-input outline-none placeholder:text-faint"
        />
        <Button type="submit" shape="control" size="icon" disabled={!draft.trim()} aria-label="بفرست">
          <SendIcon className="size-5" />
        </Button>
      </FieldShell>
    </div>
  );
}

function promptsFor(pathname: string, hasProfile: boolean) {
  if (pathname.startsWith("/compare")) return ["کدوم شیرین‌تره؟", "کدوم برای من بهتره؟"];
  if (pathname.startsWith("/learn")) return ["فرق EDP و EDT چیه؟", "بچ‌کد یعنی چی؟"];
  if (pathname.startsWith("/perfume/")) return ["شبیه این چی داری؟", "برای تابستون خوبه؟"];
  if (pathname === "/results" && hasProfile) return ["ارزان‌تر", "خنک‌تر", "ماندگارتر", "متفاوت‌تر"];
  return [LEARN_PROMPT];
}
