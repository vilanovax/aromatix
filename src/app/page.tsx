"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ForwardIcon } from "@/components/Icons";
import { Shell } from "@/components/Shell";
import { parseLine } from "@/lib/assistant";
import { useAroma } from "@/lib/store";

const EXAMPLES = [
  { text: "مهمانی شب زمستون، تا ۸ میلیون", colors: ["#8C4A32", "#C4A574", "#A65D3F"] },
  { text: "محل کار، تابستون، زیر ۲ میلیون", colors: ["#6E93A3", "#7FA58A", "#C6B15A"] },
  { text: "شبیه ساواج برای هر روز", colors: ["#8E3D32", "#6E93A3", "#6E5436"] },
];

export default function HomePage() {
  const router = useRouter();
  const { setProfile } = useAroma();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState(false);

  function go(text: string) {
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
      <div className="flex min-h-full flex-col px-5 pt-10 pb-6">
        <h1 className="text-[1.9rem] font-bold leading-[1.4]">برای این موقعیت، چه بویی بهت می‌نشیند؟</h1>
        <p className="mt-3 max-w-[22rem] text-[15px] leading-7 text-[var(--muted)]">
          بگو کجا، چه فصلی و تا چه قیمتی. لازم نیست اسم نوت‌ها را بدانی.
        </p>

        <form
          className="mt-7"
          onSubmit={(event) => {
            event.preventDefault();
            go(draft);
          }}
        >
          <label htmlFor="wish" className="sr-only">
            توصیف عطر
          </label>
          <div
            className={`flex items-center gap-1 rounded-2xl border bg-[var(--card)] p-1 ps-3.5 shadow-[0_6px_20px_-14px_rgba(28,33,31,0.35)] focus-within:border-[var(--ink)] ${
              error ? "border-[var(--danger)]" : "border-[var(--line)]"
            }`}
          >
            <input
              id="wish"
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                setError(false);
              }}
              placeholder="مثلاً قرار، پاییز، تا ۵ میلیون"
              enterKeyHint="search"
              aria-invalid={error}
              aria-describedby={error ? "wish-error" : undefined}
              className="min-h-12 min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-[#6b7470]"
            />
            <button
              type="submit"
              className="pressable solid min-h-12 shrink-0 rounded-xl bg-[var(--ink)] px-5 text-[15px] font-semibold text-[var(--paper)]"
            >
              پیدا کن
            </button>
          </div>
          {error ? (
            <p id="wish-error" className="mt-2 text-[13px] text-[var(--danger)]">
              موقعیت، فصل یا بودجه را در همین خط بنویس؛ مثلاً «محل کار، تابستون».
            </p>
          ) : null}
        </form>

        <ul className="mt-4 flex flex-wrap gap-2" aria-label="نمونه‌ها">
          {EXAMPLES.map((example) => (
            <li key={example.text}>
              <button
                type="button"
                onClick={() => go(example.text)}
                className="pressable edge inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--card)] ps-2.5 pe-3.5 text-[13px]"
              >
                <span className="flex h-2 w-7 gap-px overflow-hidden rounded-full" aria-hidden="true">
                  {example.colors.map((color) => (
                    <span key={color} className="h-full flex-1" style={{ background: color }} />
                  ))}
                </span>
                {example.text}
              </button>
            </li>
          ))}
        </ul>

        <Link
          href="/guide"
          className="pressable edge mt-10 flex min-h-[4.5rem] items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--card)] px-4"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold">مطمئن نیستی چه بنویسی؟</span>
            <span className="mt-0.5 block text-[13px] text-[var(--muted)]">چهار سؤال کوتاه؛ حدود یک دقیقه</span>
          </span>
          <ForwardIcon className="size-5 shrink-0 text-[var(--muted)]" />
        </Link>

        <p className="mt-auto pt-12 text-[12px] leading-6 text-[var(--muted)]">
          نمونهٔ رابط برای جمع‌بندی. پیشنهادها از دادهٔ نمایشی چیده شده‌اند، نه از موتور اصلی.
        </p>
      </div>
    </Shell>
  );
}
