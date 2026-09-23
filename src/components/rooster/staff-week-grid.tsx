"use client";

import { useState } from "react";
import {
  formatDayLabel,
  formatTime,
  getMonthShort,
  getWeekDays,
  getWeekdayShort,
  isToday,
  parseDateKey,
  toDateKey,
} from "@/lib/dates";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/user-avatar";
import { StaffShiftDialog } from "./staff-shift-dialog";
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
  const [selectedShift, setSelectedShift] = useState<ShiftItem | null>(null);
  const [mobileDayIndex, setMobileDayIndex] = useState(() => {
    const index = days.findIndex(isToday);
    return index === -1 ? 0 : index;
  });

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

  const mobileDay = days[mobileDayIndex] ?? days[0];
  const mobileDateKey = toDateKey(mobileDay);

  return (
    <div className="rounded-xl border bg-card">
      {/* Mobiel: dagkiezer + één dag als lijst, zodat er niet gescrold hoeft te worden. */}
      <div className="md:hidden">
        <div className="flex gap-1 overflow-x-auto border-b p-2">
          {days.map((day, index) => {
            const active = index === mobileDayIndex;
            const today = isToday(day);
            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => setMobileDayIndex(index)}
                className={cn(
                  "flex shrink-0 flex-col items-center rounded-lg px-2.5 py-1 text-center",
                  active
                    ? "bg-primary text-primary-foreground"
                    : today
                      ? "text-primary"
                      : "text-muted-foreground hover:bg-accent"
                )}
              >
                <span className="text-[10px] font-semibold uppercase tracking-wide">
                  {getWeekdayShort(day)}
                </span>
                <span className="text-sm font-semibold leading-tight">{day.getUTCDate()}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col divide-y">
          {staff.map((member) => {
            const cellShifts = shiftsByCell.get(`${member.id}_${mobileDateKey}`) ?? [];
            const leave = leaveFor(member.id, mobileDateKey);
            if (cellShifts.length === 0 && !leave) return null;
            return (
              <div key={member.id} className="flex items-center gap-2 p-2.5">
                <UserAvatar name={member.name} className="shrink-0" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{member.name}</span>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {leave && (
                    <div
                      className="rounded-lg px-2 py-1 text-xs font-medium text-white shadow-sm"
                      style={{ backgroundColor: LEAVE_COLOR[leave.type] }}
                    >
                      {LEAVE_LABEL[leave.type]}
                    </div>
                  )}
                  {cellShifts.map((shift) => (
                    <button
                      key={shift.id}
                      type="button"
                      onClick={() => setSelectedShift(shift)}
                      className="rounded-lg bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground shadow-sm"
                    >
                      {formatTime(new Date(shift.startTime))} - {formatTime(new Date(shift.endTime))}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          {staff.every((member) => {
            const cellShifts = shiftsByCell.get(`${member.id}_${mobileDateKey}`) ?? [];
            return cellShifts.length === 0 && !leaveFor(member.id, mobileDateKey);
          }) && <p className="p-3 text-sm text-muted-foreground">Geen diensten op deze dag.</p>}
        </div>
      </div>

      {/* Desktop/tablet: volledige weekgrid. */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[960px] border-collapse text-sm">
          <thead>
            <tr className="border-b">
              <th className="w-52 border-r p-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Medewerker
              </th>
              {days.map((day) => {
                const today = isToday(day);
                return (
                  <th
                    key={day.toISOString()}
                    className={cn(
                      "min-w-[128px] border-r p-2 text-left align-top last:border-r-0",
                      today && "bg-accent/50"
                    )}
                  >
                    <div className="text-[11px] font-semibold tracking-wide text-muted-foreground">
                      {getWeekdayShort(day)}
                    </div>
                    <div className={cn("text-lg font-semibold leading-tight", today ? "text-primary" : "text-foreground")}>
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
                <td className="border-r p-2 align-top">
                  <div className="flex items-center gap-2">
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
                      className={cn("border-r p-1 align-top last:border-r-0", today && "bg-accent/15")}
                    >
                      <div className="flex flex-col gap-0.5">
                        {leave && (
                          <div
                            className="rounded-lg px-2 py-1 text-xs font-medium text-white shadow-sm"
                            style={{ backgroundColor: LEAVE_COLOR[leave.type] }}
                          >
                            {LEAVE_LABEL[leave.type]}
                          </div>
                        )}
                        {cellShifts.map((shift) => (
                          <button
                            key={shift.id}
                            type="button"
                            onClick={() => setSelectedShift(shift)}
                            className="w-full rounded-lg bg-primary px-2 py-1 text-left text-primary-foreground shadow-sm transition-transform hover:-translate-y-px"
                          >
                            <div className="text-xs font-semibold">
                              {formatTime(new Date(shift.startTime))} - {formatTime(new Date(shift.endTime))}
                            </div>
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
      </div>

      {selectedShift && (
        <StaffShiftDialog
          open
          onOpenChange={(open) => !open && setSelectedShift(null)}
          dateLabel={formatDayLabel(parseDateKey(selectedShift.date))}
          shift={selectedShift}
        />
      )}
    </div>
  );
}
