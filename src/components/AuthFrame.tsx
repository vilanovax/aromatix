import Image from "next/image";
import { Card } from "@/components/ui/card";
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
      <div className="vf app relative flex min-h-full flex-col px-5 pt-2 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <div className="relative flex flex-1 flex-col justify-center gap-6 py-4">
          <div className="flex flex-col items-center text-center">
            <div className="grid size-20 place-items-center rounded-surface bg-card shadow-surface ring-1 ring-border">
              <Image src="/brand/mark-192.png" alt="" width={134} height={192} priority className="h-12 w-auto" />
            </div>
            <p className="mt-3 text-title font-bold text-foreground">آروما</p>
            <span className="mt-2 h-1 w-10 rounded-full bg-brand" aria-hidden />
            <h1 className="mt-3 text-balance text-display font-bold">{title}</h1>
            <p className="mt-2 max-w-[19rem] text-pretty text-body text-muted-foreground">{lede}</p>
          </div>

          <Card className="px-4 py-5">{children}</Card>
        </div>
      </div>
    </Shell>
  );
}
