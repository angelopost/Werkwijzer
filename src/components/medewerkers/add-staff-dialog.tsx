"use client";

import { useActionState, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createStaffMember, type StaffActionState } from "@/app/(admin)/medewerkers/actions";
import { InviteLinkBanner } from "./invite-link-banner";

export function AddStaffDialog() {
  const [open, setOpen] = useState(false);
  const [invitePath, setInvitePath] = useState<string | null>(null);
  const [state, action, pending] = useActionState<StaffActionState, FormData>(
    createStaffMember,
    undefined
  );

  useEffect(() => {
    if (state?.invitePath) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reacting to a Server Action result, not derived render state
      setInvitePath(state.invitePath);
      setOpen(false);
    }
  }, [state]);

  return (
    <div className="flex flex-col gap-4">
      {invitePath && <InviteLinkBanner path={invitePath} onDismiss={() => setInvitePath(null)} />}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button className="self-end">+ Medewerker toevoegen</Button>} />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Medewerker toevoegen</DialogTitle>
          </DialogHeader>
          <form action={action} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Naam</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">E-mailadres</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="contractType">Contracttype</Label>
              <Select name="contractType">
                <SelectTrigger id="contractType" className="w-full">
                  <SelectValue placeholder="Geen label">
                    {(value: string | null) =>
                      value === "VAST"
                        ? "Vast contract"
                        : value === "NUL_UREN"
                          ? "Nul uren contract"
                          : "Geen label"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VAST">Vast contract</SelectItem>
                  <SelectItem value="NUL_UREN">Nul uren contract</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? "Bezig…" : "Uitnodigen"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
