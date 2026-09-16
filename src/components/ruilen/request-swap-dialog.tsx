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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { requestSwap, type SwapActionState } from "@/app/(staff)/ruilen/actions";

export function RequestSwapDialog({
  shiftId,
  shiftLabel,
  colleagues,
}: {
  shiftId: string;
  shiftLabel: string;
  colleagues: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<SwapActionState, FormData>(requestSwap, undefined);

  useEffect(() => {
    if (state?.success) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reacting to a Server Action result, not derived render state
      setOpen(false);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline">Ruilen aanvragen</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ruilen aanvragen</DialogTitle>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-4">
          <input type="hidden" name="shiftId" value={shiftId} />
          <p className="text-sm text-muted-foreground">{shiftLabel}</p>

          <div className="flex flex-col gap-2">
            <Label htmlFor="targetUserId">Collega (optioneel)</Label>
            <Select name="targetUserId">
              <SelectTrigger id="targetUserId">
                <SelectValue placeholder="Open voor iedereen">
                  {(value: string | null) =>
                    colleagues.find((c) => c.id === value)?.name ?? "Open voor iedereen"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {colleagues.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Bezig…" : "Aanvragen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
