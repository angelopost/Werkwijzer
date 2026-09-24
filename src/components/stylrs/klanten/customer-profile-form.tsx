"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
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
import { updateCustomer, deleteCustomer, type ActionState } from "@/actions/stylrs/customers";

type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
};

export function CustomerProfileForm({ customer, canDelete }: { customer: Customer; canDelete: boolean }) {
  const action = updateCustomer.bind(null, customer.id);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, undefined);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteCustomer(customer.id);
    setDeleting(false);
    if (result?.error) {
      setDeleteError(result.error);
      return;
    }
    setDeleteOpen(false);
    router.push("/stylrs/klanten");
  }

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <form action={formAction} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="firstName">Voornaam</Label>
            <Input id="firstName" name="firstName" defaultValue={customer.firstName} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="lastName">Achternaam</Label>
            <Input id="lastName" name="lastName" defaultValue={customer.lastName} required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">E-mailadres</Label>
            <Input id="email" name="email" type="email" defaultValue={customer.email ?? ""} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Telefoonnummer</Label>
            <Input id="phone" name="phone" defaultValue={customer.phone ?? ""} />
          </div>
        </div>
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
        <div className="flex items-center justify-between border-t pt-4">
          {canDelete ? (
            <Button type="button" variant="outline" className="text-destructive" onClick={() => setDeleteOpen(true)}>
              Verwijderen
            </Button>
          ) : (
            <span />
          )}
          <Button type="submit" disabled={pending}>
            {pending ? "Bezig…" : "Wijzigingen opslaan"}
          </Button>
        </div>
      </form>

      {canDelete && (
        <Dialog
          open={deleteOpen}
          onOpenChange={(next) => {
            setDeleteOpen(next);
            if (!next) {
              setConfirm(false);
              setDeleteError(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Klant verwijderen</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Dit verwijdert {customer.firstName} {customer.lastName} volledig. Dit kan alleen als deze
                klant geen afsprakengeschiedenis heeft.
              </p>
              <label className="flex items-start gap-2.5 rounded-lg border p-3 text-sm">
                <Checkbox checked={confirm} onCheckedChange={(v) => setConfirm(v === true)} className="mt-0.5" />
                <span>Weet je zeker dat je deze klant wilt verwijderen?</span>
              </label>
              {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
            </div>
            <DialogFooter className="gap-2 sm:justify-between">
              <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>
                Annuleren
              </Button>
              <Button type="button" variant="destructive" disabled={!confirm || deleting} onClick={handleDelete}>
                {deleting ? "Verwijderen…" : "Verwijderen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
