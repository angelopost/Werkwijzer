"use client";

import { useActionState, useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { setAvailability, type ActionState } from "@/actions/stylrs/employees";
import { WEEKDAY_LABELS } from "@/lib/stylrs/constants";

type Availability = { weekday: number; startTime: string; endTime: string };

function WeekdayRow({ employeeId, weekday, initial }: { employeeId: string; weekday: number; initial?: Availability }) {
  const [working, setWorking] = useState(!!initial);
  const action = setAvailability.bind(null, employeeId);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, undefined);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-3 border-b py-3 last:border-0">
      <input type="hidden" name="weekday" value={weekday} />
      <label className="flex w-32 shrink-0 items-center gap-2 text-sm font-medium">
        <Checkbox
          checked={working}
          onCheckedChange={(value) => setWorking(value === true)}
        />
        <input type="hidden" name="working" value={working ? "on" : ""} />
        {WEEKDAY_LABELS[weekday]}
      </label>
      {working ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Input
            type="time"
            name="startTime"
            defaultValue={initial?.startTime ?? "09:00"}
            className="w-28"
          />
          <span>tot</span>
          <Input type="time" name="endTime" defaultValue={initial?.endTime ?? "17:00"} className="w-28" />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Werkt niet</p>
      )}
      <Button type="submit" size="sm" variant="outline" disabled={pending} className="ml-auto">
        {pending ? "Bezig…" : "Opslaan"}
      </Button>
      {state?.error && <p className="w-full text-sm text-destructive">{state.error}</p>}
    </form>
  );
}

export function AvailabilityEditor({
  employeeId,
  availability,
}: {
  employeeId: string;
  availability: Availability[];
}) {
  const byWeekday = new Map(availability.map((a) => [a.weekday, a]));

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      {Array.from({ length: 7 }, (_, weekday) => (
        <WeekdayRow key={weekday} employeeId={employeeId} weekday={weekday} initial={byWeekday.get(weekday)} />
      ))}
    </div>
  );
}
