"use server";

import { commitOfferFeed } from "@/lib/admin/offer-feed";

export async function applyOfferFeedAction(input: { text: string; mode: "patch" | "snapshot"; shop: string; acceptJumps: boolean }) {
  return commitOfferFeed(input);
}
