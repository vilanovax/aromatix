"use client";

import { installCatalog, type CatalogSnapshot } from "@/lib/catalog";
import { installKnowledge, type KnowledgeEntry } from "@/lib/knowledge";

export function CatalogBridge({
  snapshot,
  articles,
  children,
}: {
  snapshot: CatalogSnapshot;
  articles: KnowledgeEntry[];
  children: React.ReactNode;
}) {
  installCatalog(snapshot);
  installKnowledge(articles);
  return children;
}
