import { commitOfferFeed, exportOfferCsv } from "@/lib/admin/offer-feed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const shop = new URL(request.url).searchParams.get("shop") ?? undefined;
  const csv = await exportOfferCsv(shop || undefined);
  if (!csv.ok) return new Response(csv.error, { status: csv.status });
  const day = new Date().toISOString().slice(0, 10);
  const name = shop ? `aroma-prices-${shop}-${day}.csv` : `aroma-prices-${day}.csv`;
  return new Response(csv.csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${name}"`,
      "cache-control": "no-store",
    },
  });
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("mode");
  const shop = url.searchParams.get("shop");
  const acceptJumps = url.searchParams.get("acceptJumps") === "1" ? true : url.searchParams.has("acceptJumps") ? false : undefined;
  const text = await request.text();
  const result = await commitOfferFeed({
    text,
    mode: mode ?? undefined,
    shop: shop ?? undefined,
    acceptJumps,
  });
  const status = result.ok ? 200 : result.error.includes("دسترسی") ? 403 : 400;
  return Response.json(result, { status, headers: { "cache-control": "no-store" } });
}
