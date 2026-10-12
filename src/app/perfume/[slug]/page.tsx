"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AccordMark } from "@/components/AccordMark";
import { PerfumePhoto } from "@/components/Bottle";
import { CheckIcon, ForwardIcon } from "@/components/Icons";
import { Shell } from "@/components/Shell";
import { TasteRow } from "@/components/TasteRow";
import { cheaperUnconfirmed, getPerfume, leadOffer, performanceLabel, sharedAccordNames } from "@/lib/catalog";
import { cn, faNum, joinFa, millionToman } from "@/lib/format";
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
  const { openShops, compare, toggleCompare } = useAroma();

  if (!perfume) {
    return (
      <Shell back={{ href: "/results", label: "پیشنهادها" }}>
        <div className="px-5 py-10">
          <h1 className="text-headline font-bold">این عطر در نمونه نیست.</h1>
          <p className="mt-2 text-body text-muted">از پیشنهادها یکی را باز کن یا دوباره جستجو کن.</p>
          <Link
            href="/results"
            className="pressable solid mt-5 inline-flex min-h-12 items-center rounded-panel bg-ink px-5 text-body leading-none font-semibold text-paper"
          >
            برگشت به پیشنهادها
          </Link>
        </div>
      </Shell>
    );
  }

  const offer = leadOffer(perfume);
  const cheaper = cheaperUnconfirmed(perfume);
  const similars = perfume.similar.map((slug) => getPerfume(slug)).filter((item) => item !== undefined);
  const season = perfume.seasons.includes("all")
    ? "همهٔ فصل‌ها"
    : perfume.seasons.map(seasonName).join("، ");
  const picked = compare.includes(perfume.slug);

  return (
    <Shell composer back={{ href: "/results", label: "پیشنهادها" }}>
      <article className="step-in px-5 pt-4 pb-10">
        <figure className="overflow-hidden rounded-sheet">
          <PerfumePhoto
            perfume={perfume}
            sizes="hero"
            className="flex h-48 w-full items-center justify-center sm:h-56"
            imgClassName="max-h-[92%] py-3"
          />
        </figure>

        <header className="mt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-display font-bold">{perfume.nameFa}</h1>
              <p className="mt-1 text-body text-muted">
                {perfume.brand}
                <span className="mx-1.5 text-muted/40">،</span>
                <span dir="ltr" className="inline-block">
                  {perfume.nameEn}
                </span>
              </p>
            </div>
            <button
              type="button"
              aria-pressed={picked}
              onClick={() => toggleCompare(perfume.slug)}
              className={cn(
                "pressable mt-1 inline-flex min-h-9 shrink-0 items-center gap-1 rounded-full border px-2.5 text-label leading-none",
                picked ? "border-ink bg-ink text-paper" : "edge border-line bg-card text-muted",
              )}
            >
              {picked ? <CheckIcon className="size-3.5" /> : null}
              مقایسه
            </button>
          </div>

          <ul className="mt-2.5 flex flex-wrap gap-1.5" aria-label="مشخصات شیشه">
            <li className="rounded-full border border-line bg-card px-2.5 py-1 text-label text-muted">
              {perfume.concentration}
            </li>
            <li className="rounded-full border border-line bg-card px-2.5 py-1 text-label text-muted">
              {faNum(perfume.volumeMl)} میلی‌لیتر
            </li>
            {perfume.marketGender !== "مشترک" ? (
              <li className="rounded-full border border-line bg-card px-2.5 py-1 text-label text-muted">
                {perfume.marketGender}
              </li>
            ) : null}
          </ul>
        </header>

        <div className="mt-4">
          <AccordMark accords={perfume.accords} labeled />
        </div>

        <p className="mt-4 rounded-panel bg-paper px-4 py-3.5 text-body">{perfume.why}</p>

        <button
          type="button"
          onClick={() => openShops(perfume.slug)}
          className="pressable solid mt-4 flex min-h-14 w-full items-center justify-between gap-3 rounded-panel bg-ink px-4 text-start text-paper"
        >
          <span className="min-w-0">
            <span className="block text-body font-semibold">
              {offer ? `از ${millionToman(offer.price)}` : "فروشگاه‌ها"}
            </span>
            {offer ? (
              <span className="mt-0.5 flex items-center gap-1.5 text-label text-paper/75">
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-1.5 rounded-full",
                    offer.stockConfirmed ? "bg-stock-ok-on-ink" : "bg-stock-pending-on-ink",
                  )}
                />
                {offer.shop}
                {offer.stockConfirmed ? `، موجود، بررسی ${offer.checkedOn}` : `، موجودی تأیید نشده`}
              </span>
            ) : null}
          </span>
          <span className="inline-flex shrink-0 items-center gap-0.5 text-label">
            فروشگاه‌ها
            <ForwardIcon className="size-4" />
          </span>
        </button>
        {cheaper ? (
          <p className="mt-2 text-label text-muted">
            در {cheaper.shop} {millionToman(cheaper.price)}، موجودی تأیید نشده
          </p>
        ) : null}

        <section className="mt-6" aria-labelledby="taste-title">
          <h2 id="taste-title" className="text-title font-semibold">
            این عطر چطوره؟
          </h2>
          <p className="mt-1 text-label text-muted">برای قفسه و پیشنهاد بعدی نگه می‌داریم.</p>
          <div className="mt-3">
            <TasteRow slug={perfume.slug} />
          </div>
        </section>

        <dl className="mt-7 divide-y divide-line rounded-panel border border-line bg-card px-4">
          <Fact label="فصل" value={season} />
          {perfume.longevity ? (
            <Fact label="ماندگاری" value={performanceLabel("longevity", perfume.longevity)} />
          ) : null}
          {perfume.sillage ? (
            <Fact label="پخش بو" value={performanceLabel("sillage", perfume.sillage)} />
          ) : null}
          {perfume.inspiredBy ? <Fact label="نزدیک به" value={inspiredName(perfume.inspiredBy)} /> : null}
        </dl>
        {perfume.inspiredBy ? (
          <p className="mt-2 text-label text-muted">
            شباهت بر اساس نوت‌های ثبت‌شده در آروماست، نه محصول برند اصلی.
          </p>
        ) : null}

        <section className="mt-8" aria-labelledby="notes-title">
          <h2 id="notes-title" className="text-title font-semibold">
            نوت‌ها
          </h2>
          <dl className="mt-3 space-y-2.5">
            {LAYERS.map((layer) => {
              const notes = perfume.notes.filter((note) => note.layer === layer.id);
              if (notes.length === 0) return null;
              return (
                <div key={layer.id} className="flex gap-3 text-body">
                  <dt className="w-12 shrink-0 pt-0.5 text-label text-muted">{layer.label}</dt>
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

        {similars.length > 0 ? (
          <section className="mt-9" aria-labelledby="similar-title">
            <h2 id="similar-title" className="text-title font-semibold">
              مشابه‌ها
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {similars.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/perfume/${item.slug}`}
                    className="pressable quiet flex items-center gap-3 rounded-panel border border-line bg-card px-3 py-2.5"
                  >
                    <PerfumePhoto
                      perfume={item}
                      sizes="thumb"
                      className="h-14 w-12 shrink-0 rounded-control"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-body font-semibold">{item.nameFa}</span>
                      <span className="mt-0.5 block text-label text-muted">
                        {item.brand}
                        <span className="mx-1 text-muted/40">،</span>
                        {likeness(perfume, item)}
                      </span>
                      <span className="mt-2 block max-w-48">
                        <AccordMark accords={item.accords} />
                      </span>
                    </span>
                    <ForwardIcon className="size-5 shrink-0 text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>
    </Shell>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 py-3.5 text-body">
      <dt className="w-20 shrink-0 text-label text-muted">{label}</dt>
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
