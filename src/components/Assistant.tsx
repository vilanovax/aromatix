"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SendIcon } from "@/components/Icons";
import { respond, type Reply } from "@/lib/assistant";
import { matchPerfumes } from "@/lib/match";
import { useAroma } from "@/lib/store";

const COMPARE_PROMPT = "سومی شیرین‌تره یا چهارمی؟";
const LEARN_PROMPT = "وتیور چه بویی دارد؟";
const REFINE_PROMPTS = ["خنک‌تر", "ارزان‌تر", "متفاوت‌تر"];

export function Assistant() {
  const { profile, setProfile, taste } = useAroma();
  const [draft, setDraft] = useState("");
  const [reply, setReply] = useState<Reply | null>(null);
  const results = useMemo(
    () => (profile ? matchPerfumes(profile, taste) : []),
    [profile, taste],
  );
  const prompts = [
    ...(results.length >= 4 ? [COMPARE_PROMPT] : []),
    ...(profile ? REFINE_PROMPTS : []),
    LEARN_PROMPT,
  ];

  function ask(text: string) {
    const next = respond(text, profile, results);
    if (next.profile) setProfile(next.profile);
    setReply(next.reply);
    setDraft("");
  }

  return (
    <div className="border-t border-[var(--line)] bg-[var(--paper)] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      {reply ? (
        <div
          aria-live="polite"
          className="scroll-quiet sheet-panel mb-3 max-h-[38dvh] overflow-y-auto overscroll-contain rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4 shadow-[0_8px_24px_-12px_rgba(28,33,31,0.18)]"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-[13px] font-semibold">
              {reply.kind === "learn" || reply.kind === "compare" ? reply.title : "آروما"}
            </p>
            <button
              type="button"
              onClick={() => setReply(null)}
              className="pressable quiet -me-2 min-h-9 rounded-full px-3 text-[12px] text-[var(--muted)]"
            >
              بستن
            </button>
          </div>
          <p className="mt-1.5 text-[15px] leading-7">{reply.body}</p>
          {reply.kind === "learn" && reply.href ? (
            <Link href={reply.href} className="mt-3 inline-flex min-h-10 items-center text-[14px] font-medium underline-offset-4 hover:underline">
              {reply.hrefLabel}
            </Link>
          ) : null}
          {reply.kind === "compare" ? (
            <Link
              href={`/compare?a=${reply.a}&b=${reply.b}`}
              className="pressable mt-3 inline-flex min-h-11 items-center rounded-xl bg-[var(--ink)] px-4 text-[14px] font-medium text-[var(--paper)]"
            >
              مقایسه این دو
            </Link>
          ) : null}
        </div>
      ) : null}
      <div className="rail fade-end -mx-4 flex gap-1.5 px-4 pb-2.5">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => ask(prompt)}
            className="pressable edge min-h-9 shrink-0 rounded-full border border-[var(--line)] bg-[var(--card)] px-3.5 text-[13px]"
          >
            {prompt}
          </button>
        ))}
      </div>
      <form
        className="flex items-center gap-1 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-1 ps-3 focus-within:border-[var(--ink)]"
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
          placeholder="بپرس یا پیشنهاد را اصلاح کن"
          enterKeyHint="send"
          className="min-h-11 min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-[#6b7470]"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          aria-label="بفرست"
          className="pressable solid grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--ink)] text-[var(--paper)] disabled:bg-[var(--line)] disabled:text-[var(--muted)]"
        >
          <SendIcon className="size-5" />
        </button>
      </form>
    </div>
  );
}
