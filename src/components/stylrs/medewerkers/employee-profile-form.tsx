"use client";

import { useActionState, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateEmployee, deleteEmployee, type ActionState } from "@/actions/stylrs/employees";
import { EmployeeColorPicker } from "./employee-color-picker";
import { useRouter } from "next/navigation";

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  function: string | null;
  color: string;
};

export function EmployeeProfileForm({ employee }: { employee: Employee }) {
  const action = updateEmployee.bind(null, employee.id);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, undefined);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteEmployee(employee.id);
    setDeleting(false);
    if (result?.error) {
      setDeleteError(result.error);
      return;
    }
    setDeleteOpen(false);
    router.push("/stylrs/medewerkers");
  }

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <form action={formAction} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="firstName">Voornaam</Label>
            <Input id="firstName" name="firstName" defaultValue={employee.firstName} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="lastName">Achternaam</Label>
            <Input id="lastName" name="lastName" defaultValue={employee.lastName} required />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="function">Functie</Label>
          <Input id="function" name="function" defaultValue={employee.function ?? ""} placeholder="Bijv. Kapper" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">E-mailadres</Label>
            <Input id="email" name="email" type="email" defaultValue={employee.email ?? ""} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Telefoonnummer</Label>
            <Input id="phone" name="phone" defaultValue={employee.phone ?? ""} />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Kleur in de agenda</Label>
          <EmployeeColorPicker name="color" defaultValue={employee.color} />
        </div>
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
        <div className="flex items-center justify-between border-t pt-4">
          <Button type="button" variant="outline" className="text-destructive" onClick={() => setDeleteOpen(true)}>
            Verwijderen
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Bezig…" : "Wijzigingen opslaan"}
          </Button>
        </div>
      </form>

      <Dialog
        open={deleteOpen}
        onOpenChange={(next) => {
          setDeleteOpen(next);
          if (!next) {
            setConfirmDelete(false);
            setDeleteError(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Medewerker verwijderen</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Dit verwijdert {employee.firstName} {employee.lastName} volledig, inclusief werktijden en
              vrije dagen. Dit kan alleen als er geen afspraken (historie) meer aan deze medewerker
              gekoppeld zijn — is dat wel zo, deactiveer de medewerker dan in plaats van te verwijderen.
            </p>
            <label className="flex items-start gap-2.5 rounded-lg border p-3 text-sm">
              <Checkbox checked={confirmDelete} onCheckedChange={(v) => setConfirmDelete(v === true)} className="mt-0.5" />
              <span>Weet je zeker dat je deze medewerker wilt verwijderen?</span>
            </label>
            {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
          </div>
          <DialogFooter className="gap-2 sm:justify-between">
            <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>
              Annuleren
            </Button>
            <Button type="button" variant="destructive" disabled={!confirmDelete || deleting} onClick={handleDelete}>
              {deleting ? "Verwijderen…" : "Verwijderen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
