"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { SendIcon } from "@/components/Icons";
import { respond, type AskContext, type Reply } from "@/lib/assistant";
import { getPerfume } from "@/lib/catalog";
import { matchPerfumes } from "@/lib/match";
import { useAroma } from "@/lib/store";

const LEARN_PROMPT = "وتیور چه بویی دارد؟";

export function Assistant() {
  const pathname = usePathname();
  const { profile, setProfile, taste, compare } = useAroma();
  const [draft, setDraft] = useState("");
  const [reply, setReply] = useState<Reply | null>(null);
  const [chipsOpen, setChipsOpen] = useState(true);
  const replyRef = useRef<HTMLDivElement>(null);
  const pinned = useRef(false);
  const results = useMemo(
    () => (profile ? matchPerfumes(profile, taste) : []),
    [profile, taste],
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
        <div
          ref={replyRef}
          aria-live="polite"
          className="scroll-quiet sheet-panel mb-3 max-h-[38dvh] overflow-y-auto overscroll-contain rounded-panel border border-line bg-card p-4 shadow-sheet"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-label font-semibold">
              {reply.kind === "learn" || reply.kind === "compare" ? reply.title : "آروما"}
            </p>
            <button
              type="button"
              onClick={() => setReply(null)}
              className="pressable quiet -me-2 min-h-9 rounded-full px-3 text-label leading-none text-muted"
            >
              بستن
            </button>
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
            <Link
              href={`/compare?a=${reply.a}&b=${reply.b}`}
              className="pressable mt-3 inline-flex min-h-11 items-center rounded-control bg-ink px-4 text-body leading-none font-medium text-paper"
            >
              مقایسه این دو
            </Link>
          ) : null}
        </div>
      ) : null}
      {chipsOpen ? (
        <div className="rail fade-end -mx-4 flex gap-1.5 px-4 pb-2.5">
          {prompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => ask(prompt)}
              className="pressable edge min-h-9 shrink-0 rounded-full border border-line bg-card px-3.5 text-label leading-none"
            >
              {prompt}
            </button>
          ))}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setChipsOpen(true)}
          className="pressable quiet mb-2 min-h-8 rounded-full px-2 text-label leading-none text-muted"
        >
          پیشنهادهای سریع
        </button>
      )}
      <form
        className="flex items-center gap-1 rounded-panel border border-line bg-card p-1 ps-3 focus-within:border-ink"
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
        <button
          type="submit"
          disabled={!draft.trim()}
          aria-label="بفرست"
          className="pressable solid grid size-11 shrink-0 place-items-center rounded-control bg-ink text-paper disabled:bg-line disabled:text-muted"
        >
          <SendIcon className="size-5" />
        </button>
      </form>
    </div>
  );
}

function promptsFor(pathname: string, hasProfile: boolean) {
  if (pathname.startsWith("/compare")) return ["کدوم شیرین‌تره؟", "کدوم برای من بهتره؟"];
  if (pathname.startsWith("/perfume/")) return ["شبیه این چی داری؟", "برای تابستون خوبه؟"];
  if (pathname === "/results" && hasProfile) return ["ارزان‌تر", "خنک‌تر", "ماندگارتر", "متفاوت‌تر"];
  return [LEARN_PROMPT];
}
