"use client";

import { useMemo, useState } from "react";
import { Plus, Repeat } from "lucide-react";
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
import { LeaveDialog } from "./leave-dialog";
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
  const [selectedLeave, setSelectedLeave] = useState<LeavePeriod | null>(null);
  const [mobileDayIndex, setMobileDayIndex] = useState(() => {
    const index = days.findIndex(isToday);
    return index === -1 ? 0 : index;
  });

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
            return (
              <div key={member.id} className="flex items-center gap-2 p-2.5">
                <UserAvatar name={member.name} className="shrink-0" />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-sm font-medium">{member.name}</span>
                  <ContractTypeBadge contractType={member.contractType ?? null} />
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {leave && (
                    <button
                      type="button"
                      onClick={() => setSelectedLeave(leave)}
                      className="rounded-lg px-2 py-1 text-xs font-medium text-white shadow-sm"
                      style={{ backgroundColor: LEAVE_COLOR[leave.type] }}
                    >
                      {LEAVE_LABEL[leave.type]}
                    </button>
                  )}
                  {cellShifts.map((shift) => (
                    <button
                      key={shift.id}
                      type="button"
                      onClick={() => setSelection({ staffId: member.id, dateKey: mobileDateKey, shift })}
                      className={cn(
                        "flex items-center gap-1 rounded-lg bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground shadow-sm",
                        shift.status === "DRAFT" && "opacity-55"
                      )}
                    >
                      {shift.permanentShiftId && <Repeat className="size-3 shrink-0" strokeWidth={2.5} />}
                      {formatTime(new Date(shift.startTime))} - {formatTime(new Date(shift.endTime))}
                    </button>
                  ))}
                  {!leave && cellShifts.length === 0 && (
                    <button
                      type="button"
                      onClick={() => setSelection({ staffId: member.id, dateKey: mobileDateKey, shift: null })}
                      className="flex size-8 items-center justify-center rounded-lg border border-dashed text-muted-foreground hover:bg-accent/40"
                    >
                      <Plus className="size-4" strokeWidth={2} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
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
                      className={cn("border-r p-1 align-top last:border-r-0", today && "bg-accent/15")}
                    >
                      {leave && (
                        <button
                          type="button"
                          onClick={() => setSelectedLeave(leave)}
                          className="mb-0.5 w-full rounded-lg px-2 py-1 text-left text-xs font-medium text-white shadow-sm transition-transform hover:-translate-y-px"
                          style={{ backgroundColor: LEAVE_COLOR[leave.type] }}
                        >
                          {LEAVE_LABEL[leave.type]}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelection({ staffId: member.id, dateKey, shift: null })}
                        className="mb-0.5 flex min-h-8 w-full items-center justify-center rounded-lg border border-dashed border-transparent text-muted-foreground hover:border-border hover:bg-accent/40"
                      >
                        {cellShifts.length === 0 && <Plus className="size-4" strokeWidth={2} />}
                      </button>
                      <div className="flex flex-col gap-0.5">
                        {cellShifts.map((shift) => (
                          <button
                            key={shift.id}
                            type="button"
                            onClick={() => setSelection({ staffId: member.id, dateKey, shift })}
                            className={cn(
                              "w-full rounded-lg bg-primary px-2 py-1 text-left text-primary-foreground shadow-sm transition-transform hover:-translate-y-px",
                              shift.status === "DRAFT" && "opacity-55"
                            )}
                          >
                            <div className="flex items-center gap-1 text-xs font-semibold">
                              {shift.permanentShiftId && <Repeat className="size-3 shrink-0" strokeWidth={2.5} />}
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
      </div>

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

      {selectedLeave && (
        <LeaveDialog
          open
          onOpenChange={(open) => !open && setSelectedLeave(null)}
          staffName={staff.find((s) => s.id === selectedLeave.userId)?.name ?? ""}
          leave={selectedLeave}
        />
      )}
    </div>
  );
}
