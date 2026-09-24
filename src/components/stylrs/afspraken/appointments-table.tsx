"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateLong, formatTime } from "@/lib/stylrs/format";
import { AppointmentDetailDialog } from "@/components/stylrs/agenda/appointment-detail-dialog";
import type { AgendaAppointment } from "@/components/stylrs/agenda/agenda-grid";

const STATUS_VARIANT: Record<string, "default" | "secondary"> = {
  CONFIRMED: "default",
  COMPLETED: "secondary",
  CANCELLED: "secondary",
  NO_SHOW: "secondary",
};

const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: "Bevestigd",
  COMPLETED: "Afgerond",
  CANCELLED: "Geannuleerd",
  NO_SHOW: "No-show",
};

export function AppointmentsTable({
  appointments,
  employees,
}: {
  appointments: AgendaAppointment[];
  employees: { id: string; firstName: string; lastName: string }[];
}) {
  const [selected, setSelected] = useState<AgendaAppointment | null>(null);

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Datum</TableHead>
            <TableHead>Klant</TableHead>
            <TableHead>Behandeling</TableHead>
            <TableHead>Medewerker</TableHead>
            <TableHead>Prijs</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((appointment) => (
            <TableRow
              key={appointment.id}
              className="cursor-pointer"
              onClick={() => setSelected(appointment)}
            >
              <TableCell>
                <p className="font-medium text-foreground">{formatDateLong(appointment.startTime)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatTime(appointment.startTime)} – {formatTime(appointment.endTime)}
                </p>
              </TableCell>
              <TableCell>
                {appointment.customer.firstName} {appointment.customer.lastName}
              </TableCell>
              <TableCell className="text-muted-foreground">{appointment.service.name}</TableCell>
              <TableCell className="text-muted-foreground">
                <span className="mr-1.5 inline-block size-2 rounded-full align-middle" style={{ backgroundColor: appointment.employee.color }} />
                {appointment.employee.firstName}
              </TableCell>
              <TableCell className="text-muted-foreground">{formatCurrency(appointment.price)}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[appointment.status]}>{STATUS_LABELS[appointment.status]}</Badge>
              </TableCell>
            </TableRow>
          ))}
          {appointments.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                Geen afspraken gevonden.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {selected && (
        <AppointmentDetailDialog appointment={selected} employees={employees} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
