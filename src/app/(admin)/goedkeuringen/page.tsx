import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDayLabel, formatTime } from "@/lib/dates";
import { ApprovalButtons } from "@/components/goedkeuringen/approval-buttons";
import { approveSwap, rejectSwap, approveLeave, rejectLeave } from "./actions";

const TYPE_LABEL: Record<string, string> = { VERLOF: "Verlof", ZIEK: "Ziekmelding" };

export default async function GoedkeuringenPage() {
  const [swaps, leaveRequests] = await Promise.all([
    prisma.shiftSwapRequest.findMany({
      where: { status: "PENDING" },
      include: { shift: true, requestingUser: true, targetUser: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.leaveRequest.findMany({
      where: { status: "PENDING", type: "VERLOF" },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const total = swaps.length + leaveRequests.length;

  return (
    <div className="flex flex-col gap-8">
      {total === 0 && (
        <p className="text-sm text-muted-foreground">Er staan geen aanvragen open ter goedkeuring.</p>
      )}

      {swaps.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Ruilverzoeken</h2>
          <div className="flex flex-col gap-2">
            {swaps.map((swap) => (
              <Card key={swap.id}>
                <CardContent className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">
                      {swap.requestingUser.name}
                      {swap.targetUser && <> &rarr; {swap.targetUser.name}</>}
                      {!swap.targetUser && <Badge variant="secondary" className="ml-2">open voor iedereen</Badge>}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {formatDayLabel(swap.shift.date)}, {formatTime(swap.shift.startTime)} -{" "}
                      {formatTime(swap.shift.endTime)}
                    </p>
                  </div>
                  <ApprovalButtons
                    onApprove={approveSwap.bind(null, swap.id)}
                    onReject={rejectSwap.bind(null, swap.id)}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
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
                      {formatDayLabel(request.startDate)} t/m {formatDayLabel(request.endDate)}
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
