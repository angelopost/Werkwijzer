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
import { createEmployee, type ActionState } from "@/actions/stylrs/employees";
import { EmployeeColorPicker } from "./employee-color-picker";

export function AddEmployeeDialog() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ActionState, FormData>(createEmployee, undefined);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      setOpen(false);
    }
    wasPending.current = pending;
  }, [pending, state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button className="self-end" onClick={() => setOpen(true)}>
        + Nieuwe medewerker
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Medewerker toevoegen</DialogTitle>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="firstName">Voornaam</Label>
              <Input id="firstName" name="firstName" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lastName">Achternaam</Label>
              <Input id="lastName" name="lastName" required />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="function">Functie</Label>
            <Input id="function" name="function" placeholder="Bijv. Kapper" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">E-mailadres</Label>
            <Input id="email" name="email" type="email" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Telefoonnummer</Label>
            <Input id="phone" name="phone" />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Kleur in de agenda</Label>
            <EmployeeColorPicker name="color" />
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Bezig…" : "Toevoegen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
