"use client";

import { createContext, useContext, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { Flag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn, faNum } from "@/lib/format";
import { REPORT_TOPICS, type ReportTopicId } from "@/lib/reports";

type ReportState = {
  name: string;
  open: boolean;
  done: boolean;
  setOpen: (open: boolean) => void;
  topic: ReportTopicId;
  setTopic: (topic: ReportTopicId) => void;
  body: string;
  setBody: (body: string) => void;
  error: string | null;
  pending: boolean;
  submit: (event: React.FormEvent) => void;
};

const ReportContext = createContext<ReportState | null>(null);

function useReport() {
  const value = useContext(ReportContext);
  if (!value) throw new Error("ReportPerfume بیرون از محدوده استفاده شده.");
  return value;
}

export function ReportPerfume({ slug, name, children }: { slug: string; name: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState<ReportTopicId>("price");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, topic, body }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "گزارش ثبت نشد.");
        return;
      }
      setDone(true);
      setBody("");
    } catch {
      setError("الان گزارش ثبت نمی‌شود. کمی بعد دوباره امتحان کن.");
    } finally {
      setPending(false);
    }
  }

  return (
    <ReportContext.Provider value={{ name, open, done, setOpen, topic, setTopic, body, setBody, error, pending, submit }}>
      {children}
    </ReportContext.Provider>
  );
}

export function ReportPerfumeButton() {
  const { open, done, setOpen, name } = useReport();
  return (
    <Button
      type="button"
      variant={open ? "default" : "outline"}
      size="icon"
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-label={done ? `گزارش ${name} ثبت شد` : `گزارش اطلاعات اشتباه ${name}`}
      disabled={done}
      onClick={() => setOpen(true)}
      className={cn("min-h-11 min-w-11 shrink-0 rounded-full!", !open && "bg-card!")}
    >
      <Flag strokeWidth={2} aria-hidden="true" />
    </Button>
  );
}

export function ReportPerfumePanel() {
  const { name, open, done, topic, setTopic, body, setBody, error, pending, submit, setOpen } = useReport();
  const [mounted, setMounted] = useState(false);
  const titleId = useId();
  const supportId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const focus = window.setTimeout(() => {
      document.querySelector<HTMLElement>("[data-report-focus]")?.focus();
    }, 180);
    return () => {
      window.clearTimeout(focus);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="vf app fixed inset-0 z-50 flex items-end justify-center bg-transparent sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        aria-label="بستن گزارش"
        onClick={() => setOpen(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={supportId}
        className="vf app sheet-panel scroll-quiet relative z-10 max-h-[85dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-surface border border-border bg-card px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-surface sm:rounded-surface"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border sm:hidden" aria-hidden="true" />
        {done ? (
          <div className="pb-2">
            <h2 id={titleId} className="text-pretty text-title font-semibold">
              گزارش ثبت شد
            </h2>
            <p id={supportId} className="mt-2 text-pretty text-body text-muted-foreground">
              گزارش {name} در مدیریت بررسی می‌شود.
            </p>
            <Button type="button" size="lg" className="mt-5 min-h-12 w-full" onClick={() => setOpen(false)}>
              باشه
            </Button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <h2 id={titleId} className="text-pretty text-title font-semibold">
                  گزارش اطلاعات اشتباه
                </h2>
                <p id={supportId} className="mt-1 text-pretty text-body text-muted-foreground">
                  بگو کدام بخش {name} درست نیست.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="بستن"
                onClick={() => setOpen(false)}
                className="min-h-11 min-w-11 shrink-0 rounded-full!"
              >
                <X strokeWidth={2} aria-hidden="true" />
              </Button>
            </div>
            <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="موضوع گزارش">
              {REPORT_TOPICS.map((item) => {
                const selected = topic === item.id;
                return (
                  <Button
                    key={item.id}
                    type="button"
                    variant={selected ? "default" : "outline"}
                    aria-pressed={selected}
                    onClick={() => setTopic(item.id)}
                    className={cn("min-h-11 rounded-full! px-3 font-medium", !selected && "bg-card!")}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </div>
            <label className="mt-5 block">
              <span className="flex items-baseline justify-between gap-3">
                <span className="text-label font-medium">توضیح</span>
                <span className="text-label text-muted-foreground tabular-nums">
                  {body.trim().length < 8 ? `حداقل ${faNum(8)} نویسه` : `${faNum(body.trim().length)} نویسه`}
                </span>
              </span>
              <Textarea
                value={body}
                maxLength={400}
                onChange={(event) => setBody(event.target.value)}
                placeholder="مثلاً قیمت فروشگاه با این عدد یکی نیست."
                className="mt-2"
                data-report-focus
              />
            </label>
            {error ? (
              <p role="alert" className="mt-3 text-pretty text-label text-destructive">
                {error}
              </p>
            ) : null}
            <Button type="submit" size="lg" className="mt-5 min-h-12 w-full" disabled={pending || body.trim().length < 8}>
              {pending ? "در حال ثبت…" : "ثبت گزارش"}
            </Button>
            <Button type="button" variant="ghost" size="md" className="mt-1 min-h-11 w-full font-normal text-muted-foreground" onClick={() => setOpen(false)}>
              انصراف
            </Button>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}
