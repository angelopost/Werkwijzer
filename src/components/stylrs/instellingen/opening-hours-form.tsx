"use client";

import { useState, useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateOpeningHours } from "@/actions/stylrs/settings";
import { WEEKDAY_LABELS } from "@/lib/stylrs/constants";

type Day = { weekday: number; isClosed: boolean; openTime: string | null; closeTime: string | null };

export function OpeningHoursForm({ days }: { days: Day[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const byWeekday = new Map(days.map((d) => [d.weekday, d]));

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updateOpeningHours(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="rounded-xl border bg-card p-4 shadow-sm">
      {Array.from({ length: 7 }, (_, weekday) => {
        const day = byWeekday.get(weekday);
        return (
          <OpeningHoursRow key={weekday} weekday={weekday} day={day} />
        );
      })}
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={isPending} className="mt-4">
        {isPending ? "Bezig…" : "Openingstijden opslaan"}
      </Button>
    </form>
  );
}

function OpeningHoursRow({ weekday, day }: { weekday: number; day?: Day }) {
  const [open, setOpen] = useState(!day?.isClosed);

  return (
    <div className="flex flex-wrap items-center gap-3 border-b py-3 last:border-0">
      <label className="flex w-32 shrink-0 items-center gap-2 text-sm font-medium">
        <Checkbox checked={open} onCheckedChange={(v) => setOpen(v === true)} />
        <input type="hidden" name={`closed-${weekday}`} value={open ? "on" : ""} />
        {WEEKDAY_LABELS[weekday]}
      </label>
      {open ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Input type="time" name={`open-${weekday}`} defaultValue={day?.openTime ?? "09:00"} className="w-28" />
          <span>tot</span>
          <Input type="time" name={`close-${weekday}`} defaultValue={day?.closeTime ?? "18:00"} className="w-28" />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Gesloten</p>
      )}
    </div>
  );
}
