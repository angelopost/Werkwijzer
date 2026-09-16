"use client";

import { useMemo, useState } from "react";
import { formatDayLabel, formatTime, getWeekDays, parseDateKey, toDateKey } from "@/lib/dates";
import { ShiftDialog } from "./shift-dialog";
import type { AvailabilityEntry, FunctieOption, LeavePeriod, ShiftItem, StaffRow } from "./types";

const LEAVE_LABEL: Record<LeavePeriod["type"], string> = { VERLOF: "Verlof", ZIEK: "Ziek" };
const LEAVE_COLOR: Record<LeavePeriod["type"], string> = { VERLOF: "#d97706", ZIEK: "#ea580c" };

export function RoosterGrid({
  weekStartKey,
  staff,
  functies,
  shifts,
  leavePeriods = [],
  availability = [],
}: {
  weekStartKey: string;
  staff: StaffRow[];
  functies: FunctieOption[];
  shifts: ShiftItem[];
  leavePeriods?: LeavePeriod[];
  availability?: AvailabilityEntry[];
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

  const availabilityByCell = useMemo(() => {
    const map = new Map<string, AvailabilityEntry>();
    for (const entry of availability) {
      map.set(`${entry.userId}_${entry.date}`, entry);
    }
    return map;
  }, [availability]);

  function leaveFor(userId: string, dateKey: string): LeavePeriod | undefined {
    return leavePeriods.find((l) => l.userId === userId && dateKey >= l.startDate && dateKey <= l.endDate);
  }

  const selectedStaff = staff.find((s) => s.id === selection?.staffId);

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
                const availabilityEntry = availabilityByCell.get(`${member.id}_${dateKey}`);
                return (
                  <td
                    key={dateKey}
                    className="min-h-16 border-r p-1.5 align-top last:border-r-0"
                  >
                    {leave && (
                      <div
                        className="mb-1 rounded-md px-2 py-1 text-xs font-medium text-white"
                        style={{ backgroundColor: LEAVE_COLOR[leave.type] }}
                      >
                        {LEAVE_LABEL[leave.type]}
                      </div>
                    )}
                    {!leave && availabilityEntry?.status === "UNAVAILABLE" && (
                      <div className="mb-1 rounded-md bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
                        Niet beschikbaar
                      </div>
                    )}
                    {!leave && availabilityEntry?.status === "PREFERRED" && (
                      <div className="mb-1 rounded-md bg-emerald-600/10 px-2 py-1 text-xs font-medium text-emerald-700">
                        Voorkeur
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelection({ staffId: member.id, dateKey, shift: null })}
                      className="mb-1 flex w-full min-h-14 items-center justify-center rounded-md border border-dashed border-transparent text-muted-foreground hover:border-border hover:bg-accent/50"
                    >
                      {cellShifts.length === 0 && <span className="text-lg leading-none">+</span>}
                    </button>
                    <div className="flex flex-col gap-1">
                      {cellShifts.map((shift) => (
                        <button
                          key={shift.id}
                          type="button"
                          onClick={() => setSelection({ staffId: member.id, dateKey, shift })}
                          className="w-full rounded-md px-2 py-1.5 text-left text-white shadow-sm"
                          style={{
                            backgroundColor: shift.functieColor ?? "#64748b",
                            opacity: shift.status === "DRAFT" ? 0.6 : 1,
                          }}
                        >
                          <div className="text-xs font-medium">
                            {formatTime(new Date(shift.startTime))} - {formatTime(new Date(shift.endTime))}
                          </div>
                          <div className="text-xs opacity-90">
                            {shift.functieName}
                            {shift.status === "DRAFT" && " · concept"}
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

      {selection && selectedStaff && (
        <ShiftDialog
          open
          onOpenChange={(open) => !open && setSelection(null)}
          staffId={selectedStaff.id}
          staffName={selectedStaff.name}
          dateKey={selection.dateKey}
          dateLabel={formatDayLabel(parseDateKey(selection.dateKey))}
          functies={functies}
          shift={selection.shift}
        />
      )}
    </div>
  );
}
