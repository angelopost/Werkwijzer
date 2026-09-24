"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toggleServiceActive, deleteService } from "@/actions/stylrs/services";
import { ServiceFormDialog } from "./service-form-dialog";
import { formatCurrency } from "@/lib/stylrs/format";

type Employee = { id: string; firstName: string; lastName: string };
type ServiceRow = {
  id: string;
  name: string;
  description: string | null;
  price: string | number;
  durationMinutes: number;
  category: string | null;
  active: boolean;
  employeeIds: string[];
};

function DeleteServiceButton({ service }: { service: ServiceRow }) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    setPending(true);
    const result = await deleteService(service.id);
    setPending(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setOpen(false);
  }

  return (
    <>
      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setOpen(true)}>
        Verwijderen
      </Button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setConfirm(false);
            setError(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Behandeling verwijderen</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Dit verwijdert &quot;{service.name}&quot; volledig. Dit kan alleen als er geen afspraken
              (historie) meer voor deze behandeling zijn — is dat wel zo, schakel de behandeling dan uit.
            </p>
            <label className="flex items-start gap-2.5 rounded-lg border p-3 text-sm">
              <Checkbox checked={confirm} onCheckedChange={(v) => setConfirm(v === true)} className="mt-0.5" />
              <span>Weet je zeker dat je deze behandeling wilt verwijderen?</span>
            </label>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter className="gap-2 sm:justify-between">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuleren
            </Button>
            <Button type="button" variant="destructive" disabled={!confirm || pending} onClick={handleDelete}>
              {pending ? "Verwijderen…" : "Verwijderen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ServiceTable({ services, employees }: { services: ServiceRow[]; employees: Employee[] }) {
  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Naam</TableHead>
            <TableHead>Categorie</TableHead>
            <TableHead>Duur</TableHead>
            <TableHead>Prijs</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Acties</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service.id}>
              <TableCell className="font-medium">{service.name}</TableCell>
              <TableCell className="text-muted-foreground">{service.category ?? "—"}</TableCell>
              <TableCell className="text-muted-foreground">{service.durationMinutes} min</TableCell>
              <TableCell className="text-muted-foreground">{formatCurrency(Number(service.price))}</TableCell>
              <TableCell>
                {service.active ? <Badge>Actief</Badge> : <Badge variant="secondary">Inactief</Badge>}
              </TableCell>
              <TableCell className="flex justify-end gap-1">
                <ServiceFormDialog
                  employees={employees}
                  service={service}
                  trigger={
                    <Button variant="outline" size="sm">
                      Bewerken
                    </Button>
                  }
                />
                <form action={toggleServiceActive.bind(null, service.id)}>
                  <Button variant="outline" size="sm" type="submit">
                    {service.active ? "Uitschakelen" : "Inschakelen"}
                  </Button>
                </form>
                <DeleteServiceButton service={service} />
              </TableCell>
            </TableRow>
          ))}
          {services.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                Nog geen behandelingen toegevoegd.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
