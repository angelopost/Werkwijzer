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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatClockDayLabel, formatClockTime } from "@/lib/dates";
import { durationHours, formatDuration } from "@/lib/hours";

export type TimeEntryRow = {
  id: string;
  clockIn: string;
  clockOut: string | null;
  employeeName?: string;
  status?: "PENDING" | "APPROVED" | null;
  correctionMinutes?: number | null;
  reviewNote?: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "In afwachting",
  APPROVED: "Goedgekeurd",
};

export function TimeEntryList({
  entries,
  onSelect,
  onSubmit,
}: {
  entries: TimeEntryRow[];
  onSelect?: (entry: TimeEntryRow) => void;
  onSubmit?: (entryId: string) => void;
}) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">Nog geen in-/uitklokregistraties.</p>;
  }

  const showEmployee = entries.some((e) => e.employeeName !== undefined);
  const showStatus = onSubmit !== undefined || entries.some((e) => e.status);

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
            {showStatus && <TableHead>Status</TableHead>}
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
                <TableCell>{clockOut ? formatDuration(durationHours(clockIn, clockOut)) : "—"}</TableCell>
                {showStatus && (
                  <TableCell>
                    {entry.status ? (
                      <div className="flex flex-col gap-0.5">
                        <Badge variant={entry.status === "APPROVED" ? "default" : "secondary"}>
                          {STATUS_LABEL[entry.status]}
                        </Badge>
                        {entry.status === "APPROVED" && !!entry.correctionMinutes && (
                          <span className="text-xs text-muted-foreground">
                            Correctie: {entry.correctionMinutes > 0 ? "+" : ""}
                            {entry.correctionMinutes} min
                          </span>
                        )}
                      </div>
                    ) : clockOut && onSubmit ? (
                      <Button
                        type="button"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSubmit(entry.id);
                        }}
                      >
                        Indienen
                      </Button>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
