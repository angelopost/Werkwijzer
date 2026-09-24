"use client";

import { useEffect, useRef, useState } from "react";
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
import { createService, updateService, type ActionState } from "@/actions/stylrs/services";
import { EmployeeCheckboxField } from "./employee-checkbox-field";

type Employee = { id: string; firstName: string; lastName: string };

type ServiceValues = {
  id: string;
  name: string;
  description: string | null;
  price: string | number;
  durationMinutes: number;
  category: string | null;
  employeeIds: string[];
};

export function ServiceFormDialog({
  employees,
  service,
  trigger,
}: {
  employees: Employee[];
  service?: ServiceValues;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const action = service ? updateService.bind(null, service.id) : createService;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, undefined);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      setOpen(false);
    }
    wasPending.current = pending;
  }, [pending, state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{service ? "Behandeling bewerken" : "Behandeling toevoegen"}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Naam</Label>
            <Input id="name" name="name" defaultValue={service?.name} required placeholder="Bijv. Heren knippen" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="price">Prijs (€)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                defaultValue={service ? String(service.price) : undefined}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="durationMinutes">Duur (minuten)</Label>
              <Input
                id="durationMinutes"
                name="durationMinutes"
                type="number"
                min="5"
                step="5"
                defaultValue={service?.durationMinutes ?? 30}
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="category">Categorie</Label>
            <Input id="category" name="category" defaultValue={service?.category ?? ""} placeholder="Bijv. Knippen" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Omschrijving</Label>
            <Textarea id="description" name="description" defaultValue={service?.description ?? ""} rows={2} />
          </div>
          {employees.length > 0 && (
            <div className="flex flex-col gap-2">
              <Label>Uitgevoerd door</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {employees.map((employee) => (
                  <EmployeeCheckboxField
                    key={employee.id}
                    employeeId={employee.id}
                    label={`${employee.firstName} ${employee.lastName}`}
                    defaultChecked={service?.employeeIds.includes(employee.id) ?? false}
                  />
                ))}
              </div>
            </div>
          )}
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Bezig…" : service ? "Wijzigingen opslaan" : "Toevoegen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
