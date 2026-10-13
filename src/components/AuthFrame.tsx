import Image from "next/image";
import { Card } from "@/components/Card";
import { Shell } from "@/components/Shell";

export function AuthFrame({
  title,
  lede,
  children,
}: {
  title: string;
  lede: string;
  children: React.ReactNode;
}) {
  return (
    <Shell browse={false} brand={false} back={{ href: "/", label: "شروع" }}>
      <div className="relative flex min-h-full flex-col overflow-hidden px-5 pt-2 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(110%_90%_at_50%_-15%,color-mix(in_srgb,var(--color-moss)_90%,transparent),transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -start-20 top-28 size-48 rounded-full bg-brass/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -end-16 top-40 size-36 rounded-full bg-moss blur-2xl"
        />

        <div className="relative flex flex-1 flex-col justify-center gap-6 py-4">
          <div className="flex flex-col items-center text-center">
            <div className="grid size-[5rem] place-items-center rounded-sheet bg-card shadow-sheet ring-1 ring-line">
              <Image
                src="/brand/mark-192.png"
                alt=""
                width={134}
                height={192}
                priority
                className="h-12 w-auto"
              />
            </div>
            <p className="mt-3 text-title font-bold tracking-tight text-ink">آروما</p>
            <span className="mt-2 h-0.5 w-10 rounded-full bg-brass" aria-hidden />
            <h1 className="mt-3 text-balance text-display font-bold text-ink">{title}</h1>
            <p className="mt-2 max-w-[19rem] text-pretty text-body text-muted">{lede}</p>
          </div>

          <Card shadow="sheet" className="relative px-4 py-5">
            {children}
          </Card>
        </div>
      </div>
    </Shell>
  );
}
