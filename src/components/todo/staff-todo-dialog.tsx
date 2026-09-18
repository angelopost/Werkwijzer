"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { markTodoCompletedBy } from "@/app/(staff)/mijn-to-do/actions";
import { formatDayLabel, parseDateKey } from "@/lib/dates";
import { PRIORITY_LABEL, type TodoItem, type TodoPriority, type TodoStaffOption } from "./types";

const NONE_VALUE = "none";

const PRIORITY_BADGE_VARIANT: Record<TodoPriority, "destructive" | "default" | "secondary"> = {
  DRINGEND: "destructive",
  NORMAAL: "default",
  NIET_DRINGEND: "secondary",
};

export function StaffTodoDialog({
  open,
  onOpenChange,
  todo,
  staff,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  todo: TodoItem;
  staff: TodoStaffOption[];
}) {
  const [completedById, setCompletedById] = useState(todo.completedById ?? NONE_VALUE);
  const [pending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      await markTodoCompletedBy(todo.id, completedById === NONE_VALUE ? null : completedById);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{todo.title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">{formatDayLabel(parseDateKey(todo.date))}</p>

          {todo.description && (
            <p className="whitespace-pre-wrap text-sm">{todo.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant={PRIORITY_BADGE_VARIANT[todo.priority]}>
              {PRIORITY_LABEL[todo.priority]}
            </Badge>
            {todo.assigneeName && (
              <span className="text-xs text-muted-foreground">Bestemd voor: {todo.assigneeName}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="completedById" className="text-sm font-medium">
              Wie heeft dit afgerond?
            </label>
            <Select
              value={completedById}
              onValueChange={(value) => setCompletedById(value ?? NONE_VALUE)}
            >
              <SelectTrigger id="completedById" className="w-full">
                <SelectValue placeholder="Nog niet afgerond">
                  {(value: string | null) =>
                    staff.find((s) => s.id === value)?.name ?? "Nog niet afgerond"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>Nog niet afgerond</SelectItem>
                {staff.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" onClick={handleSave} disabled={pending} className="self-end">
            {pending ? "Bezig…" : "Opslaan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
