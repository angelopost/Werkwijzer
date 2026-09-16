import { formatTime, getMonthShort, getWeekDays, getWeekdayShort, isToday, parseDateKey, toDateKey } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { LeavePeriod, ShiftItem, StaffRow } from "./types";

const LEAVE_LABEL: Record<LeavePeriod["type"], string> = { VERLOF: "Verlof", ZIEK: "Ziek" };
const LEAVE_COLOR: Record<LeavePeriod["type"], string> = { VERLOF: "#d97706", ZIEK: "#ea580c" };

export function StaffWeekGrid({
  weekStartKey,
  staff,
  shifts,
  leavePeriods = [],
}: {
  weekStartKey: string;
  staff: StaffRow[];
  shifts: ShiftItem[];
  leavePeriods?: LeavePeriod[];
}) {
  const days = getWeekDays(parseDateKey(weekStartKey));

  const shiftsByCell = new Map<string, ShiftItem[]>();
  for (const shift of shifts) {
    const key = `${shift.assignedUserId}_${shift.date}`;
    const list = shiftsByCell.get(key) ?? [];
    list.push(shift);
    shiftsByCell.set(key, list);
  }

  function leaveFor(userId: string, dateKey: string): LeavePeriod | undefined {
    return leavePeriods.find((l) => l.userId === userId && dateKey >= l.startDate && dateKey <= l.endDate);
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full min-w-[960px] border-collapse text-sm">
        <thead>
          <tr className="border-b">
            <th className="w-52 border-r p-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Medewerker
            </th>
            {days.map((day) => {
              const today = isToday(day);
              return (
                <th
                  key={day.toISOString()}
                  className={cn(
                    "min-w-[128px] border-r p-3 text-left align-top last:border-r-0",
                    today && "bg-accent/50"
                  )}
                >
                  <div className="text-[11px] font-semibold tracking-wide text-muted-foreground">
                    {getWeekdayShort(day)}
                  </div>
                  <div className={cn("text-xl font-semibold leading-tight", today ? "text-primary" : "text-foreground")}>
                    {day.getUTCDate()}
                  </div>
                  <div className="text-[11px] text-muted-foreground">{getMonthShort(day)}</div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {staff.map((member) => (
            <tr key={member.id} className="border-b last:border-b-0">
              <td className="border-r p-3 align-top">
                <div className="flex items-center gap-2.5">
                  <UserAvatar name={member.name} />
                  <span className="font-medium">{member.name}</span>
                </div>
              </td>
              {days.map((day) => {
                const dateKey = toDateKey(day);
                const cellShifts = shiftsByCell.get(`${member.id}_${dateKey}`) ?? [];
                const leave = leaveFor(member.id, dateKey);
                const today = isToday(day);
                return (
                  <td
                    key={dateKey}
                    className={cn("min-h-16 border-r p-1.5 align-top last:border-r-0", today && "bg-accent/15")}
                  >
                    <div className="flex flex-col gap-1">
                      {leave && (
                        <div
                          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-white shadow-sm"
                          style={{ backgroundColor: LEAVE_COLOR[leave.type] }}
                        >
                          {LEAVE_LABEL[leave.type]}
                        </div>
                      )}
                      {cellShifts.map((shift) => (
                        <div
                          key={shift.id}
                          className="w-full rounded-lg px-2.5 py-1.5 text-white shadow-sm"
                          style={{ backgroundColor: shift.functieColor ?? "#64748b" }}
                        >
                          <div className="text-xs font-semibold">
                            {formatTime(new Date(shift.startTime))} - {formatTime(new Date(shift.endTime))}
                          </div>
                          <div className="text-xs opacity-90">{shift.functieName}</div>
                        </div>
                      ))}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
