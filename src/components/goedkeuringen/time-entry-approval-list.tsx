"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatClockDayLabel, formatClockTime } from "@/lib/dates";
import { durationHours, formatHours } from "@/lib/hours";
import { TimeEntryApprovalDialog, type PendingTimeEntry } from "./time-entry-approval-dialog";

export function TimeEntryApprovalList({
  entries,
  onApprove,
}: {
  entries: PendingTimeEntry[];
  onApprove: (
    entryId: string,
    correctionMinutes: number,
    reviewNote: string | null
  ) => Promise<{ error?: string } | undefined>;
}) {
  const [selected, setSelected] = useState<PendingTimeEntry | null>(null);
  const router = useRouter();

  return (
    <div className="flex flex-col gap-2">
      {entries.map((entry) => {
        const clockIn = new Date(entry.clockIn);
        const clockOut = new Date(entry.clockOut);
        return (
          <Card key={entry.id}>
            <CardContent className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">{entry.employeeName}</p>
                <p className="text-sm text-muted-foreground">
                  {formatClockDayLabel(clockIn)} · {formatClockTime(clockIn)} -{" "}
                  {formatClockTime(clockOut)} · {formatHours(durationHours(clockIn, clockOut))} uur
                </p>
              </div>
              <Button size="sm" onClick={() => setSelected(entry)}>
                Beoordelen
              </Button>
            </CardContent>
          </Card>
        );
      })}

      {selected && (
        <TimeEntryApprovalDialog
          open
          onOpenChange={(open) => {
            if (!open) {
              setSelected(null);
              router.refresh();
            }
          }}
          entry={selected}
          onApprove={onApprove}
        />
      )}
    </div>
  );
}
