"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import {
  formatTime,
  getMonthShort,
  getWeekDays,
  getWeekdayShort,
  isToday,
  parseDateKey,
  toDateKey,
  formatDayLabel,
} from "@/lib/dates";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ContractTypeBadge } from "@/components/ui/contract-type-badge";
import { ShiftDialog } from "./shift-dialog";
import type { LeavePeriod, ShiftItem, StaffRow } from "./types";

const LEAVE_LABEL: Record<LeavePeriod["type"], string> = { VERLOF: "Verlof", ZIEK: "Ziek" };
const LEAVE_COLOR: Record<LeavePeriod["type"], string> = { VERLOF: "#d97706", ZIEK: "#ea580c" };

export function RoosterGrid({
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
  const days = useMemo(() => getWeekDays(parseDateKey(weekStartKey)), [weekStartKey]);
  const [selection, setSelection] = useState<{ staffId: string; dateKey: string; shift: ShiftItem | null } | null>(
    null
  );

  const shiftsByCell = useMemo(() => {
    const map = new Map<string, ShiftItem[]>();
    for (const shift of shifts) {
      const key = `${shift.assignedUserId}_${shift.date}`;
      const list = map.get(key) ?? [];
      list.push(shift);
      map.set(key, list);
    }
    return map;
  }, [shifts]);

  function leaveFor(userId: string, dateKey: string): LeavePeriod | undefined {
    return leavePeriods.find((l) => l.userId === userId && dateKey >= l.startDate && dateKey <= l.endDate);
  }

  const selectedStaff = staff.find((s) => s.id === selection?.staffId);

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
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate font-medium">{member.name}</span>
                    <ContractTypeBadge contractType={member.contractType ?? null} />
                  </div>
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
                    {leave && (
                      <div
                        className="mb-1 rounded-lg px-2 py-1.5 text-xs font-medium text-white shadow-sm"
                        style={{ backgroundColor: LEAVE_COLOR[leave.type] }}
                      >
                        {LEAVE_LABEL[leave.type]}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelection({ staffId: member.id, dateKey, shift: null })}
                      className="mb-1 flex min-h-14 w-full items-center justify-center rounded-lg border border-dashed border-transparent text-muted-foreground hover:border-border hover:bg-accent/40"
                    >
                      {cellShifts.length === 0 && <Plus className="size-4" strokeWidth={2} />}
                    </button>
                    <div className="flex flex-col gap-1">
                      {cellShifts.map((shift) => (
                        <button
                          key={shift.id}
                          type="button"
                          onClick={() => setSelection({ staffId: member.id, dateKey, shift })}
                          className={cn(
                            "w-full rounded-lg bg-primary px-2.5 py-1.5 text-left text-primary-foreground shadow-sm transition-transform hover:-translate-y-px",
                            shift.status === "DRAFT" && "opacity-55"
                          )}
                        >
                          <div className="text-xs font-semibold">
                            {formatTime(new Date(shift.startTime))} - {formatTime(new Date(shift.endTime))}
                          </div>
                          {shift.status === "DRAFT" && <div className="text-xs opacity-90">Concept</div>}
                        </button>
                      ))}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {selection && selectedStaff && (
        <ShiftDialog
          open
          onOpenChange={(open) => !open && setSelection(null)}
          staffId={selectedStaff.id}
          staffName={selectedStaff.name}
          dateKey={selection.dateKey}
          dateLabel={formatDayLabel(parseDateKey(selection.dateKey))}
          shift={selection.shift}
        />
      )}
    </div>
  );
}
