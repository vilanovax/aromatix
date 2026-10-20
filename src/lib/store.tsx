"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { LegacyTaste, Profile, UserPerfume } from "@/lib/types";
import { emptyUserPerfume, isEmptyUserPerfume } from "@/lib/types";
import { recordUsage } from "@/lib/usage";

type Persisted = {
  profile: Profile | null;
  library: Record<string, UserPerfume>;
  compare: string[];
  nudgeSeen: boolean;
  /** نام انگلیسی نت‌ها کنار فارسی. */
  noteNamesEn: boolean;
};

type LegacyPersisted = {
  profile?: Profile | null;
  taste?: Record<string, LegacyTaste>;
  compare?: string[];
};

type Store = Persisted & {
  ready: boolean;
  shopFor: string | null;
  termFor: string | null;
  setProfile: (profile: Profile) => void;
  setWanted: (slug: string) => void;
  saveExperience: (slug: string, rating: number, owned: boolean) => void;
  clearExperience: (slug: string) => void;
  setDisliked: (slug: string) => void;
  setNoteNamesEn: (on: boolean) => void;
  dismissNudge: () => void;
  toggleCompare: (slug: string) => void;
  openShops: (slug: string) => void;
  closeShops: () => void;
  openTerm: (slug: string) => void;
  closeTerm: () => void;
};

const KEY = "aroma-ui-v2";
const LEGACY_KEY = "aroma-ui-v1";
const AromaContext = createContext<Store | null>(null);

export function Providers({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [library, setLibrary] = useState<Record<string, UserPerfume>>({});
  const [compare, setCompare] = useState<string[]>([]);
  const [nudgeSeen, setNudgeSeen] = useState(false);
  const [noteNamesEn, setNoteNamesEnState] = useState(false);
  const [shopFor, setShopFor] = useState<string | null>(null);
  const [termFor, setTermFor] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    let data = stored ? parsePersisted(stored) : null;
    if (stored && !data) localStorage.removeItem(KEY);
    if (!data) {
      const legacyRaw = localStorage.getItem(LEGACY_KEY) ?? sessionStorage.getItem(LEGACY_KEY);
      if (legacyRaw) data = parseLegacy(legacyRaw);
    }
    if (data) {
      applyPersisted(data);
      localStorage.setItem(KEY, JSON.stringify(data));
    }
    localStorage.removeItem(LEGACY_KEY);
    sessionStorage.removeItem(LEGACY_KEY);
    setReady(true);
  }, []);

  function applyPersisted(data: Persisted) {
    setProfileState(data.profile);
    setLibrary(data.library);
    setCompare(data.compare);
    setNudgeSeen(data.nudgeSeen);
    setNoteNamesEnState(data.noteNamesEn);
  }

  useEffect(() => {
    if (!ready) return;
    const data: Persisted = { profile, library, compare, nudgeSeen, noteNamesEn };
    localStorage.setItem(KEY, JSON.stringify(data));
  }, [ready, profile, library, compare, nudgeSeen, noteNamesEn]);

  const value = useMemo<Store>(
    () => ({
      ready,
      profile,
      library,
      compare,
      nudgeSeen,
      noteNamesEn,
      shopFor,
      termFor,
      setProfile: setProfileState,
      setWanted: (slug) => {
        setLibrary((current) =>
          write(current, slug, (prev) => {
            if (prev.owned) return { ...prev, wanted: false };
            if (prev.wanted) return { ...prev, wanted: false };
            return {
              ...prev,
              wanted: true,
              disliked: false,
              tried: prev.rating != null ? true : false,
            };
          }),
        );
      },
      saveExperience: (slug, rating, owned) => {
        const safe = Math.min(10, Math.max(1, Math.round(rating)));
        setLibrary((current) =>
          write(current, slug, (prev) => ({
            ...prev,
            tried: true,
            disliked: false,
            rating: safe,
            ratedAt: new Date().toISOString(),
            inferred: false,
            owned,
            wanted: owned ? false : prev.wanted,
          })),
        );
      },
      clearExperience: (slug) => {
        setLibrary((current) =>
          write(current, slug, (prev) => ({
            ...prev,
            rating: null,
            ratedAt: null,
            inferred: false,
            tried: prev.owned || prev.disliked ? prev.tried : false,
          })),
        );
      },
      setDisliked: (slug) => {
        setLibrary((current) =>
          write(current, slug, (prev) =>
            prev.disliked
              ? {
                  ...prev,
                  disliked: false,
                  tried: prev.rating != null || prev.owned ? prev.tried : false,
                }
              : {
                  ...prev,
                  disliked: true,
                  tried: true,
                  wanted: false,
                  rating: null,
                  ratedAt: null,
                  inferred: false,
                },
          ),
        );
      },
      setNoteNamesEn: setNoteNamesEnState,
      dismissNudge: () => setNudgeSeen(true),
      toggleCompare: (slug) => {
        setCompare((current) => {
          if (current.includes(slug)) return current.filter((item) => item !== slug);
          const next = [...current, slug];
          return next.length > 2 ? next.slice(-2) : next;
        });
      },
      openShops: (slug) => {
        recordUsage("shop_open", slug);
        setTermFor(null);
        setShopFor(slug);
      },
      closeShops: () => setShopFor(null),
      openTerm: (slug) => {
        setShopFor(null);
        setTermFor(slug);
      },
      closeTerm: () => setTermFor(null),
    }),
    [ready, profile, library, compare, nudgeSeen, noteNamesEn, shopFor, termFor],
  );

  return <AromaContext.Provider value={value}>{children}</AromaContext.Provider>;
}

export function useAroma() {
  const store = useContext(AromaContext);
  if (!store) throw new Error("useAroma باید داخل Providers باشد");
  return store;
}

function write(
  current: Record<string, UserPerfume>,
  slug: string,
  recipe: (prev: UserPerfume) => UserPerfume,
) {
  const nextState = recipe(current[slug] ?? emptyUserPerfume());
  const next = { ...current };
  if (isEmptyUserPerfume(nextState)) delete next[slug];
  else next[slug] = nextState;
  return next;
}

function parsePersisted(raw: string): Persisted | null {
  try {
    const data = JSON.parse(raw) as Partial<Persisted>;
    return {
      profile: data.profile ?? null,
      library: normalizeLibrary(data.library),
      compare: Array.isArray(data.compare) ? data.compare.filter((item) => typeof item === "string") : [],
      nudgeSeen: Boolean(data.nudgeSeen),
      noteNamesEn: Boolean(data.noteNamesEn),
    };
  } catch {
    return null;
  }
}

function parseLegacy(raw: string): Persisted | null {
  try {
    const data = JSON.parse(raw) as LegacyPersisted;
    return {
      profile: data.profile ?? null,
      library: migrateTaste(data.taste ?? {}),
      compare: Array.isArray(data.compare) ? data.compare.filter((item) => typeof item === "string") : [],
      nudgeSeen: false,
      noteNamesEn: false,
    };
  } catch {
    return null;
  }
}

function migrateTaste(taste: Record<string, LegacyTaste>) {
  const library: Record<string, UserPerfume> = {};
  for (const [slug, value] of Object.entries(taste)) {
    if (value === "like") {
      library[slug] = {
        owned: false,
        wanted: false,
        tried: true,
        disliked: false,
        rating: 8,
        ratedAt: null,
        inferred: true,
      };
    } else if (value === "try") {
      library[slug] = {
        ...emptyUserPerfume(),
        wanted: true,
      };
    } else if (value === "dislike") {
      library[slug] = {
        ...emptyUserPerfume(),
        tried: true,
        disliked: true,
      };
    }
  }
  return library;
}

function normalizeLibrary(value: unknown) {
  if (!value || typeof value !== "object") return {};
  const library: Record<string, UserPerfume> = {};
  for (const [slug, raw] of Object.entries(value as Record<string, unknown>)) {
    const state = normalizeState(raw);
    if (state) library[slug] = state;
  }
  return library;
}

function normalizeState(raw: unknown): UserPerfume | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<UserPerfume>;
  const rating =
    typeof row.rating === "number" && row.rating >= 1 && row.rating <= 10 ? Math.round(row.rating) : null;
  const state: UserPerfume = {
    owned: Boolean(row.owned),
    wanted: Boolean(row.wanted) && !row.owned,
    tried: Boolean(row.tried) || rating != null || Boolean(row.disliked),
    disliked: Boolean(row.disliked) && (rating == null || rating < 4),
    rating: Boolean(row.disliked) && (rating == null || rating < 4) ? null : rating,
    ratedAt: typeof row.ratedAt === "string" ? row.ratedAt : null,
    inferred: Boolean(row.inferred) && rating != null,
  };
  if (state.owned) state.wanted = false;
  if (state.disliked) {
    state.rating = null;
    state.ratedAt = null;
    state.inferred = false;
    state.tried = true;
  }
  return isEmptyUserPerfume(state) ? null : state;
}
