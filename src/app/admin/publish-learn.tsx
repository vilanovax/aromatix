"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { publishLearnSeed } from "@/app/admin/learn-actions";
import { Button } from "@/components/ui/button";

export function PublishLearn() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function publish() {
    setPending(true);
    setError(null);
    const result = await publishLearnSeed();
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-4">
      {error ? (
        <p role="alert" className="mb-3 text-label text-destructive">
          {error}
        </p>
      ) : null}
      <Button type="button" size="md" disabled={pending} onClick={publish}>
        {pending ? "در حال انتشار" : "انتشار دانستنی‌ها"}
      </Button>
    </div>
  );
}
