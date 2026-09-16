"use client";

import { useActionState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { saveShift, deleteShift, type ActionState } from "@/app/(admin)/rooster/actions";
import { formatTime } from "@/lib/dates";
import type { ShiftItem } from "./types";

export function ShiftDialog({
  open,
  onOpenChange,
  staffId,
  staffName,
  dateKey,
  dateLabel,
  shift,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffId: string;
  staffName: string;
  dateKey: string;
  dateLabel: string;
  shift: ShiftItem | null;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveShift, undefined);

  useEffect(() => {
    if (state && !state.error) {
      onOpenChange(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  async function handleDelete() {
    if (!shift) return;
    await deleteShift(shift.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {shift ? "Dienst bewerken" : "Dienst toevoegen"} — {staffName}
          </DialogTitle>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-4">
          {shift && <input type="hidden" name="id" value={shift.id} />}
          <input type="hidden" name="assignedUserId" value={staffId} />
          <input type="hidden" name="date" value={dateKey} />

          <p className="text-sm text-muted-foreground">{dateLabel}</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="startTime">Starttijd</Label>
              <Input
                id="startTime"
                name="startTime"
                type="time"
                required
                defaultValue={shift ? formatTime(new Date(shift.startTime)) : "09:00"}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="endTime">Eindtijd</Label>
              <Input
                id="endTime"
                name="endTime"
                type="time"
                required
                defaultValue={shift ? formatTime(new Date(shift.endTime)) : "17:00"}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="breakMinutes">Pauze (minuten)</Label>
            <Input
              id="breakMinutes"
              name="breakMinutes"
              type="number"
              min={0}
              max={240}
              defaultValue={shift?.breakMinutes ?? 0}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notities</Label>
            <Textarea id="notes" name="notes" defaultValue={shift?.notes ?? ""} />
          </div>

          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

          <DialogFooter className="gap-2 sm:justify-between">
            {shift ? (
              <Button type="button" variant="outline" onClick={handleDelete} className="text-destructive">
                Verwijderen
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit" disabled={pending}>
              {pending ? "Opslaan…" : "Opslaan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
