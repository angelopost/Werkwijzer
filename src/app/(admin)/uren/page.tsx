import { prisma } from "@/lib/db";
import { addUTCDays, formatDayLabel, getWeekStart, parseDateKey } from "@/lib/dates";
import { formatDuration, shiftHours } from "@/lib/hours";
import { PeriodFilter } from "@/components/layout/period-filter";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function UrenPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const defaultFrom = getWeekStart(new Date());
  const from = params.from ? parseDateKey(params.from) : defaultFrom;
  const to = params.to ? parseDateKey(params.to) : addUTCDays(defaultFrom, 6);

  const [staff, shifts] = await Promise.all([
    prisma.user.findMany({
      where: { role: "STAFF", isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.shift.findMany({
      where: { date: { gte: from, lte: to }, status: "PUBLISHED" },
    }),
  ]);

  const hoursByUser = new Map<string, number>();
  for (const shift of shifts) {
    if (!shift.assignedUserId) continue;
    const hours = shiftHours(shift.startTime, shift.endTime, shift.breakMinutes);
    hoursByUser.set(shift.assignedUserId, (hoursByUser.get(shift.assignedUserId) ?? 0) + hours);
  }

  return (
    <div className="flex flex-col gap-4">
      <PeriodFilter />

      <p className="text-sm text-muted-foreground">
        {formatDayLabel(from)} t/m {formatDayLabel(to)}
      </p>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Medewerker</TableHead>
              <TableHead>Gewerkte uren</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((member) => {
              const hours = hoursByUser.get(member.id) ?? 0;
              return (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2.5">
                      <UserAvatar name={member.name} />
                      {member.name}
                    </div>
                  </TableCell>
                  <TableCell>{formatDuration(hours)}</TableCell>
                </TableRow>
              );
            })}
            {staff.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground">
                  Nog geen medewerkers.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        Gebaseerd op gepubliceerde diensten in de gekozen periode. Concept-diensten tellen nog
        niet mee.
      </p>
    </div>
  );
}
