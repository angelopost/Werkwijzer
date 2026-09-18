"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TimeEntryList, type TimeEntryRow } from "./time-entry-list";

export function StaffTimeEntryLog({
  entries,
  onSubmit,
}: {
  entries: TimeEntryRow[];
  onSubmit: (entryId: string) => Promise<{ error?: string } | undefined>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(entryId: string) {
    setError(null);
    startTransition(async () => {
      const result = await onSubmit(entryId);
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <TimeEntryList entries={entries} onSubmit={handleSubmit} />
    </div>
  );
}
