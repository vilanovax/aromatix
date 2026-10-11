"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AccordMark } from "@/components/AccordMark";
import { ScentMark } from "@/components/Bottle";
import { Shell } from "@/components/Shell";
import { cheaperUnconfirmed, decisionFacts, getPerfume, leadOffer, performanceLabel, sweetness } from "@/lib/catalog";
import { cn, faNum, millionToman } from "@/lib/format";
import { useAroma } from "@/lib/store";
import type { Perfume } from "@/lib/types";

export default function ComparePage() {
  return (
    <Suspense>
      <CompareScreen />
    </Suspense>
  );
}

function CompareScreen() {
  const params = useSearchParams();
  const { compare } = useAroma();
  const a = params.get("a") ?? compare[0];
  const b = params.get("b") ?? compare[1];
  const left = a ? getPerfume(a) : undefined;
  const right = b ? getPerfume(b) : undefined;

  return (
    <Shell composer back={{ href: "/results", label: "پیشنهادها" }}>
      {!left || !right || left.slug === right.slug ? (
        <div className="px-5 py-8">
          <h1 className="text-[1.4rem] font-bold">دو عطر را انتخاب کن</h1>
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
            روی کارت پیشنهاد، مقایسه را بزن. با دوتایی شدن، جدول کنار هم می‌آید.
          </p>
          <Link
            href="/results"
            className="pressable mt-5 inline-flex min-h-12 items-center rounded-2xl bg-[var(--ink)] px-5 text-[15px] font-medium text-[var(--paper)]"
          >
            رفتن به پیشنهادها
          </Link>
        </div>
      ) : (
        <div className="px-4 pt-5 pb-10">
          <h1 className="px-1 text-[1.4rem] font-bold">
            {left.nameFa} یا {right.nameFa}؟
          </h1>
          <Decision left={left} right={right} />
          <p className="mt-3 px-1 text-[14px] leading-7 text-[var(--muted)]">{diffLine(left, right)}</p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {[left, right].map((perfume) => (
              <Link key={perfume.slug} href={`/perfume/${perfume.slug}`} className="rounded-2xl bg-[var(--card)] p-3">
                <ScentMark perfume={perfume} className="mx-auto h-24 w-full rounded-xl" />
                <span className="mt-2 block text-center text-[15px] font-semibold">{perfume.nameFa}</span>
                <span className="mt-0.5 block text-center text-[12px] text-[var(--muted)]">{perfume.brand}</span>
                <span className="mt-3 block">
                  <AccordMark accords={perfume.accords} />
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-5 overflow-x-auto overscroll-contain">
            <table className="w-full min-w-[22rem] border-separate border-spacing-0 text-[14px]">
              <tbody>
                <Row
                  label="چرا"
                  values={[left.why, right.why]}
                />
                <Row
                  label="قیمت"
                  values={[left, right].map((perfume) => millionToman(leadOffer(perfume).price))}
                />
                <Row label="غلظت" values={[left.concentration, right.concentration]} />
                <Row label="حجم" values={[left, right].map((perfume) => `${faNum(perfume.volumeMl)} میلی‌لیتر`)} />
                <Row label="فصل" values={[left, right].map(seasonText)} />
                <Row
                  label="ماندگاری"
                  values={[left, right].map((perfume) =>
                    perfume.longevity ? performanceLabel("longevity", perfume.longevity) : "",
                  )}
                />
                <Row
                  label="پخش بو"
                  values={[left, right].map((perfume) =>
                    perfume.sillage ? performanceLabel("sillage", perfume.sillage) : "",
                  )}
                />
                <Row label="نزدیک به" values={[left, right].map((perfume) => inspiredName(perfume.inspiredBy))} />
                <Row label="نوت مشترک" values={[shared(left, right), ""]} span />
              </tbody>
            </table>
          </div>
          <p className="mt-4 px-1 text-[12px] leading-6 text-[var(--muted)]">
            قیمت‌ها همان فروشگاهِ موجودِ تأییدشده است. جایی که داده نداریم، ردیف را با حدس پر نمی‌کنیم.
          </p>
          <UnverifiedPrices left={left} right={right} />
        </div>
      )}
    </Shell>
  );
}

function Decision({ left, right }: { left: Perfume; right: Perfume }) {
  const facts = decisionFacts(left, right);
  if (facts.length === 0) {
    return (
      <p className="mt-3 rounded-xl bg-[var(--moss)] px-3 py-2.5 text-[14px] leading-7">
        از روی قیمت تأییدشده و ماندگاری، این دو به هم نزدیک‌اند.
      </p>
    );
  }

  return (
    <ul className="mt-4 flex flex-col gap-2">
      {facts.map((item) => (
        <li key={item.name} className="rounded-2xl bg-[var(--card)] px-4 py-3">
          <p className="text-[15px] font-semibold">{item.name}</p>
          <p className="mt-0.5 text-[14px] leading-6 text-[var(--muted)]">{item.fact}</p>
        </li>
      ))}
    </ul>
  );
}

function UnverifiedPrices({ left, right }: { left: Perfume; right: Perfume }) {
  const notes = [left, right].flatMap((perfume) => {
    const cheaper = cheaperUnconfirmed(perfume);
    if (!cheaper) return [];
    return [`${perfume.nameFa}: در ${cheaper.shop} ${millionToman(cheaper.price)}، موجودی تأیید نشده`];
  });
  if (notes.length === 0) return null;
  return (
    <ul className="mt-2 px-1 text-[12px] leading-6 text-[var(--muted)]">
      {notes.map((note) => (
        <li key={note}>{note}</li>
      ))}
    </ul>
  );
}

function Row({ label, values, span = false }: { label: string; values: string[]; span?: boolean }) {
  if (!span && values.every((value) => value.length === 0)) return null;
  return (
    <tr className="align-top">
      <th className="sticky inset-inline-start-0 z-10 w-20 bg-[var(--paper)] py-3 pe-2 text-start text-[13px] font-normal text-[var(--muted)]">
        {label}
      </th>
      {span ? (
        <td colSpan={2} className="px-2 py-3 leading-7">
          {values[0] || "نوت مشترکی در این نمونه نیست."}
        </td>
      ) : (
        values.map((value, index) => (
          <td
            key={`${label}-${index}`}
            className={cn("px-2 py-3 leading-7", values[0] === values[1] ? "text-[var(--muted)]" : "font-medium")}
          >
            {value}
          </td>
        ))
      )}
    </tr>
  );
}

function diffLine(left: Perfume, right: Perfume) {
  const leftSweet = sweetness(left);
  const rightSweet = sweetness(right);
  if (Math.abs(leftSweet - rightSweet) < 0.08) {
    const leftLead = left.accords[0]?.name;
    const rightLead = right.accords[0]?.name;
    if (leftLead && rightLead && leftLead !== rightLead) {
      return `${left.nameFa} با ${leftLead} باز می‌شود؛ ${right.nameFa} با ${rightLead}.`;
    }
    return "از روی نوت‌های ثبت‌شده، حال‌وهوایشان نزدیک است. جزئیات پایین را ببین.";
  }
  const sweeter = leftSweet > rightSweet ? left : right;
  const drier = sweeter.slug === left.slug ? right : left;
  return `${sweeter.nameFa} شیرین‌تر حس می‌شود؛ ${drier.nameFa} خشک‌تر و کمتر شیرین است.`;
}

function seasonText(perfume: Perfume) {
  if (perfume.seasons.includes("all")) return "همهٔ فصل‌ها";
  return perfume.seasons
    .map((season) => (season === "summer" ? "تابستان" : season === "winter" ? "زمستان" : "معتدل"))
    .join("، ");
}

function inspiredName(id?: string) {
  if (id === "sauvage") return "ساواج الکسیر";
  if (id === "aventus") return "اونتوس";
  if (id === "angels") return "آنجلز شیر";
  return "";
}

function shared(left: Perfume, right: Perfume) {
  const rightNotes = new Set(right.notes.map((note) => note.name));
  const names = [...new Set(left.notes.map((note) => note.name).filter((name) => rightNotes.has(name)))];
  return names.join("، ");
}
