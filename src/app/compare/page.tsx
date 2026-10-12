"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { AccordMark } from "@/components/AccordMark";
import { Shell } from "@/components/Shell";
import {
  cheaperUnconfirmed,
  decisionFacts,
  getPerfume,
  leadOffer,
  performanceLabel,
  sweetness,
} from "@/lib/catalog";
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
          <h1 className="text-headline font-bold">دو عطر را انتخاب کن</h1>
          <p className="mt-3 text-body text-muted">
            روی کارت پیشنهاد، مقایسه را بزن. با دوتایی شدن، جدول کنار هم می‌آید.
          </p>
          <Link
            href="/results"
            className="pressable mt-5 inline-flex min-h-12 items-center rounded-panel bg-ink px-5 text-body leading-none font-medium text-paper"
          >
            رفتن به پیشنهادها
          </Link>
        </div>
      ) : (
        <CompareBody left={left} right={right} />
      )}
    </Shell>
  );
}

function CompareBody({ left, right }: { left: Perfume; right: Perfume }) {
  const facts = useMemo(() => decisionFacts(left, right), [left, right]);
  const leanSlug =
    facts.length === 1 ? (facts[0].name === left.nameFa ? left.slug : right.slug) : null;
  const diffs = useMemo(() => diffRows(left, right), [left, right]);
  const alike = useMemo(() => alikeLine(left, right), [left, right]);
  const notes = useMemo(() => sharedNotes(left, right), [left, right]);

  return (
    <div className="px-4 pt-5 pb-10">
      <h1 className="px-1 text-headline font-bold">
        {left.nameFa} یا {right.nameFa}؟
      </h1>

      <Decision facts={facts} />
      <p className="mt-3 px-1 text-body text-muted">{diffLine(left, right)}</p>

      <div className="mt-5 grid grid-cols-2 gap-2.5">
        {[left, right].map((perfume) => {
          const lean = leanSlug === perfume.slug;
          return (
            <Link
              key={perfume.slug}
              href={`/perfume/${perfume.slug}`}
              className={cn(
                "rounded-panel border p-3",
                lean ? "border-ink bg-card" : "border-line bg-card",
              )}
            >
              <span className="block text-title font-semibold">{perfume.nameFa}</span>
              <span className="mt-0.5 block text-label text-muted">{perfume.brand}</span>
              <span className="mt-3 block">
                <AccordMark accords={perfume.accords} />
              </span>
              <span className="mt-2.5 block text-body font-semibold">
                {millionToman(leadOffer(perfume).price)}
              </span>
            </Link>
          );
        })}
      </div>

      {diffs.length > 0 ? (
        <section className="mt-6" aria-labelledby="diff-title">
          <h2 id="diff-title" className="px-1 text-label font-semibold text-muted">
            تفاوت‌ها
          </h2>
          <div className="mt-2 overflow-x-auto overscroll-contain">
            <table className="w-full border-separate border-spacing-0 text-body">
              <thead>
                <tr className="text-label text-muted">
                  <th className="w-20 py-2 pe-2 text-start font-normal" />
                  <th className="px-2 py-2 text-start font-medium text-ink">{left.nameFa}</th>
                  <th className="px-2 py-2 text-start font-medium text-ink">{right.nameFa}</th>
                </tr>
              </thead>
              <tbody>
                {diffs.map((row) => (
                  <tr key={row.label} className="align-top">
                    <th className="sticky inset-inline-start-0 z-10 w-20 bg-paper py-3 pe-2 text-start text-label font-normal text-muted">
                      {row.label}
                    </th>
                    {row.values.map((value, index) => (
                      <td key={`${row.label}-${index}`} className="px-2 py-3 font-medium">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {alike ? (
        <p className="mt-5 px-1 text-label text-muted">
          مشترک: {alike}
        </p>
      ) : null}

      {notes ? (
        <p className="mt-2 px-1 text-label text-muted">
          نوت مشترک: {notes}
        </p>
      ) : (
        <p className="mt-2 px-1 text-label text-muted">نوت مشترکی در این نمونه نیست.</p>
      )}

      <p className="mt-5 px-1 text-label text-muted">
        قیمت‌ها از فروشگاهِ موجودِ تأییدشده است. جایی که داده نداریم، حدس نمی‌زنیم.
      </p>
      <UnverifiedPrices left={left} right={right} />
    </div>
  );
}

function Decision({ facts }: { facts: Array<{ name: string; fact: string }> }) {
  if (facts.length === 0) {
    return (
      <p className="mt-3 rounded-control bg-moss px-3 py-2.5 text-body">
        از روی قیمت تأییدشده و ماندگاری، این دو به هم نزدیک‌اند.
      </p>
    );
  }

  return (
    <ul className="mt-4 flex flex-col gap-2">
      {facts.map((item) => (
        <li key={item.name} className="rounded-panel bg-card px-4 py-3">
          <p className="text-body font-semibold">{item.name}</p>
          <p className="mt-0.5 text-label text-muted">{item.fact}</p>
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
    <ul className="mt-2 px-1 text-label text-muted">
      {notes.map((note) => (
        <li key={note}>{note}</li>
      ))}
    </ul>
  );
}

function diffRows(left: Perfume, right: Perfume) {
  const rows: Array<{ label: string; values: [string, string] }> = [];

  const longevity: [string, string] = [
    left.longevity ? performanceLabel("longevity", left.longevity) : "",
    right.longevity ? performanceLabel("longevity", right.longevity) : "",
  ];
  if (longevity[0] !== longevity[1] && (longevity[0] || longevity[1])) {
    rows.push({ label: "ماندگاری", values: longevity });
  }

  const sillage: [string, string] = [
    left.sillage ? performanceLabel("sillage", left.sillage) : "",
    right.sillage ? performanceLabel("sillage", right.sillage) : "",
  ];
  if (sillage[0] !== sillage[1] && (sillage[0] || sillage[1])) {
    rows.push({ label: "پخش بو", values: sillage });
  }

  const inspired: [string, string] = [inspiredName(left.inspiredBy), inspiredName(right.inspiredBy)];
  if (inspired[0] !== inspired[1] && (inspired[0] || inspired[1])) {
    rows.push({ label: "نزدیک به", values: inspired });
  }

  const seasons: [string, string] = [seasonText(left), seasonText(right)];
  if (seasons[0] !== seasons[1]) {
    rows.push({ label: "فصل", values: seasons });
  }

  const concentration: [string, string] = [left.concentration, right.concentration];
  if (concentration[0] !== concentration[1]) {
    rows.push({ label: "غلظت", values: concentration });
  }

  const volume: [string, string] = [
    `${faNum(left.volumeMl)} میلی‌لیتر`,
    `${faNum(right.volumeMl)} میلی‌لیتر`,
  ];
  if (volume[0] !== volume[1]) {
    rows.push({ label: "حجم", values: volume });
  }

  return rows;
}

function alikeLine(left: Perfume, right: Perfume) {
  const parts: string[] = [];
  if (left.concentration === right.concentration) parts.push(left.concentration);
  if (left.volumeMl === right.volumeMl) parts.push(`${faNum(left.volumeMl)} میلی‌لیتر`);
  if (seasonText(left) === seasonText(right)) parts.push(seasonText(left));
  return parts.join(" · ");
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
    return "از روی نوت‌های ثبت‌شده، حال‌وهوایشان نزدیک است.";
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

function sharedNotes(left: Perfume, right: Perfume) {
  const rightNotes = new Set(right.notes.map((note) => note.name));
  const names = [...new Set(left.notes.map((note) => note.name).filter((name) => rightNotes.has(name)))];
  return names.join("، ");
}
