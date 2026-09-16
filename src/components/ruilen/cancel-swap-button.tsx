"use client";

import { Button } from "@/components/ui/button";
import { cancelSwap } from "@/app/(staff)/ruilen/actions";

export function CancelSwapButton({ swapId }: { swapId: string }) {
  return (
    <Button size="sm" variant="ghost" onClick={() => cancelSwap(swapId)}>
      Annuleren
    </Button>
  );
}
