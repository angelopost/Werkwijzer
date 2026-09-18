import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { formatLeaveRangeLabel, formatTime, getAmsterdamDateKey } from "@/lib/dates";
import { ApprovalButtons } from "@/components/goedkeuringen/approval-buttons";
import { TimeEntryApprovalList } from "@/components/goedkeuringen/time-entry-approval-list";
import { approveLeave, rejectLeave, approveTimeEntryRequest } from "./actions";

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

  const timeEntriesWithSchedule = await Promise.all(
    pendingTimeEntries.map(async (entry) => {
      const dateKey = getAmsterdamDateKey(entry.clockIn);
      const shift = await prisma.shift.findFirst({
        where: { assignedUserId: entry.userId, date: new Date(`${dateKey}T00:00:00Z`) },
      });
      return {
        id: entry.id,
        employeeName: entry.user.name,
        clockIn: entry.clockIn.toISOString(),
        clockOut: entry.clockOut!.toISOString(),
        scheduledStartTime: shift ? formatTime(shift.startTime) : null,
        scheduledEndTime: shift ? formatTime(shift.endTime) : null,
      };
    })
  );

  const hasNothing = leaveRequests.length === 0 && timeEntriesWithSchedule.length === 0;

  return (
    <div className="flex flex-col gap-8">
      {hasNothing && (
        <p className="text-sm text-muted-foreground">Er staan geen aanvragen open ter goedkeuring.</p>
      )}

      {timeEntriesWithSchedule.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Ingediende tijden</h2>
          <TimeEntryApprovalList entries={timeEntriesWithSchedule} onApprove={approveTimeEntryRequest} />
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
