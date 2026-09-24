"use client";

import { useActionState, useState, useTransition } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateAppointmentStatus, rescheduleAppointment, type ActionState } from "@/actions/stylrs/appointments";
import { formatCurrency, formatDateLong, formatTime } from "@/lib/stylrs/format";
import type { AgendaAppointment } from "./agenda-grid";

const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: "Bevestigd",
  COMPLETED: "Afgerond",
  CANCELLED: "Geannuleerd",
  NO_SHOW: "No-show",
};

export function AppointmentDetailDialog({
  appointment,
  employees,
  onClose,
}: {
  appointment: AgendaAppointment;
  employees: { id: string; firstName: string; lastName: string }[];
  onClose: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const action = rescheduleAppointment.bind(null, appointment.id);
  const [state, formAction, reschedulePending] = useActionState<ActionState, FormData>(action, undefined);

  function setStatus(status: "CANCELLED" | "COMPLETED" | "NO_SHOW") {
    startTransition(async () => {
      await updateAppointmentStatus(appointment.id, status);
      onClose();
    });
  }

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {appointment.customer.firstName} {appointment.customer.lastName}
          </DialogTitle>
        </DialogHeader>

        {!editing ? (
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={appointment.status === "CANCELLED" ? "secondary" : "default"}>
                {STATUS_LABELS[appointment.status]}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Behandeling</span>
              <span className="font-medium text-foreground">{appointment.service.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Medewerker</span>
              <span className="font-medium text-foreground">
                {appointment.employee.firstName} {appointment.employee.lastName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Datum</span>
              <span className="font-medium text-foreground">{formatDateLong(appointment.startTime)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tijd</span>
              <span className="font-medium text-foreground">
                {formatTime(appointment.startTime)} – {formatTime(appointment.endTime)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Prijs</span>
              <span className="font-medium text-foreground">{formatCurrency(appointment.price)}</span>
            </div>
            {appointment.note && (
              <div>
                <span className="text-muted-foreground">Notitie</span>
                <p className="mt-1 rounded-lg bg-muted p-2 text-foreground">{appointment.note}</p>
              </div>
            )}

            <DialogFooter className="mt-2 flex-wrap gap-2 sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {appointment.status === "CONFIRMED" && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                      Verzetten
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setStatus("COMPLETED")} disabled={isPending}>
                      Voltooien
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setStatus("NO_SHOW")} disabled={isPending}>
                      No-show
                    </Button>
                  </>
                )}
              </div>
              {appointment.status === "CONFIRMED" && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setStatus("CANCELLED")}
                  disabled={isPending}
                >
                  Annuleren
                </Button>
              )}
            </DialogFooter>
          </div>
        ) : (
          <form action={formAction} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="reschedule-date">Datum</Label>
                <Input
                  id="reschedule-date"
                  name="date"
                  type="date"
                  defaultValue={format(appointment.startTime, "yyyy-MM-dd")}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="reschedule-time">Begintijd</Label>
                <Input
                  id="reschedule-time"
                  name="startTime"
                  type="time"
                  defaultValue={format(appointment.startTime, "HH:mm")}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="reschedule-employee">Medewerker</Label>
              <Select name="employeeId" defaultValue={appointment.employee.id}>
                <SelectTrigger id="reschedule-employee" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.firstName} {e.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
            <DialogFooter className="gap-2 sm:justify-between">
              <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                Terug
              </Button>
              <Button type="submit" disabled={reschedulePending}>
                {reschedulePending ? "Bezig…" : "Opslaan"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
