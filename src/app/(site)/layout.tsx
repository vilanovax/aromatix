import { CatalogBridge } from "@/components/CatalogBridge";
import { AccountProvider } from "@/lib/account";
import { loadCatalog } from "@/lib/catalog-server";
import { loadArticles } from "@/lib/knowledge-server";

export default async function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [snapshot, articles] = await Promise.all([loadCatalog(), loadArticles()]);
  return (
    <CatalogBridge snapshot={snapshot} articles={articles}>
      <AccountProvider>{children}</AccountProvider>
    </CatalogBridge>
  );
}
