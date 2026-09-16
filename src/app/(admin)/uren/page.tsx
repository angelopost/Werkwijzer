import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatWeekRangeLabel, getWeekDays, getWeekStart, parseDateKey, shiftWeek, toDateKey } from "@/lib/dates";
import { formatHours, shiftHours } from "@/lib/hours";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function UrenPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const params = await searchParams;
  const weekStart = params.week ? parseDateKey(params.week) : getWeekStart(new Date());
  const days = getWeekDays(weekStart);
  const from = days[0];
  const to = days[6];

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

  const prevWeekKey = toDateKey(shiftWeek(weekStart, -1));
  const nextWeekKey = toDateKey(shiftWeek(weekStart, 1));
  const todayWeekKey = toDateKey(getWeekStart(new Date()));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href={`/uren?week=${prevWeekKey}`}>&larr;</Link>}
        />
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href={`/uren?week=${todayWeekKey}`}>Deze week</Link>}
        />
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href={`/uren?week=${nextWeekKey}`}>&rarr;</Link>}
        />
        <span className="ml-2 text-sm font-medium">{formatWeekRangeLabel(weekStart)}</span>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Medewerker</TableHead>
              <TableHead>Geplande uren</TableHead>
              <TableHead>Contracturen</TableHead>
              <TableHead>Verschil</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((member) => {
              const hours = hoursByUser.get(member.id) ?? 0;
              const contract = member.contractHoursPerWeek;
              const diff = contract != null ? hours - contract : null;
              return (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{formatHours(hours)} uur</TableCell>
                  <TableCell>{contract != null ? `${formatHours(contract)} uur` : "—"}</TableCell>
                  <TableCell>
                    {diff == null ? (
                      "—"
                    ) : Math.abs(diff) < 0.05 ? (
                      <Badge variant="secondary">Op schema</Badge>
                    ) : (
                      <Badge variant={diff > 0 ? "default" : "secondary"}>
                        {diff > 0 ? "+" : ""}
                        {formatHours(diff)} uur
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {staff.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Nog geen medewerkers.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        Gebaseerd op gepubliceerde diensten deze week. Concept-diensten tellen nog niet mee.
      </p>
    </div>
  );
}
