"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/stylrs/format";
import { AppointmentDetailDialog } from "./appointment-detail-dialog";
import type { AppointmentStatus } from "@/generated/prisma/enums";

const HOUR_HEIGHT = 56;

export type AgendaAppointment = {
  id: string;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  note: string | null;
  price: number;
  customer: { firstName: string; lastName: string };
  employee: { id: string; firstName: string; lastName: string; color: string };
  service: { name: string };
};

export type AgendaColumn = {
  key: string;
  label: string;
  sublabel?: string;
  isToday?: boolean;
};

function minutesOf(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

export function AgendaGrid({
  columns,
  appointmentsByColumn,
  gridStartMinutes,
  gridEndMinutes,
  employees,
}: {
  columns: AgendaColumn[];
  appointmentsByColumn: Map<string, AgendaAppointment[]>;
  gridStartMinutes: number;
  gridEndMinutes: number;
  employees: { id: string; firstName: string; lastName: string }[];
}) {
  const [selected, setSelected] = useState<AgendaAppointment | null>(null);
  const totalMinutes = gridEndMinutes - gridStartMinutes;
  const pxPerMinute = HOUR_HEIGHT / 60;
  const gridHeight = totalMinutes * pxPerMinute;

  const hourMarks: number[] = [];
  for (let m = Math.ceil(gridStartMinutes / 60) * 60; m <= gridEndMinutes; m += 60) {
    hourMarks.push(m);
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
      <div className="flex min-w-[640px]">
        <div className="w-14 shrink-0 border-r">
          <div className="h-10 border-b" />
          <div className="relative" style={{ height: gridHeight }}>
            {hourMarks.map((m) => (
              <div
                key={m}
                className="absolute left-0 right-0 -translate-y-1/2 pr-2 text-right text-xs text-muted-foreground"
                style={{ top: (m - gridStartMinutes) * pxPerMinute }}
              >
                {String(Math.floor(m / 60)).padStart(2, "0")}:00
              </div>
            ))}
          </div>
        </div>

        {columns.map((col) => {
          const events = appointmentsByColumn.get(col.key) ?? [];
          return (
            <div key={col.key} className="min-w-[140px] flex-1 border-r last:border-r-0">
              <div
                className={cn(
                  "flex h-10 flex-col items-center justify-center border-b text-xs font-medium",
                  col.isToday && "bg-primary/5 text-primary"
                )}
              >
                <span>{col.label}</span>
                {col.sublabel && <span className="text-[0.65rem] text-muted-foreground">{col.sublabel}</span>}
              </div>
              <div className="relative" style={{ height: gridHeight }}>
                {hourMarks.map((m) => (
                  <div
                    key={m}
                    className="absolute left-0 right-0 border-t border-dashed"
                    style={{ top: (m - gridStartMinutes) * pxPerMinute }}
                  />
                ))}
                {events.map((event) => {
                  const start = Math.max(minutesOf(event.startTime), gridStartMinutes);
                  const end = Math.min(minutesOf(event.endTime), gridEndMinutes);
                  const top = (start - gridStartMinutes) * pxPerMinute;
                  const height = Math.max((end - start) * pxPerMinute, 20);
                  const cancelled = event.status === "CANCELLED";
                  return (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => setSelected(event)}
                      className={cn(
                        "absolute left-1 right-1 overflow-hidden rounded-md border-l-4 bg-card px-1.5 py-1 text-left text-xs shadow-sm ring-1 ring-black/5 transition-opacity hover:opacity-90",
                        cancelled && "opacity-50"
                      )}
                      style={{ top, height, borderLeftColor: event.employee.color }}
                    >
                      <p className="truncate font-medium text-foreground">
                        {event.customer.firstName} {event.customer.lastName}
                      </p>
                      <p className="truncate text-muted-foreground">
                        {formatTime(event.startTime)} · {event.service.name}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <AppointmentDetailDialog
          appointment={selected}
          employees={employees}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
