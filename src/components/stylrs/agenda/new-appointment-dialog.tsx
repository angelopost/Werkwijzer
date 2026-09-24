"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useActionState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createManualAppointment, type ActionState } from "@/actions/stylrs/appointments";

type Customer = { id: string; firstName: string; lastName: string };
type Employee = { id: string; firstName: string; lastName: string };
type Service = { id: string; name: string; price: number; durationMinutes: number; employeeIds: string[] };

export function NewAppointmentDialog({
  customers,
  employees,
  services,
  defaultDate,
  trigger,
}: {
  customers: Customer[];
  employees: Employee[];
  services: Service[];
  defaultDate: string;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ActionState, FormData>(createManualAppointment, undefined);
  const wasPending = useRef(false);
  const [newCustomer, setNewCustomer] = useState(false);
  const [serviceId, setServiceId] = useState<string>(services[0]?.id ?? "");

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      setOpen(false);
    }
    wasPending.current = pending;
  }, [pending, state]);

  const selectedService = services.find((s) => s.id === serviceId);
  const eligibleEmployees = useMemo(() => {
    if (!selectedService) return employees;
    return employees.filter((e) => selectedService.employeeIds.includes(e.id));
  }, [selectedService, employees]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nieuwe afspraak</DialogTitle>
        </DialogHeader>
        <form action={action} className="flex max-h-[75vh] flex-col gap-4 overflow-y-auto pr-1">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>Klant</Label>
              <button
                type="button"
                className="text-xs font-medium text-primary hover:underline"
                onClick={() => setNewCustomer((v) => !v)}
              >
                {newCustomer ? "Bestaande klant kiezen" : "+ Nieuwe klant"}
              </button>
            </div>
            {!newCustomer ? (
              <Select name="customerId">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Kies een klant" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.firstName} {c.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Input name="newCustomerFirstName" placeholder="Voornaam" />
                <Input name="newCustomerLastName" placeholder="Achternaam" />
                <Input name="newCustomerEmail" placeholder="E-mail (optioneel)" className="col-span-2" />
                <Input name="newCustomerPhone" placeholder="Telefoon (optioneel)" className="col-span-2" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="serviceId">Behandeling</Label>
            <Select name="serviceId" value={serviceId} onValueChange={(v) => v && setServiceId(v)}>
              <SelectTrigger id="serviceId" className="w-full">
                <SelectValue placeholder="Kies een behandeling" />
              </SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.durationMinutes} min)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="employeeId">Medewerker</Label>
            <Select name="employeeId">
              <SelectTrigger id="employeeId" className="w-full">
                <SelectValue placeholder="Kies een medewerker" />
              </SelectTrigger>
              <SelectContent>
                {eligibleEmployees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.firstName} {e.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="date">Datum</Label>
              <Input id="date" name="date" type="date" defaultValue={defaultDate} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="startTime">Begintijd</Label>
              <Input id="startTime" name="startTime" type="time" required />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="price">Prijs (€)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              key={selectedService?.id}
              defaultValue={selectedService?.price}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="note">Interne notitie</Label>
            <Textarea id="note" name="note" rows={2} />
          </div>

          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Bezig…" : "Afspraak toevoegen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
