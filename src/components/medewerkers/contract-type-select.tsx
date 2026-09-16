"use client";

import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { setContractType } from "@/app/(admin)/medewerkers/actions";

const LABELS: Record<string, string> = {
  VAST: "Vast contract",
  NUL_UREN: "Nul uren contract",
};

export function ContractTypeSelect({
  userId,
  value,
}: {
  userId: string;
  value: "VAST" | "NUL_UREN" | null;
}) {
  const [isPending, startTransition] = useTransition();

  function handleChange(next: string | null) {
    if (!next) return;
    startTransition(() => {
      setContractType(userId, next as "VAST" | "NUL_UREN");
    });
  }

  return (
    <Select value={value ?? undefined} onValueChange={handleChange}>
      <SelectTrigger
        size="sm"
        disabled={isPending}
        className={cn(
          "h-6 gap-1 rounded-full border-none px-2.5 text-xs font-medium shadow-none",
          value === "VAST" && "bg-primary text-primary-foreground hover:bg-primary/90",
          value === "NUL_UREN" && "bg-accent text-accent-foreground hover:bg-accent/80",
          !value && "bg-muted text-muted-foreground"
        )}
      >
        <SelectValue placeholder="Contracttype">
          {(v: string | null) => LABELS[v ?? ""] ?? "Contracttype"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="VAST">Vast contract</SelectItem>
        <SelectItem value="NUL_UREN">Nul uren contract</SelectItem>
      </SelectContent>
    </Select>
  );
}
