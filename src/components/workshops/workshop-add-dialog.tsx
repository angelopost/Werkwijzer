"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
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
import { createWorkshop, type WorkshopActionState } from "@/app/(admin)/workshops/actions";

export function WorkshopAddDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [state, action, pending] = useActionState<WorkshopActionState, FormData>(
    createWorkshop,
    undefined
  );

  useEffect(() => {
    if (state?.success && state.id) {
      setOpen(false);
      router.push(`/workshops/${state.id}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)} className="self-start">
        <Plus data-icon="inline-start" />
        Workshop toevoegen
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Workshop toevoegen</DialogTitle>
          </DialogHeader>
          <form action={action} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="workshopName">Naam</Label>
              <Input
                id="workshopName"
                name="name"
                required
                maxLength={200}
                placeholder="Bijvoorbeeld: Teamuitje"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="workshopDate">Datum</Label>
              <Input
                id="workshopDate"
                name="date"
                type="date"
                required
                className="block w-full max-w-full overflow-hidden"
              />
            </div>

            {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

            <DialogFooter className="flex-col sm:flex-col items-stretch gap-2">
              <Button type="submit" disabled={pending} className="self-end">
                {pending ? "Bezig…" : "Toevoegen"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
