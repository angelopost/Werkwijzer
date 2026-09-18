"use client";

import { useActionState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTodo, updateTodo, deleteTodo, type TodoActionState } from "@/app/(admin)/todo/actions";
import { PRIORITY_LABEL, type TodoItem, type TodoStaffOption } from "./types";

export function TodoDialog({
  open,
  onOpenChange,
  dateKey,
  todo,
  staff,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateKey: string;
  todo: TodoItem | null;
  staff: TodoStaffOption[];
}) {
  const boundAction = todo ? updateTodo.bind(null, todo.id) : createTodo;
  const [state, action, pending] = useActionState<TodoActionState, FormData>(boundAction, undefined);

  useEffect(() => {
    if (state && !state.error) {
      onOpenChange(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  async function handleDelete() {
    if (!todo) return;
    await deleteTodo(todo.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{todo ? "To do bewerken" : "To do toevoegen"}</DialogTitle>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Titel</Label>
            <Input id="title" name="title" required maxLength={200} defaultValue={todo?.title ?? ""} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Beschrijving</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Wat moet er precies gebeuren?"
              defaultValue={todo?.description ?? ""}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="date">Datum</Label>
            <Input
              id="date"
              name="date"
              type="date"
              required
              className="block w-full max-w-full overflow-hidden"
              defaultValue={todo?.date ?? dateKey}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="assigneeId">Medewerker</Label>
            <Select name="assigneeId" defaultValue={todo?.assigneeId ?? "algemeen"}>
              <SelectTrigger id="assigneeId" className="w-full">
                <SelectValue placeholder="Algemeen">
                  {(value: string | null) =>
                    staff.find((s) => s.id === value)?.name ?? "Algemeen"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="algemeen">Algemeen</SelectItem>
                {staff.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="priority">Prioriteit</Label>
            <Select name="priority" defaultValue={todo?.priority ?? "NORMAAL"}>
              <SelectTrigger id="priority" className="w-full">
                <SelectValue placeholder="Prioriteit">
                  {(value: string | null) => PRIORITY_LABEL[(value ?? "NORMAAL") as keyof typeof PRIORITY_LABEL]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRINGEND">Dringend</SelectItem>
                <SelectItem value="NORMAAL">Normaal</SelectItem>
                <SelectItem value="NIET_DRINGEND">Niet dringend</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

          <DialogFooter className="gap-2 sm:justify-between">
            {todo ? (
              <Button type="button" variant="outline" onClick={handleDelete} className="text-destructive">
                Verwijderen
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit" disabled={pending}>
              {pending ? "Bezig…" : "Bevestigen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
