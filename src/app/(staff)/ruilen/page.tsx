import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDayLabel, formatTime } from "@/lib/dates";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RequestSwapDialog } from "@/components/ruilen/request-swap-dialog";
import { CancelSwapButton } from "@/components/ruilen/cancel-swap-button";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "In afwachting",
  APPROVED: "Goedgekeurd",
  REJECTED: "Afgewezen",
  CANCELLED: "Geannuleerd",
};

export default async function RuilenPage() {
  const session = await auth();
  const userId = session!.user.id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [upcomingShifts, colleagues, myRequests] = await Promise.all([
    prisma.shift.findMany({
      where: { assignedUserId: userId, status: "PUBLISHED", date: { gte: today } },
      include: { functie: true },
      orderBy: { date: "asc" },
    }),
    prisma.user.findMany({
      where: { role: "STAFF", isActive: true, id: { not: userId } },
      orderBy: { name: "asc" },
    }),
    prisma.shiftSwapRequest.findMany({
      where: { requestingUserId: userId },
      include: { shift: { include: { functie: true } }, targetUser: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const requestedShiftIds = new Set(
    myRequests.filter((r) => r.status === "PENDING").map((r) => r.shiftId)
  );

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Mijn aankomende diensten</h2>
        {upcomingShifts.length === 0 && (
          <p className="text-sm text-muted-foreground">Je hebt geen aankomende diensten.</p>
        )}
        <div className="flex flex-col gap-2">
          {upcomingShifts.map((shift) => (
            <Card key={shift.id}>
              <CardContent className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium capitalize">{formatDayLabel(shift.date)}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatTime(shift.startTime)} - {formatTime(shift.endTime)} · {shift.functie?.name}
                  </p>
                </div>
                {requestedShiftIds.has(shift.id) ? (
                  <Badge variant="secondary">Ruil aangevraagd</Badge>
                ) : (
                  <RequestSwapDialog
                    shiftId={shift.id}
                    shiftLabel={`${formatDayLabel(shift.date)}, ${formatTime(shift.startTime)} - ${formatTime(shift.endTime)}`}
                    colleagues={colleagues.map((c) => ({ id: c.id, name: c.name }))}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Mijn ruilverzoeken</h2>
        {myRequests.length === 0 && (
          <p className="text-sm text-muted-foreground">Je hebt nog geen ruilverzoeken ingediend.</p>
        )}
        <div className="flex flex-col gap-2">
          {myRequests.map((request) => (
            <Card key={request.id}>
              <CardContent className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium capitalize">{formatDayLabel(request.shift.date)}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatTime(request.shift.startTime)} - {formatTime(request.shift.endTime)} ·{" "}
                    {request.shift.functie?.name}
                    {request.targetUser && ` · voor ${request.targetUser.name}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={request.status === "APPROVED" ? "default" : "secondary"}>
                    {STATUS_LABEL[request.status]}
                  </Badge>
                  {request.status === "PENDING" && <CancelSwapButton swapId={request.id} />}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
