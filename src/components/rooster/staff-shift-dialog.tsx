"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ShiftItem } from "./types";

export function StaffShiftDialog({
  open,
  onOpenChange,
  dateLabel,
  shift,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateLabel: string;
  shift: ShiftItem;
}) {
  const notes = [shift.notes, shift.correctionNote].filter(Boolean) as string[];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notities — {dateLabel}</DialogTitle>
        </DialogHeader>
        {notes.length > 0 ? (
          <div className="flex flex-col gap-3 text-sm">
            {notes.map((note, i) => (
              <p key={i} className="whitespace-pre-wrap">
                {note}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Geen notities toegevoegd.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
