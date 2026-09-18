"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TimeEntryList, type TimeEntryRow } from "./time-entry-list";
import { TimeEntryDialog } from "./time-entry-dialog";

export function AdminTimeEntryLog({
  entries,
  onSave,
  onDelete,
}: {
  entries: TimeEntryRow[];
  onSave: (entryId: string, clockInIso: string, clockOutIso: string | null) => Promise<{ error?: string }>;
  onDelete: (entryId: string) => Promise<void>;
}) {
  const [selected, setSelected] = useState<TimeEntryRow | null>(null);
  const router = useRouter();

  return (
    <>
      <TimeEntryList entries={entries} onSelect={setSelected} />
      {selected && (
        <TimeEntryDialog
          open
          onOpenChange={(open) => {
            if (!open) {
              setSelected(null);
              router.refresh();
            }
          }}
          entry={selected}
          onSave={onSave}
          onDelete={onDelete}
        />
      )}
    </>
  );
}
