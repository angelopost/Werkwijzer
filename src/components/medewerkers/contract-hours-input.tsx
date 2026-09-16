"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { setContractHours } from "@/app/(admin)/medewerkers/actions";

export function ContractHoursInput({ userId, value }: { userId: string; value: number | null }) {
  const [current, setCurrent] = useState(value?.toString() ?? "");
  const [isPending, startTransition] = useTransition();

  function save() {
    const trimmed = current.trim();
    const hours = trimmed === "" ? null : Number(trimmed);
    startTransition(() => {
      setContractHours(userId, hours);
    });
  }

  return (
    <div className="flex items-center gap-1.5">
      <Input
        type="number"
        min={0}
        max={60}
        step={0.5}
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
        }}
        disabled={isPending}
        placeholder="—"
        className="h-8 w-20"
      />
      <span className="text-sm text-muted-foreground">uur</span>
    </div>
  );
}
