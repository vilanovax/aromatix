"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Bottle } from "@/components/Bottle";
import { Shell } from "@/components/Shell";
import { perfumes } from "@/lib/catalog";

const NOTES: Record<string, { title: string; body: string[]; wear: string }> = {
  vetiver: {
    title: "وتیور",
    body: [
      "بوی خاک تمیز، ریشهٔ خشک و کمی دودی است. شیرین نیست و معمولاً خودش را در پایه نشان می‌دهد.",
      "اگر عطری زود از روی پوستت می‌رود، بودن وتیور در پایه یکی از نشانه‌هایی است که بو دیرتر می‌نشیند. این قاعده همیشگی نیست.",
    ],
    wear: "بیشتر در عطرهای تازه، چوبی و روز به کار می‌رود.",
  },
};

export default function NotePage() {
  const params = useParams<{ slug: string }>();
  const note = NOTES[params.slug];

  if (!note) {
    return (
      <Shell composer back={{ href: "/", label: "شروع" }}>
        <div className="px-5 py-10">
          <h1 className="text-xl font-bold">این نوت هنوز در دانشنامه نیست.</h1>
        </div>
      </Shell>
    );
  }

  const carriers = perfumes.filter((perfume) => perfume.notes.some((item) => item.name === "وتیور"));

  return (
    <Shell composer back={{ href: "/results", label: "پیشنهادها" }}>
      <article className="px-5 pt-6 pb-12">
        <p className="text-[13px] text-[var(--muted)]">دانشنامه</p>
        <h1 className="mt-2 text-[1.7rem] font-bold">{note.title}</h1>
        <div className="mt-4 h-2 w-24 rounded-full bg-[#6E5436]" aria-hidden="true" />
        {note.body.map((paragraph) => (
          <p key={paragraph} className="mt-4 text-[16px] leading-8">
            {paragraph}
          </p>
        ))}
        <p className="mt-4 text-[15px] leading-7 text-[var(--muted)]">{note.wear}</p>
        <section className="mt-10">
          <h2 className="text-[15px] font-semibold">در این عطرها هست</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {carriers.map((perfume) => (
              <li key={perfume.slug}>
                <Link href={`/perfume/${perfume.slug}`} className="pressable flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-2.5">
                  <Bottle perfume={perfume} className="h-16 w-12 rounded-lg" />
                  <span>
                    <span className="block font-medium">{perfume.nameFa}</span>
                    <span className="text-[13px] text-[var(--muted)]">{perfume.brand}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </Shell>
  );
}
