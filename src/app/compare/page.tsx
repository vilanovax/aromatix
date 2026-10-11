"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Bottle } from "@/components/Bottle";
import { Shell } from "@/components/Shell";
import { getPerfume, performanceLabel } from "@/lib/catalog";
import { faNum, millionToman } from "@/lib/format";
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
          <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">روی کارت پیشنهاد، مقایسه را بزن. با دوتایی شدن، جدول کنار هم می‌آید.</p>
          <Link href="/results" className="pressable mt-5 inline-flex min-h-12 items-center rounded-2xl bg-[var(--ink)] px-5 text-[15px] font-medium text-[var(--paper)]">
            رفتن به پیشنهادها
          </Link>
        </div>
      ) : (
        <div className="px-4 pt-5 pb-10">
          <h1 className="px-1 text-[1.4rem] font-bold">مقایسه</h1>
          <div className="mt-4 overflow-x-auto overscroll-contain">
            <table className="w-full min-w-[22rem] border-separate border-spacing-0 text-[14px]">
              <thead>
                <tr>
                  <th className="sticky inset-inline-start-0 z-10 w-24 bg-[var(--paper)]" />
                  {[left, right].map((perfume) => (
                    <th key={perfume.slug} className="min-w-36 px-2 pb-3 text-start font-medium">
                      <Link href={`/perfume/${perfume.slug}`}>
                        <Bottle perfume={perfume} className="h-28 w-20 rounded-xl" />
                        <span className="mt-2 block">{perfume.nameFa}</span>
                        <span className="mt-0.5 block text-[12px] font-normal text-[var(--muted)]">{perfume.brand}</span>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <Row label="قیمت" values={[left, right].map((perfume) => millionToman(Math.min(...perfume.shops.map((shop) => shop.price))))} />
                <Row label="غلظت" values={[left.concentration, right.concentration]} />
                <Row label="حجم" values={[left, right].map((perfume) => `${faNum(perfume.volumeMl)} میلی‌لیتر`)} />
                <Row label="فصل" values={[left, right].map(seasonText)} />
                <Row label="ماندگاری" values={[left, right].map((perfume) => (perfume.longevity ? performanceLabel("longevity", perfume.longevity) : ""))} />
                <Row label="پخش بو" values={[left, right].map((perfume) => (perfume.sillage ? performanceLabel("sillage", perfume.sillage) : ""))} />
                <Row label="نزدیک به" values={[left, right].map((perfume) => inspiredName(perfume.inspiredBy))} />
                <Row label="نوت مشترک" values={[shared(left, right), ""]} span />
              </tbody>
            </table>
          </div>
          <p className="mt-4 px-1 text-[12px] leading-6 text-[var(--muted)]">جایی که داده نداریم، ردیف را با حدس پر نمی‌کنیم.</p>
        </div>
      )}
    </Shell>
  );
}

function Row({ label, values, span = false }: { label: string; values: string[]; span?: boolean }) {
  if (!span && values.every((value) => value.length === 0)) return null;
  return (
    <tr className="align-top">
      <th className="sticky inset-inline-start-0 z-10 bg-[var(--paper)] py-3 pe-2 text-start text-[13px] font-normal text-[var(--muted)]">{label}</th>
      {span ? (
        <td colSpan={2} className="px-2 py-3 leading-7">
          {values[0] || "نوت مشترکی در این نمونه نیست."}
        </td>
      ) : (
        values.map((value, index) => (
          <td key={`${label}-${index}`} className="px-2 py-3 leading-7">
            {value}
          </td>
        ))
      )}
    </tr>
  );
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
