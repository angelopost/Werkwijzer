"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateStaffName } from "@/app/(admin)/medewerkers/actions";

export function StaffNameEditor({ userId, name }: { userId: string; name: string }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function save() {
    const trimmed = value.trim();
    if (!trimmed || trimmed === name) {
      setValue(name);
      setError(null);
      setEditing(false);
      return;
    }
    startTransition(async () => {
      const result = await updateStaffName(userId, trimmed);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setEditing(false);
    });
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-1">
        <Input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") {
              setValue(name);
              setError(null);
              setEditing(false);
            }
          }}
          disabled={isPending}
          className="h-8 w-40"
        />
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <span>{name}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={() => setEditing(true)}
        aria-label="Naam bewerken"
      >
        <Pencil />
      </Button>
    </div>
  );
}
