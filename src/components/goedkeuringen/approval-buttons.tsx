"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";

export function ApprovalButtons({
  onApprove,
  onReject,
}: {
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() => startTransition(onReject)}
      >
        Afwijzen
      </Button>
      <Button size="sm" disabled={isPending} onClick={() => startTransition(onApprove)}>
        Goedkeuren
      </Button>
    </div>
  );
}
