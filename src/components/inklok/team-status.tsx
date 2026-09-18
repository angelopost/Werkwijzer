import { UserAvatar } from "@/components/ui/user-avatar";
import { Badge } from "@/components/ui/badge";
import { formatClockTime } from "@/lib/dates";

export type TeamStatusRow = {
  id: string;
  name: string;
  openSince: string | null;
};

export function TeamStatus({ staff }: { staff: TeamStatusRow[] }) {
  if (staff.length === 0) {
    return <p className="text-sm text-muted-foreground">Nog geen medewerkers.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {staff.map((member) => (
        <div key={member.id} className="flex items-center justify-between rounded-md border bg-card p-3">
          <div className="flex items-center gap-2.5">
            <UserAvatar name={member.name} />
            <span className="font-medium">{member.name}</span>
          </div>
          {member.openSince ? (
            <Badge>Ingeklokt sinds {formatClockTime(new Date(member.openSince))}</Badge>
          ) : (
            <Badge variant="secondary">Niet ingeklokt</Badge>
          )}
        </div>
      ))}
    </div>
  );
}
