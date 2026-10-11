"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AccordMark } from "@/components/AccordMark";
import { ScentMark } from "@/components/Bottle";
import { ForwardIcon } from "@/components/Icons";
import { Shell } from "@/components/Shell";
import { TasteRow } from "@/components/TasteRow";
import { cheaperUnconfirmed, getPerfume, leadOffer, performanceLabel, sharedAccordNames } from "@/lib/catalog";
import { faNum, joinFa, millionToman } from "@/lib/format";
import { useAroma } from "@/lib/store";
import type { Perfume } from "@/lib/types";

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

  const offer = leadOffer(perfume);
  const cheaper = cheaperUnconfirmed(perfume);
  const similars = perfume.similar.map((slug) => getPerfume(slug)).filter((item) => item !== undefined);

  return (
    <Shell composer back={{ href: "/results", label: "پیشنهادها" }}>
      <article className="px-5 pt-4 pb-10">
        <ScentMark perfume={perfume} className="h-36 w-full rounded-3xl" />
        <h1 className="mt-5 text-[1.7rem] font-bold leading-tight">{perfume.nameFa}</h1>
        <p className="mt-1 text-[15px] text-(--muted)">{perfume.brand}</p>
        <p dir="ltr" className="text-end text-[12px] text-(--muted)">
          {perfume.nameEn}
        </p>
        <p className="mt-3 text-[13px] leading-6 text-(--muted)">
          {perfume.concentration} · {faNum(perfume.volumeMl)} میلی‌لیتر
        </p>

        <div className="mt-6">
          <AccordMark accords={perfume.accords} labeled />
        </div>

        <div className="mt-6 rounded-2xl bg-(--card) px-4 py-3.5">
          <p className="text-[12px] font-semibold text-(--muted)">چرا این عطر؟</p>
          <p className="mt-1.5 text-[16px] leading-8">{perfume.why}</p>
        </div>

        <section className="mt-8">
          <h2 className="text-[15px] font-semibold">نوت‌ها</h2>
          <dl className="mt-3 space-y-3">
            {LAYERS.map((layer) => {
              const notes = perfume.notes.filter((note) => note.layer === layer.id);
              if (notes.length === 0) return null;
              return (
                <div key={layer.id} className="flex gap-3 text-[14px] leading-7">
                  <dt className="w-14 shrink-0 text-(--muted)">{layer.label}</dt>
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

        <dl className="mt-8 divide-y divide-(--line) rounded-2xl border border-(--line) bg-(--card) px-4">
          <Fact label="فصل" value={perfume.seasons.includes("all") ? "همهٔ فصل‌ها" : perfume.seasons.map(seasonName).join("، ")} />
          {perfume.longevity ? <Fact label="ماندگاری" value={performanceLabel("longevity", perfume.longevity)} /> : null}
          {perfume.sillage ? <Fact label="پخش بو" value={performanceLabel("sillage", perfume.sillage)} /> : null}
          {perfume.inspiredBy ? <Fact label="نزدیک به" value={inspiredName(perfume.inspiredBy)} /> : null}
        </dl>
        <p className="mt-3 text-[12px] leading-6 text-(--muted)">
          شباهت بر اساس نوت‌های ثبت‌شده در آروماست، نه محصول برند اصلی.
        </p>

        <button
          type="button"
          onClick={() => openShops(perfume.slug)}
          className="pressable solid mt-6 flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl bg-(--ink) px-4 text-start text-(--paper)"
        >
          <span>
            <span className="block text-[15px] font-semibold">
              {offer ? `از ${millionToman(offer.price)}` : "فروشگاه‌ها"}
            </span>
            {offer ? (
              <span className="mt-0.5 block text-[12px] text-(--paper)/75">
                {offer.shop}
                {offer.stockConfirmed ? "، موجود" : "، موجودی تأیید نشده"}
              </span>
            ) : null}
          </span>
          <span className="inline-flex shrink-0 items-center text-[13px]">
            فروشگاه‌ها
            <ForwardIcon className="size-4" />
          </span>
        </button>
        {cheaper ? (
          <p className="mt-2 text-[12px] leading-6 text-(--muted)">
            در {cheaper.shop} {millionToman(cheaper.price)}، موجودی تأیید نشده
          </p>
        ) : null}

        <div className="mt-4">
          <TasteRow slug={perfume.slug} />
        </div>

        {similars.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-[15px] font-semibold">مشابه‌ها</h2>
            <div className="rail fade-end -mx-5 mt-3 flex gap-3 px-5 pb-1">
              {similars.map((item) => (
                <Link key={item.slug} href={`/perfume/${item.slug}`} className="w-36 shrink-0">
                  <ScentMark perfume={item} className="h-28 w-full rounded-2xl" />
                  <p className="mt-2 text-[14px] font-semibold">{item.nameFa}</p>
                  <p className="text-[12px] text-(--muted)">{item.brand}</p>
                  <p className="mt-1 text-[12px] leading-5 text-(--muted)">{likeness(perfume, item)}</p>
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
    <div className="flex gap-3 py-3.5 text-[14px]">
      <dt className="w-20 shrink-0 text-(--muted)">{label}</dt>
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

function likeness(current: Perfume, other: Perfume) {
  const accords = sharedAccordNames(current, other);
  if (accords.length > 0) return `هر دو ${joinFa(accords)} دارند`;
  const notes = new Set(other.notes.map((note) => note.name));
  const shared = [...new Set(current.notes.map((note) => note.name).filter((name) => notes.has(name)))];
  if (shared.length > 0) return `نوت مشترک: ${joinFa(shared)}`;
  return "در همین خانواده آمده";
}

function inspiredName(id: string) {
  if (id === "sauvage") return "ساواج الکسیر";
  if (id === "aventus") return "اونتوس";
  if (id === "angels") return "آنجلز شیر";
  return id;
}
