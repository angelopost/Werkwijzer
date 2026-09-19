import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { addUTCDays, formatDayLabel, getWeekStart, parseDateKey } from "@/lib/dates";
import { formatDuration, hasShiftEnded, shiftHours } from "@/lib/hours";
import { PeriodFilter } from "@/components/layout/period-filter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function MijnUrenPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const session = await auth();
  const userId = session!.user.id;

  const params = await searchParams;
  const defaultFrom = getWeekStart(new Date());
  const from = params.from ? parseDateKey(params.from) : defaultFrom;
  const to = params.to ? parseDateKey(params.to) : addUTCDays(defaultFrom, 6);

  const allShifts = await prisma.shift.findMany({
    where: { assignedUserId: userId, date: { gte: from, lte: to }, status: "PUBLISHED" },
    orderBy: { date: "asc" },
  });
  const shifts = allShifts.filter(hasShiftEnded);

  const totalHours = shifts.reduce(
    (sum, shift) => sum + shiftHours(shift.startTime, shift.endTime, shift.breakMinutes),
    0
  );

  return (
    <div className="flex flex-col gap-4">
      <PeriodFilter />

      <p className="text-sm text-muted-foreground">
        {formatDayLabel(from)} t/m {formatDayLabel(to)}
      </p>

      <div className="rounded-xl border bg-card p-6">
        <p className="text-sm text-muted-foreground">Totaal gewerkt</p>
        <p className="text-3xl font-semibold">{formatDuration(totalHours)}</p>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Datum</TableHead>
              <TableHead>Uren</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shifts.map((shift) => (
              <TableRow key={shift.id}>
                <TableCell className="font-medium">{formatDayLabel(shift.date)}</TableCell>
                <TableCell>
                  {formatDuration(shiftHours(shift.startTime, shift.endTime, shift.breakMinutes))}
                </TableCell>
              </TableRow>
            ))}
            {shifts.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground">
                  Geen gepubliceerde diensten in deze periode.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
