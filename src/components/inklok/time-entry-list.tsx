"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatClockDayLabel, formatClockTime } from "@/lib/dates";
import { durationHours, formatHours } from "@/lib/hours";

export type TimeEntryRow = {
  id: string;
  clockIn: string;
  clockOut: string | null;
  employeeName?: string;
};

export function TimeEntryList({
  entries,
  onSelect,
}: {
  entries: TimeEntryRow[];
  onSelect?: (entry: TimeEntryRow) => void;
}) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">Nog geen in-/uitklokregistraties.</p>;
  }

  const showEmployee = entries.some((e) => e.employeeName !== undefined);

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {showEmployee && <TableHead>Medewerker</TableHead>}
            <TableHead>Datum</TableHead>
            <TableHead>Ingeklokt</TableHead>
            <TableHead>Uitgeklokt</TableHead>
            <TableHead>Duur</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => {
            const clockIn = new Date(entry.clockIn);
            const clockOut = entry.clockOut ? new Date(entry.clockOut) : null;
            return (
              <TableRow
                key={entry.id}
                onClick={onSelect ? () => onSelect(entry) : undefined}
                className={cn(onSelect && "cursor-pointer")}
              >
                {showEmployee && <TableCell className="font-medium">{entry.employeeName}</TableCell>}
                <TableCell className={cn(!showEmployee && "font-medium")}>
                  {formatClockDayLabel(clockIn)}
                </TableCell>
                <TableCell>{formatClockTime(clockIn)}</TableCell>
                <TableCell>
                  {clockOut ? (
                    formatClockTime(clockOut)
                  ) : (
                    <Badge variant="secondary">Nog bezig</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {clockOut ? `${formatHours(durationHours(clockIn, clockOut))} uur` : "—"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
