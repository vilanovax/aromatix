"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PerfumePhoto } from "@/components/Bottle";
import { Card } from "@/components/ui/card";
import { alternativeGroups, perfumePool, type AltGroup } from "@/lib/alternatives";
import { guidePrice, publicLead } from "@/lib/catalog";
import { cn, faNum, millionToman } from "@/lib/format";
import { perfumeHref } from "@/lib/nav";
import { offerAvailability, offerStockLine } from "@/lib/offer-stock";
import { faceFromPerfume, personalFit, type ScentFace } from "@/lib/personal-fit";
import { referenceBottles, type ReferenceProfile } from "@/lib/references";
import { useAroma } from "@/lib/store";
import type { Perfume } from "@/lib/types";

export function AlternativeGroups({
  perfume,
  reference,
  from,
  budget = null,
}: {
  perfume?: Perfume;
  reference?: ReferenceProfile;
  from: string;
  budget?: number | null;
}) {
  const { library, ready } = useAroma();
  if (!ready) return <div className="mt-8 min-h-16" aria-busy="true" />;

  const face: ScentFace | null = perfume
    ? faceFromPerfume(perfume)
    : reference
      ? {
          nameFa: reference.nameFa,
          accords: reference.accords,
          notes: reference.notes,
          seasons: reference.seasons,
          occasions: reference.occasions,
        }
      : null;
  if (!face) return null;

  const rawPool = perfume ? perfumePool(perfume) : reference ? referenceBottles(reference.id) : [];
  const fit = personalFit(face, library);
  const selfDisliked = perfume ? Boolean(library[perfume.slug]?.disliked) : false;
  const groups = alternativeGroups({
    face,
    pool: rawPool,
    budget,
    escape: fit.level === "far" || selfDisliked,
    library,
    source: perfume ?? null,
  });
  const pricedOut = budget != null && rawPool.length > 0 && groups.length === 0;
  const cheaper =
    groups.find((group) => group.id === "cheaper") ??
    (perfume
      ? {
          id: "cheaper" as const,
          title: "ارزان‌تر شبیه این، در ایران",
          items: [],
        }
      : null);
  const rest = groups.filter((group) => group.id !== "cheaper");
  const emptyAll = groups.length === 0 && !pricedOut && !perfume;

  return (
    <section id="similar" className="mt-8 scroll-mt-4" aria-labelledby="similar-title">
      <h2 id="similar-title" className="text-title font-semibold">
        جایگزین‌ها
      </h2>
      {pricedOut ? (
        <p className="mt-2 text-pretty text-body text-muted-foreground">
          با سقف {faNum(budget)} میلیون، شیشه‌ای از این حال‌وهوا در نمونه نیست.
        </p>
      ) : null}
      {emptyAll ? (
        <p className="mt-2 text-pretty text-body text-muted-foreground">برای این حس، جایگزین دیگری در نمونه نیست.</p>
      ) : null}

      {cheaper ? <CheaperBlock group={cheaper} from={from} /> : null}

      <div className="mt-5 flex flex-col gap-5">
        {rest.map((group) => (
          <div key={group.id}>
            <h3 className="text-label text-muted-foreground">{group.title}</h3>
            <ul className="mt-2 flex flex-col gap-3">
              {group.items.map((item) => (
                <li key={item.perfume.slug}>
                  <AltCard perfume={item.perfume} reason={item.reason} from={from} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function CheaperBlock({ group, from }: { group: AltGroup; from: string }) {
  return (
    <div id="cheaper" className="mt-4 scroll-mt-4">
      <h3 className="text-title font-semibold">{group.title}</h3>
      <p className="mt-1 text-pretty text-label text-muted-foreground">
        قیمت تأییدشدهٔ فروشگاه‌های ایران؛ شباهت حس بو است، نه کپی یک‌به‌یک.
      </p>
      {group.items.length === 0 ? (
        <p className="mt-3 text-pretty text-body text-muted-foreground">
          هنوز جایگزین ارزان‌تری با قیمت فروشگاه در نمونه نیست.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {group.items.map((item) => (
            <li key={item.perfume.slug}>
              <AltCard perfume={item.perfume} reason={item.reason} from={from} emphasizePrice />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AltCard({
  perfume,
  reason,
  from,
  emphasizePrice = false,
}: {
  perfume: Perfume;
  reason: string;
  from: string;
  emphasizePrice?: boolean;
}) {
  const href = perfumeHref(perfume.slug, from);
  const offer = publicLead(perfume);
  const guide = guidePrice(perfume);

  return (
    <Card className="p-0">
      <Link
        href={href}
        className="flex min-h-16 items-center gap-3 p-3 outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
      >
        <PerfumePhoto perfume={perfume} sizes="thumb" alt="" className="h-14 w-12 shrink-0 rounded-control" />
        <span className="min-w-0 flex-1 text-start">
          <span className="block text-body font-semibold">{perfume.nameFa}</span>
          <span className="mt-1 block text-pretty text-label">{reason}</span>
          <span className="mt-1 block text-label text-muted-foreground">{perfume.brand}</span>
          {offer ? (
            <span
              className={cn(
                "mt-2 flex flex-wrap items-center gap-2 text-label",
                emphasizePrice ? "font-semibold text-foreground" : "text-muted-foreground",
              )}
            >
              <span>{millionToman(offer.price)}</span>
              <span className="font-normal text-muted-foreground">· {offer.shop}</span>
              <span
                aria-hidden="true"
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  offerAvailability(offer) === "in_stock" && "bg-stock-ok",
                  offerAvailability(offer) !== "in_stock" && "bg-stock-pending",
                )}
              />
              <span className="font-normal text-muted-foreground">{offerStockLine(offer)}</span>
            </span>
          ) : guide ? (
            <span className="mt-2 block text-label text-muted-foreground">
              حدود {millionToman(guide)}، برآورد کاتالوگ
            </span>
          ) : (
            <span className="mt-2 block text-label text-muted-foreground">قیمت فروشگاه به‌زودی</span>
          )}
        </span>
        <ChevronLeft strokeWidth={1.5} className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </Link>
    </Card>
  );
}
