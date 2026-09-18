"use client";

import { useActionState, useEffect, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createTodo,
  updateTodo,
  deleteTodo,
  deleteAllPermanentTodos,
  type TodoActionState,
} from "@/app/(admin)/todo/actions";
import { getWeekdayFullLabel, parseDateKey } from "@/lib/dates";
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
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [bulkDeleteChecked, setBulkDeleteChecked] = useState(false);
  const [bulkDeletePending, setBulkDeletePending] = useState(false);

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

  async function handleDeleteAllPermanent() {
    if (!todo?.permanentTodoId || !bulkDeleteChecked) return;
    setBulkDeletePending(true);
    await deleteAllPermanentTodos(todo.permanentTodoId);
    onOpenChange(false);
  }

  const weekdayLabel = getWeekdayFullLabel(parseDateKey(todo?.date ?? dateKey));
  const canMakePermanent = !todo || !todo.permanentTodoId;

  if (todo?.permanentTodoId && confirmBulkDelete) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alle to do's verwijderen</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Dit verwijdert alle nog komende {weekdayLabel}-to do&apos;s uit dit vaste patroon.
              To do&apos;s die al zijn geweest blijven staan.
            </p>
            <label className="flex items-start gap-2.5 rounded-lg border p-3 text-sm">
              <Checkbox
                checked={bulkDeleteChecked}
                onCheckedChange={(checked) => setBulkDeleteChecked(checked === true)}
                className="mt-0.5"
              />
              <span>
                Weet je zeker dat je alle {weekdayLabel}-to do&apos;s wilt verwijderen? Dit kan je
                niet ongedaan maken.
              </span>
            </label>
          </div>
          <DialogFooter className="gap-2 sm:justify-between">
            <Button type="button" variant="outline" onClick={() => setConfirmBulkDelete(false)}>
              Annuleren
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={!bulkDeleteChecked || bulkDeletePending}
              onClick={handleDeleteAllPermanent}
            >
              {bulkDeletePending ? "Verwijderen…" : "Verwijderen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
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

          {canMakePermanent ? (
            <label className="flex items-center gap-2.5 rounded-lg border p-3 text-sm">
              <Checkbox name="permanent" defaultChecked={false} />
              <span className="font-medium">Permanent</span>
            </label>
          ) : (
            <p className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
              Vast to do-patroon (elke {weekdayLabel})
            </p>
          )}

          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

          <DialogFooter className="flex-col sm:flex-col items-stretch gap-2">
            {todo && (
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={handleDelete} className="text-destructive">
                  Verwijderen
                </Button>
                {todo.permanentTodoId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setConfirmBulkDelete(true)}
                    className="text-destructive"
                  >
                    Alle to do&apos;s verwijderen
                  </Button>
                )}
              </div>
            )}
            <Button type="submit" disabled={pending} className="self-end">
              {pending ? "Bezig…" : "Bevestigen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
