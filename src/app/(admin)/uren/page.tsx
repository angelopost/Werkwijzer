import { prisma } from "@/lib/db";
import { addUTCDays, formatDayLabel, getWeekStart, parseDateKey } from "@/lib/dates";
import { formatDuration, hasShiftEnded, shiftHours } from "@/lib/hours";
import { UrenFilters } from "@/components/uren/uren-filters";
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
  searchParams: Promise<{ from?: string; to?: string; userId?: string }>;
}) {
  const params = await searchParams;
  const defaultFrom = getWeekStart(new Date());
  const from = params.from ? parseDateKey(params.from) : defaultFrom;
  const to = params.to ? parseDateKey(params.to) : addUTCDays(defaultFrom, 6);

  const [staff, allShifts] = await Promise.all([
    prisma.user.findMany({
      where: { role: "STAFF", isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.shift.findMany({
      where: { date: { gte: from, lte: to }, status: "PUBLISHED" },
      orderBy: { date: "asc" },
    }),
  ]);
  const shifts = allShifts.filter(hasShiftEnded);

  const hoursByUser = new Map<string, number>();
  for (const shift of shifts) {
    if (!shift.assignedUserId) continue;
    const hours = shiftHours(shift.startTime, shift.endTime, shift.breakMinutes);
    hoursByUser.set(shift.assignedUserId, (hoursByUser.get(shift.assignedUserId) ?? 0) + hours);
  }

  const selectedStaff = params.userId ? staff.find((s) => s.id === params.userId) : undefined;
  const selectedShifts = selectedStaff
    ? shifts.filter((shift) => shift.assignedUserId === selectedStaff.id)
    : [];
  const selectedTotalHours = selectedShifts.reduce(
    (sum, shift) => sum + shiftHours(shift.startTime, shift.endTime, shift.breakMinutes),
    0
  );

  return (
    <div className="flex flex-col gap-4">
      <UrenFilters staff={staff.map((s) => ({ id: s.id, name: s.name }))} />

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
        Gebaseerd op gepubliceerde diensten in de gekozen periode waarvan de eindtijd al is
        verstreken, of die al zijn goedgekeurd via een inkloktijd. Concept-diensten en diensten
        die nog moeten plaatsvinden en nog niet zijn goedgekeurd tellen nog niet mee.
      </p>

      {selectedStaff && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold">
            Overzicht {selectedStaff.name}
          </h2>

          <div className="rounded-xl border bg-card p-6">
            <p className="text-sm text-muted-foreground">Totaal gewerkt</p>
            <p className="text-3xl font-semibold">{formatDuration(selectedTotalHours)}</p>
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
                {selectedShifts.map((shift) => (
                  <TableRow key={shift.id}>
                    <TableCell className="font-medium">{formatDayLabel(shift.date)}</TableCell>
                    <TableCell>
                      {formatDuration(shiftHours(shift.startTime, shift.endTime, shift.breakMinutes))}
                    </TableCell>
                  </TableRow>
                ))}
                {selectedShifts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      Geen gewerkte diensten in deze periode.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
