import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { formatDayLabel } from "@/lib/dates";
import { ApprovalButtons } from "@/components/goedkeuringen/approval-buttons";
import { approveLeave, rejectLeave } from "./actions";

const TYPE_LABEL: Record<string, string> = { VERLOF: "Verlof", ZIEK: "Ziekmelding" };

export default async function GoedkeuringenPage() {
  const leaveRequests = await prisma.leaveRequest.findMany({
    where: { status: "PENDING", type: "VERLOF" },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex flex-col gap-8">
      {leaveRequests.length === 0 && (
        <p className="text-sm text-muted-foreground">Er staan geen aanvragen open ter goedkeuring.</p>
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
