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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateLeavePeriod, deleteLeavePeriod, type ActionState } from "@/app/(admin)/rooster/actions";
import type { LeavePeriod } from "./types";

const TYPE_LABEL: Record<string, string> = { VERLOF: "Verlof", ZIEK: "Ziekmelding" };

export function LeaveDialog({
  open,
  onOpenChange,
  staffName,
  leave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffName: string;
  leave: LeavePeriod;
}) {
  const boundAction = updateLeavePeriod.bind(null, leave.id);
  const [state, action, pending] = useActionState<ActionState, FormData>(boundAction, undefined);

  useEffect(() => {
    if (state && !state.error) {
      onOpenChange(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  async function handleDelete() {
    await deleteLeavePeriod(leave.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verlof/ziekte bewerken — {staffName}</DialogTitle>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="leaveType">Type</Label>
            <Select name="type" defaultValue={leave.type}>
              <SelectTrigger id="leaveType" className="w-full">
                <SelectValue>{(value: string | null) => TYPE_LABEL[value ?? "VERLOF"]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VERLOF">Verlof</SelectItem>
                <SelectItem value="ZIEK">Ziekmelding</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex w-full min-w-0 flex-col gap-2">
              <Label htmlFor="startDate">Startdatum</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                required
                className="block w-full max-w-full overflow-hidden"
                defaultValue={leave.startDate}
              />
            </div>
            <div className="flex w-full min-w-0 flex-col gap-2">
              <Label htmlFor="endDate">Einddatum</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                required
                className="block w-full max-w-full overflow-hidden"
                defaultValue={leave.endDate}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="reason">Toelichting</Label>
            <Textarea id="reason" name="reason" defaultValue={leave.reason ?? ""} />
          </div>

          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

          <DialogFooter className="gap-2 sm:justify-between">
            <Button type="button" variant="outline" onClick={handleDelete} className="text-destructive">
              Aanvraag verwijderen
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Opslaan…" : "Opslaan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
