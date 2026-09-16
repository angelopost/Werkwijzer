"use client";

import { useActionState, useEffect, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  saveShift,
  deleteShift,
  deletePermanentShift,
  type ActionState,
} from "@/app/(admin)/rooster/actions";
import { formatTime, getWeekdayFullLabel, parseDateKey } from "@/lib/dates";
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
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [bulkDeleteChecked, setBulkDeleteChecked] = useState(false);
  const [bulkDeletePending, setBulkDeletePending] = useState(false);

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

  async function handleDeleteAllPermanent() {
    if (!shift?.permanentShiftId || !bulkDeleteChecked) return;
    setBulkDeletePending(true);
    await deletePermanentShift(shift.permanentShiftId);
    onOpenChange(false);
  }

  const weekdayLabel = getWeekdayFullLabel(parseDateKey(dateKey));
  const canMakePermanent = !shift || !shift.permanentShiftId;

  if (shift?.permanentShiftId && confirmBulkDelete) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alle vaste diensten verwijderen</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Dit verwijdert alle nog komende {weekdayLabel}-diensten van {staffName} uit dit
              vaste patroon. Andere dagen (bijvoorbeeld een andere weekdag) blijven gewoon
              staan. Diensten die al zijn geweest blijven ook staan.
            </p>
            <label className="flex items-start gap-2.5 rounded-lg border p-3 text-sm">
              <Checkbox
                checked={bulkDeleteChecked}
                onCheckedChange={(checked) => setBulkDeleteChecked(checked === true)}
                className="mt-0.5"
              />
              <span>
                Weet je zeker dat je alle {weekdayLabel}-diensten van {staffName} wilt
                verwijderen? Dit kan je niet ongedaan maken.
              </span>
            </label>
          </div>
          <DialogFooter className="gap-2 sm:justify-between">
            <Button type="button" variant="outline" onClick={() => setConfirmBulkDelete(false)}>
              Annuleren
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={!bulkDeleteChecked || bulkDeletePending}
              onClick={handleDeleteAllPermanent}
            >
              {bulkDeletePending ? "Verwijderen…" : "Verwijderen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
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

          {canMakePermanent ? (
            <label className="flex items-center gap-2.5 rounded-lg border p-3 text-sm">
              <Checkbox name="permanent" defaultChecked={false} />
              <span className="font-medium">Permanent</span>
            </label>
          ) : (
            <p className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
              Vast rooster-patroon (elke {weekdayLabel})
            </p>
          )}

          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

          <DialogFooter className="gap-2 sm:justify-between">
            {shift ? (
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleDelete} className="text-destructive">
                  Verwijderen
                </Button>
                {shift.permanentShiftId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setConfirmBulkDelete(true)}
                    className="text-destructive"
                  >
                    Alle vaste diensten verwijderen
                  </Button>
                )}
              </div>
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
