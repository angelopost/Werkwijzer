"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { deleteStaffMember } from "@/app/(admin)/medewerkers/actions";

export function DeleteStaffButton({ userId, name }: { userId: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!checked) return;
    setPending(true);
    await deleteStaffMember(userId);
    setOpen(false);
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="text-destructive"
        onClick={() => setOpen(true)}
      >
        Verwijderen
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setChecked(false);
            setPending(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Medewerker verwijderen</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Dit verwijdert {name} volledig, inclusief het account en alle beschikbaarheids-,
              verlof- en ziekmeldingen. Diensten die al zijn ingepland blijven staan, maar
              worden niet meer aan {name} toegewezen.
            </p>
            <label className="flex items-start gap-2.5 rounded-lg border p-3 text-sm">
              <Checkbox
                checked={checked}
                onCheckedChange={(value) => setChecked(value === true)}
                className="mt-0.5"
              />
              <span>Weet je zeker dat je {name} wilt verwijderen? Dit kan je niet ongedaan maken.</span>
            </label>
          </div>
          <DialogFooter className="gap-2 sm:justify-between">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuleren
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={!checked || pending}
              onClick={handleDelete}
            >
              {pending ? "Verwijderen…" : "Verwijderen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
