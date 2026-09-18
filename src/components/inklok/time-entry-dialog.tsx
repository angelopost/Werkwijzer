"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toDatetimeLocalValue } from "@/lib/dates";
import type { TimeEntryRow } from "./time-entry-list";

export function TimeEntryDialog({
  open,
  onOpenChange,
  entry,
  onSave,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: TimeEntryRow;
  onSave: (entryId: string, clockInIso: string, clockOutIso: string | null) => Promise<{ error?: string }>;
  onDelete: (entryId: string) => Promise<void>;
}) {
  const [clockIn, setClockIn] = useState(toDatetimeLocalValue(new Date(entry.clockIn)));
  const [clockOut, setClockOut] = useState(
    entry.clockOut ? toDatetimeLocalValue(new Date(entry.clockOut)) : ""
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSave() {
    setError(null);
    setPending(true);
    const clockInIso = new Date(clockIn).toISOString();
    const clockOutIso = clockOut ? new Date(clockOut).toISOString() : null;
    const result = await onSave(entry.id, clockInIso, clockOutIso);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onOpenChange(false);
  }

  async function handleDelete() {
    setPending(true);
    await onDelete(entry.id);
    setPending(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registratie bewerken{entry.employeeName ? ` — ${entry.employeeName}` : ""}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="entryClockIn">Ingeklokt</Label>
            <Input
              id="entryClockIn"
              type="datetime-local"
              value={clockIn}
              onChange={(e) => setClockIn(e.target.value)}
              className="block w-full max-w-full overflow-hidden"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="entryClockOut">Uitgeklokt</Label>
            <Input
              id="entryClockOut"
              type="datetime-local"
              value={clockOut}
              onChange={(e) => setClockOut(e.target.value)}
              className="block w-full max-w-full overflow-hidden"
            />
            <p className="text-xs text-muted-foreground">Laat leeg als de medewerker nog ingeklokt is.</p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button type="button" variant="outline" onClick={handleDelete} disabled={pending} className="text-destructive">
            Verwijderen
          </Button>
          <Button type="button" onClick={handleSave} disabled={pending}>
            {pending ? "Opslaan…" : "Opslaan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
