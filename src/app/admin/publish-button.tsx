"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { publishSeedCatalog } from "@/app/admin/actions";
import { Button } from "@/components/Button";

export function PublishCatalogButton() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function publish() {
    setPending(true);
    setError(null);
    const result = await publishSeedCatalog();
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-4">
      <Button type="button" onClick={publish} disabled={pending}>
        {pending ? "در حال انتشار" : "انتشار کاتالوگ اولیه"}
      </Button>
      {error ? (
        <p role="alert" className="mt-2 text-label text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
