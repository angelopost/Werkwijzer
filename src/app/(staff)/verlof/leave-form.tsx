"use client";

import { useActionState } from "react";
import { requestLeave, type LeaveActionState } from "./actions";
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

const TYPE_LABEL: Record<string, string> = { VERLOF: "Verlof", ZIEK: "Ziekmelding" };

export function LeaveForm() {
  const [state, action, pending] = useActionState<LeaveActionState, FormData>(requestLeave, undefined);

  return (
    <form action={action} className="flex flex-col gap-4 rounded-md border bg-card p-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="type">Type</Label>
        <Select name="type" defaultValue="VERLOF">
          <SelectTrigger id="type" className="w-full">
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
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="reason">Toelichting (optioneel)</Label>
        <Textarea id="reason" name="reason" />
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.success && <p className="text-sm text-emerald-600">Aanvraag ingediend.</p>}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Bezig…" : "Indienen"}
      </Button>
    </form>
  );
}
