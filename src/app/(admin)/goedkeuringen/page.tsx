import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { formatLeaveRangeLabel, formatTime, getAmsterdamDateKey, parseDateKey, toDateKey } from "@/lib/dates";
import { ApprovalButtons } from "@/components/goedkeuringen/approval-buttons";
import { TimeEntryApprovalList } from "@/components/goedkeuringen/time-entry-approval-list";
import { approveLeave, rejectLeave, approveTimeEntryRequest, rejectTimeEntryRequest } from "./actions";

const TYPE_LABEL: Record<string, string> = { VERLOF: "Verlof", ZIEK: "Ziekmelding" };

export default async function GoedkeuringenPage() {
  const [leaveRequests, pendingTimeEntries] = await Promise.all([
    prisma.leaveRequest.findMany({
      where: { status: "PENDING", type: "VERLOF" },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.timeEntry.findMany({
      where: { status: "PENDING" },
      include: { user: true },
      orderBy: { submittedAt: "asc" },
    }),
  ]);

  // Eén query voor de eventueel geplande diensten van alle ingediende tijden samen,
  // in plaats van een aparte query per registratie.
  const entryDateKeys = pendingTimeEntries.map((e) => getAmsterdamDateKey(e.clockIn));
  const relevantShifts =
    pendingTimeEntries.length > 0
      ? await prisma.shift.findMany({
          where: {
            assignedUserId: { in: [...new Set(pendingTimeEntries.map((e) => e.userId))] },
            date: {
              gte: parseDateKey(entryDateKeys.reduce((min, k) => (k < min ? k : min))),
              lte: parseDateKey(entryDateKeys.reduce((max, k) => (k > max ? k : max))),
            },
          },
        })
      : [];
  const shiftByUserDate = new Map(
    relevantShifts.map((s) => [`${s.assignedUserId}_${toDateKey(s.date)}`, s])
  );

  const timeEntriesWithSchedule = pendingTimeEntries.map((entry) => {
    const dateKey = getAmsterdamDateKey(entry.clockIn);
    const shift = shiftByUserDate.get(`${entry.userId}_${dateKey}`);
    return {
      id: entry.id,
      employeeName: entry.user.name,
      clockIn: entry.clockIn.toISOString(),
      clockOut: entry.clockOut!.toISOString(),
      scheduledStartTime: shift ? formatTime(shift.startTime) : null,
      scheduledEndTime: shift ? formatTime(shift.endTime) : null,
    };
  });

  const hasNothing = leaveRequests.length === 0 && timeEntriesWithSchedule.length === 0;

  return (
    <div className="flex flex-col gap-8">
      {hasNothing && (
        <p className="text-sm text-muted-foreground">Er staan geen aanvragen open ter goedkeuring.</p>
      )}

      {timeEntriesWithSchedule.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Ingediende tijden</h2>
          <TimeEntryApprovalList
            entries={timeEntriesWithSchedule}
            onApprove={approveTimeEntryRequest}
            onReject={rejectTimeEntryRequest}
          />
        </section>
      )}

      {leaveRequests.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Verlofaanvragen</h2>
          <div className="flex flex-col gap-2">
            {leaveRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">
                      {request.user.name} · {TYPE_LABEL[request.type]}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatLeaveRangeLabel(
                        request.startDate,
                        request.endDate,
                        request.startTime,
                        request.endTime
                      )}
                      {request.reason && ` · ${request.reason}`}
                    </p>
                  </div>
                  <ApprovalButtons
                    onApprove={approveLeave.bind(null, request.id)}
                    onReject={rejectLeave.bind(null, request.id)}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
