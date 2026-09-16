import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDayLabel } from "@/lib/dates";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LeaveForm } from "./leave-form";
import { CancelLeaveButton } from "@/components/verlof/cancel-leave-button";

const TYPE_LABEL: Record<string, string> = { VERLOF: "Verlof", ZIEK: "Ziekmelding" };
const STATUS_LABEL: Record<string, string> = {
  PENDING: "In afwachting",
  APPROVED: "Goedgekeurd",
  REJECTED: "Afgewezen",
};

export default async function VerlofPage() {
  const session = await auth();
  const userId = session!.user.id;

  const requests = await prisma.leaveRequest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Nieuwe aanvraag</h2>
        <LeaveForm />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Mijn aanvragen</h2>
        {requests.length === 0 && (
          <p className="text-sm text-muted-foreground">Je hebt nog geen verlof of ziekmeldingen ingediend.</p>
        )}
        <div className="flex flex-col gap-2">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardContent className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">
                    {TYPE_LABEL[request.type]} · {formatDayLabel(request.startDate)}
                    {toDateKeyEq(request.startDate, request.endDate)
                      ? ""
                      : ` t/m ${formatDayLabel(request.endDate)}`}
                  </p>
                  {request.reason && <p className="text-sm text-muted-foreground">{request.reason}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={request.status === "APPROVED" ? "default" : "secondary"}>
                    {STATUS_LABEL[request.status]}
                  </Badge>
                  {request.status === "PENDING" && <CancelLeaveButton leaveId={request.id} />}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function toDateKeyEq(a: Date, b: Date): boolean {
  return a.getTime() === b.getTime();
}
