"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Scale } from "lucide-react";
import { AccordMark } from "@/components/AccordMark";
import { Shell } from "@/components/Shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Separator } from "@/components/ui/separator";
import {
  cheaperUnconfirmed,
  decisionVerdict,
  getPerfume,
  isPublicPerfume,
  publicLead,
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
  const leftPerfume = a ? getPerfume(a) : undefined;
  const rightPerfume = b ? getPerfume(b) : undefined;
  const left = isPublicPerfume(leftPerfume) ? leftPerfume : undefined;
  const right = isPublicPerfume(rightPerfume) ? rightPerfume : undefined;

  return (
    <Shell composer back={{ href: "/results", label: "پیشنهادها" }}>
      {!left || !right || left.slug === right.slug ? (
        <EmptyState
          className="vf app mx-5 my-8"
          icon={Scale}
          title="دو عطر را انتخاب کن"
          description="روی پیشنهادها یا صفحهٔ عطر، «مقایسه» را بزن. با دوتایی شدن، نوار پایین جدول را باز می‌کند."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button href="/results" className="min-h-11">
                پیشنهادها
              </Button>
              <Button href="/shelf" variant="outline" className="min-h-11">
                آرومای من
              </Button>
            </div>
          }
        />
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
    <div className="vf app px-4 pt-5 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      <h1 className="px-1 text-balance text-headline font-bold">
        {left.nameFa} یا {right.nameFa}؟
      </h1>

      <Alert className="mt-3">{verdict.body}</Alert>
      {scent ? <p className="mt-3 px-1 text-pretty text-body text-muted-foreground">{scent}</p> : null}

      <div className="mt-5 grid grid-cols-2 gap-3">
        {[left, right].map((perfume) => {
          const lean = verdict.leanSlug === perfume.slug;
          const href = perfumeHref(perfume.slug, fromPath);
          const offer = publicLead(perfume);
          return (
            <Card key={perfume.slug} className={cn("p-0", lean && "ring-2 ring-primary")}>
              <Link
                href={href}
                className="block p-4 outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
              >
                <span className="block text-title font-semibold">{perfume.nameFa}</span>
                <span className="mt-1 block text-label text-muted-foreground">{perfume.brand}</span>
                <span className="mt-3 block">
                  <AccordMark accords={perfume.accords} />
                </span>
                <span className="mt-3 block text-body font-semibold">{offer ? millionToman(offer.price) : "—"}</span>
              </Link>
            </Card>
          );
        })}
      </div>

      {diffs.length > 0 ? (
        <section className="mt-8" aria-labelledby="diff-title">
          <h2 id="diff-title" className="px-1 text-title font-semibold">
            تفاوت‌ها
          </h2>
          <div className="mt-2 grid grid-cols-2 gap-3 px-1 text-start text-label text-muted-foreground" aria-hidden="true">
            <span>{left.nameFa}</span>
            <span>{right.nameFa}</span>
          </div>
          <Card className="mt-2 px-4 py-1">
            {diffs.map((row, index) => (
              <div key={row.label}>
                {index > 0 ? <Separator /> : null}
                <div className="py-3">
                  <p className="text-label text-muted-foreground">{row.label}</p>
                  <div className="mt-2 grid grid-cols-2 gap-3 text-body">
                    {row.values.map((value, valueIndex) => (
                      <p
                        key={`${row.label}-${valueIndex}`}
                        className={cn(
                          "min-w-0 text-pretty",
                          value === "—" ? "text-muted-foreground" : "font-medium text-foreground",
                        )}
                      >
                        {value}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </section>
      ) : null}

      <SharedBlock alike={alike} notes={notes} leftName={left.nameFa} rightName={right.nameFa} />

      <p className="mt-6 px-1 text-pretty text-label text-muted-foreground">
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
    <section className="mt-8" aria-labelledby="shared-title">
      <h2 id="shared-title" className="px-1 text-pretty text-title font-semibold">
        مشترک بین {leftName} و {rightName}
      </h2>
      <Card className="mt-2 px-4 py-4">
        {alike ? (
          <div>
            <p className="text-label text-muted-foreground">مشخصات</p>
            <p className="mt-1 text-pretty text-body">{alike}</p>
          </div>
        ) : null}
        {alike ? <Separator className="my-3" /> : null}
        <div>
          <p className="text-label text-muted-foreground">نوت‌ها</p>
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
    <Alert variant="warning" className="mt-3">
      <ul className="space-y-1">
        {notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </Alert>
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
