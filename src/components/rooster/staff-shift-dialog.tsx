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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notities — {dateLabel}</DialogTitle>
        </DialogHeader>
        <p className="text-sm whitespace-pre-wrap">
          {shift.notes || <span className="text-muted-foreground">Geen notities toegevoegd.</span>}
        </p>
      </DialogContent>
    </Dialog>
  );
}
