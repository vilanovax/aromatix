"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { publishLearnSeed } from "@/app/admin/learn-actions";
import { Alert } from "@/components/ui/alert";
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
    <div>
      {error ? (
        <Alert variant="destructive" className="mb-3">
          {error}
        </Alert>
      ) : null}
      <Button type="button" size="md" disabled={pending} onClick={publish}>
        {pending ? "در حال انتشار" : "انتشار دانستنی‌ها"}
      </Button>
    </div>
  );
}
