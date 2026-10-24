import Link from "next/link";
import { Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { pageMeta } from "@/lib/page-meta";

export const metadata = pageMeta(
  "آروما چطور پیشنهاد می‌دهد",
  "پیشنهاد آروما از سؤال یا قفسهٔ سلیقه می‌آید و قیمت را از فروشگاه‌های ایران نشان می‌دهد، بدون رأی ساختگی.",
);

const STEPS = [
  {
    title: "از سؤال یا قفسه شروع می‌کنیم",
    body: "اسم یک عطر، موقعیت و بودجه، یا امتیازهایی که در آرومای من دادی را می‌خوانیم.",
  },
  {
    title: "پیشنهاد را با حال‌وهوای بو می‌چینیم",
    body: "آکورد، نوت، فصل و موقعیت را با هم می‌سنجیم؛ نه تبلیغ برند و نه رأی ساختگی.",
  },
  {
    title: "قیمت را از فروشگاه‌های ایران نشان می‌دهیم",
    body: "وقتی قیمت تأییدشده داریم همان را می‌گوییم. اگر فقط برآورد کاتالوگ باشد، صریح می‌نویسیم.",
  },
] as const;

const LIMITS = [
  "روی پوست خودت ممکن است فرق کند؛ تست نهایی با توست.",
  "شباهت یعنی حال‌وهوای نزدیک، نه کپی یک‌به‌یک فرمول.",
  "جایی که داده نداریم حدس نمی‌زنیم.",
] as const;

export default function HowPage() {
  return (
    <Shell back={{ href: "/", label: "خانه" }}>
      <article className="vf app px-5 pt-6 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <header>
          <h1 className="text-balance text-display font-bold">آروما چطور پیشنهاد می‌دهد؟</h1>
          <p className="mt-3 text-pretty text-body text-muted-foreground">
            هدف ساده است: از یک جملهٔ فارسی برسی به شیشه‌ای که در ایران قابل خرید باشد و به سلیقه‌ات نزدیک
            باشد.
          </p>
        </header>

        <ol className="mt-8 flex flex-col gap-4">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <Card className="p-4">
                <p className="text-label text-muted-foreground">گام {["یک", "دو", "سه"][index]}</p>
                <h2 className="mt-1 text-title font-semibold">{step.title}</h2>
                <p className="mt-2 text-pretty text-body">{step.body}</p>
              </Card>
            </li>
          ))}
        </ol>

        <section className="mt-8" aria-labelledby="limits-title">
          <h2 id="limits-title" className="text-title font-semibold">
            محدودیت‌ها
          </h2>
          <Card className="mt-3 px-4 py-1">
            {LIMITS.map((line, index) => (
              <div key={line}>
                {index > 0 ? <Separator /> : null}
                <p className="py-3 text-pretty text-body">{line}</p>
              </div>
            ))}
          </Card>
        </section>

        <div className="mt-8 flex flex-col gap-2">
          <Button href="/" className="min-h-11 w-full">
            شروع از خانه
          </Button>
          <Button href="/guide" variant="outline" className="min-h-11 w-full bg-card!">
            با ۴ سؤال شروع کن
          </Button>
          <p className="mt-2 text-pretty text-label text-muted-foreground">
            جزئیات واژه‌ها را در{" "}
            <Link href="/learn" className="font-medium text-foreground underline-offset-4 hover:underline">
              دانستنی‌ها
            </Link>{" "}
            ببین.
          </p>
        </div>
      </article>
    </Shell>
  );
}
