"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatClockTime } from "@/lib/dates";

type ClockActionResult = { error?: string; entry?: { clockIn: string; clockOut: string | null } };

export function ClockButton({
  initialClockIn,
  onClockIn,
  onClockOut,
}: {
  initialClockIn: string | null;
  onClockIn: () => Promise<ClockActionResult>;
  onClockOut: () => Promise<ClockActionResult>;
}) {
  const [clockIn, setClockIn] = useState(initialClockIn);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = clockIn ? await onClockOut() : await onClockIn();
      if (result.error) {
        setError(result.error);
        return;
      }
      setClockIn(clockIn ? null : (result.entry?.clockIn ?? new Date().toISOString()));
      router.refresh();
    });
  }

  const isClockedIn = clockIn !== null;

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center">
      <span
        className={
          "flex size-12 items-center justify-center rounded-full " +
          (isClockedIn ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground")
        }
      >
        <Clock className="size-6" />
      </span>
      <div>
        <p className="font-medium">
          {isClockedIn ? `Ingeklokt sinds ${formatClockTime(new Date(clockIn!))}` : "Niet ingeklokt"}
        </p>
        <p className="text-sm text-muted-foreground">
          {isClockedIn ? "Klik om je dienst te beëindigen" : "Klik om je dienst te starten"}
        </p>
      </div>
      <Button
        type="button"
        size="lg"
        variant={isClockedIn ? "destructive" : "default"}
        disabled={pending}
        onClick={handleClick}
        className="w-full sm:w-auto"
      >
        {pending ? "Bezig…" : isClockedIn ? "Uitklokken" : "Inklokken"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
