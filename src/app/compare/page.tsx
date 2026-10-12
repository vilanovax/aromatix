"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { AccordMark } from "@/components/AccordMark";
import { BrandLink } from "@/components/BrandLink";
import { ButtonLink } from "@/components/Button";
import { Card, Note } from "@/components/Card";
import { Shell } from "@/components/Shell";
import {
  cheaperUnconfirmed,
  decisionVerdict,
  getPerfume,
  leadOffer,
  performanceLabel,
  sweetness,
} from "@/lib/catalog";
import { cn, faNum, millionToman } from "@/lib/format";
import { perfumeHref } from "@/lib/nav";
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
          <p className="mt-3 max-w-[22rem] text-pretty text-body text-muted">
            روی پیشنهادها یا صفحهٔ عطر، «مقایسه» را بزن. با دوتایی شدن، نوار پایین جدول را باز می‌کند.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <ButtonLink href="/results" size="md" className="px-5">
              پیشنهادها
            </ButtonLink>
            <ButtonLink href="/shelf" variant="edge" size="md" className="px-5">
              آرومای من
            </ButtonLink>
          </div>
        </div>
      ) : (
        <CompareBody left={left} right={right} />
      )}
    </Shell>
  );
}

function CompareBody({ left, right }: { left: Perfume; right: Perfume }) {
  const verdict = useMemo(() => decisionVerdict(left, right), [left, right]);
  const diffs = useMemo(() => diffRows(left, right), [left, right]);
  const alike = useMemo(() => alikeLine(left, right), [left, right]);
  const notes = useMemo(() => sharedNotes(left, right), [left, right]);
  const scent = useMemo(() => diffLine(left, right), [left, right]);
  const fromPath = `/compare?a=${left.slug}&b=${right.slug}`;

  return (
    <div className="px-4 pt-5 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      <h1 className="px-1 text-balance text-headline font-bold">
        {left.nameFa} یا {right.nameFa}؟
      </h1>

      <Note className="mt-3 text-pretty">{verdict.body}</Note>
      {scent ? <p className="mt-3 px-1 text-pretty text-body text-muted">{scent}</p> : null}

      <div className="mt-5 grid grid-cols-2 gap-2.5">
        {[left, right].map((perfume) => {
          const lean = verdict.leanSlug === perfume.slug;
          const href = perfumeHref(perfume.slug, fromPath);
          return (
            <Card
              key={perfume.slug}
              as="div"
              shadow={lean ? "card" : "none"}
              className={cn("p-3.5", lean ? "border-ink" : undefined)}
            >
              <Link
                href={href}
                className="block rounded-control outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
              >
                <span className="block text-title font-semibold">{perfume.nameFa}</span>
              </Link>
              <span className="mt-0.5 block text-label">
                <BrandLink name={perfume.brand} from={perfume.slug} />
              </span>
              <Link
                href={href}
                className="mt-3 block rounded-control outline-offset-2 focus-visible:outline-2 focus-visible:outline-ink"
              >
                <AccordMark accords={perfume.accords} />
                <span className="mt-2.5 block text-body font-semibold">{millionToman(leadOffer(perfume).price)}</span>
              </Link>
            </Card>
          );
        })}
      </div>

      {diffs.length > 0 ? (
        <section className="mt-7" aria-labelledby="diff-title">
          <h2 id="diff-title" className="px-1 text-title font-semibold">
            تفاوت‌ها
          </h2>
          <div className="mt-2 grid grid-cols-2 gap-2.5 px-1 text-label text-muted" aria-hidden="true">
            <span>{left.nameFa}</span>
            <span>{right.nameFa}</span>
          </div>
          <Card className="mt-2 overflow-hidden p-0">
            {diffs.map((row, index) => (
              <div
                key={row.label}
                className={cn("px-3.5 py-3", index > 0 && "border-t border-line")}
              >
                <p className="text-label text-muted">{row.label}</p>
                <div className="mt-1.5 grid grid-cols-2 gap-2.5 text-body">
                  {row.values.map((value, valueIndex) => (
                    <p
                      key={`${row.label}-${valueIndex}`}
                      className={cn(
                        "min-w-0 text-pretty",
                        value === "—" ? "text-muted" : "font-medium text-ink",
                      )}
                    >
                      {value}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </Card>
        </section>
      ) : null}

      <SharedBlock alike={alike} notes={notes} leftName={left.nameFa} rightName={right.nameFa} />

      <p className="mt-6 px-1 text-pretty text-label text-muted">
        قیمت‌ها از فروشگاهِ موجودِ تأییدشده است. جایی که داده نداریم، حدس نمی‌زنیم.
      </p>
      <UnverifiedPrices left={left} right={right} />
    </div>
  );
}

function SharedBlock({
  alike,
  notes,
  leftName,
  rightName,
}: {
  alike: string;
  notes: string;
  leftName: string;
  rightName: string;
}) {
  return (
    <section className="mt-7" aria-labelledby="shared-title">
      <h2 id="shared-title" className="px-1 text-pretty text-title font-semibold">
        مشترک بین {leftName} و {rightName}
      </h2>
      <Card className="mt-2 px-4 py-3.5">
        {alike ? (
          <div>
            <p className="text-label text-muted">مشخصات</p>
            <p className="mt-1 text-pretty text-body">{alike}</p>
          </div>
        ) : null}
        <div className={alike ? "mt-3 border-t border-line pt-3" : undefined}>
          <p className="text-label text-muted">نوت‌ها</p>
          <p className="mt-1 text-pretty text-body">{notes || "نوت مشترکی در این نمونه نیست."}</p>
        </div>
      </Card>
    </section>
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
    <ul className="mt-2 space-y-1 px-1 text-pretty text-label text-muted">
      {notes.map((note) => (
        <li key={note}>{note}</li>
      ))}
    </ul>
  );
}

function diffRows(left: Perfume, right: Perfume) {
  const rows: Array<{ label: string; values: [string, string] }> = [];

  const longevity: [string, string] = [
    left.longevity ? performanceLabel("longevity", left.longevity) : "—",
    right.longevity ? performanceLabel("longevity", right.longevity) : "—",
  ];
  if (longevity[0] !== longevity[1]) {
    rows.push({ label: "ماندگاری", values: longevity });
  }

  const sillage: [string, string] = [
    left.sillage ? performanceLabel("sillage", left.sillage) : "—",
    right.sillage ? performanceLabel("sillage", right.sillage) : "—",
  ];
  if (sillage[0] !== sillage[1]) {
    rows.push({ label: "پخش بو", values: sillage });
  }

  const inspired: [string, string] = [
    inspiredName(left.inspiredBy) || "—",
    inspiredName(right.inspiredBy) || "—",
  ];
  if (inspired[0] !== inspired[1]) {
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
    return "";
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
