"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { setAvailability } from "./actions";

type Status = "AVAILABLE" | "UNAVAILABLE" | "PREFERRED";

type DayEntry = {
  dateKey: string;
  label: string;
  status: Status | null;
  note: string;
};

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "AVAILABLE", label: "Beschikbaar" },
  { value: "PREFERRED", label: "Voorkeur" },
  { value: "UNAVAILABLE", label: "Niet beschikbaar" },
];

export function AvailabilityWeekForm({ initialDays }: { initialDays: DayEntry[] }) {
  const [days, setDays] = useState(initialDays);
  const [isPending, startTransition] = useTransition();

  function updateDay(index: number, patch: Partial<DayEntry>) {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  }

  function save(day: DayEntry) {
    if (!day.status) return;
    const formData = new FormData();
    formData.set("date", day.dateKey);
    formData.set("status", day.status);
    formData.set("note", day.note);
    startTransition(() => {
      setAvailability(formData);
    });
  }

  return (
    <div className="flex flex-col divide-y rounded-md border bg-card">
      {days.map((day, index) => (
        <div key={day.dateKey} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="w-28 shrink-0 text-sm font-medium capitalize">{day.label}</div>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={day.status === option.value ? "default" : "outline"}
                className={cn(
                  day.status === option.value &&
                    option.value === "UNAVAILABLE" &&
                    "bg-destructive text-white hover:bg-destructive/80",
                  day.status === option.value && option.value === "PREFERRED" && "bg-emerald-600 hover:bg-emerald-600/80"
                )}
                onClick={() => {
                  updateDay(index, { status: option.value });
                  save({ ...day, status: option.value });
                }}
              >
                {option.label}
              </Button>
            ))}
          </div>
          <Input
            placeholder="Notitie (optioneel)"
            value={day.note}
            onChange={(e) => updateDay(index, { note: e.target.value })}
            onBlur={() => save(day)}
            className="sm:max-w-xs"
          />
        </div>
      ))}
      {isPending && <p className="p-2 text-xs text-muted-foreground">Opslaan…</p>}
    </div>
  );
}
