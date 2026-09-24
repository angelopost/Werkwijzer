"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { addTimeOff, deleteTimeOff, type ActionState } from "@/actions/stylrs/employees";
import { formatDateShort } from "@/lib/stylrs/format";
import { Trash2 } from "lucide-react";

type TimeOff = { id: string; startDate: Date; endDate: Date; reason: string | null };

export function TimeOffList({ employeeId, timeOff }: { employeeId: string; timeOff: TimeOff[] }) {
  const action = addTimeOff.bind(null, employeeId);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, undefined);

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <ul className="mb-4 flex flex-col gap-2">
        {timeOff.map((item) => (
          <li key={item.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
            <div>
              <p className="font-medium text-foreground">
                {formatDateShort(item.startDate)} – {formatDateShort(item.endDate)}
              </p>
              {item.reason && <p className="text-xs text-muted-foreground">{item.reason}</p>}
            </div>
            <form action={deleteTimeOff.bind(null, employeeId, item.id)}>
              <Button type="submit" variant="ghost" size="icon-sm" aria-label="Verwijderen">
                <Trash2 className="size-4" />
              </Button>
            </form>
          </li>
        ))}
        {timeOff.length === 0 && (
          <li className="text-sm text-muted-foreground">Geen vrije dagen of vakanties gepland.</li>
        )}
      </ul>

      <form action={formAction} className="flex flex-wrap items-end gap-3 border-t pt-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="startDate">Van</Label>
          <Input id="startDate" name="startDate" type="date" required className="w-40" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="endDate">Tot en met</Label>
          <Input id="endDate" name="endDate" type="date" required className="w-40" />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="reason">Reden (optioneel)</Label>
          <Input id="reason" name="reason" placeholder="Bijv. vakantie" />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Bezig…" : "Toevoegen"}
        </Button>
        {state?.error && <p className="w-full text-sm text-destructive">{state.error}</p>}
      </form>
    </div>
  );
}
