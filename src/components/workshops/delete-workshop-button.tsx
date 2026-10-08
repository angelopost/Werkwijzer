"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { deleteWorkshop } from "@/app/(admin)/workshops/actions";

export function DeleteWorkshopButton({ workshopId, name }: { workshopId: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!checked) return;
    setPending(true);
    await deleteWorkshop(workshopId);
    router.push("/workshops");
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="self-start text-destructive"
        onClick={() => setOpen(true)}
      >
        Workshop verwijderen
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
            <DialogTitle>Workshop verwijderen</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Dit verwijdert &ldquo;{name}&rdquo; volledig, inclusief alle acties en reacties.
            </p>
            <label className="flex items-start gap-2.5 rounded-lg border p-3 text-sm">
              <Checkbox
                checked={checked}
                onCheckedChange={(value) => setChecked(value === true)}
                className="mt-0.5"
              />
              <span>Weet je zeker dat je deze workshop wilt verwijderen? Dit kan je niet ongedaan maken.</span>
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
