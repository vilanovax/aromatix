"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Profile, Taste } from "@/lib/types";

type Persisted = {
  profile: Profile | null;
  taste: Record<string, Taste>;
  compare: string[];
};

type Store = Persisted & {
  ready: boolean;
  shopFor: string | null;
  setProfile: (profile: Profile) => void;
  setTaste: (slug: string, taste: Taste) => void;
  toggleCompare: (slug: string) => void;
  openShops: (slug: string) => void;
  closeShops: () => void;
};

const KEY = "aroma-ui-v1";
const AromaContext = createContext<Store | null>(null);

export function Providers({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [taste, setTasteState] = useState<Record<string, Taste>>({});
  const [compare, setCompare] = useState<string[]>([]);
  const [shopFor, setShopFor] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    const legacy = stored ? null : sessionStorage.getItem(KEY);
    const raw = stored ?? legacy;
    if (raw) {
      try {
        const data = JSON.parse(raw) as Persisted;
        setProfileState(data.profile ?? null);
        setTasteState(data.taste ?? {});
        setCompare(data.compare ?? []);
        if (!stored) localStorage.setItem(KEY, raw);
      } catch {
        localStorage.removeItem(KEY);
      }
    }
    if (legacy) sessionStorage.removeItem(KEY);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const data: Persisted = { profile, taste, compare };
    localStorage.setItem(KEY, JSON.stringify(data));
  }, [ready, profile, taste, compare]);

  const value = useMemo<Store>(
    () => ({
      ready,
      profile,
      taste,
      compare,
      shopFor,
      setProfile: setProfileState,
      setTaste: (slug, nextTaste) => {
        setTasteState((current) => {
          const next = { ...current };
          if (next[slug] === nextTaste) delete next[slug];
          else next[slug] = nextTaste;
          return next;
        });
      },
      toggleCompare: (slug) => {
        setCompare((current) => {
          if (current.includes(slug)) return current.filter((item) => item !== slug);
          const next = [...current, slug];
          return next.length > 2 ? next.slice(-2) : next;
        });
      },
      openShops: setShopFor,
      closeShops: () => setShopFor(null),
    }),
    [ready, profile, taste, compare, shopFor],
  );

  return <AromaContext.Provider value={value}>{children}</AromaContext.Provider>;
}

export function useAroma() {
  const store = useContext(AromaContext);
  if (!store) throw new Error("useAroma باید داخل Providers باشد");
  return store;
}
