import Link from "next/link";
import { brandByName } from "@/lib/catalog";
import { cn } from "@/lib/format";

export function BrandLink({
  name,
  from,
  className,
}: {
  name: string;
  from?: string;
  className?: string;
}) {
  const brand = brandByName(name);
  if (!brand) {
    return <span className={className}>{name}</span>;
  }

  const href = from ? `/brands/${brand.slug}?from=${from}` : `/brands/${brand.slug}`;

  return (
    <Link
      href={href}
      className={cn(
        "underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
        className,
      )}
    >
      {name}
    </Link>
  );
}
