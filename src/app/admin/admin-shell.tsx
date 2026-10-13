"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/format";
import { ADMIN_SECTIONS, type AdminSection } from "@/lib/auth/sections";

const GROUP_ORDER = ["کار", "کاتالوگ", "حساب‌ها"] as const;

export function AdminShell({
  name,
  sections,
  children,
}: {
  name: string;
  sections: readonly AdminSection[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-dvh bg-desk text-ink lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <header className="sticky top-0 z-20 flex items-center gap-2 bg-ink px-3 py-2.5 text-paper lg:hidden">
        <button
          type="button"
          aria-expanded={open}
          aria-controls="admin-menu"
          onClick={() => setOpen(true)}
          className="shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-label"
        >
          منو
        </button>
        <p className="min-w-0 flex-1 truncate text-label font-bold">آروما</p>
        <button type="button" onClick={logout} className="shrink-0 rounded-full px-2.5 py-1.5 text-label text-paper/80">
          خروج
        </button>
      </header>

      {open ? (
        <div className="fixed inset-0 z-30 lg:hidden">
          <button type="button" aria-label="بستن منو" className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} />
          <div
            id="admin-menu"
            role="dialog"
            aria-modal="true"
            aria-label="منوی مدیریت"
            className="absolute inset-y-0 start-0 flex w-72 max-w-[85vw] flex-col bg-ink text-paper shadow-frame"
          >
            <Menu name={name} sections={sections} pathname={pathname} onLogout={logout} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}

      <aside className="sticky top-0 z-10 hidden h-dvh bg-ink text-paper lg:flex lg:flex-col">
        <Menu name={name} sections={sections} pathname={pathname} onLogout={logout} />
      </aside>

      <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">{children}</div>
    </div>
  );
}

function Menu({
  name,
  sections,
  pathname,
  onLogout,
  onNavigate,
}: {
  name: string;
  sections: readonly AdminSection[];
  pathname: string;
  onLogout: () => void;
  onNavigate?: () => void;
}) {
  const allowed = new Set(sections);
  const groups = GROUP_ORDER.map((label) => ({
    label,
    links: ADMIN_SECTIONS.filter((section) => section.group === label && allowed.has(section.id)),
  })).filter((group) => group.links.length > 0);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="px-5 pt-6">
        <p className="text-label text-brass">آروما</p>
        <p className="mt-1 text-title font-bold">مدیریت</p>
      </div>
      <nav className="mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto px-3 pb-4" aria-label="بخش‌های مدیریت">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-3 text-label text-paper/45">{group.label}</p>
            <div className="mt-1 space-y-1">
              {group.links.map((link) => {
                const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    onClick={onNavigate}
                    className={cn(
                      "block rounded-control px-3 py-2.5 text-label",
                      active ? "bg-paper font-medium text-ink" : "text-paper/80 hover:bg-white/10",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 px-5 py-4">
        <p className="truncate text-label text-paper/70">{name}</p>
        <button type="button" onClick={onLogout} className="mt-2 text-label text-paper underline-offset-4 hover:underline">
          خروج
        </button>
      </div>
    </div>
  );
}
