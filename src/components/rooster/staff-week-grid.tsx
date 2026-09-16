import { formatDayLabel, formatTime, getWeekDays, parseDateKey, toDateKey } from "@/lib/dates";
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
    <div className="overflow-x-auto rounded-md border bg-card">
      <table className="w-full min-w-[900px] border-collapse text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="w-48 border-r p-3 text-left font-medium">Medewerker</th>
            {days.map((day) => (
              <th key={day.toISOString()} className="border-r p-3 text-left font-medium capitalize last:border-r-0">
                {formatDayLabel(day)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {staff.map((member) => (
            <tr key={member.id} className="border-b last:border-b-0">
              <td className="border-r p-3 font-medium align-top">{member.name}</td>
              {days.map((day) => {
                const dateKey = toDateKey(day);
                const cellShifts = shiftsByCell.get(`${member.id}_${dateKey}`) ?? [];
                const leave = leaveFor(member.id, dateKey);
                return (
                  <td key={dateKey} className="min-h-16 border-r p-1.5 align-top last:border-r-0">
                    <div className="flex flex-col gap-1">
                      {leave && (
                        <div
                          className="rounded-md px-2 py-1.5 text-xs font-medium text-white"
                          style={{ backgroundColor: LEAVE_COLOR[leave.type] }}
                        >
                          {LEAVE_LABEL[leave.type]}
                        </div>
                      )}
                      {cellShifts.map((shift) => (
                        <div
                          key={shift.id}
                          className="w-full rounded-md px-2 py-1.5 text-white shadow-sm"
                          style={{ backgroundColor: shift.functieColor ?? "#64748b" }}
                        >
                          <div className="text-xs font-medium">
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
