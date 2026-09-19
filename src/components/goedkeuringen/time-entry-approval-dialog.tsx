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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { formatClockDayLabel, formatClockTime } from "@/lib/dates";
import { durationHours, formatDuration } from "@/lib/hours";

export type PendingTimeEntry = {
  id: string;
  employeeName: string;
  clockIn: string;
  clockOut: string;
  scheduledStartTime: string | null;
  scheduledEndTime: string | null;
};

export function TimeEntryApprovalDialog({
  open,
  onOpenChange,
  entry,
  onApprove,
  onReject,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: PendingTimeEntry;
  onApprove: (
    entryId: string,
    correctionMinutes: number,
    reviewNote: string | null
  ) => Promise<{ error?: string } | undefined>;
  onReject: (entryId: string) => Promise<void>;
}) {
  const [correctionMinutes, setCorrectionMinutes] = useState("0");
  const [reviewNote, setReviewNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confirmReject, setConfirmReject] = useState(false);
  const [rejectChecked, setRejectChecked] = useState(false);
  const [rejectPending, setRejectPending] = useState(false);

  const clockIn = new Date(entry.clockIn);
  const clockOut = new Date(entry.clockOut);
  const correction = Number(correctionMinutes) || 0;
  const adjustedEnd = new Date(clockOut.getTime() + correction * 60_000);

  async function handleApprove() {
    setError(null);
    setPending(true);
    const result = await onApprove(entry.id, correction, reviewNote.trim() || null);
    setPending(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    onOpenChange(false);
  }

  async function handleReject() {
    if (!rejectChecked) return;
    setRejectPending(true);
    await onReject(entry.id);
    setRejectPending(false);
    onOpenChange(false);
  }

  if (confirmReject) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tijd afwijzen — {entry.employeeName}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Deze registratie wordt volledig verwijderd en verdwijnt ook bij {entry.employeeName}{" "}
              uit het overzicht bij Inklokken.
            </p>
            <label className="flex items-start gap-2.5 rounded-lg border p-3 text-sm">
              <Checkbox
                checked={rejectChecked}
                onCheckedChange={(checked) => setRejectChecked(checked === true)}
                className="mt-0.5"
              />
              <span>Weet je zeker dat je deze registratie wilt afwijzen? Dit kan je niet ongedaan maken.</span>
            </label>
          </div>
          <DialogFooter className="gap-2 sm:justify-between">
            <Button type="button" variant="outline" onClick={() => setConfirmReject(false)}>
              Terug
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={!rejectChecked || rejectPending}
              onClick={handleReject}
            >
              {rejectPending ? "Afwijzen…" : "Afwijzen"}
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
          <DialogTitle>Tijd goedkeuren — {entry.employeeName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">{formatClockDayLabel(clockIn)}</p>

          <div className="flex flex-col gap-1 rounded-lg border bg-muted/40 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ingeklokt</span>
              <span className="font-medium">{formatClockTime(clockIn)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Uitgeklokt</span>
              <span className="font-medium">{formatClockTime(clockOut)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gewerkt</span>
              <span className="font-medium">{formatDuration(durationHours(clockIn, clockOut))}</span>
            </div>
            {entry.scheduledStartTime && entry.scheduledEndTime && (
              <div className="flex justify-between border-t pt-1 mt-1">
                <span className="text-muted-foreground">Gepland</span>
                <span>
                  {entry.scheduledStartTime} - {entry.scheduledEndTime}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="correctionMinutes">Correctie (minuten)</Label>
            <Input
              id="correctionMinutes"
              type="number"
              step={1}
              value={correctionMinutes}
              onChange={(e) => setCorrectionMinutes(e.target.value)}
              className="block w-full max-w-full overflow-hidden"
            />
            <p className="text-xs text-muted-foreground">
              Positief = minuten erbij op de uitkloktijd, negatief = eraf. Nieuwe eindtijd:{" "}
              <span className="font-medium text-foreground">{formatClockTime(adjustedEnd)}</span>
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="reviewNote">Notities</Label>
            <Textarea
              id="reviewNote"
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="Reden voor de aanpassing (optioneel)"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter className="flex-col sm:flex-col items-stretch gap-2">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuleren
            </Button>
            <Button
              type="button"
              variant="outline"
              className="text-destructive"
              onClick={() => setConfirmReject(true)}
            >
              Afwijzen
            </Button>
          </div>
          <Button type="button" onClick={handleApprove} disabled={pending} className="self-end">
            {pending ? "Bezig…" : "Goedkeuren"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
