"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  BookOpen,
  LayoutDashboard,
  Settings,
  Sparkles,
  Store,
  Tag,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarGroup, SidebarItem } from "@/components/ui/sidebar";
import { ADMIN_SECTIONS, type AdminSection } from "@/lib/auth/sections";

const GROUP_ORDER = ["کار", "کاتالوگ", "حساب‌ها"] as const;

const ICONS = {
  overview: LayoutDashboard,
  reports: BarChart3,
  perfumes: Sparkles,
  brands: Tag,
  shops: Store,
  learn: BookOpen,
  users: Users,
  settings: Settings,
} as const;

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
    <div className="vf min-h-dvh bg-background text-foreground lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-border bg-background px-3 py-2 lg:hidden">
        <Button type="button" variant="outline" size="sm" aria-expanded={open} aria-controls="admin-menu" onClick={() => setOpen(true)}>
          منو
        </Button>
        <p className="min-w-0 flex-1 truncate text-sm font-semibold">آروما</p>
        <Button type="button" variant="ghost" size="sm" onClick={logout}>
          خروج
        </Button>
      </header>

      {open ? (
        <div className="fixed inset-0 z-30 lg:hidden">
          <button type="button" aria-label="بستن منو" className="absolute inset-0 bg-background/70" onClick={() => setOpen(false)} />
          <div id="admin-menu" role="dialog" aria-modal="true" aria-label="منوی مدیریت" className="absolute inset-y-0 start-0 w-72 max-w-[85vw] p-3">
            <Menu
              name={name}
              sections={sections}
              pathname={pathname}
              onLogout={logout}
              onNavigate={() => setOpen(false)}
              className="h-full"
            />
          </div>
        </div>
      ) : null}

      <div className="sticky top-0 z-10 hidden h-dvh p-3 lg:block">
        <Menu name={name} sections={sections} pathname={pathname} onLogout={logout} className="h-full" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
    </div>
  );
}

function Menu({
  name,
  sections,
  pathname,
  onLogout,
  onNavigate,
  className,
}: {
  name: string;
  sections: readonly AdminSection[];
  pathname: string;
  onLogout: () => void;
  onNavigate?: () => void;
  className?: string;
}) {
  const allowed = new Set(sections);
  const groups = GROUP_ORDER.map((label) => ({
    label,
    links: ADMIN_SECTIONS.filter((section) => section.group === label && allowed.has(section.id)),
  })).filter((group) => group.links.length > 0);

  return (
    <Sidebar
      className={className}
      header={
        <div>
          <p className="text-xs text-brand">آروما</p>
          <p className="text-base font-semibold">مدیریت</p>
        </div>
      }
      footer={
        <div>
          <p className="truncate text-sm text-muted-foreground">{name}</p>
          <Button type="button" variant="ghost" size="sm" className="mt-1 -ms-2" onClick={onLogout}>
            خروج
          </Button>
        </div>
      }
    >
      {groups.map((group) => (
        <SidebarGroup key={group.label} title={group.label}>
          {group.links.map((link) => {
            const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
            return (
              <SidebarItem
                key={link.href}
                href={link.href}
                label={link.label}
                icon={ICONS[link.id]}
                active={active}
                onClick={onNavigate}
              />
            );
          })}
        </SidebarGroup>
      ))}
    </Sidebar>
  );
}
