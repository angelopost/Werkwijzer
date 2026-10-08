"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import {
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
import { LeaveBlock, ShiftBlock } from "./shift-block";
import { staffPalette } from "./staff-colors";
import type { LeavePeriod, ShiftItem, StaffRow } from "./types";

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
                <UserAvatar
                  name={member.name}
                  colorClass={staffPalette(member.colorIndex).avatar}
                  className="shrink-0"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-sm font-medium">{member.name}</span>
                  <ContractTypeBadge contractType={member.contractType ?? null} />
                </div>
                <div className="flex w-36 shrink-0 flex-col items-stretch gap-1">
                  {leave && <LeaveBlock leave={leave} onClick={() => setSelectedLeave(leave)} />}
                  {cellShifts.map((shift) => (
                    <ShiftBlock
                      key={shift.id}
                      shift={shift}
                      colorIndex={member.colorIndex}
                      onClick={() => setSelection({ staffId: member.id, dateKey: mobileDateKey, shift })}
                    />
                  ))}
                  {!leave && cellShifts.length === 0 && (
                    <button
                      type="button"
                      onClick={() => setSelection({ staffId: member.id, dateKey: mobileDateKey, shift: null })}
                      className="flex size-8 items-center justify-center self-end rounded-lg border border-dashed text-muted-foreground hover:bg-accent/40"
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
                      today && "bg-primary/5"
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
                    <UserAvatar name={member.name} colorClass={staffPalette(member.colorIndex).avatar} />
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
                  const isEmpty = cellShifts.length === 0 && !leave;
                  const addShift = () => setSelection({ staffId: member.id, dateKey, shift: null });
                  return (
                    <td
                      key={dateKey}
                      className={cn("border-r p-1.5 align-top last:border-r-0", today && "bg-primary/5")}
                    >
                      <div className="group relative flex min-h-12 flex-col gap-1">
                        {leave && <LeaveBlock leave={leave} onClick={() => setSelectedLeave(leave)} />}
                        {cellShifts.map((shift) => (
                          <ShiftBlock
                            key={shift.id}
                            shift={shift}
                            colorIndex={member.colorIndex}
                            onClick={() => setSelection({ staffId: member.id, dateKey, shift })}
                          />
                        ))}

                        {isEmpty ? (
                          <button
                            type="button"
                            onClick={addShift}
                            aria-label="Dienst toevoegen"
                            className="flex min-h-12 w-full flex-1 items-center justify-center rounded-md border border-dashed border-transparent text-muted-foreground/60 transition-colors hover:border-border hover:bg-accent/40 hover:text-foreground"
                          >
                            <Plus className="size-4" strokeWidth={2} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={addShift}
                            aria-label="Nog een dienst toevoegen"
                            className="absolute right-0.5 bottom-0.5 flex size-5 items-center justify-center rounded-full border bg-background text-muted-foreground opacity-0 shadow-xs transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                          >
                            <Plus className="size-3" strokeWidth={2.5} />
                          </button>
                        )}
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
