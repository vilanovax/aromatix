"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AccordMark } from "@/components/AccordMark";
import { Bottle } from "@/components/Bottle";
import { Shell } from "@/components/Shell";
import { TasteRow } from "@/components/TasteRow";
import { getPerfume, performanceLabel } from "@/lib/catalog";
import { faNum } from "@/lib/format";
import { useAroma } from "@/lib/store";

const LAYERS = [
  { id: "top", label: "شروع" },
  { id: "middle", label: "میانه" },
  { id: "base", label: "پایه" },
] as const;

export default function PerfumePage() {
  const params = useParams<{ slug: string }>();
  const perfume = getPerfume(params.slug);
  const { openShops } = useAroma();

  if (!perfume) {
    return (
      <Shell back={{ href: "/results", label: "پیشنهادها" }}>
        <div className="px-5 py-10">
          <h1 className="text-xl font-bold">این عطر در نمونه نیست.</h1>
          <Link href="/results" className="mt-4 inline-flex min-h-11 items-center text-[15px] font-medium">
            برگشت به پیشنهادها
          </Link>
        </div>
      </Shell>
    );
  }

  const similars = perfume.similar.map((slug) => getPerfume(slug)).filter((item) => item !== undefined);

  return (
    <Shell composer back={{ href: "/results", label: "پیشنهادها" }}>
      <article className="px-5 pt-5 pb-10">
        <Bottle perfume={perfume} className="h-64 w-full rounded-3xl" />
        <h1 className="mt-5 text-[1.7rem] font-bold leading-tight">{perfume.nameFa}</h1>
        <p className="mt-1 text-[15px] text-[var(--muted)]">{perfume.brand}</p>
        <p dir="ltr" className="text-end text-[12px] text-[var(--muted)]">
          {perfume.nameEn}
        </p>
        <p className="mt-3 text-[13px] text-[var(--muted)]">
          {perfume.concentration}، {faNum(perfume.volumeMl)} میلی‌لیتر، در فروشگاه‌ها {perfume.marketGender} ثبت شده
        </p>
        <div className="mt-6">
          <AccordMark accords={perfume.accords} labeled />
        </div>
        <p className="mt-6 text-[16px] leading-8">{perfume.why}</p>
        <section className="mt-8">
          <h2 className="text-[15px] font-semibold">نوت‌ها</h2>
          <dl className="mt-3 space-y-3">
            {LAYERS.map((layer) => {
              const notes = perfume.notes.filter((note) => note.layer === layer.id);
              if (notes.length === 0) return null;
              return (
                <div key={layer.id} className="flex gap-3 text-[14px] leading-7">
                  <dt className="w-14 shrink-0 text-[var(--muted)]">{layer.label}</dt>
                  <dd>
                    {notes.map((note, index) => (
                      <span key={note.name}>
                        {index > 0 ? "، " : null}
                        {note.name === "وتیور" ? (
                          <Link href="/notes/vetiver" className="underline-offset-4 hover:underline">
                            وتیور
                          </Link>
                        ) : (
                          note.name
                        )}
                      </span>
                    ))}
                  </dd>
                </div>
              );
            })}
          </dl>
        </section>
        <dl className="mt-8 space-y-2 text-[14px]">
          <Fact label="فصل" value={perfume.seasons.includes("all") ? "همهٔ فصل‌ها" : perfume.seasons.map(seasonName).join("، ")} />
          {perfume.longevity ? <Fact label="ماندگاری" value={performanceLabel("longevity", perfume.longevity)} /> : null}
          {perfume.sillage ? <Fact label="پخش بو" value={performanceLabel("sillage", perfume.sillage)} /> : null}
          {perfume.inspiredBy ? <Fact label="نزدیک به" value={inspiredName(perfume.inspiredBy)} /> : null}
        </dl>
        <p className="mt-4 text-[12px] leading-6 text-[var(--muted)]">شباهت بر اساس نوت‌های ثبت‌شده در آروماست، نه محصول برند اصلی.</p>
        <button
          type="button"
          onClick={() => openShops(perfume.slug)}
          className="pressable solid mt-6 min-h-12 w-full rounded-2xl bg-[var(--ink)] text-[15px] font-semibold text-[var(--paper)]"
        >
          فروشگاه‌ها
        </button>
        <div className="mt-4">
          <TasteRow slug={perfume.slug} />
        </div>
        {similars.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-[15px] font-semibold">مشابه‌ها</h2>
            <div className="rail -mx-5 mt-3 flex gap-3 px-5 pb-1">
              {similars.map((item) => (
                <Link key={item.slug} href={`/perfume/${item.slug}`} className="w-36 shrink-0">
                  <Bottle perfume={item} className="h-40 w-full rounded-2xl" />
                  <p className="mt-2 text-[14px] font-medium">{item.nameFa}</p>
                  <p className="text-[12px] text-[var(--muted)]">{item.brand}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </Shell>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-20 shrink-0 text-[var(--muted)]">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function seasonName(id: string) {
  if (id === "summer") return "تابستان";
  if (id === "winter") return "زمستان";
  if (id === "mild") return "معتدل";
  return "همهٔ فصل‌ها";
}

function inspiredName(id: string) {
  if (id === "sauvage") return "ساواج الکسیر";
  if (id === "aventus") return "اونتوس";
  if (id === "angels") return "آنجلز شیر";
  return id;
}
