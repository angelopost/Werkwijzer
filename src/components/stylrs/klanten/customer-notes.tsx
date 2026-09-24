"use client";

import { useActionState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { addCustomerNote, deleteCustomerNote, type ActionState } from "@/actions/stylrs/customers";
import { formatDateShort } from "@/lib/stylrs/format";
import { Trash2 } from "lucide-react";

type Note = { id: string; body: string; createdAt: Date };

export function CustomerNotes({ customerId, notes }: { customerId: string; notes: Note[] }) {
  const action = addCustomerNote.bind(null, customerId);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, undefined);

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <p className="mb-3 text-xs text-muted-foreground">
        Alleen zichtbaar voor medewerkers van jouw salon.
      </p>
      <ul className="mb-4 flex flex-col gap-2">
        {notes.map((note) => (
          <li key={note.id} className="flex items-start justify-between gap-3 rounded-lg border p-3 text-sm">
            <div>
              <p className="text-foreground">{note.body}</p>
              <p className="mt-1 text-xs text-muted-foreground">{formatDateShort(note.createdAt)}</p>
            </div>
            <form action={deleteCustomerNote.bind(null, customerId, note.id)}>
              <Button type="submit" variant="ghost" size="icon-sm" aria-label="Verwijderen">
                <Trash2 className="size-4" />
              </Button>
            </form>
          </li>
        ))}
        {notes.length === 0 && <li className="text-sm text-muted-foreground">Nog geen notities.</li>}
      </ul>
      <form action={formAction} className="flex flex-col gap-2 border-t pt-4">
        <Textarea name="body" placeholder="Bijv. gebruikt meestal tondeuse stand 3 aan de zijkant." rows={2} required />
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
        <Button type="submit" disabled={pending} className="self-end">
          {pending ? "Bezig…" : "Notitie toevoegen"}
        </Button>
      </form>
    </div>
  );
}
