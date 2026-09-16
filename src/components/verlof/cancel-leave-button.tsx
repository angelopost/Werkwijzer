"use client";

import { Button } from "@/components/ui/button";
import { cancelLeave } from "@/app/(staff)/verlof/actions";

export function CancelLeaveButton({ leaveId }: { leaveId: string }) {
  return (
    <Button size="sm" variant="ghost" onClick={() => cancelLeave(leaveId)}>
      Intrekken
    </Button>
  );
}
